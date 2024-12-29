from django.core.management.base import BaseCommand
from products.models import Product, Brand, CBDEffect
from decimal import Decimal

class Command(BaseCommand):
    help = 'Adds a sample product with effects to the database'

    def handle(self, *args, **kwargs):
        # Create or get a brand
        brand, _ = Brand.objects.get_or_create(
            name='Sample Brand',
            defaults={
                'description': 'A sample brand for testing'
            }
        )

        # Create a product
        product, created = Product.objects.get_or_create(
            name='CBD Oil Tincture',
            defaults={
                'description': 'High-quality CBD oil tincture with multiple beneficial effects',
                'brand': brand,
                'category': 'TINCTURES',
                'strain': 'CBD',
                'thc_content': '0.3%',
                'cbd_content': '1000mg',
                'price': Decimal('49.99'),
                'stock': 100,
                'lab_tested': True,
                'featured': True
            }
        )

        if created:
            # Add effects to the product
            effects = CBDEffect.objects.all()
            product.effects.add(*effects)
            self.stdout.write(self.style.SUCCESS(f'Created product: {product.name} with {effects.count()} effects'))
        else:
            self.stdout.write(self.style.WARNING(f'Product already exists: {product.name}'))
