"""
URL configuration for urbanherbapi project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title="Urban Herb API",
        default_version='v1',
        description="API documentation for Urban Herb e-commerce platform",
        terms_of_service="https://www.urbanherb.com/terms/",
        contact=openapi.Contact(email="contact@urbanherb.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

@api_view(['GET'])
def api_root(request, format=None):
    """
    API root view that provides links to all main endpoints
    """
    return Response({
        'auth': {
            'login': reverse('token_obtain_pair', request=request, format=format),
            'refresh': reverse('token_refresh', request=request, format=format),
            'register': request.build_absolute_uri('/api/auth/register/'),
            'profile': request.build_absolute_uri('/api/auth/profile/'),
        },
        'products': {
            'list': reverse('product-list', request=request, format=format),
            'brands': reverse('brand-list', request=request, format=format),
            'reviews': reverse('reviews-list', request=request, format=format),
            'cart': reverse('cart-list', request=request, format=format),
            'wishlist': reverse('wishlist-list', request=request, format=format),
        },
        'docs': {
            'swagger': request.build_absolute_uri('/api/swagger/'),
            'redoc': request.build_absolute_uri('/api/redoc/'),
        },
        'health': request.build_absolute_uri('/api/health-check/'),
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api-root'),
    path('api/auth/', include('authentication.urls')),
    path('api/products/', include('products.urls')),
    path('api/health-check/', lambda request: JsonResponse({'status': 'ok'})),
    # Swagger URLs
    path('api/swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('api/swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
