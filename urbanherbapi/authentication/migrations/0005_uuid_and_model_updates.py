from django.db import migrations, models
import uuid
import random
import string

def gen_uuid(apps, schema_editor):
    for model_name in ['User', 'Address', 'UserPreferences', 'VerificationCode', 'SecuritySettings', 'UserActivity', 'SocialConnection', 'Referral']:
        MyModel = apps.get_model('authentication', model_name)
        db_alias = schema_editor.connection.alias
        for row in MyModel.objects.using(db_alias).all():
            row.temp_id = uuid.uuid4()
            row.save(update_fields=['temp_id'])

def update_email_defaults(apps, schema_editor):
    User = apps.get_model('authentication', 'User')
    db_alias = schema_editor.connection.alias
    
    # Function to generate a unique placeholder email
    def generate_unique_email():
        random_string = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))
        return f'placeholder_{random_string}@example.com'
    
    # Update null emails
    users_with_null_email = User.objects.using(db_alias).filter(email__isnull=True)
    for user in users_with_null_email:
        user.email = generate_unique_email()
        user.save()
    
    # Update empty emails
    users_with_empty_email = User.objects.using(db_alias).filter(email='')
    for user in users_with_empty_email:
        user.email = generate_unique_email()
        user.save()

class Migration(migrations.Migration):
    dependencies = [
        ('authentication', '0004_alter_verificationcode_options_and_more'),
    ]

    operations = [
        # Update email field first
        migrations.RunPython(update_email_defaults),
        migrations.AlterField(
            model_name='user',
            name='email',
            field=models.EmailField(max_length=254, unique=True, verbose_name='email address'),
        ),
        
        # Add temporary UUID fields
        migrations.AddField(
            model_name='user',
            name='temp_id',
            field=models.UUIDField(null=True),
        ),
        migrations.AddField(
            model_name='address',
            name='temp_id',
            field=models.UUIDField(null=True),
        ),
        migrations.AddField(
            model_name='userpreferences',
            name='temp_id',
            field=models.UUIDField(null=True),
        ),
        migrations.AddField(
            model_name='verificationcode',
            name='temp_id',
            field=models.UUIDField(null=True),
        ),
        migrations.AddField(
            model_name='securitysettings',
            name='temp_id',
            field=models.UUIDField(null=True),
        ),
        migrations.AddField(
            model_name='useractivity',
            name='temp_id',
            field=models.UUIDField(null=True),
        ),
        migrations.AddField(
            model_name='socialconnection',
            name='temp_id',
            field=models.UUIDField(null=True),
        ),
        migrations.AddField(
            model_name='referral',
            name='temp_id',
            field=models.UUIDField(null=True),
        ),

        # Generate UUIDs
        migrations.RunPython(gen_uuid),

        # Drop old id columns
        migrations.RemoveField(
            model_name='user',
            name='id',
        ),
        migrations.RemoveField(
            model_name='address',
            name='id',
        ),
        migrations.RemoveField(
            model_name='userpreferences',
            name='id',
        ),
        migrations.RemoveField(
            model_name='verificationcode',
            name='id',
        ),
        migrations.RemoveField(
            model_name='securitysettings',
            name='id',
        ),
        migrations.RemoveField(
            model_name='useractivity',
            name='id',
        ),
        migrations.RemoveField(
            model_name='socialconnection',
            name='id',
        ),
        migrations.RemoveField(
            model_name='referral',
            name='id',
        ),

        # Rename temp_id to id
        migrations.RenameField(
            model_name='user',
            old_name='temp_id',
            new_name='id',
        ),
        migrations.RenameField(
            model_name='address',
            old_name='temp_id',
            new_name='id',
        ),
        migrations.RenameField(
            model_name='userpreferences',
            old_name='temp_id',
            new_name='id',
        ),
        migrations.RenameField(
            model_name='verificationcode',
            old_name='temp_id',
            new_name='id',
        ),
        migrations.RenameField(
            model_name='securitysettings',
            old_name='temp_id',
            new_name='id',
        ),
        migrations.RenameField(
            model_name='useractivity',
            old_name='temp_id',
            new_name='id',
        ),
        migrations.RenameField(
            model_name='socialconnection',
            old_name='temp_id',
            new_name='id',
        ),
        migrations.RenameField(
            model_name='referral',
            old_name='temp_id',
            new_name='id',
        ),

        # Set UUIDs as primary keys
        migrations.AlterField(
            model_name='user',
            name='id',
            field=models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False),
        ),
        migrations.AlterField(
            model_name='address',
            name='id',
            field=models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False),
        ),
        migrations.AlterField(
            model_name='userpreferences',
            name='id',
            field=models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False),
        ),
        migrations.AlterField(
            model_name='verificationcode',
            name='id',
            field=models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False),
        ),
        migrations.AlterField(
            model_name='securitysettings',
            name='id',
            field=models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False),
        ),
        migrations.AlterField(
            model_name='useractivity',
            name='id',
            field=models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False),
        ),
        migrations.AlterField(
            model_name='socialconnection',
            name='id',
            field=models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False),
        ),
        migrations.AlterField(
            model_name='referral',
            name='id',
            field=models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False),
        ),

        # Update User model fields
        migrations.AlterField(
            model_name='user',
            name='last_login',
            field=models.DateTimeField(auto_now=True, null=True, verbose_name='last login'),
        ),
        migrations.AlterField(
            model_name='user',
            name='date_joined',
            field=models.DateTimeField(auto_now_add=True, verbose_name='date joined'),
        ),
        migrations.AlterField(
            model_name='user',
            name='is_email_verified',
            field=models.BooleanField(default=False, verbose_name='email verified'),
        ),
        migrations.AlterField(
            model_name='user',
            name='gender',
            field=models.CharField(choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other'), ('prefer_not_to_say', 'Prefer not to say')], default='prefer_not_to_say', max_length=20, verbose_name='gender'),
        ),
        
        # Update Address model fields
        migrations.AddField(
            model_name='address',
            name='apartment',
            field=models.CharField(blank=True, max_length=50, verbose_name='apartment'),
        ),
        migrations.AddField(
            model_name='address',
            name='state',
            field=models.CharField(default='', max_length=100, verbose_name='state'),
        ),
        migrations.AddField(
            model_name='address',
            name='zip_code',
            field=models.CharField(default='', max_length=20, verbose_name='zip code'),
        ),
        migrations.AddField(
            model_name='address',
            name='country',
            field=models.CharField(default='US', max_length=100, verbose_name='country'),
        ),
        
        # Update UserPreferences model fields
        migrations.AddField(
            model_name='userpreferences',
            name='currency',
            field=models.CharField(choices=[('USD', 'US Dollar'), ('EUR', 'Euro'), ('GBP', 'British Pound')], default='USD', max_length=3, verbose_name='currency'),
        ),
        migrations.AddField(
            model_name='userpreferences',
            name='language',
            field=models.CharField(choices=[('en', 'English'), ('es', 'Spanish'), ('fr', 'French')], default='en', max_length=10, verbose_name='language'),
        ),
        migrations.AddField(
            model_name='userpreferences',
            name='timezone',
            field=models.CharField(default='UTC', max_length=50, verbose_name='timezone'),
        ),
        
        # Update VerificationCode model fields
        migrations.AddField(
            model_name='verificationcode',
            name='email',
            field=models.EmailField(default='', max_length=254),
        ),
        migrations.AlterField(
            model_name='verificationcode',
            name='code',
            field=models.CharField(default='000000', max_length=6),
        ),
        
        # Remove unnecessary fields
        migrations.RemoveField(
            model_name='user',
            name='phone_number',
        ),
        migrations.RemoveField(
            model_name='user',
            name='is_phone_verified',
        ),
        migrations.RemoveField(
            model_name='user',
            name='loyalty_points',
        ),
        migrations.RemoveField(
            model_name='user',
            name='loyalty_tier',
        ),
        migrations.RemoveField(
            model_name='user',
            name='referral_code',
        ),
        migrations.RemoveField(
            model_name='address',
            name='phone_number',
        ),
        migrations.RemoveField(
            model_name='address',
            name='district',
        ),
        migrations.RemoveField(
            model_name='address',
            name='label',
        ),
        migrations.RemoveField(
            model_name='userpreferences',
            name='show_online_status',
        ),
        migrations.RemoveField(
            model_name='userpreferences',
            name='show_last_seen',
        ),
        migrations.RemoveField(
            model_name='userpreferences',
            name='show_profile_photo',
        ),
        migrations.RemoveField(
            model_name='userpreferences',
            name='sms_notifications',
        ),
        migrations.RemoveField(
            model_name='verificationcode',
            name='phone_number',
        ),
        migrations.RemoveField(
            model_name='verificationcode',
            name='updated_at',
        ),
    ]
