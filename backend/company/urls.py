from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CompanyApplicationViewSet, CompanyProfileViewSet, JobViewSet

router = DefaultRouter()
router.include_format_suffixes = False
router.register(r"profile", CompanyProfileViewSet, basename="company-profile")
router.register(r"jobs", JobViewSet, basename="company-jobs")
router.register(r"applications", CompanyApplicationViewSet, basename="company-applications")

urlpatterns = [
    path("", include(router.urls)),
]
