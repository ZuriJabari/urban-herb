from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a test user with a simple password'

    def handle(self, *args, **options):
        email = 'test@test.com'
        password = 'test123'

        try:
            with transaction.atomic():
                # Delete existing user if exists
                User.objects.filter(email=email).delete()

                # Create new user
                user = User.objects.create_user(
                    email=email,
                    password=password,
                    first_name='Test',
                    last_name='User',
                    is_active=True,
                    is_staff=True,
                    is_superuser=True,
                    is_email_verified=True
                )

                # Force save to ensure all flags are set
                user.is_active = True
                user.is_staff = True
                user.is_superuser = True
                user.is_email_verified = True
                user.save()

                self.stdout.write(self.style.SUCCESS(f'\nCreated test user:'))
                self.stdout.write(f'Email: {email}')
                self.stdout.write(f'Password: {password}')
                self.stdout.write(f'Is active: {user.is_active}')
                self.stdout.write(f'Is staff: {user.is_staff}')
                self.stdout.write(f'Is superuser: {user.is_superuser}')
                self.stdout.write(f'Is email verified: {user.is_email_verified}')

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
