from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def test_auth_endpoint(request):
    """Test endpoint to verify auth is working"""
    return Response({'message': 'Auth endpoint is working!'})
