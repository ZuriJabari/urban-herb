from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
from .views import ProductViewSet, BrandViewSet, ProductImageViewSet, ReviewViewSet, CartViewSet, WishlistViewSet

router = DefaultRouter()
router.register('products', ProductViewSet, basename='product')
router.register('brands', BrandViewSet, basename='brand')
router.register('cart', CartViewSet, basename='cart')
router.register('wishlist', WishlistViewSet, basename='wishlist')
router.register('product-images', ProductImageViewSet, basename='product-images')
router.register('reviews', ReviewViewSet, basename='reviews')

@api_view(['GET'])
def product_endpoints(request):
    return Response({
        'products': reverse('product-list', request=request),
        'brands': reverse('brand-list', request=request),
        'cart': reverse('cart-list', request=request),
        'wishlist': reverse('wishlist-list', request=request),
        'product_images': reverse('product-images-list', request=request),
        'reviews': reverse('reviews-list', request=request),
    })

urlpatterns = [
    path('', product_endpoints, name='product-list'),
    path('', include(router.urls)),
]
