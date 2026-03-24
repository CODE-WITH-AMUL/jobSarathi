"""
Role-based permission classes for access control.
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsCandidateUser(BasePermission):
    """
    Permission to check if user has candidate role.
    Only candidates can browse jobs, apply, and manage their profiles.
    """
    message = "Only candidates can access this endpoint."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        # Check if user has profile with candidate role
        if hasattr(request.user, 'profile'):
            return request.user.profile.is_candidate
        
        # Fallback for users without profile (shouldn't happen with signals)
        return False


class IsCompanyUser(BasePermission):
    """
    Permission to check if user has company role.
    Only companies can post jobs, edit jobs, and view applicants.
    """
    message = "Only company users can access this endpoint."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        # Check if user has profile with company role
        if hasattr(request.user, 'profile'):
            return request.user.profile.is_company
        
        # Fallback for backward compatibility - check for CompanyProfile
        from company.models import CompanyProfile
        return CompanyProfile.objects.filter(user=request.user).exists()


class IsOwnerOrReadOnly(BasePermission):
    """
    Allow any access to safe methods.
    Only allow edit/delete to owner of the object.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.user == request.user


class IsCandidateOrReadOnly(BasePermission):
    """
    Permission that allows candidates to access.
    Others get read-only access or no access.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        
        if not (request.user and request.user.is_authenticated):
            return False
        
        if hasattr(request.user, 'profile'):
            return request.user.profile.is_candidate
        
        return False


class IsCompanyOrReadOnly(BasePermission):
    """
    Permission that allows companies to access.
    Others get read-only access or no access.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        
        if not (request.user and request.user.is_authenticated):
            return False
        
        if hasattr(request.user, 'profile'):
            return request.user.profile.is_company
        
        from company.models import CompanyProfile
        return CompanyProfile.objects.filter(user=request.user).exists()
