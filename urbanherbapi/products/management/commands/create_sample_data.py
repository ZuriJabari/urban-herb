from django.core.management.base import BaseCommand
from products.models import Brand, Product, ProductImage
import json

class Command(BaseCommand):
    help = 'Creates sample product data'

    def handle(self, *args, **kwargs):
        # Create brands
        brand1 = Brand.objects.create(
            name='Green Leaf Botanicals',
            logo='https://example.com/logo1.png',
            website='https://greenleafbotanicals.com',
            description='Premium botanical products'
        )

        brand2 = Brand.objects.create(
            name='Pure Wellness',
            logo='https://example.com/logo2.png',
            website='https://purewellness.com',
            description='Natural wellness solutions'
        )

        # Create products
        products_data = [
            {
                'name': 'Premium CBD Oil',
                'description': 'High-quality CBD oil for relaxation and wellness.',
                'brand': brand1,
                'category': 'TINCTURES',
                'strain': 'CBD',
                'thc_content': '0.3%',
                'cbd_content': '1000mg',
                'effects': json.dumps(['RELAXING', 'STRESS_RELIEF']),
                'benefits': json.dumps(['Pain Relief', 'Better Sleep', 'Reduced Anxiety']),
                'price': '59.99',
                'stock': 100,
                'lab_tested': True,
                'weight': '30ml',
                'dosage': '1ml daily',
                'ingredients': 'Hemp extract, MCT oil',
                'usage_instructions': 'Place 1ml under tongue and hold for 30 seconds',
                'warning': 'Consult physician before use'
            },
            {
                'name': 'Organic Hemp Flower',
                'description': 'Premium organic hemp flower for a natural experience.',
                'brand': brand2,
                'category': 'FLOWERS',
                'strain': 'SATIVA',
                'thc_content': '0.2%',
                'cbd_content': '18%',
                'effects': json.dumps(['ENERGIZING', 'FOCUSED']),
                'benefits': json.dumps(['Energy Boost', 'Mental Clarity', 'Creativity']),
                'price': '29.99',
                'stock': 50,
                'lab_tested': True,
                'weight': '3.5g',
                'usage_instructions': 'For aromatherapy use only',
                'warning': 'Keep out of reach of children'
            },
            {
                'name': 'Relaxation Gummies',
                'description': 'Delicious CBD gummies for relaxation.',
                'brand': brand1,
                'category': 'EDIBLES',
                'strain': 'CBD',
                'thc_content': '0%',
                'cbd_content': '25mg per gummy',
                'effects': json.dumps(['RELAXING', 'SLEEPY']),
                'benefits': json.dumps(['Stress Relief', 'Better Sleep', 'Calmness']),
                'price': '24.99',
                'stock': 75,
                'lab_tested': True,
                'weight': '300g',
                'dosage': '1-2 gummies daily',
                'ingredients': 'Organic sugar, pectin, CBD isolate',
                'usage_instructions': 'Take 1-2 gummies daily as needed',
                'warning': 'Not for children. Keep in cool place'
            },
            {
                'name': 'Relief Balm',
                'description': 'Soothing CBD balm for muscle and joint relief.',
                'brand': brand2,
                'category': 'TOPICALS',
                'strain': 'CBD',
                'thc_content': '0%',
                'cbd_content': '500mg',
                'effects': json.dumps(['PAIN_RELIEF']),
                'benefits': json.dumps(['Muscle Relief', 'Joint Support', 'Skin Health']),
                'price': '39.99',
                'stock': 60,
                'lab_tested': True,
                'weight': '60g',
                'ingredients': 'Shea butter, coconut oil, CBD isolate',
                'usage_instructions': 'Apply to affected area as needed',
                'warning': 'For external use only'
            }
        ]

        for product_data in products_data:
            product = Product.objects.create(**product_data)
            
            # Create a sample image for each product
            ProductImage.objects.create(
                product=product,
                image=f'https://picsum.photos/400/400?random={product.id}',
                alt_text=f'{product.name} image',
                is_primary=True
            )

        self.stdout.write(self.style.SUCCESS('Successfully created sample data'))
