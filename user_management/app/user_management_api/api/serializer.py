from django.contrib.auth import get_user_model
from django.contrib.auth.models import User as DjangoUser
from rest_framework import serializers
from .models import ApiUser, User

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class ApiUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    display_name = serializers.CharField(allow_blank=True, required=False)
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    user_42 = serializers.BooleanField(required=False)
    oauth_id = serializers.CharField(allow_blank=True, required=False)

    class Meta:
        model = ApiUser
        fields = [
            'username', 'email', 'password', 'display_name', 'first_name', 'last_name',
            'user_42', 'oauth_id'
        ]

    def create(self, validated_data):
        user_data = {
            'username': validated_data['username'],
            'email': validated_data['email'],
            'first_name': validated_data['first_name'],
            'last_name': validated_data['last_name'],
        }
        password = validated_data['password']
        django_user = DjangoUser.objects.create_user(**user_data, password=password)
        api_user = ApiUser.objects.create(
            user=django_user,
            display_name=validated_data.get('username'),
            user_42=validated_data.get('user_42', False),
            oauth_id=validated_data.get('oauth_id', '')
        )
        return api_user