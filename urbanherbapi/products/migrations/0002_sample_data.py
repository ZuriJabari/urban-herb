from django.db import migrations
from django.utils.text import slugify
import json

def add_sample_data(apps, schema_editor):
    Brand = apps.get_model('products', 'Brand')
    Product = apps.get_model('products', 'Product')
    ProductImage = apps.get_model('products', 'ProductImage')

    # Create sample brands
    brands = [
        {
            'name': 'Pure Relief',
            'website': 'https://purerelief.com',
            'description': 'Premium CBD products for natural wellness',
            'logo': 'https://example.com/logos/pure-relief.png'
        },
        {
            'name': 'Green Roads',
            'website': 'https://greenroads.com',
            'description': 'Award-winning CBD company focused on quality and transparency',
            'logo': 'https://example.com/logos/green-roads.png'
        },
        {
            'name': 'CBDfx',
            'website': 'https://cbdfx.com',
            'description': 'Innovative CBD products made with organic ingredients',
            'logo': 'https://example.com/logos/cbdfx.png'
        },
        {
            'name': 'Hemp Basics',
            'website': 'https://hempbasics.com',
            'description': 'Quality hemp accessories and smoking essentials',
            'logo': 'https://example.com/logos/hemp-basics.png'
        }
    ]

    created_brands = {}
    for brand_data in brands:
        brand = Brand.objects.create(**brand_data)
        created_brands[brand.name] = brand

    # Create sample products
    products = [
        # Flowers
        {
            'name': 'Calm CBD Hemp Flower',
            'description': 'Premium CBD-rich hemp flower with calming effects. Perfect for relaxation and stress relief.',
            'brand': created_brands['Pure Relief'],
            'category': 'FLOWERS',
            'strain': 'CBD',
            'thc_content': '<0.3%',
            'cbd_content': '18%',
            'effects': json.dumps(['RELAXING', 'STRESS_RELIEF', 'PAIN_RELIEF']),
            'benefits': json.dumps(['Reduces anxiety', 'Promotes relaxation', 'Helps with sleep']),
            'price': '39.99',
            'weight': '3.5g',
            'lab_tested': True,
            'rating': '4.5',
            'review_count': 128,
            'featured': True
        },
        # Edibles
        {
            'name': 'CBD Gummies for Sleep',
            'description': 'Delicious CBD gummies with melatonin for better sleep. Each gummy contains 25mg CBD.',
            'brand': created_brands['Green Roads'],
            'category': 'EDIBLES',
            'strain': 'CBD',
            'thc_content': '0%',
            'cbd_content': '25mg/gummy',
            'effects': json.dumps(['SLEEPY', 'RELAXING']),
            'benefits': json.dumps(['Better sleep', 'Relaxation', 'Stress relief']),
            'price': '49.99',
            'dosage': '1-2 gummies before bedtime',
            'lab_tested': True,
            'rating': '4.8',
            'review_count': 256,
            'featured': True
        },
        # Concentrates
        {
            'name': 'Full Spectrum CBD Oil',
            'description': 'High-potency CBD oil with full spectrum of cannabinoids for maximum effect.',
            'brand': created_brands['CBDfx'],
            'category': 'CONCENTRATES',
            'strain': 'CBD',
            'thc_content': '<0.3%',
            'cbd_content': '1500mg',
            'effects': json.dumps(['PAIN_RELIEF', 'ANXIETY_RELIEF']),
            'benefits': json.dumps(['Pain management', 'Anxiety relief', 'Better sleep']),
            'price': '129.99',
            'dosage': '1ml (1 full dropper)',
            'lab_tested': True,
            'rating': '4.7',
            'review_count': 189
        },
        # Vapes
        {
            'name': 'CBD Vape Pen - Calm',
            'description': 'Disposable CBD vape pen with calming terpene blend.',
            'brand': created_brands['CBDfx'],
            'category': 'VAPES',
            'strain': 'CBD',
            'thc_content': '0%',
            'cbd_content': '250mg',
            'effects': json.dumps(['RELAXING', 'STRESS_RELIEF']),
            'benefits': json.dumps(['Quick relief', 'Portable', 'Discreet']),
            'price': '34.99',
            'lab_tested': True,
            'rating': '4.6',
            'review_count': 145
        },
        # Accessories
        {
            'name': 'Premium Hemp Rolling Papers',
            'description': 'Organic hemp rolling papers with natural gum arabic. Slow-burning and smooth.',
            'brand': created_brands['Hemp Basics'],
            'category': 'ACCESSORIES',
            'strain': 'NA',
            'price': '4.99',
            'rating': '4.4',
            'review_count': 89
        },
        {
            'name': 'Glass CBD Oil Dropper',
            'description': 'Premium glass dropper with measurement marks for precise dosing.',
            'brand': created_brands['Hemp Basics'],
            'category': 'ACCESSORIES',
            'strain': 'NA',
            'price': '12.99',
            'rating': '4.3',
            'review_count': 67
        }
    ]

    for product_data in products:
        product_data['slug'] = slugify(product_data['name'])
        product = Product.objects.create(**product_data)

        # Add product images
        ProductImage.objects.create(
            product=product,
            image=f'https://example.com/products/{product.slug}/1.jpg',
            alt_text=f'{product.name} - Main Image',
            is_primary=True
        )
        
        # Add additional images for featured products
        if product.featured:
            for i in range(2, 5):
                ProductImage.objects.create(
                    product=product,
                    image=f'https://example.com/products/{product.slug}/{i}.jpg',
                    alt_text=f'{product.name} - Image {i}'
                )

def remove_sample_data(apps, schema_editor):
    Brand = apps.get_model('products', 'Brand')
    Product = apps.get_model('products', 'Product')
    ProductImage = apps.get_model('products', 'ProductImage')

    ProductImage.objects.all().delete()
    Product.objects.all().delete()
    Brand.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(add_sample_data, remove_sample_data),
    ]
