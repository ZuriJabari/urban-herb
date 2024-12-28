from .auth_views import FirebaseTokenView
from .profile_views import get_user_profile

__all__ = ['FirebaseTokenView', 'get_user_profile']

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from ..serializers.user_serializers import UserSerializer
import logging
import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_http_methods

logger = logging.getLogger(__name__)
User = get_user_model()

# Initialize Firebase Admin SDK
cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS)
try:
    firebase_admin.initialize_app(cred)
    logger.info("Firebase Admin SDK initialized successfully")
except ValueError as e:
    logger.warning(f"Firebase Admin SDK already initialized: {e}")

@method_decorator(csrf_exempt, name='dispatch')
class FirebaseTokenView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []  # Disable authentication for this view

    def options(self, request, *args, **kwargs):
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    def post(self, request):
        """Exchange Firebase token for Django token"""
        logger.info("Received POST request to /api/v1/auth/firebase-token/")
        logger.info(f"Request META: {request.META}")
        logger.info(f"Request headers: {request.headers}")
        logger.info(f"Request data: {request.data}")
        
        try:
            # Get the Firebase token from request
            firebase_token = request.data.get('token')
            if not firebase_token:
                logger.error("Firebase token missing from request")
                return Response(
                    {'error': 'Firebase token is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            logger.info("Got Firebase token, length: %d", len(firebase_token))
            
            # Verify the Firebase token
            try:
                decoded_token = firebase_auth.verify_id_token(firebase_token)
                logger.info("Firebase token verified successfully")
                logger.info(f"Decoded token: {decoded_token}")
            except Exception as e:
                logger.error(f"Firebase token verification failed: {str(e)}")
                return Response(
                    {'error': f'Invalid Firebase token: {str(e)}'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Get user info from decoded token
            email = decoded_token.get('email')
            uid = decoded_token.get('uid')
            name = decoded_token.get('name', '')
            
            logger.info(f"Processing user data - Email: {email}, UID: {uid}")
            
            # Try to get existing user or create new one
            try:
                user = User.objects.get(email=email)
                logger.info(f"Found existing user: {user.id}")
                
                # Update Firebase UID if it changed
                if user.firebase_uid != uid:
                    user.firebase_uid = uid
                    user.save()
                    logger.info(f"Updated Firebase UID for user: {user.id}")
            except User.DoesNotExist:
                # Split name into first and last name
                name_parts = name.split(' ', 1)
                first_name = name_parts[0]
                last_name = name_parts[1] if len(name_parts) > 1 else ''
                
                logger.info(f"Creating new user with email: {email}")
                # Create new user
                user = User.objects.create_user(
                    email=email,
                    firebase_uid=uid,
                    first_name=first_name,
                    last_name=last_name,
                    is_email_verified=True
                )

            # Generate Django token
            refresh = RefreshToken.for_user(user)
            
            response_data = {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            }
            logger.info("Token exchange successful")
            
            response = Response(response_data)
            response["Access-Control-Allow-Origin"] = "*"
            response["Access-Control-Allow-Credentials"] = "true"
            return response
            
        except Exception as e:
            logger.error(f"Firebase token exchange error: {str(e)}", exc_info=True)
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
