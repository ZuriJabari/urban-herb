from django.core.mail.backends.base import BaseEmailBackend
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content, TemplateId, DynamicTemplateData
from django.conf import settings
import json

class SendGridEmailBackend(BaseEmailBackend):
    def __init__(self, fail_silently=False, **kwargs):
        super().__init__(fail_silently=fail_silently, **kwargs)
        self.sg = SendGridAPIClient(api_key=settings.SENDGRID_API_KEY)
        self.default_from_email = settings.DEFAULT_FROM_EMAIL

    def send_messages(self, email_messages):
        if not email_messages:
            return 0

        num_sent = 0
        for message in email_messages:
            try:
                # Create SendGrid Email object
                from_email = Email(message.from_email or self.default_from_email)
                
                # Determine which template to use based on subject
                template_id = None
                if 'Welcome' in message.subject:
                    template_id = settings.SENDGRID_TEMPLATES['welcome']
                elif 'Verify' in message.subject:
                    template_id = settings.SENDGRID_TEMPLATES['email_verification']
                elif 'Reset' in message.subject:
                    template_id = settings.SENDGRID_TEMPLATES['password_reset']
                else:
                    template_id = settings.SENDGRID_TEMPLATES['base_email']

                # Extract dynamic data from message
                try:
                    dynamic_data = json.loads(message.body)
                except json.JSONDecodeError:
                    dynamic_data = {'content': message.body}

                for to_email in message.to:
                    # Create a separate email for each recipient
                    sg_mail = Mail(
                        from_email=from_email,
                        to_emails=To(to_email)
                    )
                    
                    # Add template and dynamic data
                    sg_mail.template_id = TemplateId(template_id)
                    sg_mail.dynamic_template_data = DynamicTemplateData(dynamic_data)

                    # Send email through SendGrid
                    response = self.sg.client.mail.send.post(request_body=sg_mail.get())
                    
                    if response.status_code in [200, 201, 202]:
                        num_sent += 1
                    
            except Exception as e:
                if not self.fail_silently:
                    raise e

        return num_sent
