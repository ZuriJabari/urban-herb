from django.core.management.base import BaseCommand
from products.models import CBDEffect

class Command(BaseCommand):
    help = 'Adds sample CBD effects to the database'

    def handle(self, *args, **kwargs):
        effects = [
            {
                'name': 'Relaxation',
                'description': 'Promotes a sense of calm and relaxation',
                'icon': 'FaMoon'
            },
            {
                'name': 'Pain Relief',
                'description': 'Helps alleviate physical discomfort',
                'icon': 'FaHandHoldingMedical'
            },
            {
                'name': 'Sleep Aid',
                'description': 'Supports better sleep quality',
                'icon': 'FaMoon'
            },
            {
                'name': 'Focus',
                'description': 'Enhances mental clarity and concentration',
                'icon': 'FaBrain'
            },
            {
                'name': 'Mood Boost',
                'description': 'Elevates mood and promotes positivity',
                'icon': 'FaSmile'
            },
            {
                'name': 'Anti-Inflammation',
                'description': 'Reduces inflammation in the body',
                'icon': 'FaHeart'
            },
            {
                'name': 'Stress Relief',
                'description': 'Helps manage stress and anxiety',
                'icon': 'FaLeaf'
            },
            {
                'name': 'Digestive Aid',
                'description': 'Supports digestive health',
                'icon': 'FaStomach'
            }
        ]

        for effect_data in effects:
            effect, created = CBDEffect.objects.get_or_create(
                name=effect_data['name'],
                defaults={
                    'description': effect_data['description'],
                    'icon': effect_data['icon']
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created effect: {effect.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Effect already exists: {effect.name}'))
