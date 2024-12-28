# Generated by Django 4.2.7 on 2024-12-27 11:52

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):
    dependencies = [
        ("authentication", "0006_alter_user_created_at"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="address",
            options={
                "ordering": ["-is_default", "-created_at"],
                "verbose_name": "address",
                "verbose_name_plural": "addresses",
            },
        ),
        migrations.AlterModelOptions(
            name="userpreferences",
            options={
                "verbose_name": "user preferences",
                "verbose_name_plural": "user preferences",
            },
        ),
        migrations.AlterModelOptions(
            name="verificationcode",
            options={
                "verbose_name": "verification code",
                "verbose_name_plural": "verification codes",
            },
        ),
        migrations.RemoveField(
            model_name="securitysettings",
            name="account_recovery_phone",
        ),
        migrations.RemoveField(
            model_name="user",
            name="updated_at",
        ),
        migrations.AlterField(
            model_name="address",
            name="city",
            field=models.CharField(default="", max_length=100, verbose_name="city"),
        ),
        migrations.AlterField(
            model_name="address",
            name="id",
            field=models.UUIDField(
                default=uuid.uuid4, editable=False, primary_key=True, serialize=False
            ),
        ),
        migrations.AlterField(
            model_name="address",
            name="is_default",
            field=models.BooleanField(default=False, verbose_name="default address"),
        ),
        migrations.AlterField(
            model_name="address",
            name="street_address",
            field=models.CharField(
                default="", max_length=255, verbose_name="street address"
            ),
        ),
        migrations.AlterField(
            model_name="referral",
            name="id",
            field=models.UUIDField(
                default=uuid.uuid4, editable=False, primary_key=True, serialize=False
            ),
        ),
        migrations.AlterField(
            model_name="securitysettings",
            name="id",
            field=models.UUIDField(
                default=uuid.uuid4, editable=False, primary_key=True, serialize=False
            ),
        ),
        migrations.AlterField(
            model_name="securitysettings",
            name="two_factor_method",
            field=models.CharField(
                blank=True,
                choices=[("EMAIL", "Email"), ("APP", "Authenticator App")],
                max_length=20,
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name="socialconnection",
            name="id",
            field=models.UUIDField(
                default=uuid.uuid4, editable=False, primary_key=True, serialize=False
            ),
        ),
        migrations.AlterField(
            model_name="user",
            name="bio",
            field=models.TextField(blank=True, max_length=500, verbose_name="bio"),
        ),
        migrations.AlterField(
            model_name="user",
            name="created_at",
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AlterField(
            model_name="user",
            name="date_of_birth",
            field=models.DateField(blank=True, null=True, verbose_name="date of birth"),
        ),
        migrations.AlterField(
            model_name="user",
            name="email",
            field=models.EmailField(
                default="", max_length=254, unique=True, verbose_name="email address"
            ),
        ),
        migrations.AlterField(
            model_name="user",
            name="id",
            field=models.UUIDField(
                default=uuid.uuid4, editable=False, primary_key=True, serialize=False
            ),
        ),
        migrations.AlterField(
            model_name="useractivity",
            name="id",
            field=models.UUIDField(
                default=uuid.uuid4, editable=False, primary_key=True, serialize=False
            ),
        ),
        migrations.AlterField(
            model_name="userpreferences",
            name="email_notifications",
            field=models.BooleanField(default=True, verbose_name="email notifications"),
        ),
        migrations.AlterField(
            model_name="userpreferences",
            name="id",
            field=models.UUIDField(
                default=uuid.uuid4, editable=False, primary_key=True, serialize=False
            ),
        ),
        migrations.AlterField(
            model_name="userpreferences",
            name="newsletter",
            field=models.BooleanField(default=True, verbose_name="newsletter"),
        ),
        migrations.AlterField(
            model_name="userpreferences",
            name="order_updates",
            field=models.BooleanField(default=True, verbose_name="order updates"),
        ),
        migrations.AlterField(
            model_name="userpreferences",
            name="promotional_emails",
            field=models.BooleanField(default=True, verbose_name="promotional emails"),
        ),
        migrations.AlterField(
            model_name="userpreferences",
            name="push_notifications",
            field=models.BooleanField(default=True, verbose_name="push notifications"),
        ),
        migrations.AlterField(
            model_name="userpreferences",
            name="theme",
            field=models.CharField(
                choices=[("light", "Light"), ("dark", "Dark"), ("system", "System")],
                default="system",
                max_length=10,
                verbose_name="theme",
            ),
        ),
        migrations.AlterField(
            model_name="verificationcode",
            name="id",
            field=models.UUIDField(
                default=uuid.uuid4, editable=False, primary_key=True, serialize=False
            ),
        ),
    ]