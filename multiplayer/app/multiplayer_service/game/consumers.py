import json
import time
import asyncio 
import aiohttp
import jwt
import os
import uuid
import random 
import logging  # Logging facility for Python    

from channels.layers import get_channel_layer
from channels.generic.websocket import AsyncWebsocketConsumer

from django.conf import settings
from datetime import datetime
from .managers import GameManager
from .save_game import send_game_result

logger = logging.getLogger(__name__)  # Creates a logger instance for this module
logging.basicConfig(filename='myapp.log', level=logging.DEBUG)  # Configures basfic logging to a file
    

class GamePlayer:
    def __init__(self, user_id=None, display_name=None, game_type=None, game_id=None):
        self.user_id = user_id
        self.display_name = display_name
        self.game_type = game_type
        self.game_id = game_id
        self.room_id = None
        self.connection = None
        self.spacePressed = False
        self.tournament_player_number = 0
        
    async def send(self, text_data):
        """Wrapper para el método send de la conexión WebSocket"""
        if self.connection:
            await self.connection.send(text_data)
            
    def set_connection(self, connection):
        """Establece la conexión WebSocket para este jugador"""
        self.connection = connection
        
    def __str__(self):
        return f"GamePlayer(id={self.user_id}, name={self.display_name})" 

waiting_players = []

waiting_friends = []

waiting_semifinal_players = []

waiting_final_players = []

active_rooms = {}

tournaments = {}
active_connections = [] # 

active_tasks = {}

id = 1
    

