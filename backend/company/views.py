from django.shortcuts import get_object_or_404
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsCompanyUser
from user.models import JobApplication

from .models import CompanyProfile, Job
from .serializers import (
    CompanyApplicationReviewSerializer,
    CompanyJobApplicationSerializer,
    CompanyProfileSerializer,
    JobSerializer,
)
from .services import CompanyService
from .selectors import JobSelector


class CompanyProfileViewSet(viewsets.ModelViewSet):
    serializer_class = CompanyProfileSerializer
    permission_classes = [IsAuthenticated, IsCompanyUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        # Ensure CompanyProfile exists for company users
        CompanyProfile.objects.get_or_create(
            user=self.request.user,
            defaults={"name": self.request.user.username},
        )
        return CompanyProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CompanyProfileUpdateView(APIView):
    """
    Alias endpoint for profile updates.
    PUT/PATCH /api/company/profile/update/
    """

    permission_classes = [IsAuthenticated, IsCompanyUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def put(self, request):
        return self._update(request, partial=False)

    def patch(self, request):
        return self._update(request, partial=True)

    def _update(self, request, partial):
        profile, _ = CompanyProfile.objects.get_or_create(
            user=request.user,
            defaults={"name": request.user.username},
        )

        serializer = CompanyProfileSerializer(
            profile,
            data=request.data,
            partial=partial,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CompanyDashboardStatsView(APIView):
    """
    GET /api/company/dashboard/stats/
    Returns summary stats for company dashboard widgets.
    """

    permission_classes = [IsAuthenticated, IsCompanyUser]

    def get(self, request):
        return Response(CompanyService.get_company_stats(request.user), status=status.HTTP_200_OK)


class PublicJobViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public API for browsing job posts.
    Accessible to everyone (candidates and guests).
    """
    queryset = Job.objects.filter(job_status='Open')
    serializer_class = JobSerializer
    permission_classes = [AllowAny]

class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated, IsCompanyUser]

    def get_queryset(self):
        return JobSelector.get_company_jobs_with_stats(self.request.user)

    def perform_create(self, serializer):
        company_profile = self._get_or_create_company_profile()
        serializer.save(
            posted_by=self.request.user,
            company=company_profile,
            company_name=company_profile.name,
        )
    
    def perform_update(self, serializer):
        company_profile = self._get_or_create_company_profile()
        serializer.save(company=company_profile, company_name=company_profile.name)
    
    def _get_or_create_company_profile(self):
        """Helper to ensure company profile exists"""
        company_profile, _ = CompanyProfile.objects.get_or_create(
            user=self.request.user,
            defaults={"name": self.request.user.username},
        )
        return company_profile

    @action(detail=True, methods=["patch"], url_path="toggle-status")
    def toggle_status(self, request, pk=None):
        job = self.get_object()
        job.job_status = "Closed" if job.job_status == "Open" else "Open"
        job.save(update_fields=["job_status", "updated_at"])
        serializer = self.get_serializer(job)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CompanyJobCreateView(APIView):
    """
    Alias endpoint for creating jobs.
    POST /api/jobs/create/
    """

    permission_classes = [IsAuthenticated, IsCompanyUser]

    def post(self, request):
        serializer = JobSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        company_profile, _ = CompanyProfile.objects.get_or_create(
            user=request.user,
            defaults={"name": request.user.username},
        )

        job = serializer.save(
            posted_by=request.user,
            company=company_profile,
            company_name=company_profile.name,
        )
        return Response(
            JobSerializer(job, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class CompanyJobUpdateView(APIView):
    """
    Alias endpoint for updating jobs.
    PUT/PATCH /api/jobs/{id}/update/
    """

    permission_classes = [IsAuthenticated, IsCompanyUser]

    def put(self, request, job_id):
        return self._update(request, job_id, partial=False)

    def patch(self, request, job_id):
        return self._update(request, job_id, partial=True)

    def _update(self, request, job_id, partial):
        job = get_object_or_404(Job, id=job_id, posted_by=request.user)

        serializer = JobSerializer(
            job,
            data=request.data,
            partial=partial,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        company_profile, _ = CompanyProfile.objects.get_or_create(
            user=request.user,
            defaults={"name": request.user.username},
        )

        updated_job = serializer.save(company=company_profile, company_name=company_profile.name)
        return Response(
            JobSerializer(updated_job, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )


class CompanyJobDeleteView(APIView):
    """
    Alias endpoint for deleting jobs.
    DELETE /api/jobs/{id}/delete/
    """

    permission_classes = [IsAuthenticated, IsCompanyUser]

    def delete(self, request, job_id):
        job = get_object_or_404(Job, id=job_id, posted_by=request.user)
        job.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


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
