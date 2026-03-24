from django.db import OperationalError
from rest_framework import status, viewsets
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from company.models import CompanyProfile
from .models import Profile
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
from .services import RoleValidationService, UserValidationService


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
    Class-based view for candidate login.
    POST /api/auth/candidate/login/
    
    Only allows users with 'candidate' role to login.
    Rejects company users with 403 Forbidden.
    Provides comprehensive error messages for debugging.
    """
    serializer_class = CandidateTokenObtainPairSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        """
        Candidate login endpoint with enhanced error handling.
        Accepts: username/email, password
        Returns: access_token, refresh_token, role (always 'candidate')
        """
        try:
            # Validate input fields
            username_or_email = request.data.get('username') or request.data.get('email')
            password = request.data.get('password')
            
            if not username_or_email:
                return Response(
                    {"detail": "Username or email is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if not password:
                return Response(
                    {"detail": "Password is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return super().post(request, *args, **kwargs)
        except ValidationError as e:
            error_detail = str(e.detail) if hasattr(e, 'detail') else str(e)
            
            if "This user account is registered as" in error_detail:
                return Response(
                    {"detail": error_detail, "error_code": "WRONG_ROLE"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            return Response(
                {"detail": error_detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            error_str = str(e)
            if "This user account is registered as" in error_str:
                return Response(
                    {"detail": error_str, "error_code": "WRONG_ROLE"},
                    status=status.HTTP_403_FORBIDDEN
                )
            if "No active account found" in error_str or "Invalid credentials" in error_str.lower():
                return Response(
                    {"detail": "Invalid username/email or password", "error_code": "INVALID_CREDENTIALS"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            raise


class CompanyLoginView(TokenObtainPairView):
    """
    Class-based view for company/employer login.
    POST /api/auth/company/login/
    
    Only allows users with 'company' role to login.
    Rejects candidate users with 403 Forbidden.
    Provides comprehensive error messages for debugging.
    """
    serializer_class = CompanyTokenObtainPairSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        """
        Company login endpoint with enhanced error handling.
        Accepts: username/email, password
        Returns: access_token, refresh_token, role (always 'company')
        """
        try:
            # Validate input fields
            username_or_email = request.data.get('username') or request.data.get('email')
            password = request.data.get('password')
            
            if not username_or_email:
                return Response(
                    {"detail": "Username or email is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if not password:
                return Response(
                    {"detail": "Password is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return super().post(request, *args, **kwargs)
        except ValidationError as e:
            error_detail = str(e.detail) if hasattr(e, 'detail') else str(e)
            
            if "This user account is registered as" in error_detail:
                return Response(
                    {"detail": error_detail, "error_code": "WRONG_ROLE"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            return Response(
                {"detail": error_detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            error_str = str(e)
            if "This user account is registered as" in error_str:
                return Response(
                    {"detail": error_str, "error_code": "WRONG_ROLE"},
                    status=status.HTTP_403_FORBIDDEN
                )
            if "No active account found" in error_str or "Invalid credentials" in error_str.lower():
                return Response(
                    {"detail": "Invalid username/email or password", "error_code": "INVALID_CREDENTIALS"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            raise


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
