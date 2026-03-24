from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    # Role-selection and role-specific auth
    LoginRoleSelectionView,
    CandidateLoginView,
    CompanyLoginView,
    CandidateRegisterView,
    CompanyRegisterView,
    # Legacy endpoints (backward compatibility)
    RegisterView,
    EmailOrUsernameTokenObtainPairView,
    # Profile
    ProfileViewSet,
)

# ============================================================================
# ROUTER SETUP
# ============================================================================
router = DefaultRouter()
router.include_format_suffixes = False
router.register(r'profile', ProfileViewSet, basename='profile')

# ============================================================================
# URL PATTERNS
# ============================================================================
urlpatterns = [
    # ========== ROLE-SELECTION & ROLE-SPECIFIC AUTHENTICATION ==========
    # Step 1: User selects role
    path('auth/login-role/', LoginRoleSelectionView.as_view(), name='login_role_selection'),
    
    # Step 2: Role-specific login
    path('auth/candidate/login/', CandidateLoginView.as_view(), name='candidate_login'),
    path('auth/company/login/', CompanyLoginView.as_view(), name='company_login'),
    
    # Step 2: Role-specific registration
    path('auth/candidate/register/', CandidateRegisterView.as_view(), name='candidate_register'),
    path('auth/company/register/', CompanyRegisterView.as_view(), name='company_register'),
    
    # ========== LEGACY ENDPOINTS (BACKWARD COMPATIBILITY) ==========
    path('login/', EmailOrUsernameTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('register/', RegisterView.as_view(), name='register'),
    
    # ========== TOKEN REFRESH ==========
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # ========== PROFILE MANAGEMENT ==========
    path('', include(router.urls)),
]
