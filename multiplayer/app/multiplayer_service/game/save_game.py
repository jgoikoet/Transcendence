import json
import pika
import os
import logging

logger = logging.getLogger(__name__) 

semifinal_data = {}


async def send_game_result(room):
    if room['game_state']['match_type'] != 'FRIENDS':
        winner = 0
        if room['game_state']['Player1Points'] > room['game_state']['Player2Points']:
            winner = room['game_state']['player1_id']
            player_display_name = room['game_state']['player1_display_name']
        else:
            winner = room['game_state']['player2_id']
            player_display_name = room['game_state']['player2_display_name']

        data = {
            "player1_id": room['game_state']['player1_id'],
            "player2_id": room['game_state']['player2_id'],
            "player1_display_name": room['game_state']['player1_display_name'],
            "player2_display_name": room['game_state']['player2_display_name'],
            "player1_score": room['game_state']['Player1Points'],
            "player2_score": room['game_state']['Player2Points'],
            "match_type": room['game_state']['match_type'],
            "winner_id": winner,
            "tournament_id": room['game_state']['tournament_id'],
        }
        logger.info(f"Winner is - {player_display_name}")

        if room['game_state']['match_type'] == 'SEMIFINAL':
            if room['game_state']['tournament_id'] not in semifinal_data:
                semifinal_data[room['game_state']['tournament_id']] = []
            semifinal_data[room['game_state']['tournament_id']].append(data)
        elif room['game_state']['match_type'] == 'FINAL':
            if room['game_state']['tournament_id'] in semifinal_data and len(semifinal_data[room['game_state']['tournament_id']]) == 2:
                await queue_message(os.getenv("RABBITMQ_PONG_MATCH_QUEUE"), semifinal_data[room['game_state']['tournament_id']][0])
                await queue_message(os.getenv("RABBITMQ_PONG_MATCH_QUEUE"), semifinal_data[room['game_state']['tournament_id']][1])
                del semifinal_data[room['game_state']['tournament_id']]
            await queue_message(os.getenv("RABBITMQ_PONG_MATCH_QUEUE"), data)
        else:
            await queue_message(os.getenv("RABBITMQ_PONG_MATCH_QUEUE"), data)


        #await queue_message(os.getenv("RABBITMQ_PONG_MATCH_QUEUE"), data)
        
async def queue_message(queue, message):
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            host=os.getenv("RABBITMQ_HOST"),
            credentials=pika.PlainCredentials(
                os.getenv("RABBITMQ_DEFAULT_USER"),
                os.getenv("RABBITMQ_DEFAULT_PASS")
            )
        )
    )
    channel = connection.channel()
    channel.queue_declare(queue=queue)
    channel.basic_publish(
        exchange='',
        routing_key=queue,
        body=json.dumps(message)
    )
    connection.close()

async def end_tournament(tournament_id, winner_id):
    # Lógica para finalizar el torneo
    print(f"Finalizando torneo {tournament_id} con ganador {winner_id}")
