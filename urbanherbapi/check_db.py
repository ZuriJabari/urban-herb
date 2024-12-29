import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'urbanherbapi.settings')
django.setup()

from products.models import Brand, Product, CBDEffect
from django.db import connection

# Check Brand table
print("\nChecking Brand table:")
brands = Brand.objects.all()
print(f"Number of brands: {brands.count()}")
for brand in brands:
    print(f"Brand: {brand.name}")

# Check Product table
print("\nChecking Product table:")
products = Product.objects.all()
print(f"Number of products: {products.count()}")
for product in products:
    print(f"Product: {product.name} (Brand: {product.brand.name})")

# Show the actual SQL queries
print("\nLast executed queries:")
for query in connection.queries[-5:]:
    print(f"\nQuery: {query['sql']}")
    print(f"Time: {query['time']}")
