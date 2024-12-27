from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, BrandViewSet, ProductImageViewSet, ReviewViewSet, CartViewSet, WishlistViewSet

router = DefaultRouter()
router.register('', ProductViewSet, basename='product')
router.register('brands', BrandViewSet, basename='brand')
router.register('cart', CartViewSet, basename='cart')
router.register('wishlist', WishlistViewSet, basename='wishlist')
router.register('product-images', ProductImageViewSet, basename='product-images')
router.register('reviews', ReviewViewSet, basename='reviews')

urlpatterns = [
    path('', include(router.urls)),
]
