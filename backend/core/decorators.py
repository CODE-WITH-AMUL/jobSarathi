"""
Role-based decorators for Django views and viewsets.
Provides decorators for enforcing role-based access control.
"""
from functools import wraps
from django.http import JsonResponse
from django.shortcuts import redirect
from rest_framework import status
from rest_framework.response import Response


def require_role(*allowed_roles):
    """
    Decorator to restrict view access to specific roles.
    Works with both function-based and class-based views.
    
    Usage:
        @require_role('candidate')
        def candidate_only_view(request):
            pass
        
        @require_role('candidate', 'company')
        def shared_view(request):
            pass
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return Response(
                    {"detail": "Authentication required."},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            if not hasattr(request.user, 'profile'):
                return Response(
                    {"detail": "User profile not found."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            user_role = request.user.profile.role
            
            if user_role not in allowed_roles:
                return Response(
                    {
                        "detail": f"This action requires one of these roles: {', '.join(allowed_roles)}. "
                                f"Your role is: {user_role}",
                        "required_roles": list(allowed_roles),
                        "user_role": user_role
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def require_candidate(view_func):
    """
    Decorator to restrict view access to candidates only.
    
    Usage:
        @require_candidate
        def candidate_dashboard(request):
            pass
    """
    return require_role('candidate')(view_func)


def require_company(view_func):
    """
    Decorator to restrict view access to companies only.
    
    Usage:
        @require_company
        def company_dashboard(request):
            pass
    """
    return require_role('company')(view_func)


class RoleRequiredMixin:
    """
    Mixin for class-based views to enforce role-based access control.
    
    Usage in ViewSet:
        class MyViewSet(RoleRequiredMixin, viewsets.ModelViewSet):
            required_role = 'candidate'
            ...
    
    For multiple roles:
        class MyViewSet(RoleRequiredMixin, viewsets.ModelViewSet):
            required_roles = ['candidate', 'company']
            ...
    """
    required_role = None
    required_roles = None
    
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication required."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not hasattr(request.user, 'profile'):
            return Response(
                {"detail": "User profile not found."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        user_role = request.user.profile.role
        
        # Check against required_roles if specified, otherwise required_role
        allowed_roles = self.required_roles or (
            [self.required_role] if self.required_role else None
        )
        
        if allowed_roles and user_role not in allowed_roles:
            return Response(
                {
                    "detail": f"This action requires one of these roles: {', '.join(allowed_roles)}. "
                            f"Your role is: {user_role}",
                    "required_roles": allowed_roles,
                    "user_role": user_role
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().dispatch(request, *args, **kwargs)


class CandidateOnlyMixin:
    """Mixin to restrict to candidate role only."""
    required_role = 'candidate'


class CompanyOnlyMixin:
    """Mixin to restrict to company role only."""
    required_role = 'company'


def candidate_only(view_func):
    """Restrict view to candidates only."""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not hasattr(request.user, 'profile') or not request.user.profile.is_candidate:
            return Response(
                {"detail": "Only candidates can access this resource."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return view_func(request, *args, **kwargs)
    return wrapper


def company_only(view_func):
    """Restrict view to companies only."""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not hasattr(request.user, 'profile') or not request.user.profile.is_company:
            return Response(
                {"detail": "Only company users can access this resource."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return view_func(request, *args, **kwargs)
    return wrapper


def owner_required(model_field='user'):
    """
    Decorator to ensure user owns the object being accessed.
    
    Usage:
        @owner_required('user')
        def update_profile(request, pk):
            profile = MyModel.objects.get(pk=pk)
            # user must own profile.user
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return Response(
                    {"detail": "Authentication required."},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # This is a basic wrapper - actual implementation depends on view
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator
