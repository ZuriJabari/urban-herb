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

# Function to list all available URLs
def list_urls(request):
    from django.urls import get_resolver
    urls = []
    
    def collect_urls(resolver, prefix=''):
        for pattern in resolver.url_patterns:
            if hasattr(pattern, 'url_patterns'):
                collect_urls(pattern, prefix + str(pattern.pattern))
            else:
                urls.append({
                    'pattern': prefix + str(pattern.pattern),
                    'name': pattern.name if hasattr(pattern, 'name') else None,
                    'lookup_str': pattern.lookup_str if hasattr(pattern, 'lookup_str') else None,
                })
    
    collect_urls(get_resolver())
    return JsonResponse({'urls': urls})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/products/', include('products.urls')),
    path('api/health-check/', lambda request: JsonResponse({'status': 'ok'})),
    path('api/urls/', list_urls, name='list-urls'),  
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
