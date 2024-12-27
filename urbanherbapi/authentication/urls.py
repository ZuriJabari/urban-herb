from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
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

@api_view(['GET'])
def auth_endpoints(request):
    return Response({
        'register': reverse('register-list', request=request),
        'login': reverse('login-list', request=request),
        'users': reverse('users-list', request=request),
        'addresses': reverse('addresses-list', request=request),
        'preferences': reverse('preferences-list', request=request),
        'token_refresh': reverse('token_refresh', request=request),
    })

urlpatterns = [
    # ViewSet URLs
    path('', auth_endpoints, name='auth-endpoints'),
    path('', include(router.urls)),
    path('auth/', include(auth_router.urls)),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('phone/send-verification/', PhoneVerificationView.as_view(), name='send-phone-verification'),
    path('phone/verify/', VerifyPhoneView.as_view(), name='verify-phone'),
    path('auth/me/', UserViewSet.as_view({'get': 'me', 'patch': 'me'}), name='user-profile'),
]
