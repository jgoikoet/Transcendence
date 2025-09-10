from django.http import JsonResponse
from django.shortcuts import redirect
from django.conf import settings
from django.contrib.auth import logout, get_user_model
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from requests_oauthlib import OAuth2Session
from rest_framework_simplejwt.tokens import RefreshToken
from .models import ApiUser
import pyotp
import time
import random
import json
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    refresh['username'] = user.username
    refresh['display_name'] = user.username  

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

@api_view(['POST'])
def oauth_verify_2fa(request):
    user_id = request.data.get('user_id')
    code = request.data.get('code')
    if not user_id or not code:
        return Response({'error': 'User ID and code are required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    totp = pyotp.TOTP(user.apiuser.two_factor_secret)
    current_time = int(time.time())
    if totp.verify(code, valid_window=2):
        tokens = get_tokens_for_user(user)
        api_user = ApiUser.objects.get(user=user)
        return Response({
            **tokens,
            'user_id': user.id,
            'username': user.username,
            'display_name': api_user.display_name
        })
    else:
        return Response({'error': 'Invalid verification code'}, status=status.HTTP_400_BAD_REQUEST)

def get_oauth_session(state=None):
    return OAuth2Session(
        settings.OAUTH2_CLIENT_ID,
        redirect_uri=settings.OAUTH2_REDIRECT_URI,
        state=state
    )

def auth_login(request):
    oauth = get_oauth_session()
    authorization_url, state = oauth.authorization_url(settings.OAUTH2_AUTH_URL)
    request.session['oauth_state'] = state
    return redirect(authorization_url)

def auth_callback(request):
    oauth = get_oauth_session(state=request.session.get('oauth_state'))
    try:
        token = oauth.fetch_token(
            settings.OAUTH2_TOKEN_URL,
            client_secret=settings.OAUTH2_CLIENT_SECRET,
            authorization_response=request.build_absolute_uri()
        )
        request.session['oauth_token'] = token
        user_info = get_user_info(request)        
        if user_info:
            user = create_or_update_user(user_info)  
            if user.apiuser.two_factor_enabled:
                request.session['oauth_user_id'] = user.id
                return redirect(f"{settings.LOGIN_REDIRECT_URL}?oauth2fa={user.id}")
            tokens = get_tokens_for_user(user)
            api_user = ApiUser.objects.get(user=user)
            response_data = {
                'access': tokens['access'],
                'refresh': tokens['refresh'],
                'user': json.dumps(api_user.get_full_user_data())
            }
            
            redirect_url = f"{settings.LOGIN_REDIRECT_URL}#" + "&".join([f"{key}={value}" for key, value in response_data.items()])
            return redirect(redirect_url)
        else:
            return JsonResponse({'error': 'No se pudo obtener la información del usuario'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

def get_user_info(request):
    token = request.session.get('oauth_token')
    if not token:
        return None
    oauth = OAuth2Session(settings.OAUTH2_CLIENT_ID, token=token)
    try:
        user_info = oauth.get(settings.OAUTH2_API_BASE_URL + 'me').json()
        return user_info
    except Exception as e:
        return None

def create_or_update_user(user_info):
    oauth_id = str(user_info['id'])
    email = user_info.get('email', '')
    base_username = user_info['login']
    username = base_username
    random_number = random.randint(1000, 9999)
    try:
        api_user = ApiUser.objects.get(oauth_id=oauth_id)
        user = api_user.user
        created = False
    except ApiUser.DoesNotExist:
        while True:
            username = f"{base_username}{random_number}"
            if not User.objects.filter(username=username).exists():
                break
        user, created = User.objects.get_or_create(username=username)
        if created:
            user.email = email
            user.set_unusable_password()
            user.is_active = True
            user.save()
        
        api_user = ApiUser.objects.create(
            user=user,
            oauth_id=oauth_id,
            user_42=True
        )
    user.email = email
    user.first_name = user_info.get('first_name', '')
    user.last_name = user_info.get('last_name', '')
    api_user.display_name = username
    user.save()
    api_user.user_42 = True
    api_user.save()
    return user

def auth_logout(request):
    logout(request)
    return JsonResponse({"message": "Has cerrado sesión exitosamente."})
