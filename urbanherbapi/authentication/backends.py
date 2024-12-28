from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q

User = get_user_model()

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, email=None, **kwargs):
        try:
            # Try to fetch the user by email
            email_to_use = email or username  # username field might contain email
            if not email_to_use:
                return None
                
            # Get the user and verify their password
            user = User.objects.get(Q(email=email_to_use))
            if user.check_password(password):
                return user
            return None
            
        except User.DoesNotExist:
            return None
            
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
