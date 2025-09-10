import jwt
from django.conf import settings

def get_user_id_from__data(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    payload = decode_jwt_token(token)
    if payload is None:
        return None
    return payload.get('user_id')

def decode_jwt_token(token):
    try:
        # Decodifica el token usando la clave secreta de Django
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        return payload
    except Exception as e:
        print(f"Error decodificando token: {str(e)}")
        return None
