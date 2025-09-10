from django.contrib.auth import authenticate
from django.contrib.auth.models import User as DjangoUser
from django.conf import settings
from django.http import JsonResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from ..models import ApiUser
from ..serializer import ApiUserSerializer

import pyotp

def get_user_list(request):
    users = ApiUser.objects.all().values('user__id', 'user__username')
    return Response(list(users))

def logout_view(request):
    try:
        refresh_token = request.data.get("refresh_token")
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
    except TokenError:
        return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def test_token(request):
    user = request.user
    return Response({
        'user_id': user.id,
        'username': user.username,
    })

def get_auth_url(request):
    auth_url = f"{settings.OAUTH2_AUTH_URL}?client_id={settings.OAUTH2_CLIENT_ID}&redirect_uri={settings.OAUTH2_REDIRECT_URI}&response_type=code"
    return JsonResponse({"auth_url": auth_url})

def oauth_login(request):
    auth_url = f"{settings.OAUTH2_AUTH_URL}?client_id={settings.OAUTH2_CLIENT_ID}&redirect_uri={settings.OAUTH2_REDIRECT_URI}&response_type=code"
    return redirect(auth_url)

def change_password(request):
    user = request.user

    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')

    if not current_password or not new_password:
        return Response({"error": "Both current and new password are required"}, 
                        status=status.HTTP_400_BAD_REQUEST)

    if not authenticate(username=user.username, password=current_password):
        return Response({"error": "Current password is incorrect"}, 
                        status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()

    return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)

def update_user_profile(request):
    try:
        django_user = request.user 
        api_user = ApiUser.objects.get(user=django_user)
    except (DjangoUser.DoesNotExist, ApiUser.DoesNotExist):
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    django_user.first_name = request.data.get('first_name', django_user.first_name)
    django_user.last_name = request.data.get('last_name', django_user.last_name)
    django_user.save()

    new_display_name = request.data.get('display_name')
    if new_display_name:
        if ApiUser.objects.filter(display_name=new_display_name).exclude(user=django_user).exists():
            return Response({"error": "Este nombre de visualización ya está en uso."}, status=status.HTTP_400_BAD_REQUEST)
        api_user.display_name = new_display_name
    api_user.save()

    updated_data = api_user.get_full_user_data()
    tokens = get_tokens_for_user(django_user)
    return Response({**updated_data, **tokens}, status=status.HTTP_200_OK)

def get_user_profile(request):
    try:
        api_user = ApiUser.objects.get(user=request.user)
        return Response(api_user.get_full_user_data())
    except ApiUser.DoesNotExist:
        return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    refresh['username'] = user.username
    try:
        api_user = ApiUser.objects.get(user=user)
        refresh['display_name'] = api_user.display_name
    except ApiUser.DoesNotExist:
        refresh['display_name'] = "Apiuser Error"
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    two_factor_code = request.data.get('two_factor_code')

    user = authenticate(username=username, password=password)
    
    if user:
        try:
            api_user = ApiUser.objects.get(user=user)
            if api_user.two_factor_enabled:
                if not two_factor_code:
                    return Response({'require_2fa': True}, status=status.HTTP_200_OK)
                totp = pyotp.TOTP(api_user.two_factor_secret)
                if not totp.verify(two_factor_code):
                    return Response({'error': 'Invalid 2FA code'}, status=status.HTTP_400_BAD_REQUEST)
        except ApiUser.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)
        tokens = get_tokens_for_user(user)
        return Response({
            **tokens,
            'user_id': user.id,
            'username': user.username,
            'display_name': api_user.display_name
        })
    
    return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

def get_user(request, pk):
    try:
        api_user = ApiUser.objects.get(user__id=pk)
        return Response(api_user.get_full_user_data())
    except ApiUser.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

def create_user(request):
    serializer = ApiUserSerializer(data=request.data)
    if serializer.is_valid():
        try:
            api_user = serializer.save()
            updated_data = api_user.get_full_user_data()
            tokens = get_tokens_for_user(api_user.user)
            return Response({**updated_data, **tokens}, status=status.HTTP_200_OK)
        except Exception as e:
            if 'username' in str(e):
                return Response({"error": "Username already exists"}, status=status.HTTP_409_CONFLICT)
            return Response({"error": "Error creating user"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

