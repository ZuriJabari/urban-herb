from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, BrandViewSet, ProductImageViewSet, ReviewViewSet, CartViewSet, WishlistViewSet

router = DefaultRouter()
router.register('products', ProductViewSet, basename='product')
router.register('brands', BrandViewSet, basename='brand')
router.register('cart', CartViewSet, basename='cart')
router.register('wishlist', WishlistViewSet, basename='wishlist')

# Nested routers for product-related endpoints
product_router = DefaultRouter()
product_router.register('images', ProductImageViewSet, basename='product-images')
product_router.register('reviews', ReviewViewSet, basename='product-reviews')

urlpatterns = [
    # Main endpoints
    path('', include(router.urls)),
    
    # Product-specific endpoints
    path('products/<int:product_pk>/', include(product_router.urls)),
    
    # Cart endpoints
    path('cart/add/', CartViewSet.as_view({'post': 'add'}), name='cart-add'),
    
    # Wishlist endpoints
    path('wishlist/toggle/', WishlistViewSet.as_view({'post': 'toggle'}), name='wishlist-toggle'),
    path('wishlist/check/<int:product_id>/', WishlistViewSet.as_view({'get': 'check'}), name='wishlist-check'),
]
