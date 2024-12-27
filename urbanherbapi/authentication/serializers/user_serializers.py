from rest_framework import serializers
from authentication.models import (
    User, UserPreferences, SecuritySettings, 
    UserActivity, SocialConnection, Referral
)

class UserPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreferences
        fields = [
            'language', 'currency', 'theme',
            'newsletter', 'promotional_emails', 'order_updates',
            'push_notifications', 'show_online_status',
            'show_last_seen', 'show_profile_photo'
        ]

class SecuritySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecuritySettings
        fields = [
            'two_factor_enabled', 'two_factor_method',
            'login_alerts', 'trusted_devices',
            'last_password_change', 'password_reset_required',
            'account_recovery_email', 'account_recovery_phone'
        ]

class UserActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserActivity
        fields = [
            'activity_type', 'description', 'ip_address',
            'device_info', 'location', 'created_at'
        ]

class SocialConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialConnection
        fields = [
            'platform', 'platform_username', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class ReferralSerializer(serializers.ModelSerializer):
    class Meta:
        model = Referral
        fields = [
            'code_used', 'points_awarded', 'is_successful',
            'created_at', 'converted_at', 'referred_user', 'referrer'
        ]
        read_only_fields = ['created_at', 'converted_at']

class UserProfileSerializer(serializers.ModelSerializer):
    preferences = UserPreferencesSerializer(source='userpreferences', read_only=True)
    security = SecuritySettingsSerializer(source='securitysettings', read_only=True)
    activities = UserActivitySerializer(many=True, read_only=True)
    social_connections = SocialConnectionSerializer(many=True, read_only=True)
    referrals_made = ReferralSerializer(many=True, read_only=True)
    referrals_received = ReferralSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'date_of_birth', 'profile_photo', 'bio', 'gender',
            'loyalty_points', 'loyalty_tier', 'referral_code',
            'preferences', 'security', 'activities',
            'social_connections', 'referrals_made', 'referrals_received',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'loyalty_points', 'loyalty_tier',
            'referral_code', 'created_at', 'updated_at'
        ]

    def update(self, instance, validated_data):
        # Handle nested updates for preferences
        preferences_data = self.context['request'].data.get('preferences')
        if preferences_data:
            preferences = instance.userpreferences
            for key, value in preferences_data.items():
                setattr(preferences, key, value)
            preferences.save()

        # Update the user instance
        return super().update(instance, validated_data)