class GameMatchmakingConsumer(AsyncWebsocketConsumer):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.player = GamePlayer()
        self.playing = False

    def decode_jwt_token(self, token):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            return payload
        except Exception as e:
            logger.info(f"Error decodificando token: {str(e)}")
            return None

    async def send_game_result(self, room):
        return await send_game_result(room)


    async def connect(self):
       
        """Cuando un cliente se conecta al WebSocket."""
        logger.info("se ha conectado un cliente")
        await self.accept()

    async def disconnect(self, close_code):

        logger.info(f"juega a {self.player.game_type}")

        if self.player.user_id in active_connections:
            active_connections.remove(self.player.user_id)

        if self.player in waiting_players:
            waiting_players.remove(self.player)

        if self.player in waiting_semifinal_players:
            waiting_semifinal_players.remove(self.player)
 
        if self.player in waiting_friends:
            waiting_friends.remove(self.player)
        
        await asyncio.sleep(0.5)

        for room_id, room in active_rooms.items():
            logger.info(f"ROOM-id--{room_id}, player1 ID: {room['player1'].user_id}, player2 ID: {room['player2'].user_id}")


        for room_id, room in active_rooms.items():
            if self.player == room['player1']:
                active_rooms.pop(room_id)
                room['player2'].connection.playing = False
                room['player1'].connection.playing = False
                room['player2'].spacePressed = False
                room['player1'].spacePressed = False
                logger.info(f"------PLAYER 1 DESCONETAU------{self.player.game_type}")
                name = room['player1'].display_name
                if self.player.game_type == 'INDIVIDUAL' or self.player.game_type == 'FRIENDS':
                    await room['player2'].send(text_data=json.dumps({
                        'type': 'disconnect',
                        'message': f'Error: {name} PLAYER HAS DISCONNECTED',
                        'color': 'red',
                        'game_type': room['player2'].game_type
                    }))
                if room['player2'].game_type == 'INDIVIDUAL':
                    active_rooms.pop(room_id, None)
            
                if (self.player.game_type == 'SEMIFINAL' or self.player.game_type == 'FINAL') and self.player not in tournaments[room['game_state']['tournament_id']]['eliminated_players']:
                    await self.destroyTournament(room['game_state']['tournament_id'], self.player)
                    
                if room_id in active_tasks:
                    active_tasks[room_id].cancel()
                active_tasks.pop(room_id, None)
                break

            if self.player == room['player2']:
                active_rooms.pop(room_id)
                room['player1'].connection.playing = False
                room['player2'].connection.playing = False
                room['player1'].spacePressed = False
                room['player2'].spacePressed = False
                logger.info("------PLAYER 2 DESCONETAU------")
                name = room['player2'].display_name
                if self.player.game_type == 'INDIVIDUAL' or self.player.game_type == 'FRIENDS':
                    await room['player1'].send(text_data=json.dumps({
                        'type': 'disconnect',
                        'message': f'Error: {name} PLAYER HAS DISCONNECTED',
                        'color': 'red',
                        'game_type': room['player1'].game_type
                    }))
                if room['player1'].game_type == 'INDIVIDUAL':
                    active_rooms.pop(room_id, None)
                if (self.player.game_type == 'SEMIFINAL' or self.player.game_type == 'FINAL') and self.player not in tournaments[room['game_state']['tournament_id']]['eliminated_players']:
                    await self.destroyTournament(room['game_state']['tournament_id'], self.player)
                    
                if room_id in active_tasks:
                    active_tasks[room_id].cancel()
                active_tasks.pop(room_id, None)
                break

    async def destroyTournament(self, tournament_id, player):

        for plyr in tournaments[tournament_id]['players']:
            if plyr != player:
                await plyr.send(text_data=json.dumps({
                    'type': 'disconnect',
                    'message': 'ONE PLAYER DISCONNECTED\nTOURNAMENT CANCELED',
                    'color': 'red',
                    'game_type': 'destroy'
                }))
        
        if tournaments[tournament_id]['room1'] in active_rooms:
            active_rooms.pop(tournaments[tournament_id]['room1'], None)
        if tournaments[tournament_id]['room2'] in active_rooms:
            active_rooms.pop(tournaments[tournament_id]['room2'], None)
        if tournaments[tournament_id]['room1'] in active_tasks:
            active_tasks[tournaments[tournament_id]['room1']].cancel()
            active_tasks.pop(tournaments[tournament_id]['room1'], None)
        if tournaments[tournament_id]['room2'] in active_tasks:
            active_tasks[tournaments[tournament_id]['room2']].cancel()
            active_tasks.pop(tournaments[tournament_id]['room2'], None)

        if player.room_id in active_tasks:
            active_tasks[player.room_id].cancel()
            active_tasks.pop(player.room_id, None)




    async def receive(self, text_data):

        data = json.loads(text_data)
        message_type = data.get('type', 0)

        if message_type == 'move':
            logger.info("----TYPE move----")
            if not self.player.room_id:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': "Not in a game room"
                }))
                return
            await self.handle_action_player_movement(data)
        elif message_type == 'join_game':
            logger.info("----TYPE join game----")
            await self.handle_action_join_game(data)
        elif message_type == 'spacePressed':
            logger.info("----TYPE spacePressed----")
            self.player.spacePressed = True
        else:
            logger.info("----TYPE error----")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': "Bad request, parameter 'type' is mandatory"
            }))


    async def handle_action_join_game(self, data):

        if 'token' not in data:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': "Token not provided"
            }))
            return

        payload = self.decode_jwt_token(data['token'])
        if payload is None:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': "Invalid tokena"
            }))
            return
        
        self.player.user_id = payload.get('user_id')
        self.player.display_name = payload.get('display_name')
        self.player.game_type = data.get('game_type')
        self.player.game_id = data.get('game_id')
        self.player.set_connection(self)

        logger.info(f"Se conecta {self.player.display_name}, ID: {self.player.user_id}")

        if self.player.user_id in active_connections:
            await self.send(text_data=json.dumps({
                'type': 'duplicated',
                'message': "DUPLICATED PLAYER\nGO TO AMPUERO AND SUCK",
                'color': 'red'
            }))
            active_connections.append(self.player.user_id)
            return

        active_connections.append(self.player.user_id)

        logger.info(f"Cliente autenticado - {self.player}")
        
        if self.player.user_id:
            if self.player.game_type == 'SEMIFINAL':
                waiting_semifinal_players.append(self.player)
            elif self.player.game_type == 'FINAL':
                waiting_final_players.append(self.player)
            elif self.player.game_type == 'FRIENDS':
                waiting_friends.append(self.player)
            else:
                waiting_players.append(self.player)
            await self.match_players()
        else:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': "Bad request, parameter 'user_id' is mandatory"
            }))



    async def match_players(self):


        logger.info(f"Match Friends: {len(waiting_friends)}")
        
        if len(waiting_players) >= 2:

            logger.info("HAy mas de 2 jugadores")

            player1 = waiting_players.pop(0)
            player2 = waiting_players.pop(0)

            player1.spacePressed = False
            player2.spacePressed = False

            self.player1_user_id = player1.user_id
            self.player1_display_name = player1.display_name
            
            self.player2_user_id = player2.user_id
            self.player2_display_name = player2.display_name

            logger.info(f"Emparejando hijos de puta ugerdos:")
            logger.info(f"Player 1 - ID: {player1.user_id}, Nombre: {player1.display_name}")
            logger.info(f"Player 2 - ID: {player2.user_id}, Nombre: {player2.display_name}")
            logger.info(f"Emparejando type:{player1.game_type}")
            logger.info(f"Emparejando id:{player1.game_id}")

            await self.init_new_game(player1, player2, 'INDIVIDUAL', 0)
            await self.notify_match_found(player1, player2)

        elif len(waiting_friends) >= 2:

            logger.info(f"Match A Friends 1 : {waiting_friends[0].game_id}")
            logger.info(f"Match B Friends 2 : {waiting_friends[1].game_id}")
            found_pair = False
            for i in range(len(waiting_friends)):
                for j in range(i+1, len(waiting_friends)):
                    if waiting_friends[i].game_id == waiting_friends[j].game_id:
                        player1 = waiting_friends.pop(i)
                        player2 = waiting_friends.pop(j-1)
                        found_pair = True
                        break
                if found_pair:
                    break
            else:
                return
              
            self.player1_user_id = player1.user_id
            self.player1_display_name = player1.display_name
            
            self.player2_user_id = player2.user_id
            self.player2_display_name = player2.display_name

            player1.spacePressed = False
            player2.spacePressed = False

            logger.info(f"Player 1 - ID: {player1.user_id}, Nombre: {player1.display_name}")
            logger.info(f"Player 2 - ID: {player2.user_id}, Nombre: {player2.display_name}")
            logger.info(f"Emparejando type:{player1.game_type}")
            logger.info(f"Emparejando id:{player1.game_id}")

            await self.init_new_game(player1, player2, 'FRIENDS', 0)
            await self.notify_match_found(player1, player2)

        elif len(waiting_semifinal_players) >= 4:

            random.shuffle(waiting_semifinal_players)

            tournament_uuid = uuid.uuid4()
            id_torneo = int(str(uuid.uuid4().hex)[:7], 16) 

            tournaments[id_torneo] = {
                'room1': None,
                'room2': None,
                'eliminated_players': [],
                'disconnected_players': 0,
                'players': []
            } 

            player1 = waiting_semifinal_players.pop(0)
            player2 = waiting_semifinal_players.pop(0)
            player1.tournament_player_number = 1
            player2.tournament_player_number = 2
            tournaments[id_torneo]['players'].append(player1)
            tournaments[id_torneo]['players'].append(player2)


            self.player1_user_id = player1.user_id
            self.player1_display_name = player1.display_name
            self.player2_user_id = player2.user_id
            self.player2_display_name = player2.display_name
            

            logger.info(f"Emparejando jugadores Grupo A:")
            logger.info(f"Player 1 - ID: {player1.user_id}, Nombre: {player1.display_name}")
            logger.info(f"Player 2 - ID: {player2.user_id}, Nombre: {player2.display_name}")

            await self.init_new_game(player1, player2, 'SEMIFINAL', id_torneo)
            await self.notify_match_found(player1, player2)
 
            player3 = waiting_semifinal_players.pop(0)
            player4 = waiting_semifinal_players.pop(0)
            player3.tournament_player_number = 3
            player4.tournament_player_number = 4
            tournaments[id_torneo]['players'].append(player3)
            tournaments[id_torneo]['players'].append(player4)
      
            self.player3_user_id = player3.user_id
            self.player3_display_name = player3.display_name
            self.player4_user_id = player4.user_id
            self.player4_display_name = player4.display_name

            await self.init_new_game(player3, player4, 'SEMIFINAL', id_torneo)
            await self.notify_match_found(player3, player4)

    async def init_new_game(self, player1, player2, match_type, tournament_id):

        room_id = f"room_{player1.user_id}_{player2.user_id}"


        await player1.send(text_data=json.dumps({
            'type': 'setName',
            'player1DisplayName': player1.display_name,
            'player2DisplayName': player2.display_name,
            'player1Id': player1.user_id,
            'player2Id': player2.user_id,
        }))
        await player2.send(text_data=json.dumps({
            'type': 'setName',
            'player1DisplayName': player1.display_name,
            'player2DisplayName': player2.display_name,
            'player1Id': player1.user_id,
            'player2Id': player2.user_id,            
            
        }))

        active_rooms[room_id] = {
            'player1': player1,
            'player2': player2,
            'room_id': room_id,
            'game_state': {
                'player1_id': player1.user_id,
                'player1_display_name': player1.display_name,                  
                'player2_id': player2.user_id,
                'player2_display_name': player2.display_name,   
                'match_type': match_type,
                'tournament_id': tournament_id,                
                'player1Y': 150,
                'Player1Points': 0,
                'player1up': False,
                'player1down': False,
                'player2Y': 150,
                'Player2Points': 0,
                'player2up': False,
                'player2down': False,
                'paddleSpeed': 12,
                'ball': {
                    'position': {'x': 300, 'y': 200},
                    'speed': {'x': 10, 'y': 1}
                }
            }
        }


        if player1.game_type == 'SEMIFINAL':
            logger.info(f"1 tournament_id {tournament_id}")

            if player1.tournament_player_number == 1:
                tournaments[tournament_id]['room1'] = room_id
            else:
                tournaments[tournament_id]['room2'] = room_id

        player1.room_id = room_id
        player2.room_id = room_id

    async def countdown(self, player1, player2):
        await player1.send(text_data=json.dumps({
            'type': 'new_message',
            'message': '3',
            'color':  'palegreen'
        }))
        await player2.send(text_data=json.dumps({
            'type': 'new_message',
            'message': '3',
            'color':  'palegreen'
        }))
        await asyncio.sleep(1)
        await player1.send(text_data=json.dumps({
            'type': 'new_message',
            'message': '2',
            'color':  'palegreen'
        }))
        await player2.send(text_data=json.dumps({
            'type': 'new_message',
            'message': '2',
            'color':  'palegreen'
        }))
        await asyncio.sleep(1)
        await player1.send(text_data=json.dumps({
            'type': 'new_message',
            'message': '1',
            'color':  'palegreen'
        }))
        await player2.send(text_data=json.dumps({
            'type': 'new_message',
            'message': '1',
            'color':  'palegreen'
        }))
        await asyncio.sleep(1)
        await player1.send(text_data=json.dumps({
            'type': 'start_playing',
        }))
        await player2.send(text_data=json.dumps({
            'type': 'start_playing',
        }))
    

    async def wait_for_players(self, player1, player2):
        room_id = f"room_{player1.user_id}_{player2.user_id}"
        
        while player1.spacePressed == False or player2.spacePressed == False:
            if not room_id in active_rooms:
                return

            if player1.spacePressed == True:
                await player1.send(text_data=json.dumps({
                    'type': 'waiting_other_press'
                }))
                
            if player2.spacePressed == True:
                await player2.send(text_data=json.dumps({
                    'type': 'waiting_other_press'
                }))
                
            await asyncio.sleep(0.1)

        await player1.send(text_data=json.dumps({
                'type': 'start_playing'
            }))
        await player2.send(text_data=json.dumps({
                'type': 'start_playing'
            }))


        logger.info("Los 2 pulsados")
        if room_id in active_tasks:
            active_tasks[room_id].cancel()
            active_tasks.pop(room_id, None)
        task = asyncio.create_task(self.update_ball(room_id))
        active_tasks[room_id] = task

        for roomID, tsk in active_tasks.items():
            logger.info(f"room_id: {roomID}")

    async def notify_match_found(self, player1, player2):

        await player1.send(text_data=json.dumps({
            'type': 'match_found',
            'room': player1.room_id,
            'game_type': player1.game_type
        }))
        await player2.send(text_data=json.dumps({
            'type': 'match_found',
            'room': player2.room_id,
            'game_type': player2.game_type
        }))

        if player1.room_id in active_tasks:
            active_tasks[player1.room_id].cancel()
            active_tasks.pop(player1.room_id, None)

        task = asyncio.create_task (self.wait_for_players(player1, player2))
        active_tasks[player1.room_id] = task



    async def notify_start_game(self, player1, player2):

        await player1.send(text_data=json.dumps({
            'type': 'start_game'
        }))
        await player2.send(text_data=json.dumps({
            'type': 'start_game'
        }))


    async def handle_action_player_movement(self, data):
        room = active_rooms.get(self.player.room_id, [])
        movement_direction = data.get('action', 0)
        is_player1 = room['player1'].user_id == self.player.user_id
        
        if movement_direction == 'upOn':
            if is_player1:
                room['game_state']['player1up'] = True
            else:
                room['game_state']['player2up'] = True
        elif movement_direction == 'downOn':
            if is_player1:
                room['game_state']['player1down'] = True
            else:
                room['game_state']['player2down'] = True
        elif movement_direction == 'upOff':
            if is_player1:
                room['game_state']['player1up'] = False
            else:
                room['game_state']['player2up'] = False
        elif movement_direction == 'downOff':
            if is_player1:
                room['game_state']['player1down'] = False
            else:
                room['game_state']['player2down'] = False
        else:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': "Bad request, parameter 'direction' is mandatory."
            }))
            return

    async def send_game_state_update(self, room, speedx, speedy):

        await room['player1'].send(text_data=json.dumps({
            'type': 'game_state_update',
            'player1Y': room['game_state']['player1Y'],
            'player2Y': room['game_state']['player2Y'],
            'ballX': room['game_state']['ball']['position']['x'],
            'ballY': room['game_state']['ball']['position']['y'],
            'speedX': speedx,
            'speedY': speedy,
            'time': time.time()
        }))
        await room['player2'].send(text_data=json.dumps({
            'type': 'game_state_update',
            'player1Y': room['game_state']['player1Y'],
            'player2Y': room['game_state']['player2Y'],
            'ballX': room['game_state']['ball']['position']['x'],
            'ballY': room['game_state']['ball']['position']['y'],
            'speedX': speedx,
            'speedY': speedy,
            'time': time.time()
        }))

    async def sendTournamentResultsToPlayers(self, room):


        logger.info(f"------PLAYER 1 points: {room['game_state']['Player1Points']}")
        logger.info(f"------PLAYER 2 points: {room['game_state']['Player2Points']}")


        if room['game_state']['Player1Points'] == 3:
            await room['player1'].send(text_data=json.dumps({
                'type': 'finish_tournament',
                'message': 'WINNER',
                'winner_player': 'player1'
            }))
            await room['player2'].send(text_data=json.dumps({
                'type': 'finish_tournament',
                'message': 'LOSER',
                'winner_name': room['player1'].display_name,
                'winner_player': 'player1'
            }))
            winner = room['player1'].display_name
        else:
            await room['player2'].send(text_data=json.dumps({
                'type': 'finish_tournament',
                'message': 'WINNER',
                'winner_player': 'player2'
            }))
            await room['player1'].send(text_data=json.dumps({
                'type': 'finish_tournament',
                'message': 'LOSER',
                'winner_name': room['player2'].display_name,
                'winner_player': 'player2'
            }))
            winner = room['player2'].display_name

        for player in tournaments[room['game_state']['tournament_id']]['eliminated_players']:
            await player.send(text_data=json.dumps({
                'type': 'finish_tournament',
                'message': 'LOSER',
                'winner_name': winner
            }))

    async def setFinal(self, room):

        logger.info(f"Player1Points: {room['game_state']['Player1Points']}, ID {room['player1'].user_id}")
        logger.info(f"Player2Points: {room['game_state']['Player2Points']}, ID {room['player2'].user_id}")

        try:
            await asyncio.sleep(0.2)
            logger.info(f"----ENTRO EN SET FINAL-disconected: {tournaments[room['game_state']['tournament_id']]['disconnected_players']}")
            
            if room['game_state']['Player1Points'] == 3 and room['player1'].user_id in  active_connections:
                if (tournaments[room['game_state']['tournament_id']]['disconnected_players'] == 3):
                    logger.info("Enviamos mensaje ganadora player 1")
                    await room['player1'].send(text_data=json.dumps({
                        'type': 'finish_tournament',
                        'message': 'WINNER',
                        'winner_player': 'player1'
                     }))
                    return
                else:
                    finalist = room['player1']
                    loser = room['player2']
                    tournaments[room['game_state']['tournament_id']]['eliminated_players'].append(room['player2'])
            else:
                if (tournaments[room['game_state']['tournament_id']]['disconnected_players'] == 3):
                    logger.info("Enviamos mensaje ganadora player 2")
                    await room['player2'].send(text_data=json.dumps({
                        'type': 'finish_tournament',
                        'message': 'WINNER',
                        'winner_player': 'player2'
                     }))
                    return
                else:
                    finalist = room['player2']
                    loser = room['player1']
                    tournaments[room['game_state']['tournament_id']]['eliminated_players'].append(room['player1'])

            finalist.spacePressed = False

            finalist.game_type = 'FINAL'
            finalist.tournament_id = room['game_state']['tournament_id']

            logger.info("----CONTINUO EN SET FINAL--------------------")

            for player in waiting_final_players:
                if player.tournament_id == finalist.tournament_id:
                    if not player.user_id in active_connections:
                        await self.sendTournamentResultsToPlayers({
                            'player1': finalist,
                            'player2': loser,
                            'game_state': {
                                'Player1Points': 3,
                                'Player2Points': 0,
                            }
                        })
                        return
                    logger.info("----------HAY FINALLLLLLLLLL----------")
                    logger.info(f"player ID: {player.user_id}")
                    logger.info(f"finalist ID: {finalist.user_id}")
                    await self.init_new_game(player, finalist, 'FINAL', player.tournament_id)
                    await self.notify_match_found(player, finalist)
                    return  

            logger.info("----------noooooo HAY FINALLLLLLLLLL----------")
            waiting_final_players.append(finalist)

        except Exception as e:
            logger.error(f"Error en setFinal: {e}")


    async def update_ball(self, room_id):
        
        if not active_rooms[room_id]:
            return
        
        room = active_rooms.get(room_id, [])
        """
        De momento el bucle es infinito pero hay que gestionar
        que acabe cuando la partida acaba o algún jugador se desconecta
        """

        incrementedSpeed = 0
        angleVariation = 1
        speedIncrement = 0.5
        playing = True
        ball_speed = room['game_state']['ball']['speed']
        ball_position = room['game_state']['ball']['position']
        speedX = room['game_state']['ball']['speed']['x']
        speedY = room['game_state']['ball']['speed']['y']
        totalSpeed = room['game_state']['ball']['speed']['x'] + room['game_state']['ball']['speed']['y']

        await self.countdown(room['player1'], room['player2'])

        while playing:

            ball_position['x'] += speedX
            ball_position['y'] += speedY

            if ball_position["y"] >= 390 or ball_position["y"] <= 10:
                speedY *= -1

