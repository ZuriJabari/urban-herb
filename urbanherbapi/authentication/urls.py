from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views.profile_views import get_user_profile
from .views.test_views import test_auth_endpoint
from .views import FirebaseTokenView

urlpatterns = [
    # JWT token endpoints
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User profile endpoint
    path('auth/profile/', get_user_profile, name='user-profile'),
    
    # Firebase token exchange endpoint
    path('auth/firebase-token/', FirebaseTokenView.as_view(), name='firebase-token'),
    
    # Test endpoint
    path('auth/test/', test_auth_endpoint, name='test-auth'),
]
