from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import datetime
from rest_framework.response import Response

class TokenCookieMixin:
    def get_tokens_for_user(self, user):
        """Generate access and refresh tokens for the user"""
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

    def set_token_cookies(self, response, tokens):
        """Set JWT tokens as HTTP-only cookies"""
        # Access token cookie
        response.set_cookie(
            settings.JWT_AUTH_COOKIE,
            tokens['access'],
            expires=datetime.now() + settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
            secure=settings.JWT_AUTH_COOKIE_SECURE,
            httponly=settings.JWT_AUTH_COOKIE_HTTP_ONLY,
            samesite=settings.JWT_AUTH_COOKIE_SAMESITE
        )
        
        # Refresh token cookie
        response.set_cookie(
            settings.JWT_AUTH_REFRESH_COOKIE,
            tokens['refresh'],
            expires=datetime.now() + settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
            secure=settings.JWT_AUTH_COOKIE_SECURE,
            httponly=settings.JWT_AUTH_COOKIE_HTTP_ONLY,
            samesite=settings.JWT_AUTH_COOKIE_SAMESITE
        )
        
        return response

    def get_response_with_tokens(self, user, additional_data=None):
        """Generate a response with tokens set in cookies"""
        tokens = self.get_tokens_for_user(user)
        response_data = {
            'user': {
                'id': user.id,
                'phone_number': user.phone_number,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        }
        
        if additional_data:
            response_data.update(additional_data)
            
        response = Response(response_data)
        return self.set_token_cookies(response, tokens)
