from django.urls import include
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from AdminPanal.views import PublicWebsiteSettingsView
from company.views import CompanyJobCreateView, CompanyJobDeleteView, CompanyJobUpdateView
from user.views import CandidateJobApplyView, JobCatalogViewSet

urlpatterns = [
    path('admin/settings/', include('AdminPanal.urls')),
    path('admin/', admin.site.urls),
    path('api/website-settings/', PublicWebsiteSettingsView.as_view(), name='public-website-settings'),
    path('api/jobs/', JobCatalogViewSet.as_view({'get': 'list'}), name='job-catalog-list'),
    path('api/jobs/<int:pk>/', JobCatalogViewSet.as_view({'get': 'retrieve'}), name='job-catalog-detail'),
    path('api/applications/apply/', CandidateJobApplyView.as_view(), name='candidate-apply-job'),
    path('api/jobs/create/', CompanyJobCreateView.as_view(), name='company-job-create'),
    path('api/jobs/<int:job_id>/update/', CompanyJobUpdateView.as_view(), name='company-job-update'),
    path('api/jobs/<int:job_id>/delete/', CompanyJobDeleteView.as_view(), name='company-job-delete'),
    path('api/', include('core.urls')),
    path('api/candidate/', include('user.urls')),
    path('api/company/', include('company.urls')),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
