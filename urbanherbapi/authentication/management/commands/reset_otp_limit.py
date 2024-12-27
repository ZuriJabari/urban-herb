from django.core.management.base import BaseCommand
from django.core.cache import cache
from authentication.validators import validate_phone_number

class Command(BaseCommand):
    help = 'Reset OTP rate limit for a phone number'

    def add_arguments(self, parser):
        parser.add_argument('phone_number', type=str, help='Phone number to reset OTP limit for')

    def handle(self, *args, **options):
        phone_number = options['phone_number']
        is_valid, number = validate_phone_number(phone_number)
        
        if not is_valid:
            self.stdout.write(self.style.ERROR(f'Invalid phone number: {phone_number}'))
            return
            
        cache_key = f'otp_count_{number}'
        cache.delete(cache_key)
        self.stdout.write(self.style.SUCCESS(f'Successfully reset OTP limit for {number}'))
