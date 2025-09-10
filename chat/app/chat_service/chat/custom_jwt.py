from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.exceptions import AuthenticationFailed

class TokenOnlyJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        try:
            validated_token = AccessToken(raw_token)
            user_id = validated_token['user_id']
            return (type('SimpleUser', (), {'id': user_id}), validated_token)
        except Exception as e:
            raise AuthenticationFailed('Token inválido')

