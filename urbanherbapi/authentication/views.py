from django.shortcuts import render
from rest_framework import status, viewsets, serializers
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.utils import timezone
from datetime import timedelta
import random
import string
import logging
from django.core.cache import cache
from rest_framework.views import APIView
from .models import User, Address, UserPreferences, VerificationCode
from .serializers import (
    UserSerializer, AddressSerializer, UserPreferencesSerializer,
    RegisterSerializer, PhoneLoginSerializer, EmailLoginSerializer,
    VerifyPhoneSerializer, PasswordResetRequestSerializer,
    PasswordResetVerifySerializer, PasswordResetConfirmSerializer,
    ChangePasswordSerializer
)
from .utils import create_verification_code, send_otp_via_sms, generate_otp
from .validators import validate_phone_number
from django.conf import settings

logger = logging.getLogger(__name__)

User = get_user_model()

class PhoneVerificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        """Send phone verification code"""
        logger.info(f"Received phone verification request: {request.data}")
        
        phone_number = request.data.get('phone_number')
        force_send = request.data.get('force_send', False)
        is_registration = request.data.get('is_registration', False)
        
        # Convert string 'False' to boolean False if needed
        if isinstance(is_registration, str):
            is_registration = is_registration.lower() == 'true'
        
        logger.info(f"Processing request - Phone: {phone_number}, Force: {force_send}, Registration: {is_registration}")
        
        if not phone_number:
            logger.error("Phone number not provided")
            return Response(
                {'error': 'Phone number is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate phone number
        is_valid, number = validate_phone_number(phone_number)
        logger.info(f"Phone validation result - Valid: {is_valid}, Number: {number}")
        
        if not is_valid:
            logger.error(f"Invalid phone number: {number}")
            return Response(
                {'error': number},  # number contains error message
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user exists and handle registration/login appropriately
        user = None
        try:
            user = User.objects.get(phone_number=number)
            logger.info(f"Found existing user: {user.id}")
            
            if is_registration:
                logger.warning(f"Attempted registration with existing phone number: {number}")
                return Response(
                    {'error': 'Phone number is already registered'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
        except User.DoesNotExist:
            logger.info(f"No existing user found for number: {number}")
            
            if not is_registration:
                logger.warning(f"Login attempt with non-existent phone number: {number}")
                return Response(
                    {'error': 'This phone number is not registered. Please register first.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create new unverified user for registration
            logger.info("Creating new unverified user")
            user = User.objects.create_user(
                phone_number=number,
                is_phone_verified=False,
                password=request.data.get('password', ''),
                first_name=request.data.get('first_name', ''),
                last_name=request.data.get('last_name', '')
            )
        
        # Rate limiting: Allow only 5 OTPs per phone number per hour
        cache_key = f'otp_count_{number}'
        otp_count = cache.get(cache_key, 0)
        logger.info(f"Current OTP count for {number}: {otp_count}")
        
        if otp_count >= 5 and not force_send:
            logger.warning(f"Rate limit exceeded for number: {number}")
            return Response(
                {'error': 'Too many OTP requests. Please try again later.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        
        # Create verification code
        verification = create_verification_code(user, type='phone', identifier=number)
        logger.info(f"Created verification code: {verification.code}")
        
        # Send OTP via SMS
        success, message = send_otp_via_sms(number, verification.code)
        logger.info(f"SMS send result - Success: {success}, Message: {message}")
        
        if success:
            # Increment OTP count if not force_send
            if not force_send:
                cache.set(cache_key, otp_count + 1, timeout=3600)  # 1 hour timeout
                logger.info(f"Incremented OTP count for {number} to {otp_count + 1}")
            
            return Response({
                'message': 'Verification code sent successfully',
                'details': message
            })
        else:
            # Delete the verification code if sending failed
            verification.delete()
            
            # If the error is due to rate limiting
            if "429" in message:
                logger.warning(f"SMS rate limit exceeded for number: {number}")
                return Response(
                    {'error': 'Too many SMS requests. Please try again later.'},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            
            logger.error(f"Failed to send SMS: {message}")
            return Response({
                'error': 'Failed to send verification code',
                'details': message
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

class VerifyPhoneView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        """Verify phone number with OTP"""
        phone_number = request.data.get('phone_number')
        code = request.data.get('code')
        
        if not phone_number or not code:
            return Response(
                {'error': 'Phone number and verification code are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate phone number
        is_valid, number = validate_phone_number(phone_number)
        if not is_valid:
            return Response(
                {'error': number},  # number contains error message
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(phone_number=number)
        except User.DoesNotExist:
            return Response(
                {'error': 'No user found with this phone number'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find valid verification code
        verification = VerificationCode.objects.filter(
            user=user,
            code=code,
            type='phone',
            identifier=number,
            expires_at__gt=timezone.now(),
            is_used=False
        ).first()
        
        if not verification:
            return Response(
                {'error': 'Invalid or expired code'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark verification as used
        verification.is_used = True
        verification.save()
        
        # Mark phone as verified
        user.is_phone_verified = True
        user.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Phone number verified successfully',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })

class RegistrationViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    format_kwarg = None

    def get_serializer_class(self):
        if self.action == 'register':
            return RegisterSerializer
        return UserSerializer

    def get_serializer(self, *args, **kwargs):
        """
        Return the serializer instance that should be used for validating and
        deserializing input, and for serializing output.
        """
        serializer_class = self.get_serializer_class()
        kwargs.setdefault('context', self.get_serializer_context())
        return serializer_class(*args, **kwargs)

    def get_serializer_context(self):
        """
        Extra context provided to the serializer class.
        """
        return {
            'request': self.request,
            'format': self.format_kwarg,
            'view': self
        }

    @action(detail=False, methods=['post'])
    def register(self, request):
        logger.debug(f"Register request data: {request.data}")
        serializer = self.get_serializer(data=request.data)
        try:
            logger.debug("Validating serializer data...")
            serializer.is_valid(raise_exception=True)
            
            # Format phone number if provided
            if 'phone_number' in serializer.validated_data:
                logger.debug(f"Validating phone number: {serializer.validated_data['phone_number']}")
                is_valid, number = validate_phone_number(serializer.validated_data['phone_number'])
                if not is_valid:
                    logger.error(f"Invalid phone number: {number}")
                    return Response(
                        {'error': number},  # number contains error message
                        status=status.HTTP_400_BAD_REQUEST
                    )
                serializer.validated_data['phone_number'] = number
                
                # Check if user exists with this phone number
                try:
                    existing_user = User.objects.get(phone_number=number)
                    logger.info(f"Found existing user: {existing_user.id} with phone {number}")
                    return Response(
                        {'error': 'User with this phone number already exists'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                except User.DoesNotExist:
                    logger.info(f"No existing user found with phone {number}")
                    pass
            
            logger.debug("Creating user...")
            user = serializer.save()
            logger.debug(f"User created: {user.id}")

            # Generate tokens
            logger.debug("Generating tokens...")
            refresh = RefreshToken.for_user(user)
            access = str(refresh.access_token)

            # Send verification code if phone number is provided
            verification_message = None
            if user.phone_number:
                logger.debug(f"Creating verification code for phone: {user.phone_number}")
                # Create verification code
                verification = create_verification_code(user, type='phone', identifier=user.phone_number)
                
                logger.debug("Sending OTP via SMS...")
                # Send OTP via SMS
                success, message = send_otp_via_sms(user.phone_number, verification.code)
                
                if not success:
                    logger.error(f"Failed to send OTP: {message}")
                    return Response(
                        {'error': 'Failed to send verification code', 'details': message},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                logger.debug("OTP sent successfully")
                verification_message = message

            response_data = {
                'user': UserSerializer(user).data,
                'access': access,
                'refresh': str(refresh),
                'message': 'Registration successful. Please verify your phone number.'
            }
            
            # Add verification message in development mode
            if verification_message and verification_message.startswith('Development mode:'):
                response_data['dev_message'] = verification_message

            logger.debug("Registration successful")
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except serializers.ValidationError as e:
            logger.error(f"Validation error: {str(e.detail)}")
            return Response(
                {'error': str(e.detail)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.exception("Unexpected error during registration")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LoginViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    format_kwarg = None

    def get_serializer_class(self):
        if self.action == 'login_phone':
            return PhoneLoginSerializer
        elif self.action == 'login_email':
            return EmailLoginSerializer
        elif self.action == 'verify_phone':
            return VerifyPhoneSerializer
        return UserSerializer

    def get_serializer(self, *args, **kwargs):
        """
        Return the serializer instance that should be used for validating and
        deserializing input, and for serializing output.
        """
        serializer_class = self.get_serializer_class()
        kwargs.setdefault('context', self.get_serializer_context())
        return serializer_class(*args, **kwargs)

    def get_serializer_context(self):
        """
        Extra context provided to the serializer class.
        """
        return {
            'request': self.request,
            'format': self.format_kwarg,
            'view': self
        }

    @action(detail=False, methods=['post'])
    def login_phone(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone_number = serializer.validated_data['phone_number']

        try:
            user = User.objects.get(phone_number=phone_number)
        except User.DoesNotExist:
            return Response(
                {'error': 'This phone number is not registered. Please register first.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        code = generate_otp()
        VerificationCode.objects.create(
            user=user,
            code=code,
            type='phone',
            identifier=phone_number,
            expires_at=timezone.now() + timedelta(minutes=10)
        )
        # TODO: Send SMS with verification code

        return Response({'detail': 'Verification code sent'})

    @action(detail=False, methods=['post'])
    def verify_phone(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone_number = serializer.validated_data['phone_number']
        code = serializer.validated_data['code']

        try:
            user = User.objects.get(phone_number=phone_number)
        except User.DoesNotExist:
            return Response(
                {'error': 'No user found with this phone number'},
                status=status.HTTP_400_BAD_REQUEST
            )

        verification = VerificationCode.objects.filter(
            user=user,
            code=code,
            type='phone',
            identifier=phone_number,
            is_used=False,
            expires_at__gt=timezone.now()
        ).first()

        if not verification:
            return Response(
                {'error': 'Invalid or expired code'},
                status=status.HTTP_400_BAD_REQUEST
            )

        verification.is_used = True
        verification.save()
        user.is_phone_verified = True
        user.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })

    @action(detail=False, methods=['post'])
    def login_email(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'No user found with this email'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user.check_password(password):
            return Response(
                {'error': 'Invalid password'},
                status=status.HTTP_400_BAD_REQUEST
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })

    @action(detail=False, methods=['post'])
    def request_password_reset(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier = serializer.validated_data['identifier']

        user = None
        if '@' in identifier:
            user = User.objects.filter(email=identifier).first()
        else:
            user = User.objects.filter(phone_number=identifier).first()

        if not user:
            return Response(
                {'error': 'No user found with this identifier'},
                status=status.HTTP_400_BAD_REQUEST
            )

        code = generate_otp()
        VerificationCode.objects.create(
            user=user,
            code=code,
            type='password_reset',
            identifier=identifier,
            expires_at=timezone.now() + timedelta(minutes=10)
        )
        # TODO: Send verification code via email or SMS

        return Response({'detail': 'Reset code sent'})

    @action(detail=False, methods=['post'])
    def verify_reset_code(self, request):
        serializer = PasswordResetVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier = serializer.validated_data['identifier']
        code = serializer.validated_data['code']

        verification = VerificationCode.objects.filter(
            identifier=identifier,
            code=code,
            type='password_reset',
            is_used=False,
            expires_at__gt=timezone.now()
        ).first()

        if not verification:
            return Response(
                {'error': 'Invalid or expired code'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({'detail': 'Code verified'})

    @action(detail=False, methods=['post'])
    def reset_password(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier = serializer.validated_data['identifier']
        code = serializer.validated_data['code']
        new_password = serializer.validated_data['new_password']

        verification = VerificationCode.objects.filter(
            identifier=identifier,
            code=code,
            type='password_reset',
            is_used=False,
            expires_at__gt=timezone.now()
        ).first()

        if not verification:
            return Response(
                {'error': 'Invalid or expired code'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = verification.user
        user.set_password(new_password)
        user.save()

        verification.is_used = True
        verification.save()

        return Response({'detail': 'Password reset successful'})

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)

    def get_object(self):
        return self.request.user

    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        if request.method == 'GET':
            return Response(self.get_serializer(request.user).data)
        
        serializer = self.get_serializer(
            request.user,
            data=request.data,
            partial=request.method == 'PATCH'
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        if not request.user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'error': 'Wrong password'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'detail': 'Password updated successfully'})

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        address = self.get_object()
        address.is_default = True
        address.save()
        return Response({'detail': 'Address set as default'})

class PreferencesViewSet(viewsets.ModelViewSet):
    serializer_class = UserPreferencesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserPreferences.objects.filter(user=self.request.user)

    def get_object(self):
        return self.request.user.preferences
