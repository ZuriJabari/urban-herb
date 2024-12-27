import os
from dotenv import load_dotenv

load_dotenv()

# SendGrid Settings
SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')
SENDGRID_FROM_EMAIL = 'zurizabari@icloud.com'

# Template IDs
SENDGRID_WELCOME_TEMPLATE_ID = 'd-deb52368b88a4cd3a6c09a05fcb91694'
SENDGRID_VERIFICATION_TEMPLATE_ID = 'd-c477f74dbafd4a1b86169a1b4f7aac6c'
SENDGRID_PASSWORD_RESET_TEMPLATE_ID = 'd-e0655b56f5854d5d9fb66da38cba12ba'

# URLs for email templates
PRIVACY_POLICY_URL = os.getenv('PRIVACY_POLICY_URL', 'https://urbanherb.com/privacy')
TERMS_URL = os.getenv('TERMS_URL', 'https://urbanherb.com/terms')
