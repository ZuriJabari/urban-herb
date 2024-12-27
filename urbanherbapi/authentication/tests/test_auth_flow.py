from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status
from authentication.models import User, VerificationCode
from django.utils import timezone
from datetime import timedelta
from django.core.cache import cache
from unittest.mock import patch

class AuthFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.phone_number = '+256782374230'
        self.test_password = 'testpass123'
        # Clear cache before each test
        cache.clear()
        
    @override_settings(DEBUG=False)  # Force production mode for SMS sending
    @patch('twilio.rest.api.v2010.account.message.MessageList.create')
    def test_registration_flow(self, mock_create):
        """Test the complete registration flow"""
        # Mock Twilio message creation
        mock_create.return_value.sid = "SM123"
        
        # Step 1: Register a new user
        registration_data = {
            'phone_number': self.phone_number,
            'password': self.test_password,
            'first_name': 'Test',
            'last_name': 'User',
            'is_registration': True
        }
        
        response = self.client.post('/api/auth/phone/send-verification/', registration_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        
        # Get the verification code from the database
        verification = VerificationCode.objects.filter(
            identifier=self.phone_number,
            type='phone'
        ).first()
        self.assertIsNotNone(verification)
        
        # Step 2: Verify the phone number
        verify_data = {
            'phone_number': self.phone_number,
            'code': verification.code
        }
        response = self.client.post('/api/auth/phone/verify/', verify_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        
        # Verify user was created and phone verified
        user = User.objects.get(phone_number=self.phone_number)
        self.assertTrue(user.is_phone_verified)
        
    @override_settings(DEBUG=False)  # Force production mode for SMS sending
    @patch('twilio.rest.api.v2010.account.message.MessageList.create')
    def test_login_flow(self, mock_create):
        """Test the complete login flow"""
        # Mock Twilio message creation
        mock_create.return_value.sid = "SM123"
        
        # Create a verified user first
        user = User.objects.create_user(
            phone_number=self.phone_number,
            password=self.test_password,
            is_phone_verified=True
        )
        
        # Step 1: Request login OTP
        login_data = {
            'phone_number': self.phone_number,
            'is_registration': False,
            'force_send': True  # Force send even though user is verified
        }
        response = self.client.post('/api/auth/phone/send-verification/', login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Get the verification code
        verification = VerificationCode.objects.filter(
            identifier=self.phone_number,
            type='phone',
            is_used=False
        ).first()
        self.assertIsNotNone(verification)
        
        # Step 2: Verify OTP
        verify_data = {
            'phone_number': self.phone_number,
            'code': verification.code
        }
        response = self.client.post('/api/auth/phone/verify/', verify_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        
    def test_invalid_phone_number(self):
        """Test registration with invalid phone number"""
        registration_data = {
            'phone_number': '123456',  # Invalid number
            'is_registration': True
        }
        response = self.client.post('/api/auth/phone/send-verification/', registration_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_wrong_verification_code(self):
        """Test verification with wrong code"""
        # Create a user and verification code
        user = User.objects.create_user(
            phone_number=self.phone_number,
            password=self.test_password
        )
        VerificationCode.objects.create(
            user=user,
            code='123456',
            type='phone',
            identifier=self.phone_number,
            expires_at=timezone.now() + timedelta(minutes=10)
        )
        
        # Try to verify with wrong code
        verify_data = {
            'phone_number': self.phone_number,
            'code': '000000'  # Wrong code
        }
        response = self.client.post('/api/auth/phone/verify/', verify_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_expired_verification_code(self):
        """Test verification with expired code"""
        # Create a user and expired verification code
        user = User.objects.create_user(
            phone_number=self.phone_number,
            password=self.test_password
        )
        VerificationCode.objects.create(
            user=user,
            code='123456',
            type='phone',
            identifier=self.phone_number,
            expires_at=timezone.now() - timedelta(minutes=1)  # Expired
        )
        
        # Try to verify with expired code
        verify_data = {
            'phone_number': self.phone_number,
            'code': '123456'
        }
        response = self.client.post('/api/auth/phone/verify/', verify_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    @override_settings(DEBUG=False)  # Force production mode for SMS sending
    @patch('twilio.rest.api.v2010.account.message.MessageList.create')
    def test_rate_limiting(self, mock_create):
        """Test OTP rate limiting"""
        # Mock Twilio message creation
        mock_create.return_value.sid = "SM123"
        
        # Create a new user for rate limiting test
        user = User.objects.create_user(
            phone_number=self.phone_number,
            password=self.test_password,
            is_phone_verified=False
        )
        
        # Try to request OTP multiple times
        login_data = {
            'phone_number': self.phone_number,
            'is_registration': False
        }
        
        # First 5 requests should succeed
        for i in range(5):
            response = self.client.post('/api/auth/phone/send-verification/', login_data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            # Verify that mock was called
            mock_create.assert_called()
        
        # The 6th request should fail with rate limit
        response = self.client.post('/api/auth/phone/send-verification/', login_data)
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
