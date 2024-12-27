import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'urbanherbapi.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Create superuser if it doesn't exist
if not User.objects.filter(email='admin@urbanherbug.com').exists():
    User.objects.create_superuser(
        email='admin@urbanherbug.com',
        password='Admin@123',
        first_name='Admin',
        last_name='User'
    )
    print("Superuser created successfully!")
else:
    print("Superuser already exists!")
