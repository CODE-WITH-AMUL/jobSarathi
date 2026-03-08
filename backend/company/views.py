from django.db.models import Count
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response

from user.models import JobApplication

from .models import CompanyProfile, Job
from .serializers import (
    CompanyApplicationReviewSerializer,
    CompanyJobApplicationSerializer,
    CompanyProfileSerializer,
    JobSerializer,
)


class IsCompanyUser(BasePermission):
    message = "Only company users can access this endpoint."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        token_role = _get_token_role(request)
        return (
            token_role == "company"
            or hasattr(request.user, "company_profile")
            or request.user.posted_jobs.exists()
        )


class CompanyProfileViewSet(viewsets.ModelViewSet):
    serializer_class = CompanyProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        token_role = _get_token_role(self.request)
        if token_role == "company" and not hasattr(self.request.user, "company_profile"):
            CompanyProfile.objects.get_or_create(
                user=self.request.user,
                defaults={"name": self.request.user.username},
            )
        elif request_user_is_legacy_company(self.request.user):
            CompanyProfile.objects.get_or_create(
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
        queryset = Job.objects.select_related("company", "posted_by").filter(
            posted_by=self.request.user
        ).annotate(
            applications_count=Count("applications")
        )

        location = self.request.query_params.get("location")
        job_type = self.request.query_params.get("type")

        if location:
            queryset = queryset.filter(location_city__icontains=location)
        if job_type:
            queryset = queryset.filter(job_type__iexact=job_type)

        return queryset

    def perform_create(self, serializer):
        company_profile, _ = CompanyProfile.objects.get_or_create(
            user=self.request.user,
            defaults={"name": self.request.user.username},
        )
        serializer.save(
            posted_by=self.request.user,
            company=company_profile,
            company_name=company_profile.name,
        )


def request_user_is_legacy_company(user):
    return user.is_authenticated and user.posted_jobs.exists() and not hasattr(user, "company_profile")


def _get_token_role(request):
    token = getattr(request, "auth", None)
    if token is None:
        return None
    try:
        return token.get("role")
    except Exception:
        try:
            return token["role"]
        except Exception:
            return None


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
