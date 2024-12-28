from django.core.management.base import BaseCommand
from django.utils import timezone
from authentication.models import (
    User, UserPreferences, SecuritySettings,
    UserActivity, SocialConnection, Referral
)
import uuid
import random
from datetime import datetime, timedelta

class Command(BaseCommand):
    help = 'Populates the database with sample user data'

    def handle(self, *args, **kwargs):
        # Create sample users
        users = []
        for i in range(10):
            user = User.objects.create(
                email=f'user{i}@example.com',
                first_name=f'User{i}',
                last_name=f'Sample',
                date_of_birth=datetime(1990 + i, 1, 1),
                bio=f'I am user {i}, a plant enthusiast!',
                gender=random.choice(['M', 'F', 'O']),
                loyalty_points=random.randint(0, 1000),
                loyalty_tier=random.choice(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']),
                referral_code=str(uuid.uuid4())[:8]
            )
            users.append(user)
            self.stdout.write(f'Created user: {user.email}')

            # Create user preferences
            UserPreferences.objects.create(
                user=user,
                language=random.choice(['en', 'es', 'fr']),
                currency=random.choice(['USD', 'EUR', 'GBP']),
                theme=random.choice(['light', 'dark', 'system']),
                newsletter=random.choice([True, False]),
                promotional_emails=random.choice([True, False]),
                order_updates=True,
                push_notifications=random.choice([True, False]),
                show_online_status=random.choice([True, False]),
                show_last_seen=random.choice([True, False]),
                show_profile_photo=True
            )

            # Create security settings
            SecuritySettings.objects.create(
                user=user,
                two_factor_enabled=random.choice([True, False]),
                two_factor_method=random.choice(['SMS', 'EMAIL', None]),
                login_alerts=random.choice([True, False]),
                trusted_devices={'devices': []},
                last_password_change=timezone.now() - timedelta(days=random.randint(1, 90)),
                password_reset_required=False,
                account_recovery_email=f'recovery{i}@example.com',
                account_recovery_phone=f'+1555555{i:04d}'
            )

            # Create user activities
            for _ in range(5):
                UserActivity.objects.create(
                    user=user,
                    activity_type=random.choice(['LOGIN', 'PURCHASE', 'REVIEW', 'WISHLIST']),
                    description=f'Sample activity description',
                    ip_address='127.0.0.1',
                    device_info={'device': 'Web Browser', 'os': 'macOS'},
                    location={'city': 'San Francisco', 'country': 'USA'},
                    created_at=timezone.now() - timedelta(days=random.randint(1, 30))
                )

            # Create social connections
            for platform in ['FACEBOOK', 'GOOGLE', 'APPLE']:
                if random.choice([True, False]):
                    SocialConnection.objects.create(
                        user=user,
                        platform=platform,
                        platform_user_id=str(uuid.uuid4()),
                        platform_username=f'social_user_{i}',
                        is_active=True
                    )

        # Create referrals between users
        for i in range(5):
            referrer = random.choice(users)
            referred = random.choice([u for u in users if u != referrer])
            
            Referral.objects.create(
                referrer=referrer,
                referred_user=referred,
                code_used=referrer.referral_code,
                points_awarded=100,
                is_successful=True,
                created_at=timezone.now() - timedelta(days=random.randint(1, 30)),
                converted_at=timezone.now() - timedelta(days=random.randint(1, 29))
            )

        self.stdout.write(self.style.SUCCESS('Successfully populated the database with sample user data'))
