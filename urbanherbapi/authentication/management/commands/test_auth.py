from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model, authenticate
from django.db import transaction
import json

User = get_user_model()

class Command(BaseCommand):
    help = 'Test authentication system comprehensively'

    def handle(self, *args, **options):
        self.stdout.write('\n=== Authentication System Test ===\n')
        
        email = 'test@urbanherbug.com'
        password = 'TestPass123!'
        
        try:
            with transaction.atomic():
                # 1. Clean up existing test user
                self.stdout.write('1. Cleaning up existing test user...')
                User.objects.filter(email=email).delete()
                
                # 2. Test user creation
                self.stdout.write('\n2. Testing user creation...')
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
                self.stdout.write(f'Created user: {user.email}')
                self.stdout.write(f'User ID: {user.id}')
                
                # 3. Test user retrieval
                self.stdout.write('\n3. Testing user retrieval...')
                retrieved_user = User.objects.get(email=email)
                self.stdout.write(f'Retrieved user: {retrieved_user.email}')
                self.stdout.write(f'User active: {retrieved_user.is_active}')
                self.stdout.write(f'User staff: {retrieved_user.is_staff}')
                self.stdout.write(f'User superuser: {retrieved_user.is_superuser}')
                self.stdout.write(f'User email verified: {retrieved_user.is_email_verified}')
                
                # 4. Test password verification
                self.stdout.write('\n4. Testing password verification...')
                self.stdout.write(f'Direct password check: {user.check_password(password)}')
                
                # 5. Test authentication
                self.stdout.write('\n5. Testing authentication...')
                auth_user = authenticate(email=email, password=password)
                self.stdout.write(f'Authentication result: {"Success" if auth_user else "Failed"}')
                if auth_user:
                    self.stdout.write(f'Authenticated user: {auth_user.email}')
                
                # 6. Test wrong password
                self.stdout.write('\n6. Testing wrong password...')
                wrong_auth = authenticate(email=email, password='WrongPass123!')
                self.stdout.write(f'Wrong password auth result: {"Failed (Expected)" if not wrong_auth else "Success (Unexpected)"}')
                
                # 7. Test user permissions
                self.stdout.write('\n7. Testing user permissions...')
                self.stdout.write(f'Has admin access: {user.is_staff and user.is_superuser}')
                
                # 8. Print user model fields
                self.stdout.write('\n8. User model fields:')
                fields = {field.name: field.get_internal_type() for field in User._meta.fields}
                self.stdout.write(json.dumps(fields, indent=2))
                
                # 9. Test authentication backends
                self.stdout.write('\n9. Authentication backends:')
                from django.conf import settings
                self.stdout.write(json.dumps(settings.AUTHENTICATION_BACKENDS, indent=2))
                
                self.stdout.write('\n=== Test Complete ===')
                self.stdout.write('\nUse these credentials to log in:')
                self.stdout.write(f'Email: {email}')
                self.stdout.write(f'Password: {password}')
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\nError during testing: {str(e)}'))
