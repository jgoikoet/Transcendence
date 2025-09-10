import json
import jwt
import os
import logging 
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Message, FriendRequest
from asgiref.sync import sync_to_async
from django.db.models import Q
from django.conf import settings

logger = logging.getLogger(__name__) 
connected_users = {}

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("Attempting to connect client...")
        self.user_id = None
        await self.accept()
        print("Client connected")

    def decode_jwt_token(self, token):
        try:
            # Decodifica el token usando la clave secreta de Django
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            return payload
        except Exception as e:
            logger.info(f"Error decodificando token: {str(e)}")
            return None



    async def disconnect(self, close_code):
        if hasattr(self, 'user_id') and self.user_id is not None:
            if self.user_id in connected_users:
                connected_users.pop(self.user_id)
                print(f"User {self.user_id} disconnected and removed from connected_users")
        print("Client disconnected")

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type', 0)

        if message_type == 'connect':
            await self.handle_action_connect(data)
        elif message_type == 'send_message':
            await self.handle_action_send_message(data)
        elif message_type == 'match_message':
            await self.handle_action_send_message(data)
        elif message_type == 'accept_match' or message_type == 'cancel_match' or message_type == 'reject_match': 
            await self.handle_action_match(data)
        elif message_type == 'read_message':
            await self.handle_read_message(data)
        else:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': "Bad request, parameter 'type' is mandatory"
            }))
    
    async def handle_read_message(self, data):
        if not await self.validate_data_on_action_send_message(data):
            return
        message_id = data.get('message_id', 0)
        try:
            message = await sync_to_async(Message.objects.get)(
                Q(id=message_id)
            )
            message.message_read = True
            await sync_to_async(message.save)()
        except Exception as e:
            await self.send_error_response(f"Error: {e}")

    async def handle_action_match(self, data):
        if not await self.validate_data_on_action_send_message(data):
            return
        recipient_user_id = data.get('recipient', 0)
        message_type = data.get('type', 0)
        message = data.get('message', 0)
        try:
            match = await sync_to_async(Message.objects.get)(
                Q(user_sender=self.user_id, user_recipient=recipient_user_id, invite_status=Message.InviteStatus.PENDING) |
                Q(user_sender=recipient_user_id, user_recipient=self.user_id, invite_status=Message.InviteStatus.PENDING)
            )
            if message_type == 'accept_match':
                match.invite_status = Message.InviteStatus.ACCEPTED
                match.message_read = True
            elif message_type == 'cancel_match':
                match.invite_status = Message.InviteStatus.CANCELLED
                match.message_read = True
                await connected_users[recipient_user_id].send(text_data=json.dumps({
                        'type': 'cancel_match',
                        'message': message
                    }))
            elif message_type == 'reject_match':
                match.invite_status = Message.InviteStatus.REJECTED
                match.message_read = True
                await connected_users[recipient_user_id].send(text_data=json.dumps({
                        'type': 'reject_match',
                        'message': message
                    }))
            await sync_to_async(match.save)()
        except Message.DoesNotExist:
            await self.send_error_response("Partida no encontrada")

    async def handle_action_connect(self, data):
        
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

        
        if hasattr(self, 'user_id') and self.user_id is not None:
            if self.user_id in connected_users:
                connected_users.pop(self.user_id)

        self.user_id = data.get('user_id', 0)

        if self.user_id == 0:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': "Bad request, parameter 'user_id' is mandatory"
            }))
            return

        connected_users[self.user_id] = self
        logger.info(f"Client {self.user_id} ready to receive messages")
        
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'user_id': self.user_id
        }))

    async def handle_action_send_message(self, data):
        if not await self.validate_data_on_action_send_message(data):
            return
        print("handle_action_send_message")
        recipient_user_id = data.get('recipient', 0)
        message = data.get('message', 0)
        message_type = data.get('type', 0)

        
        if await self.is_valid_message(self.user_id, recipient_user_id):
            # TODO: Insertar el mensaje en la base de datos
            if message_type == 'send_message':
                message_data = {
                    'user_sender': self.user_id,
                    'user_recipient': recipient_user_id,
                    'message': message,
                    'message_read': False,
                    'message_type': 0,
                    'invite_status': 0
                }
                message_created = await sync_to_async(Message.objects.create)(**message_data)
                is_message_saved = message_created.id is not None
                if not is_message_saved:
                    await self.send(text_data=json.dumps({
                        'type': 'error',
                        'message': "No se pudo enviar el mensaje. Intentelo de nuevo",
                        'status': 500
                    }))
                    return 
            elif message_type == 'match_message':
                try:
                    message_data = await sync_to_async(Message.objects.get)(
                    Q(user_sender=self.user_id, user_recipient=recipient_user_id, invite_status=Message.InviteStatus.PENDING) |
                    Q(user_sender=recipient_user_id, user_recipient=self.user_id, invite_status=Message.InviteStatus.PENDING)
                    )
                except Message.DoesNotExist:
                    message_data = {
                        'user_sender': self.user_id,
                        'user_recipient': recipient_user_id,
                        'message': message,
                        'message_read': False,
                        'message_type': 1,
                        'invite_status': 1
                    }
                    message_created = await sync_to_async(Message.objects.create)(**message_data)
                    is_message_saved = message_created.id is not None
                    if not is_message_saved:
                        await self.send(text_data=json.dumps({
                            'type': 'error',
                            'message': "No se pudo enviar la invitacion. Intentelo de nuevo",
                            'status': 500
                        }))
                        return 
            if recipient_user_id in connected_users:
                if message_type == 'send_message':
                    print(f"Enviando mensaje al usuario {recipient_user_id}")
                    await connected_users[recipient_user_id].send(text_data=json.dumps({
                        'type': 'incoming_message',
                        'message': message,
                        'message_id': message_created.id,
                        'sender_id': self.user_id
                    }))
                elif message_type == 'match_message':
                        await connected_users[recipient_user_id].send(text_data=json.dumps({
                        'type': 'match_request',
                        'message': message,
                        'message_id': message_created.id,
                        'sender_id': self.user_id
                    }))
            else:
                print('The recipient user is not currently connected.')
        else:
            await self.send_error_response(f"Communication with user {recipient_user_id} is not possible.")
        
    async def validate_data_on_action_send_message(self, data):
        ret = True
        if 'recipient' not in data:
            ret = False
            await self.send_error_response("Bad request, parameter 'recipient' is mandatory")

        if 'message' not in data:
            ret =  False
            await self.send_error_response("Bad request, parameter 'message' is mandatory")
        if ret:
            print("mensaje valido")
        else:
            print("mensaje invalido")
        return ret

    async def is_valid_message(self, sender_user_id, recipient_user_id):
        friend_request = await sync_to_async(FriendRequest.objects.filter)(
            Q(
                user_sender=sender_user_id, 
                user_recipient=recipient_user_id, 
                status=FriendRequest.Status.ACCEPTED,
                user_sender_blocked=False,
                user_recipient_blocked=False
            ) |
            Q(
                user_sender=recipient_user_id, 
                user_recipient=sender_user_id, 
                status=FriendRequest.Status.ACCEPTED,
                user_sender_blocked=False,
                user_recipient_blocked=False
            )
        )
        friend_request_valid = await sync_to_async(friend_request.exists)()
        if not friend_request_valid:
            return False
        return True
    
    async def send_error_response(self, error_message):
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': error_message
        }))