#----------------LEFT COLISION----------------------------------------------------------------------------

            if ball_position["x"] <= 10:
                if (ball_position["y"] >= room['game_state']['player1Y'] and 
                ball_position["y"] < room['game_state']['player1Y'] + 33.3):
                    speedX *= -1
                    if speedY <= 0:
                        if abs(speedX) > abs(speedY):
                            speedX -= angleVariation
                            speedY -= angleVariation
                    else:
                        speedY -= angleVariation
                        speedX = totalSpeed - abs(speedY)
                elif (ball_position["y"] >= room['game_state']['player1Y'] + 33.3 and 
                ball_position["y"] < room['game_state']['player1Y'] + 66.6):
                    speedX *= -1
                elif (ball_position["y"] >= room['game_state']['player1Y'] + 66.6 and 
                ball_position["y"] < room['game_state']['player1Y'] + 100):
                    speedX *= -1
                    if speedY >= 0:
                        if abs(speedX) > abs(speedY):
                            speedX -= angleVariation
                            speedY += angleVariation
                    else:
                        speedY += angleVariation
                        speedX = totalSpeed - abs(speedY)
            
                else:
                    await self.marker_update(room, 2)
                    incrementedSpeed = 0
                    speedX = room['game_state']['ball']['speed']['x']
                    speedY = room['game_state']['ball']['speed']['y']
                    if room['game_state']['Player1Points'] == 3 or room['game_state']['Player2Points'] == 3:
                        
                        logger.info(f"game_type: {room['player1'].game_type}")
                        playing = False
                        
                        await self.send_game_result(room)

                        if  room['player1'].game_type == 'SEMIFINAL':
                            if room_id in active_tasks:
                                active_tasks[room_id].cancel()
                                active_tasks.pop(room_id, None)

                            task = asyncio.create_task(self.setFinal(room))
                            active_tasks[room_id] = task
                        elif room['player1'].game_type == 'FINAL':
                            await self.sendTournamentResultsToPlayers(room)
                            return
                        logger.info(f"----MANDAMOS DATOS DE FINAL------")
                        if room['game_state']['Player1Points'] > room['game_state']['Player2Points']:
                            await room['player1'].send(text_data=json.dumps({
                                'type': 'finish',
                                'message': 'YOU WIN!\nPRESS SPACE TO PLAY AGAIN',
                                'color':  'palegreen',
                                'game_type': room['player1'].game_type,
                                'player1Points': room['game_state']['Player1Points'],
                                'player2Points': room['game_state']['Player2Points'],
                            }))
                            await room['player2'].send(text_data=json.dumps({
                                'type': 'finish',
                                'message': 'YOU LOSE (YOU PIECE OF SHIT)\nPRESS SPACE TO PLAY AGAIN',
                                'color':  'red',
                                'game_type': room['player1'].game_type,
                                'player1Points': room['game_state']['Player1Points'],
                                'player2Points': room['game_state']['Player2Points'],
                            }))
                        else:
                            await room['player1'].send(text_data=json.dumps({
                                'type': 'finish',
                                'message': 'YOU LOSE (YOU PIECE OF SHIT)\nPRESS SPACE TO PLAY AGAIN',
                                'color':  'red',
                                'game_type': room['player1'].game_type,
                                'player1Points': room['game_state']['Player1Points'],
                                'player2Points': room['game_state']['Player2Points'],
                            }))
                            await room['player2'].send(text_data=json.dumps({
                                'type': 'finish',
                                'message': '¡YOU WIN!\nPRESS SPACE TO PLAY AGAIN',
                                'color':  'palegreen',
                                'game_type': room['player1'].game_type,
                                'player1Points': room['game_state']['Player1Points'],
                                'player2Points': room['game_state']['Player2Points'],
                            }))
                    else:
                        await room['player1'].send(text_data=json.dumps({
                            'type': 'update',
                            'player1Points': room['game_state']['Player1Points'],
                            'player2Points': room['game_state']['Player2Points'],
                        }))
                        await room['player2'].send(text_data=json.dumps({
                            'type': 'update',
                            'player1Points': room['game_state']['Player1Points'],
                            'player2Points': room['game_state']['Player2Points'],
                        }))
                        await self.countdown(room['player1'], room['player2'])
                        continue

                ball_position["x"] = 11
                speedX += speedIncrement
                if speedY <= 0:
                    speedY -= speedIncrement
                else:
                    speedY += speedIncrement
                incrementedSpeed += speedIncrement 
            
            
