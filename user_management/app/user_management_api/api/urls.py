from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .oauth2_views import create_oauth2_app
from .custom_jwt import CustomTokenObtainPairView
from . import oauth42
from . import views

urlpatterns = [
    path("auth/users/<int:pk>/", views.get_user, name="get_user"),
    path("users/create/", views.create_user, name="create_user"),
    path('users/login/', views.login_user, name='login'),
    path("auth/users/profile/", views.get_user_profile, name="get_user_profile"),
    path('auth/users/update-profile/', views.update_user_profile, name='update_user_profile'),
    path("auth/users/change-password/", views.change_password, name="change_password"),
    path('auth/users/upload-avatar/', views.upload_avatar, name='upload_avatar'),
    path('users/avatar/<int:user_id>/', views.get_avatar, name='get_avatar'),
    path('create_oauth2_app/', create_oauth2_app, name='create_oauth2_app'),
    path('oauth/login/', oauth42.auth_login, name='oauth_login'),
    path('oauth/callback/', oauth42.auth_callback, name='oauth_callback'),
    path('oauth/user_info/', oauth42.get_user_info, name='user_info'),
    path('oauth/logout/', oauth42.auth_logout, name='oauth_logout'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/test-token/', views.test_token, name='test_token'),
    path('auth/logout/', views.logout_view, name='auth_logout'),
    path('auth/enable-2fa/', views.enable_2fa, name='enable_2fa'),
    path('verify-2fa/', views.verify_2fa, name='verify_2fa'),
    path('auth/disable-2fa/', views.disable_2fa, name='disable_2fa'),
    path('oauth-2fa-verify/', oauth42.oauth_verify_2fa, name='oauth_2fa_verify'),
    path('auth/users/list/', views.get_user_list, name='user_list'),
]

