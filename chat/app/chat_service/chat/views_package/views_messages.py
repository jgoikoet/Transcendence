from django.db.models import Q
from rest_framework import status
from rest_framework.response import Response

from ..models import Message
from ..serializer import MessageSerializer
from ..utils import get_user_id_from__data

def get_messages(request):
    user1 = get_user_id_from__data(request)
    if user1 is None:
        return Response(
            {'message': 'User ID not found in token payload.'},
            status=status.HTTP_400_BAD_REQUEST
        )      
    try:
        user2 = request.data.get('user2')

        if user1 and user2:
            messages = Message.objects.filter(
                (Q(user_sender=user1, user_recipient=user2) | Q(user_sender=user2, user_recipient=user1)) &
                (Q(invite_status=Message.InviteStatus.NONE) | Q(invite_status=Message.InviteStatus.PENDING))
            )
            messages.update(message_read=True)
            messages = messages.all()
            serializer = MessageSerializer(messages, many=True)
            return Response(serializer.data)
        else:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': e}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def get_messages_not_read(request, user_sender):
    user_recipient = get_user_id_from__data(request)
    if user_recipient is None:
        return Response(
            {'message': 'User ID not found in token payload.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    messages = Message.objects.filter(
        Q(user_sender=user_sender, user_recipient=user_recipient, message_read=False)
    )
    if messages.exists():
        return Response(
            {'message': True},
            status=status.HTTP_200_OK
        )
    return Response(
        {'message': False},
        status=status.HTTP_200_OK
    )

def get_messages_not_read_total(request):
    user_recipient = get_user_id_from__data(request)
    if user_recipient is None:
        return Response(
            {'message': 'User ID not found in token payload.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    messages = Message.objects.filter(
        Q(user_recipient=user_recipient, message_read=False)
    )
    if messages.exists():
        return Response(
            {'message': True},
            status=status.HTTP_200_OK
        )
    return Response(
        {'message': False},
        status=status.HTTP_200_OK
    )

def get_match_pending(request, user_sender):
    user_recipient = get_user_id_from__data(request)
    if user_recipient is None:
        return Response(
            {'message': 'User ID not found in token payload.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    messages = Message.objects.filter(
        Q(user_sender=user_sender, user_recipient=user_recipient, invite_status=Message.InviteStatus.PENDING)
    )
    if messages.exists():
        return Response(
            {'message': True},
            status=status.HTTP_200_OK
        )
    return Response(
        {'message': False},
        status=status.HTTP_200_OK
    )

