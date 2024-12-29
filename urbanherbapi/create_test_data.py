import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'urbanherbapi.settings')
django.setup()

from products.models import Brand, Product, CBDEffect

# Create a test brand
brand, created = Brand.objects.get_or_create(
    name="Test Brand",
    defaults={
        'website': 'https://testbrand.com',
        'description': 'A test brand for development'
    }
)

# Create a test product
product, created = Product.objects.get_or_create(
    name="Test CBD Oil",
    defaults={
        'description': 'A high-quality CBD oil for testing',
        'brand': brand,
        'category': 'TINCTURES',
        'strain': 'CBD',
        'thc_content': '0.3%',
        'cbd_content': '1000mg',
        'price': 49.99,
        'stock': 100,
        'lab_tested': True,
        'weight': '30ml',
        'dosage': '1ml daily',
        'ingredients': 'Hemp-derived CBD, MCT oil',
        'usage_instructions': 'Take 1ml under tongue daily',
        'warning': 'Consult with doctor before use'
    }
)

print(f"Brand created: {created}")
print(f"Product created: {created}")
print("Test data created successfully!")
