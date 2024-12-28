from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from firebase_admin import auth, initialize_app, credentials, get_app
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
import logging
import json
import traceback

logger = logging.getLogger(__name__)
User = get_user_model()

def initialize_firebase():
    """Initialize Firebase Admin SDK if not already initialized"""
    try:
        # Try to get the default app
        logger.info("Attempting to get existing Firebase app")
        return get_app()
    except ValueError:
        # If no app exists, initialize one
        logger.info("No existing Firebase app found, initializing new app")
        
        # Log all available settings for debugging
        logger.info("Available settings keys: %s", dir(settings))
        logger.info("FIREBASE_CREDENTIALS type: %s", type(settings.FIREBASE_CREDENTIALS))
        
        if isinstance(settings.FIREBASE_CREDENTIALS, dict):
            required_keys = ['project_id', 'private_key', 'client_email']
            missing_keys = [key for key in required_keys if not settings.FIREBASE_CREDENTIALS.get(key)]
            
            if missing_keys:
                logger.error("Missing required Firebase credentials: %s", missing_keys)
                return None
            
            logger.info("Firebase credentials found, creating Certificate")
            try:
                # Log credential details (safely)
                logger.info("Credential details: %s", {
                    'project_id': settings.FIREBASE_CREDENTIALS.get('project_id'),
                    'client_email': settings.FIREBASE_CREDENTIALS.get('client_email'),
                    'private_key_length': len(settings.FIREBASE_CREDENTIALS.get('private_key', '')),
                    'has_private_key': bool(settings.FIREBASE_CREDENTIALS.get('private_key')),
                })
                
                cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS)
                logger.info("Firebase Certificate created successfully")
                app = initialize_app(cred)
                logger.info("Firebase app initialized successfully")
                return app
            except Exception as e:
                logger.error("Error initializing Firebase app: %s", str(e))
                logger.error("Traceback: %s", traceback.format_exc())
                return None
        else:
            logger.error("FIREBASE_CREDENTIALS is not a dictionary. Type: %s", type(settings.FIREBASE_CREDENTIALS))
            return None

class FirebaseTokenView(APIView):
    """
    View to exchange Firebase token for Django JWT token
    """
    def post(self, request):
        logger.info("=== Starting token exchange request ===")
        logger.info("Request headers: %s", dict(request.headers))
        logger.info("Request data keys: %s", list(request.data.keys()))
        
        firebase_token = request.data.get('token')
        if not firebase_token:
            logger.error("No token provided in request")
            return Response(
                {'error': 'No token provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        logger.info("Received token (length: %d)", len(firebase_token))
        logger.info("Token prefix: %s...", firebase_token[:10])

        try:
            # Initialize Firebase if not already initialized
            logger.info("Attempting to initialize Firebase")
            firebase_app = initialize_firebase()
            if not firebase_app:
                logger.error("Firebase initialization failed")
                return Response(
                    {'error': 'Firebase configuration is not complete'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            logger.info("Firebase initialized successfully")

            # Log Firebase credentials status (safely)
            creds = settings.FIREBASE_CREDENTIALS
            logger.info("Firebase credentials check: %s", {
                'project_id': bool(creds.get('project_id')),
                'client_email': bool(creds.get('client_email')),
                'private_key': bool(creds.get('private_key')),
                'type': creds.get('type') == 'service_account',
                'project_id_value': creds.get('project_id'),
                'client_email_value': creds.get('client_email'),
                'private_key_length': len(creds.get('private_key', '')),
            })

            # Verify the Firebase token
            logger.info("Attempting to verify Firebase token")
            try:
                decoded_token = auth.verify_id_token(firebase_token)
                uid = decoded_token['uid']
                email = decoded_token.get('email', '')
                logger.info("Token verified successfully for user: %s (uid: %s)", email, uid)
                logger.info("Decoded token claims: %s", decoded_token)
            except auth.InvalidIdTokenError as e:
                logger.error("Invalid token error: %s", str(e))
                logger.error("Traceback: %s", traceback.format_exc())
                return Response(
                    {'error': f'Invalid Firebase token: {str(e)}'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            except auth.ExpiredIdTokenError as e:
                logger.error("Token expired error: %s", str(e))
                logger.error("Traceback: %s", traceback.format_exc())
                return Response(
                    {'error': f'Firebase token has expired: {str(e)}'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            except Exception as e:
                logger.error("Token verification error: %s", str(e))
                logger.error("Traceback: %s", traceback.format_exc())
                return Response(
                    {'error': f'Failed to verify Firebase token: {str(e)}'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Get or create user
            try:
                user, created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        'username': email,  # Using email as username
                        'firebase_uid': uid,
                    }
                )

                if created:
                    logger.info("New user created: %s", email)
                else:
                    logger.info("Existing user found: %s", email)

                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)
                logger.info("JWT tokens generated successfully")
                
                response_data = {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
                logger.info("=== Token exchange completed successfully ===")
                return Response(response_data)
                
            except Exception as e:
                logger.error("Error creating/retrieving user: %s", str(e))
                logger.error("Traceback: %s", traceback.format_exc())
                return Response(
                    {'error': f'Failed to create/retrieve user: {str(e)}'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        except Exception as e:
            logger.error("Unexpected error during token exchange: %s", str(e))
            logger.error("Traceback: %s", traceback.format_exc())
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
