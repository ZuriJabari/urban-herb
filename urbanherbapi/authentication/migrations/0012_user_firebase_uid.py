# Generated by Django 4.2.7 on 2024-12-28 08:56

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("authentication", "0011_alter_verificationcode_options_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="firebase_uid",
            field=models.CharField(blank=True, max_length=128, null=True, unique=True),
        ),
    ]