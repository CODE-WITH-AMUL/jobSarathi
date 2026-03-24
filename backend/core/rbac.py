"""
Role-Based Access Control (RBAC) implementation.
Provides custom permission classes and mixins for DRF ViewSets.
"""
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework import status


class IsCandidateUser(BasePermission):
    """
    Permission to check if user has candidate role.
    Only candidates can access endpoints marked with this permission.
    """
    message = "Only candidates can access this endpoint."

    def has_permission(self, request, view):
        """Check if user is a candidate"""
        if not (request.user and request.user.is_authenticated):
            return False
        
        if hasattr(request.user, 'profile'):
            return request.user.profile.is_candidate
        
        return False


class IsCompanyUser(BasePermission):
    """
    Permission to check if user has company role.
    Only companies can post jobs and manage applications.
    """
    message = "Only company users can access this endpoint."

    def has_permission(self, request, view):
        """Check if user is a company"""
        if not (request.user and request.user.is_authenticated):
            return False
        
        if hasattr(request.user, 'profile'):
            return request.user.profile.is_company
        
        # Fallback for backward compatibility - check for CompanyProfile
        from company.models import CompanyProfile
        return CompanyProfile.objects.filter(user=request.user).exists()


class IsJobOwner(BasePermission):
    """
    Permission to check if user owns a job posting.
    Only the company that posted the job can edit/delete it.
    """
    message = "You can only edit jobs you have posted."

    def has_object_permission(self, request, view, obj):
        """Check if user posted the job"""
        return obj.posted_by == request.user


class CanApplyForJob(BasePermission):
    """
    Permission to check if user can apply for jobs.
    Only candidates can apply.
    """
    message = "Only candidates can apply for jobs."

    def has_permission(self, request, view):
        """Check if user is a candidate"""
        if not (request.user and request.user.is_authenticated):
            return False
        
        if hasattr(request.user, 'profile'):
            return request.user.profile.is_candidate
        
        return False


class CanViewApplications(BasePermission):
    """
    Permission to check if user can view job applications.
    Only the company that posted the job can view applications.
    """
    message = "You can only view applications for your posted jobs."

    def has_object_permission(self, request, view, obj):
        """Check if user can view applications for this job"""
        return obj.job.posted_by == request.user


class IsApplicationOwner(BasePermission):
    """
    Permission to check if user owns a job application.
    Only the candidate who applied can view/withdraw their application.
    """
    message = "You can only access your own applications."

    def has_object_permission(self, request, view, obj):
        """Check if user owns the application"""
        return obj.candidate.user == request.user


class ReadOnly(BasePermission):
    """Permission to allow read-only access to anyone"""
    
    def has_permission(self, request, view):
        return request.method in ['GET', 'HEAD', 'OPTIONS']


class RBACMixin:
    """
    Base mixin for RBAC-enabled ViewSets.
    Provides role-based permission checking.
    """
    required_role = None  # Override in subclass
    
    def check_role_permission(self, request):
        """
        Check if user has required role.
        
        Returns:
            bool: True if user has required role
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not hasattr(request.user, 'profile'):
            return False
        
        if self.required_role is None:
            return True
        
        return request.user.profile.role == self.required_role
    
    def get_forbidden_response(self):
        """Get standardized 403 response"""
        role = getattr(self.request.user.profile, 'role', 'unknown') if hasattr(self.request.user, 'profile') else 'unknown'
        
        return Response(
            {
                "detail": f"Access denied. This endpoint requires {self.required_role} role.",
                "your_role": role,
                "required_role": self.required_role
            },
            status=status.HTTP_403_FORBIDDEN
        )


class CandidateMixin(RBACMixin):
    """Mixin to restrict ViewSet to candidates only"""
    required_role = 'candidate'
    permission_classes = [IsCandidateUser]


class CompanyMixin(RBACMixin):
    """Mixin to restrict ViewSet to companies only"""
    required_role = 'company'
    permission_classes = [IsCompanyUser]


class PublicMixin(RBACMixin):
    """Mixin for public endpoints (no role restriction)"""
    required_role = None
    permission_classes = []
