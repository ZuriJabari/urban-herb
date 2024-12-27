from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
import uuid
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = None
    email = models.EmailField(_('email address'), unique=True, null=False, blank=False, default='')
    phone_number = models.CharField(_('phone number'), max_length=20, unique=True, null=True, blank=True)
    first_name = models.CharField(_('first name'), max_length=150)
    last_name = models.CharField(_('last name'), max_length=150)
    date_of_birth = models.DateField(_('date of birth'), null=True, blank=True)
    profile_photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True)
    bio = models.TextField(_('bio'), max_length=500, blank=True)
    gender = models.CharField(_('gender'), max_length=20, choices=[
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
        ('prefer_not_to_say', 'Prefer not to say')
    ], default='prefer_not_to_say')
    is_email_verified = models.BooleanField(_('email verified'), default=False)
    date_joined = models.DateTimeField(_('date joined'), auto_now_add=True, editable=False)
    last_login = models.DateTimeField(_('last login'), auto_now=True, null=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def __str__(self):
        return self.email

class Address(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='addresses')
    street_address = models.CharField(_('street address'), max_length=255, default='')
    apartment = models.CharField(_('apartment'), max_length=50, blank=True)
    city = models.CharField(_('city'), max_length=100, default='')
    state = models.CharField(_('state'), max_length=100, default='')
    zip_code = models.CharField(_('zip code'), max_length=20, default='')
    country = models.CharField(_('country'), max_length=100, default='US')
    is_default = models.BooleanField(_('default address'), default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('address')
        verbose_name_plural = _('addresses')
        ordering = ['-is_default', '-created_at']

    def __str__(self):
        return f"{self.street_address}, {self.city}, {self.state}"

    def save(self, *args, **kwargs):
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)

class UserPreferences(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('es', 'Spanish'),
        ('fr', 'French'),
    ]

    CURRENCY_CHOICES = [
        ('USD', 'US Dollar'),
        ('EUR', 'Euro'),
        ('GBP', 'British Pound'),
    ]

    THEME_CHOICES = [
        ('light', 'Light'),
        ('dark', 'Dark'),
        ('system', 'System'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='preferences')
    language = models.CharField(_('language'), max_length=10, choices=LANGUAGE_CHOICES, default='en')
    currency = models.CharField(_('currency'), max_length=3, choices=CURRENCY_CHOICES, default='USD')
    timezone = models.CharField(_('timezone'), max_length=50, default='UTC')
    theme = models.CharField(_('theme'), max_length=10, choices=THEME_CHOICES, default='system')
    email_notifications = models.BooleanField(_('email notifications'), default=True)
    push_notifications = models.BooleanField(_('push notifications'), default=True)
    order_updates = models.BooleanField(_('order updates'), default=True)
    promotional_emails = models.BooleanField(_('promotional emails'), default=True)
    newsletter = models.BooleanField(_('newsletter'), default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('user preferences')
        verbose_name_plural = _('user preferences')

    def __str__(self):
        return f"Preferences for {self.user.email}"

class VerificationCode(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(default='')
    code = models.CharField(max_length=6, default='000000')
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = _('verification code')
        verbose_name_plural = _('verification codes')

    def __str__(self):
        return f"{self.email} - {self.code}"

class SecuritySettings(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='security_settings')
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_method = models.CharField(
        max_length=20,
        choices=[('EMAIL', 'Email'), ('APP', 'Authenticator App')],
        null=True,
        blank=True
    )
    login_alerts = models.BooleanField(default=True)
    trusted_devices = models.JSONField(default=list)
    last_password_change = models.DateTimeField(auto_now_add=True)
    password_reset_required = models.BooleanField(default=False)
    account_recovery_email = models.EmailField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user}'s security settings"

class UserActivity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
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

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activities')
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
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    PLATFORM_CHOICES = [
        ('FACEBOOK', 'Facebook'),
        ('GOOGLE', 'Google'),
        ('APPLE', 'Apple'),
        ('TWITTER', 'Twitter')
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='social_connections')
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
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    referrer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='referrals_made')
    referred_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='referred_by')
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
