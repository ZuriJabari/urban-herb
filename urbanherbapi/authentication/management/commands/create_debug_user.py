from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model, authenticate
from django.db import transaction

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a test superuser and verify authentication'

    def handle(self, *args, **options):
        email = 'debug@urbanherbug.com'
        password = 'Debug123!@#'

        try:
            with transaction.atomic():
                # Delete existing user if any
                User.objects.filter(email=email).delete()
                
                # Create superuser
                self.stdout.write(f"Creating superuser with email: {email}")
                user = User.objects.create_superuser(
                    email=email,
                    password=password,
                    first_name='Debug',
                    last_name='User'
                )
                
                # Print user details
                self.stdout.write("User created with following details:")
                self.stdout.write(f"ID: {user.id}")
                self.stdout.write(f"Email: {user.email}")
                self.stdout.write(f"Is active: {user.is_active}")
                self.stdout.write(f"Is staff: {user.is_staff}")
                self.stdout.write(f"Is superuser: {user.is_superuser}")
                self.stdout.write(f"Is email verified: {user.is_email_verified}")
                
                # Test password verification
                self.stdout.write("\nTesting password verification:")
                password_valid = user.check_password(password)
                self.stdout.write(f"Direct password check: {password_valid}")
                
                # Test authentication
                self.stdout.write("\nTesting authentication:")
                auth_user = authenticate(email=email, password=password)
                if auth_user:
                    self.stdout.write(self.style.SUCCESS("Authentication successful"))
                else:
                    self.stdout.write(self.style.ERROR("Authentication failed"))
                    
                self.stdout.write("\nUser creation complete. Try logging in with:")
                self.stdout.write(f"Email: {email}")
                self.stdout.write(f"Password: {password}")
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error creating user: {str(e)}"))
