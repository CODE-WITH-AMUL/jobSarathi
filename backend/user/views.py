from django.db.models import Q
from rest_framework import mixins, viewsets, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsCandidateUser
from company.models import Job
from company.services import JobSearchService
from company.filters import JobSearchFilter

from .models import CandidateProfile, Education, Experience, JobApplication, Resume, SavedJob, Skill
from .serializers import (
    CandidateDashboardProfileSerializer,
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
        except ValueError:
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


class CandidateProfileUpdateView(APIView):
    """
    Alias endpoint for candidate profile update.
    PUT/PATCH /api/candidate/profile/update/
    """

    permission_classes = [IsAuthenticated, IsCandidateUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        candidate = get_or_create_candidate_profile(request.user)
        serializer = CandidateDashboardProfileSerializer(candidate, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        return self._update(request)

    def patch(self, request):
        return self._update(request)

    def _update(self, request):
        candidate = get_or_create_candidate_profile(request.user)
        data = self._normalize_profile_payload(request)

        resume_error = self._validate_resume_file(request)
        if resume_error is not None:
            return resume_error

        serializer = CandidateProfileSerializer(candidate, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)

        self._sync_skills(candidate, request.data)
        self._sync_experience(candidate, request.data.get("experience"))
        self._sync_education(candidate, request.data.get("education"))

        candidate.refresh_from_db()
        response_serializer = CandidateDashboardProfileSerializer(candidate, context={"request": request})
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    def _normalize_profile_payload(self, request):
        data = request.data.copy()
        data.pop("email", None)

        full_name = request.data.get("full_name")
        if full_name is not None:
            data.pop("full_name", None)
            normalized = str(full_name).strip()
            if normalized:
                parts = normalized.split()
                data["first_name"] = parts[0]
                data["last_name"] = " ".join(parts[1:]) if len(parts) > 1 else ""

        location = request.data.get("location")
        if location is not None:
            data.pop("location", None)
            parts = [part.strip() for part in str(location).split(",") if part and part.strip()]
            if len(parts) >= 1:
                data["city"] = parts[0]
            if len(parts) == 2:
                data["country"] = parts[1]
            if len(parts) >= 3:
                data["state"] = ", ".join(parts[1:-1])
                data["country"] = parts[-1]

        return data

    def _validate_resume_file(self, request):
        resume_file = request.FILES.get("resume")
        if resume_file and not str(resume_file.name).lower().endswith(".pdf"):
            return Response(
                {"resume": ["Only PDF resumes are allowed."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return None

    def _extract_skill_values(self, request_data):
        skills_provided = False
        skill_values = []

        raw_skills = request_data.get("skills")
        if raw_skills is not None:
            skills_provided = True
            if isinstance(raw_skills, str):
                skill_values = [s.strip() for s in raw_skills.split(",") if s and s.strip()]
            elif isinstance(raw_skills, (list, tuple)):
                skill_values = [str(s).strip() for s in raw_skills if str(s).strip()]

        if hasattr(request_data, "getlist") and "skills" in request_data:
            listed = [s.strip() for s in request_data.getlist("skills") if s and s.strip()]
            skills_provided = True
            if listed:
                skill_values = listed

        return skills_provided, skill_values

    def _sync_skills(self, candidate, request_data):
        skills_provided, skill_values = self._extract_skill_values(request_data)
        if not skills_provided:
            return

        Skill.objects.filter(candidate=candidate).delete()
        if skill_values:
            Skill.objects.bulk_create(
                [Skill(candidate=candidate, skill=skill_name) for skill_name in skill_values]
            )

    def _sync_experience(self, candidate, experience_summary):
        if experience_summary is None:
            return

        summary = str(experience_summary).strip()
        if not summary:
            return

        existing = candidate.experiences.order_by("-updated_at", "-created_at").first()
        if existing:
            existing.company = existing.company or "Summary"
            existing.position = existing.position or "Experience"
            existing.description = summary
            existing.save(update_fields=["company", "position", "description", "updated_at"])
            return

        Experience.objects.create(
            candidate=candidate,
            company="Summary",
            position="Experience",
            description=summary,
        )

    def _sync_education(self, candidate, education_summary):
        if education_summary is None:
            return

        summary = str(education_summary).strip()
        if not summary:
            return

        existing = candidate.educations.order_by("-updated_at", "-created_at").first()
        if existing:
            existing.degree = existing.degree or "Other"
            existing.institution = existing.institution or "Summary"
            existing.description = summary
            existing.save(update_fields=["degree", "institution", "description", "updated_at"])
            return

        Education.objects.create(
            candidate=candidate,
            degree="Other",
            institution="Summary",
            description=summary,
        )


class CandidateJobApplyView(APIView):
    """
    Alias endpoint for candidate apply action.
    POST /api/applications/apply/
    """

    permission_classes = [IsAuthenticated, IsCandidateUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        candidate = get_or_create_candidate_profile(request.user)
        payload = request.data.copy()

        payload.pop("candidate_id", None)

        job_id = request.data.get("job_id") or request.data.get("job")
        if not job_id:
            return Response({"job_id": ["job_id is required."]}, status=status.HTTP_400_BAD_REQUEST)

        payload["job"] = job_id
        if "job_id" in payload:
            payload.pop("job_id")

        resume_file = request.FILES.get("resume")
        if resume_file is not None and "resume_file" not in payload:
            payload["resume_file"] = resume_file

        serializer = JobApplicationSerializer(data=payload, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save(candidate=candidate)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


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
