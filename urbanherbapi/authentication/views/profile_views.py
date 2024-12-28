from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """Get the current user's profile"""
    user = request.user
    data = {
        'id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'created_at': user.date_joined,
        'updated_at': user.last_login,
    }
    
    # Add is_email_verified if it exists
    if hasattr(user, 'is_email_verified'):
        data['is_email_verified'] = user.is_email_verified
        
    return Response(data)
