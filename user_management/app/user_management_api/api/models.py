from django.db import models
from django.contrib.auth.models import User as DjangoUser
from django.utils import timezone

class User(models.Model):
    oauth_id = models.CharField(max_length=200, blank=True, null=True)
    user_42 = models.BooleanField(default=False, blank=True, null=True)
    two_factor_configured = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    def get_full_user_data(self):
        return {
            'id': self.id,
            'user_42': self.user_42,
            'oauth_id': self.oauth_id,
            'two_factor_configured': self.two_factor_configured,
            'avatar_image': self.avatar_image
        }

class ApiUser(models.Model):
    user = models.OneToOneField(
        DjangoUser,
        on_delete=models.CASCADE,
        primary_key=True,
    )
    display_name = models.CharField(max_length=150, unique=True, null=True)
    avatar_image = models.ImageField(upload_to='avatars/', null=True, blank=True, default='avatars/default.jpg')
    user_42 = models.BooleanField(default=False, blank=True, null=True)
    oauth_id = models.CharField(max_length=200, blank=True, null=True)
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=32, blank=True, null=True)
    two_factor_configured = models.BooleanField(default=False)

    def get_full_user_data(self):
        return {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'user_42': self.user_42,
            'oauth_id': self.oauth_id,
            'date_joined': timezone.localtime(self.user.date_joined).isoformat(),
            'last_login': timezone.localtime(self.user.last_login).isoformat() if self.user.last_login else None,
            'two_factor_enabled': self.two_factor_enabled,
            'two_factor_configured': self.two_factor_configured,
            'avatar_image': self.avatar_image.url if self.avatar_image else None,
            'display_name': self.display_name,
        }

    def __str__(self):
        return self.user.username