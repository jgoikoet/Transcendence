from django.conf import settings
from django.http import HttpResponse, FileResponse
from rest_framework import status
from rest_framework.response import Response
from ..models import ApiUser
import os

def get_default_avatar(request):
    default_path = os.path.join(settings.MEDIA_ROOT, 'avatars/default.jpg')
    if os.path.exists(default_path):
        return FileResponse(open(default_path, 'rb'), content_type="image/jpeg")
    else:
        return HttpResponse("Default avatar not found", status=404)

def get_avatar(request, user_id):
    try:
        api_user = ApiUser.objects.get(user__id=user_id)
        if api_user.avatar_image:
            file_path = api_user.avatar_image.path
            if os.path.exists(file_path):
                return FileResponse(open(file_path, 'rb'), content_type="image/jpeg")
        return get_default_avatar(request)
    except ApiUser.DoesNotExist:
        return get_default_avatar(request)
    except Exception:
        return get_default_avatar(request)

def upload_avatar(request):
    if 'avatar_image' not in request.FILES:
        return Response({'error': 'No file was submitted'}, status=status.HTTP_400_BAD_REQUEST)
    
    file = request.FILES['avatar_image']
    user = request.user
    try:
        api_user = ApiUser.objects.get(user=user)
        file_name = f'avatar_{user.id}.{file.name.split(".")[-1]}'
        api_user.avatar_image.save(file_name, file, save=True)
        return Response({
            'message': 'Avatar uploaded successfully',
            'path': api_user.avatar_image.url
        }, status=status.HTTP_200_OK)
    except ApiUser.DoesNotExist:
        return Response({'error': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'An error occurred while uploading the avatar: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
