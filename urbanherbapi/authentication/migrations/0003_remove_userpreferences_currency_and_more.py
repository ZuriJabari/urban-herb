# Generated by Django 4.2.9 on 2024-12-27 00:37

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("authentication", "0002_alter_userpreferences_options_and_more"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="userpreferences",
            name="currency",
        ),
        migrations.RemoveField(
            model_name="userpreferences",
            name="language",
        ),
    ]
