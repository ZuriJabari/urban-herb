from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from ..models import UserPreferences, Address
from ..validators import validate_phone_number

User = get_user_model()

class UserPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreferences
        fields = ['id', 'user', 'theme', 'notification_preferences', 'language']
        read_only_fields = ['id', 'user']

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'
        read_only_fields = ['id', 'user']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name']
        read_only_fields = []

class UserDetailsSerializer(serializers.ModelSerializer):
    """
    Custom user details serializer for dj-rest-auth
    """
    preferences = UserPreferencesSerializer(read_only=True)
    addresses = AddressSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name', 'last_name', 'phone_number',
            'date_of_birth', 'bio', 'gender', 'is_email_verified',
            'preferences', 'addresses'
        )
        read_only_fields = ('id', 'email', 'is_email_verified')
        extra_kwargs = {
            'phone_number': {'required': False},
            'date_of_birth': {'required': False},
            'bio': {'required': False},
            'gender': {'required': False},
        }

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class RegisterSerializer(serializers.ModelSerializer):
    """
    Custom registration serializer for dj-rest-auth
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = (
            'email', 'password', 'confirm_password', 'first_name', 
            'last_name', 'phone_number'
        )

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Check if email already exists
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "A user with this email already exists."})
        
        # Validate phone number if provided
        if attrs.get('phone_number'):
            is_valid, number = validate_phone_number(attrs['phone_number'])
            if not is_valid:
                raise serializers.ValidationError({'phone_number': number})
            attrs['phone_number'] = number

        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()

        # Create default preferences
        UserPreferences.objects.create(user=user)
        
        return user

class PhoneLoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    code = serializers.CharField(required=False)

    def validate_phone_number(self, value):
        is_valid, number = validate_phone_number(value)
        if not is_valid:
            raise serializers.ValidationError(number)
        return number

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'confirm_password', 'first_name', 'last_name']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(min_length=6, max_length=6)
    new_password = serializers.CharField(validators=[validate_password])
    confirm_password = serializers.CharField()

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data

class EmailVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(min_length=6, max_length=6)
