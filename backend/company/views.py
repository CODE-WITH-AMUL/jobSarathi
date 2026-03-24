from django.db.models import Count
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.permissions import IsCompanyUser
from user.models import JobApplication

from .models import CompanyProfile, Job
from .serializers import (
    CompanyApplicationReviewSerializer,
    CompanyJobApplicationSerializer,
    CompanyProfileSerializer,
    JobSerializer,
)
from .services import JobService
from .selectors import JobSelector


class CompanyProfileViewSet(viewsets.ModelViewSet):
    serializer_class = CompanyProfileSerializer
    permission_classes = [IsAuthenticated, IsCompanyUser]

    def get_queryset(self):
        # Ensure CompanyProfile exists for company users
        company_profile, _ = CompanyProfile.objects.get_or_create(
            user=self.request.user,
            defaults={"name": self.request.user.username},
        )
        return CompanyProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated, IsCompanyUser]

    def get_queryset(self):
        return JobSelector.get_company_jobs_with_stats(self.request.user)

    def perform_create(self, serializer):
        serializer.save(
            posted_by=self.request.user,
            company=self._get_or_create_company_profile()
        )
    
    def perform_update(self, serializer):
        serializer.save(company=self._get_or_create_company_profile())
    
    def _get_or_create_company_profile(self):
        """Helper to ensure company profile exists"""
        company_profile, _ = CompanyProfile.objects.get_or_create(
            user=self.request.user,
            defaults={"name": self.request.user.username},
        )
        return company_profile


class CompanyApplicationViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = CompanyJobApplicationSerializer
    permission_classes = [IsAuthenticated, IsCompanyUser]

    def get_queryset(self):
        return JobApplication.objects.select_related("job", "candidate").filter(
            job__posted_by=self.request.user
        )

    @action(detail=True, methods=["patch"], url_path="review")
    def review(self, request, pk=None):
        application = self.get_object()
        serializer = CompanyApplicationReviewSerializer(
            application,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            CompanyJobApplicationSerializer(application).data,
            status=status.HTTP_200_OK,
        )
