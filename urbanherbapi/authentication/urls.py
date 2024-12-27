from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegistrationViewSet, LoginViewSet, UserViewSet, AddressViewSet, PreferencesViewSet,
    PhoneVerificationView, VerifyPhoneView, UserProfileViewSet
)

# Create a router for viewsets
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')
router.register(r'addresses', AddressViewSet, basename='addresses')
router.register(r'preferences', PreferencesViewSet, basename='preferences')
router.register(r'auth/register', RegistrationViewSet, basename='register')
router.register(r'auth/login', LoginViewSet, basename='login')
router.register(r'auth/phone/send-verification', PhoneVerificationView, basename='send-phone-verification')
router.register(r'auth/phone/verify', VerifyPhoneView, basename='verify-phone')
router.register(r'profiles', UserProfileViewSet, basename='profile')

urlpatterns = [
    # ViewSet URLs
    path('', include(router.urls)),
    
    # JWT token endpoints
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User profile endpoint
    path('auth/profile/', UserViewSet.as_view({'get': 'me', 'patch': 'me'}), name='user-profile'),
    
    # User preferences endpoint
    path('auth/preferences/', PreferencesViewSet.as_view({'get': 'me', 'patch': 'me'}), name='user-preferences'),
]
