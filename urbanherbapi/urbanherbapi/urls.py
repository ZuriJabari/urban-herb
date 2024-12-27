"""
URL configuration for urbanherbapi project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse

@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'auth': reverse('auth-endpoints', request=request, format=format),
        'products': reverse('product-list', request=request, format=format),
        'status': 'Urban Herb API is running',
        'version': '1.0.0',
        'documentation': '/api/docs/',  # We'll add Swagger/OpenAPI docs later
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/products/', include('products.urls')),
    path('api/health-check/', lambda request: JsonResponse({'status': 'ok'})),
    path('api/urls/', lambda request: JsonResponse({'urls': []})),  
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
