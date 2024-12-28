from django.core.management.base import BaseCommand
from products.models import Product

class Command(BaseCommand):
    help = 'Lists all products in the database'

    def handle(self, *args, **options):
        products = Product.objects.all()
        if not products:
            self.stdout.write(self.style.WARNING('No products found in the database!'))
            return
        
        self.stdout.write(self.style.SUCCESS(f'Found {products.count()} products:'))
        for product in products:
            self.stdout.write(f"""
Product ID: {product.id}
Name: {product.name}
Price: ${product.price}
Description: {product.description}
Category: {product.category}
------------------------
""")
