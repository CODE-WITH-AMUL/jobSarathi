from django.db.models import Q
from rest_framework import mixins, viewsets, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsCandidateUser
from company.models import Job
from company.services import JobSearchService
from company.filters import JobSearchFilter

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
from .services import CandidateService


def get_or_create_candidate_profile(user):
    """Wrapper for backward compatibility"""
    return CandidateService.get_or_create_candidate_profile(user)


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
    pagination_class = None  # Use manual pagination in list()

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        """
        Get jobs with search filters.
        
        Query Parameters:
            - keyword/q: Search in job title, company, description, skills
            - location: Filter by location (city, state, country)
            - type: Filter by job type (Remote, Full Time, Part Time, Internship)
            - experience_level: Filter by experience level (Entry Level, Mid Level, Senior, Executive, Any)
            - salary_min: Minimum salary
            - salary_max: Maximum salary
            - company: Filter by company name
            - days_posted: Filter by days posted (in days)
            - sort_by: Sort option (newest, oldest, salary_high, salary_low, relevance)
            - page: Page number (default: 1)
            - page_size: Items per page (default: 10, max: 100)
        """
        filters = {
            'keyword': self.request.query_params.get('keyword') or self.request.query_params.get('q'),
            'location': self.request.query_params.get('location'),
            'job_type': self.request.query_params.get('type'),
            'salary_min': self.request.query_params.get('salary_min'),
            'salary_max': self.request.query_params.get('salary_max'),
            'company': self.request.query_params.get('company'),
            'days_posted': self.request.query_params.get('days_posted'),
            'experience_level': self.request.query_params.get('experience_level'),
            'sort_by': self.request.query_params.get('sort_by', 'newest'),
            'page': self.request.query_params.get('page', 1),
            'page_size': self.request.query_params.get('page_size', 10),
        }
        
        # Remove None values
        filters = {k: v for k, v in filters.items() if v is not None}
        
        try:
            result = JobSearchService.search_jobs(**filters)
            # Store pagination info for list() method
            self._pagination_info = {
                'total_count': result.get('total_count'),
                'total_pages': result.get('total_pages'),
                'page': result.get('page'),
                'page_size': result.get('page_size'),
            }
            return result.get('queryset')
        except ValueError as e:
            # Return empty queryset for invalid filters
            return Job.objects.none()
    
    def list(self, request, *args, **kwargs):
        """List jobs with enhanced response including pagination info."""
        queryset = self.filter_queryset(self.get_queryset())
        
        serializer = self.get_serializer(queryset, many=True)
        
        # Include pagination info in response
        pagination_info = getattr(self, '_pagination_info', {})
        
        return Response({
            'count': pagination_info.get('total_count', len(queryset)),
            'next': None,  # Simplified pagination
            'previous': None,
            'page': pagination_info.get('page', 1),
            'page_size': pagination_info.get('page_size', 10),
            'total_pages': pagination_info.get('total_pages', 1),
            'results': serializer.data
        })


class JobApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated, IsCandidateUser]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        candidate = get_or_create_candidate_profile(self.request.user)
        return CandidateService.get_candidate_applications(candidate)

    def perform_create(self, serializer):
        candidate = get_or_create_candidate_profile(self.request.user)
        serializer.save(candidate=candidate)


class SavedJobViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = SavedJobSerializer
    permission_classes = [IsAuthenticated, IsCandidateUser]

    def get_queryset(self):
        candidate = get_or_create_candidate_profile(self.request.user)
        return CandidateService.get_saved_jobs(candidate)

    def perform_create(self, serializer):
        candidate = get_or_create_candidate_profile(self.request.user)
        serializer.save(candidate=candidate)


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
