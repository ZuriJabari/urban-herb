from rest_framework import serializers
from .models import Product, Brand, ProductImage, Review, Cart, CartItem, Wishlist
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

class ProductSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    effects = serializers.ListField(child=serializers.CharField(), required=False)
    benefits = serializers.ListField(child=serializers.CharField(), required=False)
    average_rating = serializers.FloatField(read_only=True)
    total_reviews = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'category', 'brand', 'strain',
            'thc_content', 'cbd_content', 'effects', 'benefits', 'lab_tested', 'stock',
            'images', 'reviews', 'average_rating', 'total_reviews', 'created_at',
            'updated_at'
        ]

    def get_average_rating(self, obj):
        return obj.reviews.aggregate(Avg('rating'))['rating__avg'] or 0.0

    def get_total_reviews(self, obj):
        return obj.reviews.count()

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Convert JSON strings to lists for effects and benefits
        try:
            ret['effects'] = json.loads(instance.effects) if instance.effects else []
        except (TypeError, json.JSONDecodeError):
            ret['effects'] = []

        try:
            ret['benefits'] = json.loads(instance.benefits) if instance.benefits else []
        except (TypeError, json.JSONDecodeError):
            ret['benefits'] = []

        ret['average_rating'] = self.get_average_rating(instance)
        ret['total_reviews'] = self.get_total_reviews(instance)

        return ret

    def to_internal_value(self, data):
        # Convert lists to JSON strings for effects and benefits
        if 'effects' in data:
            data['effects'] = json.dumps(data['effects'])
        if 'benefits' in data:
            data['benefits'] = json.dumps(data['benefits'])
        return super().to_internal_value(data)

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
