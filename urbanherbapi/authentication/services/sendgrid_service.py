from django.conf import settings
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content, TemplateId, DynamicTemplateData
import logging

logger = logging.getLogger(__name__)

class SendGridService:
    def __init__(self):
        self.sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        self.from_email = Email(settings.SENDGRID_FROM_EMAIL)

    def send_welcome_email(self, user, verification_code):
        """Send welcome email with verification code to new user."""
        try:
            to_email = To(user.email)
            template_data = {
                'first_name': user.first_name,
                'verification_code': verification_code,
                'email': user.email,
                'privacy_policy_url': settings.PRIVACY_POLICY_URL,
                'terms_url': settings.TERMS_URL
            }

            mail = Mail(
                from_email=self.from_email,
                to_emails=to_email
            )
            mail.template_id = settings.SENDGRID_WELCOME_TEMPLATE_ID
            mail.dynamic_template_data = template_data

            response = self.sg.send(mail)
            logger.info(f"Welcome email sent to {user.email}. Status code: {response.status_code}")
            return True
        except Exception as e:
            logger.error(f"Error sending welcome email to {user.email}: {str(e)}")
            return False

    def send_verification_email(self, email, verification_code):
        """Send verification code email."""
        try:
            to_email = To(email)
            template_data = {
                'verification_code': verification_code,
                'email': email
            }

            mail = Mail(
                from_email=self.from_email,
                to_emails=to_email
            )
            mail.template_id = settings.SENDGRID_VERIFICATION_TEMPLATE_ID
            mail.dynamic_template_data = template_data

            response = self.sg.send(mail)
            logger.info(f"Verification email sent to {email}. Status code: {response.status_code}")
            return True
        except Exception as e:
            logger.error(f"Error sending verification email to {email}: {str(e)}")
            return False

    def send_password_reset_email(self, email, reset_code):
        """Send password reset code email."""
        try:
            to_email = To(email)
            template_data = {
                'reset_code': reset_code,
                'email': email
            }

            mail = Mail(
                from_email=self.from_email,
                to_emails=to_email
            )
            mail.template_id = settings.SENDGRID_PASSWORD_RESET_TEMPLATE_ID
            mail.dynamic_template_data = template_data

            response = self.sg.send(mail)
            logger.info(f"Password reset email sent to {email}. Status code: {response.status_code}")
            return True
        except Exception as e:
            logger.error(f"Error sending password reset email to {email}: {str(e)}")
            return False
