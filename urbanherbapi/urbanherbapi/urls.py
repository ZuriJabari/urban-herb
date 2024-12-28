"""
URL configuration for urbanherbapi project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Configure admin site
admin.site.site_header = 'UrbanHerb Admin'
admin.site.site_title = 'UrbanHerb Admin Portal'
admin.site.index_title = 'Welcome to UrbanHerb Admin Portal'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('products.urls')),  # Products API endpoints with v1 prefix
    path('api/v1/', include('authentication.urls')),  # Auth endpoints with v1 prefix
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Add debug URLs if in debug mode
if settings.DEBUG:
    from django.views.generic import TemplateView
    from rest_framework.schemas import get_schema_view
    
    urlpatterns += [
        # OpenAPI schema
        path('openapi/', get_schema_view(
            title="UrbanHerb API",
            description="API for UrbanHerb web application",
            version="1.0.0",
            public=True,
        ), name='openapi-schema'),
        
        # Swagger UI
        path('swagger-ui/', TemplateView.as_view(
            template_name='swagger-ui.html',
            extra_context={'schema_url':'openapi-schema'}
        ), name='swagger-ui'),
    ]
