from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Address, UserPreferences, VerificationCode
from .validators import validate_phone_number

User = get_user_model()

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'street_address', 'city', 'district', 'phone_number', 
                 'is_default', 'label', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class UserPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreferences
        fields = ['sms_notifications', 'email_notifications', 
                 'promotions_notifications', 'order_updates_notifications',
                 'language', 'currency']

class UserSerializer(serializers.ModelSerializer):
    addresses = AddressSerializer(many=True, read_only=True)
    preferences = UserPreferencesSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'phone_number', 'first_name', 'last_name',
                 'is_phone_verified', 'is_email_verified', 'addresses',
                 'preferences', 'created_at', 'updated_at']
        read_only_fields = ['id', 'is_phone_verified', 'is_email_verified',
                           'created_at', 'updated_at']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['email', 'phone_number', 'password', 'confirm_password', 'first_name', 'last_name']
        extra_kwargs = {
            'email': {'required': False},
            'phone_number': {'required': False},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate(self, attrs):
        if not attrs.get('email') and not attrs.get('phone_number'):
            raise serializers.ValidationError({
                'error': "Either email or phone number must be provided"
            })

        # Validate phone number if provided
        if attrs.get('phone_number'):
            is_valid, number = validate_phone_number(attrs['phone_number'])
            if not is_valid:
                raise serializers.ValidationError({
                    'phone_number': number  # number contains error message
                })
            attrs['phone_number'] = number

        # Check if phone number already exists
        if attrs.get('phone_number'):
            if User.objects.filter(phone_number=attrs['phone_number']).exists():
                raise serializers.ValidationError({
                    'phone_number': 'User with this phone number already exists.'
                })

        # Check if email already exists
        if attrs.get('email'):
            if User.objects.filter(email=attrs['email']).exists():
                raise serializers.ValidationError({
                    'email': 'User with this email already exists.'
                })

        # Check if passwords match
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({
                'error': "Passwords do not match."
            })

        return attrs

    def create(self, validated_data):
        # Remove confirm_password from the data
        validated_data.pop('confirm_password', None)
        
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create default preferences
        UserPreferences.objects.create(user=user)
        
        return user

class PhoneLoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    
    def validate_phone_number(self, value):
        is_valid, number = validate_phone_number(value)
        if not is_valid:
            raise serializers.ValidationError(number)  # number contains error message
        return number

class EmailLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class VerifyPhoneSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    code = serializers.CharField(min_length=6, max_length=6)

class PasswordResetRequestSerializer(serializers.Serializer):
    identifier = serializers.CharField(help_text="Email or phone number")

class PasswordResetVerifySerializer(serializers.Serializer):
    identifier = serializers.CharField()
    code = serializers.CharField(min_length=6, max_length=6)

class PasswordResetConfirmSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    code = serializers.CharField(min_length=6, max_length=6)
    new_password = serializers.CharField(min_length=6)

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=6)
