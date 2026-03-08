from django.db.models import Q
from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from company.models import Job

from .models import CandidateProfile, Education, Experience, JobApplication, Resume, SavedJob, Skill
from .serializers import (
    CandidateProfileSerializer,
    EducationSerializer,
    ExperienceSerializer,
    JobApplicationSerializer,
    JobListSerializer,
    ResumeSerializer,
    SavedJobSerializer,
    SkillSerializer,
)


class IsCandidateUser(BasePermission):
    message = "Only candidate users can access this endpoint."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and not hasattr(request.user, "company_profile"))


def _default_candidate_payload(user):
    first_name = user.first_name or user.username
    last_name = user.last_name or ""
    return {
        "first_name": first_name,
        "last_name": last_name,
        "email": user.email or f"{user.username}@example.com",
        "phone": f"AUTO-{user.id}",
        "address": "Not provided",
        "city": "Not provided",
        "country": "Not provided",
        "zip_code": "00000",
        "pincode": "00000",
        "dob": "1995-01-01",
        "age": 30,
        "gender": "Prefer not to say",
    }


def get_or_create_candidate_profile(user):
    profile = CandidateProfile.objects.filter(user=user).first()
    if profile:
        return profile
    profile = CandidateProfile.objects.filter(email=user.email).first() if user.email else None
    if profile:
        profile.user = user
        profile.save(update_fields=["user"])
        return profile
    return CandidateProfile.objects.create(user=user, **_default_candidate_payload(user))


class CandidateProfileViewSet(viewsets.ModelViewSet):
    serializer_class = CandidateProfileSerializer
    permission_classes = [IsAuthenticated, IsCandidateUser]

    def get_queryset(self):
        profile = get_or_create_candidate_profile(self.request.user)
        return CandidateProfile.objects.filter(pk=profile.pk)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BaseCandidateOwnedViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsCandidateUser]

    def get_candidate(self):
        return get_or_create_candidate_profile(self.request.user)


class EducationViewSet(BaseCandidateOwnedViewSet):
    serializer_class = EducationSerializer

    def get_queryset(self):
        return Education.objects.filter(candidate=self.get_candidate())

    def perform_create(self, serializer):
        serializer.save(candidate=self.get_candidate())


class ExperienceViewSet(BaseCandidateOwnedViewSet):
    serializer_class = ExperienceSerializer

    def get_queryset(self):
        return Experience.objects.filter(candidate=self.get_candidate())

    def perform_create(self, serializer):
        serializer.save(candidate=self.get_candidate())


class SkillViewSet(BaseCandidateOwnedViewSet):
    serializer_class = SkillSerializer

    def get_queryset(self):
        return Skill.objects.filter(candidate=self.get_candidate())

    def perform_create(self, serializer):
        serializer.save(candidate=self.get_candidate())


class ResumeViewSet(BaseCandidateOwnedViewSet):
    serializer_class = ResumeSerializer

    def get_queryset(self):
        return Resume.objects.filter(candidate=self.get_candidate())

    def perform_create(self, serializer):
        serializer.save(candidate=self.get_candidate())


class JobCatalogViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = JobListSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Job.objects.filter(job_status="Open")
        location = self.request.query_params.get("location")
        job_type = self.request.query_params.get("type")
        q = self.request.query_params.get("q")

        if location:
            queryset = queryset.filter(
                Q(location_city__icontains=location) | Q(location_country__icontains=location)
            )
        if job_type:
            queryset = queryset.filter(job_type__iexact=job_type)
        if q:
            queryset = queryset.filter(
                Q(job_title__icontains=q) | Q(company_name__icontains=q) | Q(description__icontains=q)
            )
        return queryset


class JobApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated, IsCandidateUser]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return JobApplication.objects.select_related("job", "candidate").filter(
            candidate=get_or_create_candidate_profile(self.request.user)
        )

    def perform_create(self, serializer):
        serializer.save(candidate=get_or_create_candidate_profile(self.request.user))


class SavedJobViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = SavedJobSerializer
    permission_classes = [IsAuthenticated, IsCandidateUser]

    def get_queryset(self):
        return SavedJob.objects.select_related("job").filter(
            candidate=get_or_create_candidate_profile(self.request.user)
        )

    def perform_create(self, serializer):
        serializer.save(candidate=get_or_create_candidate_profile(self.request.user))


class CandidateDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsCandidateUser]

    def get(self, request):
        candidate = get_or_create_candidate_profile(request.user)
        latest_jobs = Job.objects.filter(job_status="Open")[:6]
        recent_applications = JobApplication.objects.filter(candidate=candidate)[:5]

        return Response(
            {
                "profile": CandidateProfileSerializer(candidate).data,
                "latest_jobs": JobListSerializer(latest_jobs, many=True).data,
                "recent_applications": JobApplicationSerializer(recent_applications, many=True).data,
            }
        )
