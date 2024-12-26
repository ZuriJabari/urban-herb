import random
import string
from datetime import datetime, timedelta
from django.conf import settings
import logging
import os

logger = logging.getLogger(__name__)

# Try to import Twilio, but don't fail if it's not installed
try:
    from twilio.rest import Client
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False
    logger.warning("Twilio is not installed. SMS functionality will be disabled.")

def generate_otp(length=6):
    """Generate a random OTP of specified length."""
    return ''.join(random.choices(string.digits, k=length))

def create_verification_code(user, type='phone', identifier=None):
    """Create a verification code for the user."""
    from .models import VerificationCode
    
    # Delete any existing verification codes for this user
    VerificationCode.objects.filter(user=user, type=type).delete()
    
    # Generate new verification code
    code = generate_otp()
    expiry = datetime.now() + timedelta(minutes=10)
    
    # Create and save the verification code
    verification_code = VerificationCode.objects.create(
        user=user,
        code=code,
        type=type,
        identifier=identifier or user.phone_number,
        expires_at=expiry
    )
    
    return verification_code

def send_otp_via_sms(phone_number, code):
    """Send OTP via SMS."""
    # Development mode - just print the OTP
    if not TWILIO_AVAILABLE or settings.DEBUG:
        logger.info(f"Development mode: OTP for {phone_number} is {code}")
        return True, f"Development mode: OTP is {code}"

    # Check if Twilio credentials are configured
    if not all([
        getattr(settings, 'TWILIO_ACCOUNT_SID', None),
        getattr(settings, 'TWILIO_AUTH_TOKEN', None),
        getattr(settings, 'TWILIO_PHONE_NUMBER', None)
    ]):
        logger.info("Twilio credentials not properly configured. Using development mode.")
        logger.info(f"Development mode: OTP for {phone_number} is {code}")
        return True, f"Development mode: OTP is {code}"

    try:
        # Production mode - use Twilio
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=f'Your UrbanHerb verification code is: {code}. This code will expire in 5 minutes.',
            from_=settings.TWILIO_PHONE_NUMBER,
            to=phone_number
        )
        return True, "SMS sent successfully"
    except Exception as e:
        logger.error(f"Error sending SMS: {str(e)}")
        return False, f"Error sending SMS: {str(e)}"
