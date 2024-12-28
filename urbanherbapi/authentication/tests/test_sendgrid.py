from django.test import TestCase
from django.conf import settings
from authentication.services.sendgrid_service import SendGridService
from authentication.models import User
import os

class SendGridServiceTest(TestCase):
    def setUp(self):
        self.sendgrid_service = SendGridService()
        self.test_email = "test@example.com"
        self.test_user = User.objects.create_user(
            email=self.test_email,
            password="testpass123",
            first_name="Test",
            last_name="User"
        )

    def test_welcome_email(self):
        """Test sending welcome email"""
        result = self.sendgrid_service.send_welcome_email(
            self.test_user,
            verification_code="123456"
        )
        self.assertTrue(result)

    def test_verification_email(self):
        """Test sending verification email"""
        result = self.sendgrid_service.send_verification_email(
            self.test_email,
            verification_code="123456"
        )
        self.assertTrue(result)

    def test_password_reset_email(self):
        """Test sending password reset email"""
        result = self.sendgrid_service.send_password_reset_email(
            self.test_email,
            reset_code="123456"
        )
        self.assertTrue(result)
