from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a verified admin user with a known password'

    def handle(self, *args, **options):
        email = 'admin@urbanherbug.com'
        password = 'AdminPass123!'

        try:
            with transaction.atomic():
                # Delete existing user if exists
                User.objects.filter(email=email).delete()

                # Create new admin user
                user = User.objects.create_superuser(
                    email=email,
                    password=password,
                    first_name='Admin',
                    last_name='User',
                    is_active=True,
                    is_staff=True,
                    is_superuser=True,
                    is_email_verified=True
                )

                # Verify the password was set correctly
                if user.check_password(password):
                    self.stdout.write(self.style.SUCCESS(f'Successfully created admin user'))
                    self.stdout.write(f'Email: {email}')
                    self.stdout.write(f'Password: {password}')
                    self.stdout.write(f'Is active: {user.is_active}')
                    self.stdout.write(f'Is staff: {user.is_staff}')
                    self.stdout.write(f'Is superuser: {user.is_superuser}')
                    self.stdout.write(f'Is email verified: {user.is_email_verified}')
                else:
                    self.stdout.write(self.style.ERROR('Password verification failed'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating admin user: {str(e)}'))