#----------------RIGHT COLISION----------------------------------------------------------------------------

            if ball_position["x"] >= 590:
                if (ball_position["y"] >= room['game_state']['player2Y'] and 
                ball_position["y"] < room['game_state']['player2Y'] + 33.3):
                    speedX *= -1
                    if speedY <= 0:
                        if abs(speedX) > abs(speedY):
                            speedX += angleVariation
                            speedY -= angleVariation
                    else:
                        speedY -= angleVariation
                        speedX = - totalSpeed + abs(speedY)
                elif (ball_position["y"] >= room['game_state']['player2Y'] + 33.3 and 
                ball_position["y"] < room['game_state']['player2Y'] + 66.6):
                    speedX *= -1
                elif (ball_position["y"] >= room['game_state']['player2Y'] + 66.6 and 
                ball_position["y"] < room['game_state']['player2Y'] + 100):
                    speedX *= -1
                    if speedY >= 0:
                        if abs(speedX) > abs(speedY):
                            speedX += angleVariation
                            speedY += angleVariation
                    else:
                        speedY += angleVariation
                        speedX = - totalSpeed + abs(speedY)
            
                else:
                    await self.marker_update(room, 1)
                    incrementedSpeed = 0
                    speedX = -room['game_state']['ball']['speed']['x']
                    speedY = room['game_state']['ball']['speed']['y']
                    
                    if room['game_state']['Player1Points'] == 3 or room['game_state']['Player2Points'] == 3: #fin de partida endgame                     
                        
                        logger.info(f"game_type: {room['player1'].game_type}")

                        await self.send_game_result(room)

                        playing = False

                        if  room['player1'].game_type == 'SEMIFINAL':
                            if room_id in active_tasks:
                                active_tasks[room_id].cancel()
                                active_tasks.pop(room_id, None)

                            task = asyncio.create_task(self.setFinal(room))
                            active_tasks[room_id] = task
                        elif room['player1'].game_type == 'FINAL':
                            await self.sendTournamentResultsToPlayers(room)
                            return

                        if room['game_state']['Player1Points'] > room['game_state']['Player2Points']:
                            await room['player1'].send(text_data=json.dumps({
                                'type': 'finish',
                                'message': 'YOU WIN!\nPRESS SPACE TO PLAY AGAIN',
                                'color':  'palegreen',
                                'game_type': room['player1'].game_type,
                                'player1Points': room['game_state']['Player1Points'],
                                'player2Points': room['game_state']['Player2Points'],
                            }))
                            await room['player2'].send(text_data=json.dumps({
                                'type': 'finish',
                                'message': 'YOU LOSE (YOU PIECE OF SHIT)\nPRESS SPACE TO PLAY AGAIN',
                                'color':  'red',
                                'game_type': room['player1'].game_type,
                                'player1Points': room['game_state']['Player1Points'],
                                'player2Points': room['game_state']['Player2Points'],
                            }))
                        else:
                            await room['player1'].send(text_data=json.dumps({
                                'type': 'finish',
                                'message': 'YOU LOSE (YOU PIECE OF SHIT)\nPRESS SPACE TO PLAY AGAIN',
                                'color':  'red',
                                'game_type': room['player1'].game_type,
                                'player1Points': room['game_state']['Player1Points'],
                                'player2Points': room['game_state']['Player2Points'],
                            }))
                            await room['player2'].send(text_data=json.dumps({
                                'type': 'finish',
                                'message': 'YOU WIN!\nPRESS SPACE TO PLAY AGAIN',
                                'color':  'palegreen',
                                'game_type': room['player1'].game_type,
                                'player1Points': room['game_state']['Player1Points'],
                                'player2Points': room['game_state']['Player2Points'],
                            }))
                    else:
                        await room['player1'].send(text_data=json.dumps({
                            'type': 'update',
                            'player1Points': room['game_state']['Player1Points'],
                            'player2Points': room['game_state']['Player2Points'],
                        }))
                        await room['player2'].send(text_data=json.dumps({
                            'type': 'update',
                            'player1Points': room['game_state']['Player1Points'],
                            'player2Points': room['game_state']['Player2Points'],
                        }))
                        await self.countdown(room['player1'], room['player2'])
                        continue

                
                ball_position["x"] = 589
                speedX -= speedIncrement
                if speedY <= 0:
                    speedY -= speedIncrement
                else:
                    speedY += speedIncrement
                incrementedSpeed += speedIncrement 

            # Paddels movement
            if room['game_state']['player1up'] and room['game_state']['player1Y'] > 0:
                room['game_state']['player1Y'] -= room['game_state']['paddleSpeed']
            if room['game_state']['player1down'] and room['game_state']['player1Y'] < 300:
                room['game_state']['player1Y'] += room['game_state']['paddleSpeed']
            if room['game_state']['player2up'] and room['game_state']['player2Y'] > 0:
                room['game_state']['player2Y'] -= room['game_state']['paddleSpeed']
            if room['game_state']['player2down'] and room['game_state']['player2Y'] < 300:
                room['game_state']['player2Y'] += room['game_state']['paddleSpeed']

            totalSpeed = abs(speedX) + abs(speedY)

            await self.send_game_state_update(room, speedX, speedY)
            await asyncio.sleep(0.030)


    async def marker_update(self, room, player):
        if player == 1:
            room['game_state']['Player1Points'] += 1
        else:
            room['game_state']['Player2Points'] += 1

        room['game_state']['ball']['position']['x'] = 300
        room['game_state']['ball']['position']['y'] = 200
        
        room['game_state']['player1Y'] = 150
        room['game_state']['player2Y'] = 150

