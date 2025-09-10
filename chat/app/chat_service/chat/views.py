# Rest Framework imports
from rest_framework import status  # HTTP status codes
from rest_framework.decorators import api_view, authentication_classes  # Decorators for API views
from rest_framework.response import Response  # REST framework's Response class
from rest_framework_simplejwt.authentication import JWTStatelessUserAuthentication 

from .views_package import views_messages, views_friends

@api_view(['POST'])
@authentication_classes([JWTStatelessUserAuthentication])
def create_friend_requests(request):
    try:
        return views_friends.create_friend_requests(request)
    except Exception as e:
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([JWTStatelessUserAuthentication])
def get_pending_friend_requests_by_sender(request, sender_id):
    try:
        return views_friends.get_pending_friend_requests_by_sender(request, sender_id)
    except Exception as e:
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([JWTStatelessUserAuthentication])
def get_pending_friend_requests_by_recipient(request, recipient_id):
    try:
        return views_friends.get_pending_friend_requests_by_recipient(request, recipient_id)
    except Exception as e:
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([JWTStatelessUserAuthentication])
def get_friends(request, id):
    try:
        return views_friends.get_friends(request, id)
    except Exception as e:
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([JWTStatelessUserAuthentication])
def get_friends_blocked(request, id):
    try:
        return views_friends.get_friends_blocked(request, id)
    except Exception as e:
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@authentication_classes([JWTStatelessUserAuthentication])
def accept_friend_request(request):
    try:
        return views_friends.accept_friend_request(request)
    except Exception as e:
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
@authentication_classes([JWTStatelessUserAuthentication])
def block_friend(request):
    try:
        return views_friends.block_friend(request)
    except Exception as e:
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@authentication_classes([JWTStatelessUserAuthentication])
def unblock_friend(request):
    try:
        return views_friends.unblock_friend(request)
    except Exception as e:
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@authentication_classes([JWTStatelessUserAuthentication])
def delete_friend_request(request, sender_id, recipient_id):
    try:
        return views_friends.delete_friend_request(request, sender_id, recipient_id)
    except Exception as e:
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@authentication_classes([JWTStatelessUserAuthentication])
def get_messages(request):
    try:
        return views_messages.get_messages(request)
    except Exception as e:
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([JWTStatelessUserAuthentication])
def get_messages_not_read(request, user_sender):
    try:
        return views_messages.get_messages_not_read(request, user_sender)
    except Exception as e:
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([JWTStatelessUserAuthentication])
def get_messages_not_read_total(request):
    try:
        return views_messages.get_messages_not_read_total(request)
    except Exception as e:
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([JWTStatelessUserAuthentication])
def get_match_pending(request, user_sender):
    try:
        return views_messages.get_match_pending(request, user_sender)
    except Exception as e:
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)