from django.db.models import Q
from rest_framework import status
from rest_framework.response import Response

from ..models import FriendRequest
from ..serializer import FriendRequestSerializer
from ..utils import get_user_id_from__data
from ..consumers import connected_users

def create_friend_requests(request):
	sender_id = get_user_id_from__data(request)
	if sender_id is None:
		return Response(
			{'message': 'User ID not found in token payload.'},
			status=status.HTTP_400_BAD_REQUEST
		)   
	recipient_id = request.data.get('user_recipient')

	if FriendRequest.objects.filter(
		(Q(user_sender=sender_id, user_recipient=recipient_id) | Q(user_sender=recipient_id, user_recipient=sender_id)) &
		(Q(status=FriendRequest.Status.PENDING) | Q(status=FriendRequest.Status.ACCEPTED)) 
	).exists():
		return Response(
			{'message': 'A friend request already exists between these users.'},
			status=status.HTTP_409_CONFLICT
		)
	serializer = FriendRequestSerializer(data=request.data)
	if serializer.is_valid():
		serializer.save()
		return Response(serializer.data, status=status.HTTP_201_CREATED)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def get_pending_friend_requests_by_sender(request, sender_id):
	sender_id = get_user_id_from__data(request)
	if sender_id is None:
		return Response(
			{'message': 'User ID not found in token payload.'},
			status=status.HTTP_400_BAD_REQUEST
		)  
	friend_requests = FriendRequest.objects.filter(user_sender=sender_id, status=FriendRequest.Status.PENDING)
	serializer = FriendRequestSerializer(friend_requests, many=True)
	return Response(serializer.data)

def get_pending_friend_requests_by_recipient(request, recipient_id):
	friend_requests = FriendRequest.objects.filter(user_recipient=recipient_id, status=FriendRequest.Status.PENDING)
	serializer = FriendRequestSerializer(friend_requests, many=True)
	return Response(serializer.data)

def get_friends(request, id):
	user_id = get_user_id_from__data(request)
	if user_id is None:
		return Response(
			{'message': 'User ID not found in token payload.'},
			status=status.HTTP_400_BAD_REQUEST
		)          # Obtenemos las amistades
	friend_requests = FriendRequest.objects.filter(
		(Q(user_sender=user_id) | Q(user_recipient=user_id)) & 
		Q(status=FriendRequest.Status.ACCEPTED)
	)
	serializer = FriendRequestSerializer(friend_requests, many=True)
	# Añadimos el estado de conexión a cada amigo
	response_data = []
	for friend in serializer.data:
		friend_data = dict(friend)
		# Determinamos cuál es el ID del amigo
		friend_id = int(friend['user_recipient']) if int(friend['user_sender']) == user_id else int(friend['user_sender'])
		# Añadimos información adicional
		friend_data['friend_id'] = friend_id
		friend_data['is_online'] = friend_id in connected_users
		# Debug
		print(f"Friend ID: {friend_id}, Online: {friend_id in connected_users}")
		print(f"Connected users: {list(connected_users.keys())}")
		response_data.append(friend_data)
	return Response(response_data)

def get_friends_blocked(request, id):
	id = get_user_id_from__data(request)
	if id is None:
		return Response(
			{'message': 'User ID not found in token payload.'},
			status=status.HTTP_400_BAD_REQUEST
		)           
	friends_blocked = FriendRequest.objects.filter(
		Q(user_sender=id, user_recipient_blocked=True, status=FriendRequest.Status.ACCEPTED) |
		Q(user_recipient=id, user_sender_blocked=True, status=FriendRequest.Status.ACCEPTED)
	)
	serializer = FriendRequestSerializer(friends_blocked, many=True)
	return Response(serializer.data)

