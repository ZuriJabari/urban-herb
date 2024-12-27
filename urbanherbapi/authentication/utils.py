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
    logger.info(f"Attempting to send OTP to {phone_number}")
    
    # Check if Twilio is available
    if not TWILIO_AVAILABLE:
        logger.warning("Twilio package is not installed")
        logger.info(f"Development mode: OTP for {phone_number} is {code}")
        return True, f"Development mode: OTP is {code}"

    # Check if we're in DEBUG mode
    if settings.DEBUG:
        logger.info("Running in DEBUG mode")
        logger.info(f"Development mode: OTP for {phone_number} is {code}")
        return True, f"Development mode: OTP is {code}"

    # Check Twilio credentials
    twilio_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', None)
    twilio_token = getattr(settings, 'TWILIO_AUTH_TOKEN', None)
    twilio_phone = getattr(settings, 'TWILIO_PHONE_NUMBER', None)

    if not twilio_sid:
        logger.error("TWILIO_ACCOUNT_SID not configured")
    if not twilio_token:
        logger.error("TWILIO_AUTH_TOKEN not configured")
    if not twilio_phone:
        logger.error("TWILIO_PHONE_NUMBER not configured")

    if not all([twilio_sid, twilio_token, twilio_phone]):
        logger.warning("Twilio credentials not properly configured, falling back to development mode")
        logger.info(f"Development mode: OTP for {phone_number} is {code}")
        return True, f"Development mode: OTP is {code}"

    try:
        # Production mode - use Twilio
        logger.info("Initializing Twilio client")
        client = Client(twilio_sid, twilio_token)
        
        logger.info(f"Sending SMS from {twilio_phone} to {phone_number}")
        message = client.messages.create(
            body=f'Your UrbanHerb verification code is: {code}. This code will expire in 5 minutes.',
            from_=twilio_phone,
            to=phone_number
        )
        
        logger.info(f"SMS sent successfully. Message SID: {message.sid}")
        return True, "SMS sent successfully"
    except Exception as e:
        logger.error(f"Error sending SMS: {str(e)}")
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Error details: {e.__dict__}")
        return False, f"Error sending SMS: {str(e)}"
