from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, BrandViewSet, ProductImageViewSet, ReviewViewSet, CartViewSet, WishlistViewSet, CBDEffectViewSet

router = DefaultRouter()
router.register('products', ProductViewSet, basename='product')
router.register('brands', BrandViewSet, basename='brand')
router.register('cart', CartViewSet, basename='cart')
router.register('wishlist', WishlistViewSet, basename='wishlist')
router.register('effects', CBDEffectViewSet, basename='effect')

urlpatterns = [
    # Main endpoints
    path('', include(router.urls)),
    
    # Product-specific endpoints
    path('products/<slug:slug>/reviews/', ReviewViewSet.as_view({'get': 'list', 'post': 'create'}), name='product-reviews'),
    
    # Cart endpoints
    path('cart/add/', CartViewSet.as_view({'post': 'add'}), name='cart-add'),
    path('cart/remove/', CartViewSet.as_view({'post': 'remove'}), name='cart-remove'),
    path('cart/update-quantity/', CartViewSet.as_view({'post': 'update_quantity'}), name='cart-update-quantity'),
    path('cart/clear/', CartViewSet.as_view({'post': 'clear'}), name='cart-clear'),
    path('cart/current/', CartViewSet.as_view({'get': 'current'}), name='cart-current'),
    
    # Wishlist endpoints
    path('wishlist/toggle/', WishlistViewSet.as_view({'post': 'toggle'}), name='wishlist-toggle'),
    path('wishlist/check/<int:product_id>/', WishlistViewSet.as_view({'get': 'check'}), name='wishlist-check'),
]
