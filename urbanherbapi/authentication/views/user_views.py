from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from authentication.models import (
    User, UserPreferences, SecuritySettings,
    UserActivity, SocialConnection, Referral
)
from authentication.serializers.user_serializers import (
    UserProfileSerializer, UserPreferencesSerializer,
    SecuritySettingsSerializer, UserActivitySerializer,
    SocialConnectionSerializer, ReferralSerializer
)

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Only allow users to see their own profile"""
        return User.objects.filter(id=self.request.user.id)

    @action(detail=True, methods=['get'])
    def activities(self, request, pk=None):
        """Get user's activity history"""
        user = self.get_object()
        activities = UserActivity.objects.filter(user=user).order_by('-created_at')
        serializer = UserActivitySerializer(activities, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'put'])
    def preferences(self, request, pk=None):
        """Get or update user preferences"""
        user = self.get_object()
        if request.method == 'GET':
            serializer = UserPreferencesSerializer(user.userpreferences)
            return Response(serializer.data)
        
        serializer = UserPreferencesSerializer(user.userpreferences, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get', 'put'])
    def security(self, request, pk=None):
        """Get or update security settings"""
        user = self.get_object()
        if request.method == 'GET':
            serializer = SecuritySettingsSerializer(user.securitysettings)
            return Response(serializer.data)
        
        serializer = SecuritySettingsSerializer(user.securitysettings, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get', 'post'])
    def social_connections(self, request, pk=None):
        """Get or add social connections"""
        user = self.get_object()
        if request.method == 'GET':
            connections = SocialConnection.objects.filter(user=user)
            serializer = SocialConnectionSerializer(connections, many=True)
            return Response(serializer.data)
        
        serializer = SocialConnectionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def referrals(self, request, pk=None):
        """Get user's referrals (both made and received)"""
        user = self.get_object()
        made = Referral.objects.filter(referrer=user)
        received = Referral.objects.filter(referred_user=user)
        
        return Response({
            'made': ReferralSerializer(made, many=True).data,
            'received': ReferralSerializer(received, many=True).data
        })

    @action(detail=True, methods=['post'])
    def apply_referral(self, request, pk=None):
        """Apply a referral code"""
        user = self.get_object()
        referral_code = request.data.get('referral_code')
        
        if not referral_code:
            return Response(
                {'error': 'Referral code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            referrer = User.objects.get(referral_code=referral_code)
            if referrer == user:
                return Response(
                    {'error': 'Cannot use your own referral code'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if this referral already exists
            if Referral.objects.filter(referrer=referrer, referred_user=user).exists():
                return Response(
                    {'error': 'Referral already applied'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create the referral
            referral = Referral.objects.create(
                referrer=referrer,
                referred_user=user,
                code_used=referral_code,
                points_awarded=100,  # Example points
                is_successful=True
            )

            return Response(
                ReferralSerializer(referral).data,
                status=status.HTTP_201_CREATED
            )

        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid referral code'},
                status=status.HTTP_400_BAD_REQUEST
            )
