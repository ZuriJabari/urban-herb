from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _
import uuid

class CustomUserManager(BaseUserManager):
    def create_user(self, email=None, phone_number=None, password=None, **extra_fields):
        if not (email or phone_number):
            raise ValueError('Either email or phone number must be set')
        
        if email:
            email = self.normalize_email(email)
        
        user = self.model(
            email=email,
            phone_number=phone_number,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_phone_verified', True)
        extra_fields.setdefault('is_email_verified', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(phone_number=phone_number, password=password, **extra_fields)

class User(AbstractUser):
    username = None  # Remove username field
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_('email address'), unique=True, null=True, blank=True)
    phone_number = models.CharField(max_length=15, unique=True, null=True, blank=True)
    is_phone_verified = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    first_name = models.CharField(_('first name'), max_length=150)
    last_name = models.CharField(_('last name'), max_length=150)
    date_of_birth = models.DateField(null=True, blank=True)
    profile_photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    gender = models.CharField(max_length=10, choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')], blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Loyalty Program Fields
    loyalty_points = models.IntegerField(default=0)
    loyalty_tier = models.CharField(
        max_length=20,
        choices=[
            ('BRONZE', 'Bronze'),
            ('SILVER', 'Silver'),
            ('GOLD', 'Gold'),
            ('PLATINUM', 'Platinum')
        ],
        default='BRONZE'
    )
    referral_code = models.CharField(max_length=10, unique=True, blank=True, null=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def __str__(self):
        return self.email or self.phone_number or str(self.id)

    def save(self, *args, **kwargs):
        # Generate referral code if not exists
        if not self.referral_code:
            self.referral_code = f'UH{str(uuid.uuid4())[:6].upper()}'
        super().save(*args, **kwargs)

class Address(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    street_address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15)
    is_default = models.BooleanField(default=False)
    label = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('address')
        verbose_name_plural = _('addresses')

    def __str__(self):
        return f"{self.street_address}, {self.city}"

    def save(self, *args, **kwargs):
        # If this is the first address for the user, make it default
        if not self.pk and not self.user.addresses.exists():
            self.is_default = True
        # If this address is being set as default, remove default from other addresses
        if self.is_default:
            self.user.addresses.filter(is_default=True).update(is_default=False)
        super().save(*args, **kwargs)

class UserPreferences(models.Model):
    THEME_CHOICES = [
        ('light', 'Light'),
        ('dark', 'Dark'),
        ('system', 'System Default')
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default='system')
    
    # Notification Preferences
    sms_notifications = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    order_updates = models.BooleanField(default=True)
    promotional_emails = models.BooleanField(default=True)
    newsletter = models.BooleanField(default=True)
    
    # Privacy Settings
    show_profile_photo = models.BooleanField(default=True)
    show_online_status = models.BooleanField(default=True)
    show_last_seen = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('user preference')
        verbose_name_plural = _('user preferences')

    def __str__(self):
        return f"{self.user}'s preferences"

class SecuritySettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='security_settings')
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_method = models.CharField(
        max_length=20,
        choices=[('SMS', 'SMS'), ('EMAIL', 'Email'), ('APP', 'Authenticator App')],
        null=True,
        blank=True
    )
    login_alerts = models.BooleanField(default=True)
    trusted_devices = models.JSONField(default=list)
    last_password_change = models.DateTimeField(auto_now_add=True)
    password_reset_required = models.BooleanField(default=False)
    account_recovery_email = models.EmailField(null=True, blank=True)
    account_recovery_phone = models.CharField(max_length=15, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user}'s security settings"

class UserActivity(models.Model):
    ACTIVITY_TYPES = [
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
        ('PASSWORD_CHANGE', 'Password Change'),
        ('PROFILE_UPDATE', 'Profile Update'),
        ('ORDER_PLACED', 'Order Placed'),
        ('REVIEW_POSTED', 'Review Posted'),
        ('POINTS_EARNED', 'Points Earned'),
        ('POINTS_REDEEMED', 'Points Redeemed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    device_info = models.JSONField(null=True, blank=True)
    location = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('user activity')
        verbose_name_plural = _('user activities')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} - {self.activity_type} - {self.created_at}"

class SocialConnection(models.Model):
    PLATFORM_CHOICES = [
        ('FACEBOOK', 'Facebook'),
        ('GOOGLE', 'Google'),
        ('APPLE', 'Apple'),
        ('TWITTER', 'Twitter')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='social_connections')
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    platform_user_id = models.CharField(max_length=255)
    platform_username = models.CharField(max_length=255, null=True, blank=True)
    access_token = models.TextField(null=True, blank=True)
    refresh_token = models.TextField(null=True, blank=True)
    token_expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('social connection')
        verbose_name_plural = _('social connections')
        unique_together = ['user', 'platform', 'platform_user_id']

    def __str__(self):
        return f"{self.user} - {self.platform}"

class Referral(models.Model):
    referrer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referrals_made')
    referred_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referred_by')
    code_used = models.CharField(max_length=10)
    points_awarded = models.IntegerField(default=0)
    is_successful = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    converted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _('referral')
        verbose_name_plural = _('referrals')
        unique_together = ['referrer', 'referred_user']

    def __str__(self):
        return f"{self.referrer} referred {self.referred_user}"

class VerificationCode(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone_number = models.CharField(max_length=15, default='')
    code = models.CharField(max_length=6)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.phone_number} - {self.code}"
