from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
import json

@api_view(['POST'])
@permission_classes([AllowAny])
def test_welcome_email(request):
    try:
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=400)

        # Prepare dynamic data for the template
        template_data = {
            'first_name': 'Test User',
            'verification_url': 'http://localhost:3000/verify-email?token=test-token',
        }

        # Send welcome email
        send_mail(
            subject='Welcome to UrbanHerb!',
            message=json.dumps(template_data),  # Send as JSON string
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response({'message': f'Welcome email sent to {email}'})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def test_verification_email(request):
    try:
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=400)

        # Prepare dynamic data for the template
        template_data = {
            'first_name': 'Test User',
            'verification_url': 'http://localhost:3000/verify-email?token=test-token',
        }

        # Send verification email
        send_mail(
            subject='Verify Your Email',
            message=json.dumps(template_data),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response({'message': f'Verification email sent to {email}'})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def test_password_reset_email(request):
    try:
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=400)

        # Prepare dynamic data for the template
        template_data = {
            'first_name': 'Test User',
            'reset_url': 'http://localhost:3000/reset-password?token=test-token',
        }

        # Send password reset email
        send_mail(
            subject='Reset Your Password',
            message=json.dumps(template_data),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response({'message': f'Password reset email sent to {email}'})
    except Exception as e:
        return Response({'error': str(e)}, status=500)
