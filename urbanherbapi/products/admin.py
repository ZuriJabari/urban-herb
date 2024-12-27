from django.contrib import admin
from django.utils.html import format_html
from .models import Product, Brand, ProductImage, Review, Cart, CartItem, Wishlist

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class ReviewInline(admin.TabularInline):
    model = Review
    extra = 0
    readonly_fields = ['user', 'rating', 'title', 'content']
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ['product', 'quantity']

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['name', 'website', 'created_at']
    search_fields = ['name', 'description']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'brand', 'price', 'stock', 'rating', 'created_at']
    list_filter = ['category', 'brand', 'lab_tested', 'featured']
    search_fields = ['name', 'description', 'brand__name']
    inlines = [ProductImageInline, ReviewInline]
    readonly_fields = ['rating', 'review_count']

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['product__name', 'user__email', 'title', 'content']
    readonly_fields = ['user']

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at']
    inlines = [CartItemInline]
    readonly_fields = ['user']

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at']
    filter_horizontal = ['products']
    readonly_fields = ['user']
