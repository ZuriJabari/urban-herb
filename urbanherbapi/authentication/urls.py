from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegistrationViewSet, LoginViewSet, UserViewSet, AddressViewSet, PreferencesViewSet,
    PhoneVerificationView, VerifyPhoneView
)

# Create a router for viewsets
router = DefaultRouter()
router.register('users', UserViewSet, basename='users')
router.register('addresses', AddressViewSet, basename='addresses')
router.register('preferences', PreferencesViewSet, basename='preferences')

# Auth routes
auth_router = DefaultRouter()
auth_router.register('register', RegistrationViewSet, basename='register')
auth_router.register('login', LoginViewSet, basename='login')

urlpatterns = [
    # ViewSet URLs
    path('', include(router.urls)),
    path('auth/', include(auth_router.urls)),
    
    # JWT token refresh
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Phone verification endpoints
    path('phone/send-verification/', PhoneVerificationView.as_view(), name='send-phone-verification'),
    path('phone/verify/', VerifyPhoneView.as_view(), name='verify-phone'),
    
    # User profile endpoint
    path('auth/me/', UserViewSet.as_view({'get': 'me', 'patch': 'me'}), name='user-profile'),
]
