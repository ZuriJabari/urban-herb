from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Reset password for a user'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='User email')
        parser.add_argument('password', type=str, help='New password')

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']

        try:
            user = User.objects.get(email=email)
            user.set_password(password)
            user.save()
            
            # Verify the password was set correctly
            if user.check_password(password):
                self.stdout.write(self.style.SUCCESS(f'Successfully reset password for {email}'))
                self.stdout.write(self.style.SUCCESS('Password verification successful'))
            else:
                self.stdout.write(self.style.ERROR('Password verification failed!'))
                
            # Print user details
            self.stdout.write(f'User ID: {user.id}')
            self.stdout.write(f'Email verified: {user.is_email_verified}')
            self.stdout.write(f'Is active: {user.is_active}')
            
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User with email {email} does not exist'))
