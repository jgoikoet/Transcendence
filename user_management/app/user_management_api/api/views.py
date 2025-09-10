from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication 
from .views_package import user_views, avatar_views, two_factor_views


def validate_request_data(data):
    for key, value in data.items():
        if key not in ['access', 'refresh'] and len(value) > 150:
            return False, key
    return True, None


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user(request, pk):
	try:
		return user_views.get_user(request, pk)
	except:
		return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
	
@api_view(['POST'])
def create_user(request):
    try:
        is_valid, invalid_key = validate_request_data(request.data)
        if not is_valid:
            return Response({'error': f'{invalid_key} too long'}, status=status.HTTP_400_BAD_REQUEST)
        return user_views.create_user(request)
    except:
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def login_user(request):
    try:
        is_valid, invalid_key = validate_request_data(request.data)
        if not is_valid:
            return Response({'error': f'{invalid_key} too long'}, status=status.HTTP_400_BAD_REQUEST)
        return user_views.login_user(request)
    except:
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

	
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
	try:
		return user_views.get_user_profile(request)
	except:
		return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
	
@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    try:
        is_valid, invalid_key = validate_request_data(request.data)
        if not is_valid:
            return Response({'error': f'{invalid_key} too long'}, status=status.HTTP_400_BAD_REQUEST)
        return user_views.update_user_profile(request)
    except:
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

	
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def change_password(request):
    try:
        is_valid, invalid_key = validate_request_data(request.data)
        if not is_valid:
            return Response({'error': f'{invalid_key} too long'}, status=status.HTTP_400_BAD_REQUEST)
        return user_views.change_password(request)
    except:
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
	
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def test_token(request):
	try:
		return user_views.test_token(request)
	except:
		return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
	
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def logout_view(request):
	try:
		return user_views.logout_view(request)
	except:
		return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
	
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_list(request):
	try:
		return user_views.get_user_list(request)
	except:
		return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
	
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def upload_avatar(request):
	try:
		return avatar_views.upload_avatar(request)
	except:
		return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
	
@api_view(['GET'])
def get_avatar(request, user_id):
	try:
		return avatar_views.get_avatar(request, user_id)
	except:
		return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def enable_2fa(request):
	try:
		return two_factor_views.enable_2fa(request)
	except:
		return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
	
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_2fa(request):
	try:
		return two_factor_views.verify_2fa(request)
	except:
		return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
	
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def disable_2fa(request):
	try:
		return two_factor_views.disable_2fa(request)
	except:
		return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
