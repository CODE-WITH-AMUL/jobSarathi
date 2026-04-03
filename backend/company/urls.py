from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CompanyApplicationViewSet, 
    CompanyDashboardStatsView,
    CompanyProfileViewSet, 
    CompanyProfileUpdateView,
    JobViewSet,
    PublicJobViewSet
)

router = DefaultRouter()
router.include_format_suffixes = False
router.register(r"profile", CompanyProfileViewSet, basename="company-profile")
router.register(r"jobs", JobViewSet, basename="company-jobs")
router.register(r"public-jobs", PublicJobViewSet, basename="public-jobs")
router.register(r"applications", CompanyApplicationViewSet, basename="company-applications")

urlpatterns = [
    path("profile/update/", CompanyProfileUpdateView.as_view(), name="company-profile-update"),
    path("dashboard/stats/", CompanyDashboardStatsView.as_view(), name="company-dashboard-stats"),
    path("", include(router.urls)),
]
