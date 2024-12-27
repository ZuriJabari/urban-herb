from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views.auth_views import (
    RegistrationViewSet,
    LoginViewSet,
    UserViewSet,
    AddressViewSet,
    PreferencesViewSet,
    PhoneVerificationViewSet
)

# Create a router for viewsets
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')
router.register(r'addresses', AddressViewSet, basename='addresses')
router.register(r'preferences', PreferencesViewSet, basename='preferences')
router.register(r'auth/phone', PhoneVerificationViewSet, basename='phone-verification')

urlpatterns = [
    # ViewSet URLs
    path('', include(router.urls)),
    
    # Auth endpoints
    path('auth/register/', RegistrationViewSet.as_view({'post': 'register'}), name='register'),
    path('auth/login/', LoginViewSet.as_view({'post': 'login'}), name='login'),
    path('auth/password/reset/', LoginViewSet.as_view({'post': 'request_password_reset'}), name='password-reset'),
    path('auth/password/reset/confirm/', LoginViewSet.as_view({'post': 'reset_password'}), name='password-reset-confirm'),
    path('auth/verify-email/', LoginViewSet.as_view({'post': 'verify_email'}), name='verify-email'),
    
    # JWT token endpoints
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User profile endpoint
    path('auth/profile/', UserViewSet.as_view({'get': 'me', 'patch': 'me'}), name='user-profile'),
    
    # User preferences endpoint
    path('auth/preferences/', PreferencesViewSet.as_view({'get': 'me', 'patch': 'me'}), name='user-preferences'),
]