def accept_friend_request(request):
	recipient_id = get_user_id_from__data(request)
	if recipient_id is None:
		return Response(
			{'message': 'User ID not found in token payload.'},
			status=status.HTTP_400_BAD_REQUEST
		)  
	sender_id  = request.data.get('user_sender')
	if sender_id is None:
		return Response(
			{'message': 'recipient_id not found in token payload.'},
			status=status.HTTP_400_BAD_REQUEST
		)          
	try:
		friend_request = FriendRequest.objects.get(user_sender=sender_id, user_recipient=recipient_id, status=FriendRequest.Status.PENDING)
		if friend_request.status == FriendRequest.Status.PENDING:
			friend_request.status = FriendRequest.Status.ACCEPTED
			friend_request.save()
			return Response({'message': 'Friend request accepted successfully'}, status=status.HTTP_200_OK)
		else:
			return Response({
				'message': 'Friend request already accepted or invalid'
			}, status=status.HTTP_400_BAD_REQUEST)
	except FriendRequest.DoesNotExist:
		return Response({
			'message': 'Friend request not found.',
			'sender_id': sender_id,
			'recipient_id': recipient_id
		}, status=status.HTTP_404_NOT_FOUND)
	
def block_friend(request):
	user_id = get_user_id_from__data(request)
	if user_id is None:
		return Response(
			{'message': 'User ID not found in token payload.'},
			status=status.HTTP_400_BAD_REQUEST
		)  
	id_to_block = request.data.get('user_recipient')
	try:
		friend_to_block = FriendRequest.objects.get(
			Q(user_sender=user_id, user_recipient=id_to_block, status=FriendRequest.Status.ACCEPTED, user_recipient_blocked=False) |
			Q(user_sender=id_to_block, user_recipient=user_id, status=FriendRequest.Status.ACCEPTED, user_sender_blocked=False)
		)
		if friend_to_block.user_sender == user_id:
			friend_to_block.user_recipient_blocked = True
			
		elif friend_to_block.user_sender == id_to_block:
			friend_to_block.user_sender_blocked = True
		else:
			return Response({'message': 'Friend already blocked or invalid request'}, status=status.HTTP_400_BAD_REQUEST)
		friend_to_block.save()
		return Response({'message': 'Friend blocked successfully'}, status=status.HTTP_200_OK)
	except FriendRequest.DoesNotExist:
		return Response({'message:' 'Friend request not found'}, status=status.HTTP_404_NOT_FOUND)
	
def unblock_friend(request):
	user_id = get_user_id_from__data(request)
	if user_id is None:
		return Response(
			{'message': 'User ID not found in token payload.'},
			status=status.HTTP_400_BAD_REQUEST
		)  
	id_to_unblock = request.data.get('user_recipient')
	try: 
		friend_to_unblock = FriendRequest.objects.get(
			Q(user_sender=user_id, user_recipient=id_to_unblock, status=FriendRequest.Status.ACCEPTED, user_recipient_blocked=True) |
			Q(user_sender=id_to_unblock, user_recipient=user_id, status=FriendRequest.Status.ACCEPTED, user_sender_blocked=True)
		)
		if friend_to_unblock.user_sender == user_id:
			friend_to_unblock.user_recipient_blocked = False
		elif friend_to_unblock.user_sender == id_to_unblock:
			friend_to_unblock.user_sender_blocked = False
		else:
			return Response({'message': 'Friend already unblocked or invalid request'}, status=status.HTTP_400_BAD_REQUEST)
		friend_to_unblock.save()
		return Response({'message': 'Friend unblocked successfully'}, status=status.HTTP_200_OK)
	except FriendRequest.DoesNotExist:
		return Response({'message:' 'Friend request not found'}, status=status.HTTP_404_NOT_FOUND)
	
def delete_friend_request(request, sender_id, recipient_id):
    sender_pt = get_user_id_from__data(request)
    if sender_pt is None:
        return Response(
            {'message': 'User ID not found in token payload.'},
            status=status.HTTP_400_BAD_REQUEST
        )      
    try:
        request_to_delete = FriendRequest.objects.get(
            Q(user_sender=sender_id, user_recipient=recipient_id) |
            Q(user_sender=recipient_id, user_recipient=sender_id)
        )
        request_to_delete.delete()
        return Response({'message:' 'Friend request deleted'}, status=status.HTTP_200_OK)
    except FriendRequest.DoesNotExist:
        return Response({'message:' 'Friend request not found'}, status=status.HTTP_404_NOT_FOUND)
