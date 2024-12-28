from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'is_email_verified', 'firebase_uid')
        read_only_fields = ('id', 'is_email_verified', 'firebase_uid')

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField()
    last_name = serializers.CharField()

class PhoneLoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    verification_code = serializers.CharField()
