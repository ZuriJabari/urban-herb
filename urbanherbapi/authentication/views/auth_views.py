from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import secrets
import sendgrid
from sendgrid.helpers.mail import Mail, Email, To, Content, TemplateId, DynamicTemplateData

from ..serializers.auth_serializers import (
    UserDetailsSerializer,
    RegisterSerializer,
    PhoneLoginSerializer,
    AddressSerializer,
    UserPreferencesSerializer
)
from ..models import UserPreferences, Address, VerificationCode

User = get_user_model()

class RegistrationViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate verification code
        code = ''.join(secrets.choice('0123456789') for _ in range(6))
        VerificationCode.objects.create(
            email=user.email,
            code=code,
            expires_at=timezone.now() + timedelta(minutes=10)
        )
        
        # Send verification email using SendGrid
        sg = sendgrid.SendGridAPIClient(api_key=settings.EMAIL_HOST_PASSWORD)
        from_email = Email("zurizabari@icloud.com")
        to_email = To(user.email)
        
        mail = Mail(
            from_email=from_email,
            to_emails=to_email
        )
        mail.template_id = TemplateId(settings.SENDGRID_VERIFICATION_TEMPLATE_ID)
        mail.dynamic_template_data = DynamicTemplateData({
            'first_name': user.first_name,
            'verification_code': code
        })
        
        try:
            sg.send(mail)
            # Return both user data and tokens on successful registration
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Registration successful. Please verify your email.',
                'user': serializer.data,
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            # Log the error for debugging
            print(f"SendGrid Error: {str(e)}")
            # Return user data even if email fails
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Registration successful but verification email failed to send.',
                'user': serializer.data,
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'error': 'Failed to send verification email'
            }, status=status.HTTP_201_CREATED)

class LoginViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = PhoneLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'No user found with this email'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not user.check_password(password):
            return Response(
                {'error': 'Invalid password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not user.is_email_verified:
            return Response(
                {'error': 'Please verify your email before logging in'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Login successful',
            'user': UserDetailsSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })

    @action(detail=False, methods=['post'])
    def request_password_reset(self, request):
        serializer = PhoneLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'No user found with this email'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Generate reset code
        code = ''.join(secrets.choice('0123456789') for _ in range(6))
        VerificationCode.objects.create(
            email=email,
            code=code,
            expires_at=timezone.now() + timedelta(minutes=10)
        )
        
        # Send password reset email using SendGrid
        sg = sendgrid.SendGridAPIClient(api_key=settings.EMAIL_HOST_PASSWORD)
        from_email = Email("zurizabari@icloud.com")
        to_email = To(email)
        
        mail = Mail(
            from_email=from_email,
            to_emails=to_email
        )
        mail.template_id = TemplateId(settings.SENDGRID_PASSWORD_RESET_TEMPLATE_ID)
        mail.dynamic_template_data = DynamicTemplateData({
            'first_name': user.first_name,
            'reset_code': code
        })
        
        try:
            sg.send(mail)
            return Response({
                'message': 'Password reset code sent to your email'
            })
        except Exception as e:
            print(f"SendGrid Error: {str(e)}")
            return Response({
                'error': 'Failed to send password reset email',
                'message': 'Please try again later'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def verify_email(self, request):
        serializer = PhoneLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        
        try:
            verification = VerificationCode.objects.filter(
                email=email,
                code=code,
                is_used=False,
                expires_at__gt=timezone.now()
            ).latest('created_at')
        except VerificationCode.DoesNotExist:
            return Response(
                {'error': 'Invalid or expired verification code'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = User.objects.get(email=email)
        user.is_email_verified = True
        user.save()
        
        verification.is_used = True
        verification.save()
        
        # Send welcome email
        sg = sendgrid.SendGridAPIClient(api_key=settings.EMAIL_HOST_PASSWORD)
        from_email = Email("zurizabari@icloud.com")
        to_email = To(email)
        
        mail = Mail(
            from_email=from_email,
            to_emails=to_email
        )
        mail.template_id = TemplateId(settings.SENDGRID_WELCOME_TEMPLATE_ID)
        mail.dynamic_template_data = DynamicTemplateData({
            'first_name': user.first_name,
            'login_url': 'http://localhost:5173/login'
        })
        
        try:
            sg.send(mail)
        except Exception as e:
            print(f"SendGrid Error: {str(e)}")
            # Don't return error response here, just log it
            # as this is not critical for the verification process
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Email verified successfully',
            'user': UserDetailsSerializer(user).data,
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
        })

    @action(detail=False, methods=['post'])
    def reset_password(self, request):
        serializer = PhoneLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        new_password = serializer.validated_data['new_password']
        
        try:
            verification = VerificationCode.objects.filter(
                email=email,
                code=code,
                is_used=False,
                expires_at__gt=timezone.now()
            ).latest('created_at')
        except VerificationCode.DoesNotExist:
            return Response(
                {'error': 'Invalid or expired reset code'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        
        verification.is_used = True
        verification.save()
        
        return Response({
            'message': 'Password reset successful'
        })

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserDetailsSerializer
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
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PreferencesViewSet(viewsets.ModelViewSet):
    serializer_class = UserPreferencesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserPreferences.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_object(self):
        return self.get_queryset().first()

class PhoneVerificationViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def send_code(self, request):
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
            code = ''.join(secrets.choice('0123456789') for _ in range(6))
            
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

    @action(detail=False, methods=['post'])
    def verify(self, request):
        phone_number = request.data.get('phone_number')
        code = request.data.get('code')
        is_registration = request.data.get('is_registration', False)

        if not phone_number or not code:
            return Response(
                {'error': 'Phone number and verification code are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Find the verification code
            verification = VerificationCode.objects.filter(
                phone_number=phone_number,
                code=code,
                is_used=False,
                created_at__gte=timezone.now() - timezone.timedelta(minutes=10)
            ).first()

            if not verification:
                return Response(
                    {'error': 'Invalid or expired verification code'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Mark the code as used
            verification.is_used = True
            verification.save()

            # For registration, create a new user
            if is_registration:
                user, created = User.objects.get_or_create(
                    phone_number=phone_number,
                    defaults={
                        'is_phone_verified': True
                    }
                )
                if not created:
                    user.is_phone_verified = True
                    user.save()
            else:
                # For login, just verify the existing user's phone
                try:
                    user = User.objects.get(phone_number=phone_number)
                    user.is_phone_verified = True
                    user.save()
                except User.DoesNotExist:
                    return Response(
                        {'error': 'No user found with this phone number'},
                        status=status.HTTP_404_NOT_FOUND
                    )

            return Response({
                'message': 'Phone number verified successfully',
                'is_registration': is_registration
            })

        except Exception as e:
            return Response({
                'error': str(e),
                'detail': 'Error occurred while verifying phone number'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
