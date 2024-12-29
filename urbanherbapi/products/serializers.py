from rest_framework import serializers
from .models import Product, Brand, ProductImage, Review, Cart, CartItem, Wishlist, CBDEffect
from django.db.models import Avg
import json

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = '__all__'

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'product', 'user', 'user_email', 'rating', 'title', 'content', 'created_at']
        read_only_fields = ['user']

class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['product', 'rating', 'title', 'content']

class CBDEffectSerializer(serializers.ModelSerializer):
    class Meta:
        model = CBDEffect
        fields = ['id', 'name', 'description', 'icon']

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    effects = CBDEffectSerializer(many=True, read_only=True)
    brand = BrandSerializer(read_only=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    stock = serializers.IntegerField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'category', 'strain',
            'thc_content', 'cbd_content', 'effects', 'benefits',
            'price', 'discount_price', 'stock', 'featured',
            'created_at', 'updated_at', 'images', 'reviews',
            'average_rating', 'review_count', 'brand', 'lab_tested',
            'weight', 'dosage', 'ingredients', 'usage_instructions',
            'warning'
        ]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        
        # Ensure price and stock are properly serialized
        ret['price'] = float(instance.price)
        ret['stock'] = int(instance.stock)
        
        # Convert JSON strings to lists for effects and benefits
        try:
            ret['benefits'] = json.loads(instance.benefits) if instance.benefits else []
        except (TypeError, json.JSONDecodeError):
            ret['benefits'] = []

        # Ensure arrays are initialized
        ret['images'] = ret.get('images', [])
        ret['effects'] = ret.get('effects', [])
        ret['reviews'] = ret.get('reviews', [])

        # Calculate average rating and review count
        ret['average_rating'] = self.get_average_rating(instance)
        ret['review_count'] = self.get_review_count(instance)

        return ret

    def get_average_rating(self, obj):
        return float(obj.reviews.aggregate(Avg('rating'))['rating__avg'] or 0.0)

    def get_review_count(self, obj):
        return obj.reviews.count()

class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    effects = serializers.ListField(child=serializers.CharField(), required=False)
    benefits = serializers.ListField(child=serializers.CharField(), required=False)

    class Meta:
        model = Product
        fields = '__all__'

    def to_internal_value(self, data):
        # Convert lists to JSON strings for effects and benefits
        if 'effects' in data:
            data['effects'] = json.dumps(data['effects'])
        if 'benefits' in data:
            data['benefits'] = json.dumps(data['benefits'])
        return super().to_internal_value(data)

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source='product',
        write_only=True
    )
    subtotal = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
        source='get_subtotal'
    )

    class Meta:
        model = CartItem
        fields = ['id', 'cart', 'product', 'product_id', 'quantity', 'subtotal']
        read_only_fields = ['cart']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
        source='get_total'
    )

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total', 'created_at', 'updated_at']
        read_only_fields = ['user']

class WishlistSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)
    product_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Product.objects.all(),
        source='products',
        write_only=True
    )

    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'products', 'product_ids', 'created_at', 'updated_at']
        read_only_fields = ['user']
