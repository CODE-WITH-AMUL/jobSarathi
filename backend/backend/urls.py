from django.urls import include
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from AdminPanal.views import PublicWebsiteSettingsView

urlpatterns = [
    path('admin/settings/', include('AdminPanal.urls')),
    path('admin/', admin.site.urls),
    path('api/website-settings/', PublicWebsiteSettingsView.as_view(), name='public-website-settings'),
    path('api/', include('core.urls')),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
