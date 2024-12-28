from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site
from django.db import transaction

class Command(BaseCommand):
    help = 'Set up the default Django site'

    def handle(self, *args, **options):
        try:
            with transaction.atomic():
                # Update or create the default site
                Site.objects.update_or_create(
                    id=1,
                    defaults={
                        'domain': 'localhost:8001',
                        'name': 'UrbanHerb'
                    }
                )
                self.stdout.write(self.style.SUCCESS('Successfully set up default site'))
