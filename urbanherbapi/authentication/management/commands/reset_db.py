from django.core.management.base import BaseCommand
from django.db import connection
from django.conf import settings
import os

class Command(BaseCommand):
    help = 'Reset the database and create a new superuser'

    def handle(self, *args, **options):
        # Get database path
        db_path = settings.DATABASES['default']['NAME']
        
        # Close the database connection
        connection.close()
        
        # Remove the database file if it exists
        if os.path.exists(db_path):
            os.remove(db_path)
            self.stdout.write(self.style.SUCCESS(f'Removed database: {db_path}'))
        
        # Run migrations
        self.stdout.write('Running migrations...')
        os.system('python manage.py migrate')
        
        # Create superuser
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        if not User.objects.filter(email='admin@test.com').exists():
            user = User.objects.create_superuser(
                email='admin@test.com',
                password='admin123',
                first_name='Admin',
                last_name='User',
                is_active=True,
                is_staff=True,
                is_superuser=True,
                is_email_verified=True
            )
            self.stdout.write(self.style.SUCCESS('Created superuser:'))
            self.stdout.write(f'Email: admin@test.com')
            self.stdout.write(f'Password: admin123')
            self.stdout.write(f'Is active: {user.is_active}')
            self.stdout.write(f'Is staff: {user.is_staff}')
            self.stdout.write(f'Is superuser: {user.is_superuser}')
            self.stdout.write(f'Is email verified: {user.is_email_verified}')
