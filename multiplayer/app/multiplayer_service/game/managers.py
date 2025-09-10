import random

class GameManager:
    def __init__(self):
        self.waiting_players = []
        self.active_rooms = {}
        self.tournaments = {}
"""           
    def add_player(self, player, game_type='INDIVIDUAL'):
        if game_type == 'INDIVIDUAL':
            self.waiting_players.append(player)
        elif game_type == 'SEMIFINAL':
            self.tournaments.setdefault(player.tournament_id, {
                'waiting_players': []
            })['waiting_players'].append(player)
          
    def get_ready_players(self, game_type='INDIVIDUAL'):
        if game_type == 'INDIVIDUAL':
            if len(self.waiting_players) >= 2:
                return [self.waiting_players.pop(0) for _ in range(2)]
             

    def get_ready_players(self, game_type='INDIVIDUAL'):
        if game_type == 'INDIVIDUAL':
            if len(self.waiting_players) >= 2:
                return [self.waiting_players.pop(0) for _ in range(2)]
        elif game_type == 'FRIENDS':
            if len(self.waiting_friends) >= 2:
                return [self.waiting_friends.pop(0) for _ in range(2)]
        elif game_type == 'SEMIFINAL':
            if len(self.tournaments) > 0:
                for tournament in self.tournaments.values():
                    if len(tournament['waiting_players']) >= 4:
                        # Seleccionar aleatoriamente 4 jugadores
                        players = tournament['waiting_players']
                        random.shuffle(players)  # Mezclar la lista de jugadores
                        
                        # Emparejar los primeros 4 jugadores
                        player1 = players[0]
                        player2 = players[1]
                        player3 = players[2]
                        player4 = players[3]

                        # Retornar los emparejamientos
                        return [(player1, player2), (player3, player4)]

        return None 
"""