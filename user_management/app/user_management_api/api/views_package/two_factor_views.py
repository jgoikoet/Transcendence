from rest_framework.response import Response
import pyotp
import qrcode
import base64
from io import BytesIO
import logging
logger = logging.getLogger(__name__)
import time

def enable_2fa(request):
    user = request.user.apiuser
    if user.two_factor_enabled:
        return Response({'error': '2FA is already enabled'}, status=status.HTTP_400_BAD_REQUEST)
    secret = pyotp.random_base32()
    user.two_factor_secret = secret
    user.two_factor_enabled = True
    user.save()
    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(user.user.username, issuer_name="42 ft_transcendence")
    img = qrcode.make(uri)
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    qr_code = base64.b64encode(buffered.getvalue()).decode()
    return Response({
        'secret': secret,
        'qr_code': qr_code
    })

def verify_2fa(request):
    code = request.data.get('code')
    if not code:
        return Response({'error': 'Verification code is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = request.user.apiuser
    except AttributeError:
        return Response({'error': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)

    totp = pyotp.TOTP(user.two_factor_secret)
    current_time = int(time.time())

    if totp.verify(code, valid_window=15):
        user.two_factor_configured = True
        user.save()
        return Response({'message': '2FA verification successful'})
    else:
        return Response({'error': 'Invalid verification code'}, status=status.HTTP_400_BAD_REQUEST)

def disable_2fa(request):
    user = request.user.apiuser
    if not user.two_factor_enabled:
        return Response({'error': '2FA is not enabled'}, status=status.HTTP_400_BAD_REQUEST)
    user.two_factor_enabled = False
    user.two_factor_secret = None
    user.save()
    return Response({'message': '2FA has been disabled'})