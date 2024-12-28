from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'List all users in the database'

    def handle(self, *args, **options):
        users = User.objects.all()
        
        if not users:
            self.stdout.write('No users found in database')
            return
            
        self.stdout.write('\nUsers in database:')
        for user in users:
            self.stdout.write(f'\nUser Details:')
            self.stdout.write(f'Email: {user.email}')
            self.stdout.write(f'Is active: {user.is_active}')
            self.stdout.write(f'Is staff: {user.is_staff}')
            self.stdout.write(f'Is superuser: {user.is_superuser}')
            self.stdout.write(f'Is email verified: {user.is_email_verified}')
            self.stdout.write('-' * 50)
