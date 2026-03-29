from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CandidateProfileUpdateView,
    CandidateDashboardView,
    CandidateProfileViewSet,
    EducationViewSet,
    ExperienceViewSet,
    JobApplicationViewSet,
    JobCatalogViewSet,
    ResumeViewSet,
    SavedJobViewSet,
    SkillViewSet,
)

router = DefaultRouter()
router.include_format_suffixes = False
router.register(r"profile", CandidateProfileViewSet, basename="candidate-profile")
router.register(r"educations", EducationViewSet, basename="educations")
router.register(r"experiences", ExperienceViewSet, basename="experiences")
router.register(r"skills", SkillViewSet, basename="skills")
router.register(r"resumes", ResumeViewSet, basename="resumes")
router.register(r"jobs", JobCatalogViewSet, basename="jobs")
router.register(r"applications", JobApplicationViewSet, basename="applications")
router.register(r"saved-jobs", SavedJobViewSet, basename="saved-jobs")

urlpatterns = [
    path("dashboard/", CandidateDashboardView.as_view(), name="candidate-dashboard"),
    path("profile/update/", CandidateProfileUpdateView.as_view(), name="candidate-profile-update"),
    path("", include(router.urls)),
]
