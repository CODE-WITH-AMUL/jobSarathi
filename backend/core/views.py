from django.db import OperationalError
from django.utils.decorators import method_decorator
from rest_framework import status, viewsets
from rest_framework.exceptions import APIException
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

try:
    from django_ratelimit.decorators import ratelimit
except Exception:  # pragma: no cover - safety fallback if package missing
    def ratelimit(*args, **kwargs):
        def decorator(func):
            return func

        return decorator

from company.models import CompanyProfile
from .models import Profile
from .throttles import LoginRateThrottle
from .serializers import (
    CandidateRegisterSerializer,
    CandidateTokenObtainPairSerializer,
    CompanyRegisterSerializer,
    CompanyTokenObtainPairSerializer,
    EmailOrUsernameTokenObtainPairSerializer,
    ProfileSerializer,
    ProfileUpdateSerializer,
    UserRegisterSerializer,
)



# ============================================================================
# ROLE SELECTION & ROLE-SPECIFIC LOGIN/REGISTRATION
# ============================================================================

class LoginRoleSelectionView(APIView):
    """
    GET endpoint to display available login options.
    Returns the roles that the user can login as.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        """
        Return available login role options.
        Clients should present these to users for selection before login.
        """
        return Response(
            {
                "message": "Select a login option",
                "roles": [
                    {
                        "id": "candidate",
                        "label": "Login as Candidate",
                        "description": "Job seeker looking for opportunities",
                        "endpoint": "/api/auth/candidate/login/"
                    },
                    {
                        "id": "company",
                        "label": "Login as Company / Employer",
                        "description": "Company posting jobs and managing applicants",
                        "endpoint": "/api/auth/company/login/"
                    }
                ]
            },
            status=status.HTTP_200_OK
        )


class CandidateLoginView(TokenObtainPairView):
    """
    POST /api/auth/candidate/login/
    """
    serializer_class = CandidateTokenObtainPairSerializer
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]


CandidateLoginView = method_decorator(
    ratelimit(key="ip", rate="10/m", method="POST", block=True),
    name="dispatch",
)(CandidateLoginView)


class CompanyLoginView(TokenObtainPairView):
    """
    POST /api/auth/company/login/
    """
    serializer_class = CompanyTokenObtainPairSerializer
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]


CompanyLoginView = method_decorator(
    ratelimit(key="ip", rate="10/m", method="POST", block=True),
    name="dispatch",
)(CompanyLoginView)



# ============================================================================
# ROLE-SPECIFIC REGISTRATION
# ============================================================================

class CandidateRegisterView(APIView):
    """
    Class-based view for candidate registration.
    POST /api/auth/candidate/register/
    
    Creates a new candidate account with 'candidate' role.
    Automatically creates associated Profile and CandidateProfile.
    """
    permission_classes = [AllowAny]
    serializer_class = CandidateRegisterSerializer

    def post(self, request, *args, **kwargs):
        """
        Register as a candidate.
        Accepts: username, email, password, confirm_password
        Returns: user id, username, email, role
        """
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": "candidate",
                "message": "Candidate account created successfully. Please log in."
            },
            status=status.HTTP_201_CREATED,
        )


class CompanyRegisterView(APIView):
    """
    Class-based view for company/employer registration.
    POST /api/auth/company/register/
    
    Creates a new company account with 'company' role.
    Automatically creates associated Profile and CompanyProfile.
    """
    permission_classes = [AllowAny]
    serializer_class = CompanyRegisterSerializer

    def post(self, request, *args, **kwargs):
        """
        Register as a company/employer.
        Accepts: username, email, password, confirm_password, company_name (optional)
        Returns: user id, username, email, role
        """
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        company_name = user.company_profile.name if hasattr(user, 'company_profile') else user.username
        
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": "company",
                "company_name": company_name,
                "message": "Company account created successfully. Please log in."
            },
            status=status.HTTP_201_CREATED,
        )


# ============================================================================
# BACKWARD COMPATIBILITY - LEGACY ENDPOINTS
# ============================================================================

class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    """
    Legacy endpoint for backward compatibility.
    Allows login with username or email without role pre-selection.
    /api/login/ (kept for backward compatibility)
    """
    serializer_class = EmailOrUsernameTokenObtainPairSerializer
    throttle_classes = [LoginRateThrottle]


EmailOrUsernameTokenObtainPairView = method_decorator(
    ratelimit(key="ip", rate="10/m", method="POST", block=True),
    name="dispatch",
)(EmailOrUsernameTokenObtainPairView)


class RegisterView(APIView):
    """
    Legacy endpoint for backward compatibility.
    /api/register/ (kept for backward compatibility)
    """
    permission_classes = [AllowAny]
    serializer_class = UserRegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Get role from user's profile
        role = user.profile.role if hasattr(user, 'profile') else 'candidate'
        
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": role,
                "message": "User registered successfully. Please log in."
            },
            status=status.HTTP_201_CREATED,
        )


# ============================================================================
# PROFILE MANAGEMENT
# ============================================================================

class ProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            profile, _ = Profile.objects.get_or_create(user=self.request.user)
        except OperationalError as exc:
            if "no such column: core_profile.avatar" in str(exc):
                raise APIException("Database schema is outdated. Run: python manage.py migrate")
            raise
        return Profile.objects.filter(pk=profile.pk)

    def get_serializer_class(self):
        if self.action in ["update", "partial_update", "create"]:
            return ProfileUpdateSerializer
        return ProfileSerializer
