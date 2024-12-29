from django.contrib.auth import get_user_model
from django.utils.functional import SimpleLazyObject
from rest_framework.authentication import get_authorization_header
from firebase_admin import auth
import logging
from django.contrib.auth.middleware import get_user
from django.contrib.auth.models import AnonymousUser
from django.urls import resolve
from django.conf import settings

logger = logging.getLogger(__name__)
User = get_user_model()

def get_firebase_user(request):
    """Get user from Firebase token."""
    user = None
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')

    # Skip Firebase auth for admin and Django auth URLs
    current_url = resolve(request.path_info).url_name
    if current_url and (current_url.startswith('admin:') or 
                       request.path.startswith('/admin/') or 
                       request.path.startswith('/django-admin/')):
        return get_user(request)

    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        try:
            # Verify the Firebase token
            decoded_token = auth.verify_id_token(token)
            uid = decoded_token.get('uid')
            
            # Get or create user
            try:
                user = User.objects.get(firebase_uid=uid)
            except User.DoesNotExist:
                email = decoded_token.get('email', '')
                name = decoded_token.get('name', '')
                user = User.objects.create(
                    username=email,
                    email=email,
                    firebase_uid=uid,
                    first_name=name
                )
        except Exception as e:
            logger.error(f'Error verifying Firebase token: {str(e)}')
            pass

    return user or AnonymousUser()

class FirebaseAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.user = SimpleLazyObject(lambda: get_firebase_user(request))
        return self.get_response(request)
