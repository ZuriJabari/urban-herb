from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from django.utils import timezone
from authentication.models import User, Address, UserPreferences, VerificationCode
from authentication.serializers import (
    UserSerializer, AddressSerializer, PreferencesSerializer,
    UserRegistrationSerializer, UserLoginSerializer
)
from twilio.rest import Client
from django.conf import settings
import random
import string

class RegistrationViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate access and refresh tokens
            refresh = RefreshToken.for_user(user)
            tokens = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
            
            return Response({
                'user': UserSerializer(user).data,
                'tokens': tokens
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    serializer_class = UserLoginSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            identifier = serializer.validated_data.get('email') or serializer.validated_data.get('phone_number')
            password = serializer.validated_data['password']
            
            user = authenticate(username=identifier, password=password)
            if user:
                refresh = RefreshToken.for_user(user)
                tokens = {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
                return Response({
                    'user': UserSerializer(user).data,
                    'tokens': tokens
                })
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Only allow users to see their own profile"""
        return User.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        user = request.user
        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        elif request.method == 'PATCH':
            serializer = self.get_serializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Only allow users to see their own addresses"""
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Set the user when creating a new address"""
        serializer.save(user=self.request.user)

class PreferencesViewSet(viewsets.ModelViewSet):
    serializer_class = PreferencesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Only allow users to see their own preferences"""
        return UserPreferences.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Set the user when creating preferences"""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['patch'])
    def me(self, request):
        """Update the authenticated user's preferences"""
        try:
            preferences = self.get_queryset().get()
            serializer = self.get_serializer(preferences, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except UserPreferences.DoesNotExist:
            # If preferences don't exist, create them
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PhoneVerificationView(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def create(self, request):
        phone_number = request.data.get('phone_number')
        is_registration = request.data.get('is_registration', False)
        
        if not phone_number:
            return Response({'error': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Check if user exists for login
            if not is_registration:
                try:
                    user = User.objects.get(phone_number=phone_number)
                except User.DoesNotExist:
                    return Response({'error': 'No user found with this phone number'}, status=status.HTTP_404_NOT_FOUND)

            # Generate verification code
            code = ''.join(random.choices(string.digits, k=6))
            
            # Save verification code
            verification = VerificationCode.objects.create(
                phone_number=phone_number,
                code=code
            )
            
            try:
                # Attempt to send SMS using Twilio
                client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
                message = client.messages.create(
                    body=f'Your UrbanHerb verification code is: {code}',
                    from_=settings.TWILIO_PHONE_NUMBER,
                    to=phone_number
                )
            except Exception as twilio_error:
                # Log the Twilio error
                print(f"Twilio Error: {str(twilio_error)}")
                
                # For development/testing, return the code in the response
                if settings.DEBUG:
                    return Response({
                        'message': 'SMS sending failed (development mode)',
                        'debug_code': code,  # Only included in development mode
                        'error': str(twilio_error)
                    })
                else:
                    # In production, don't expose the code
                    return Response({
                        'error': 'Failed to send verification code',
                        'detail': 'Please try again later or contact support'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({'message': 'Verification code sent successfully'})
            
        except Exception as e:
            return Response({
                'error': str(e),
                'detail': 'Error occurred while processing verification'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyPhoneView(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def create(self, request):
        phone_number = request.data.get('phone_number')
        code = request.data.get('code')
        is_registration = request.data.get('is_registration', False)

        if not phone_number or not code:
            return Response(
                {'error': 'Phone number and verification code are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Verify code
            verification = VerificationCode.objects.filter(
                phone_number=phone_number,
                code=code,
                is_used=False,
                created_at__gte=timezone.now() - timezone.timedelta(minutes=10)
            ).first()

            if not verification:
                return Response({'error': 'Invalid or expired code'}, status=status.HTTP_400_BAD_REQUEST)

            # Mark code as used
            verification.is_used = True
            verification.save()

            # Handle registration vs login
            if is_registration:
                # For registration, create new user
                user = User.objects.create_user(
                    phone_number=phone_number,
                    is_phone_verified=True
                )
            else:
                # For login, get existing user
                try:
                    user = User.objects.get(phone_number=phone_number)
                    if not user.is_phone_verified:
                        user.is_phone_verified = True
                        user.save()
                except User.DoesNotExist:
                    return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
