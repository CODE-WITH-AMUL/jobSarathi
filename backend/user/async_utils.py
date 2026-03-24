"""
Async utility functions for views.
Provides async wrappers for database operations using sync_to_async.

NOTE: Django 6.0 supports async views natively. All ORM operations
must be wrapped with sync_to_async for async contexts.
"""
from asgiref.sync import sync_to_async
from django.core.paginator import Paginator
from rest_framework.response import Response
from rest_framework import status


@sync_to_async
def async_get_profile(user):
    """
    Async wrapper to get or create user profile.
    
    Args:
        user: Django User instance
        
    Returns:
        Profile: User's profile
    """
    from core.models import Profile
    profile, _ = Profile.objects.get_or_create(user=user)
    return profile


@sync_to_async
def async_get_candidate_profile(user):
    """
    Async wrapper to get or create candidate profile.
    
    Args:
        user: Django User instance
        
    Returns:
        CandidateProfile: User's candidate profile
    """
    from user.models import CandidateProfile
    profile = CandidateProfile.objects.filter(user=user).first()
    if profile:
        return profile
    
    # Try finding by email
    if user.email:
        profile = CandidateProfile.objects.filter(email=user.email).first()
        if profile:
            profile.user = user
            profile.save(update_fields=["user"])
            return profile
    
    # Create default profile
    from user.models import CandidateProfile
    defaults = {
        "first_name": user.first_name or user.username,
        "last_name": user.last_name or "",
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
    return CandidateProfile.objects.create(user=user, **defaults)


@sync_to_async
def async_get_company_profile(user):
    """
    Async wrapper to get or create company profile.
    
    Args:
        user: Django User instance
        
    Returns:
        CompanyProfile: User's company profile
    """
    from company.models import CompanyProfile
    company_profile, _ = CompanyProfile.objects.get_or_create(
        user=user,
        defaults={"name": user.username},
    )
    return company_profile


@sync_to_async
def async_search_jobs(filters):
    """
    Async wrapper for job search.
    
    Args:
        filters: Dictionary of search filters
        
    Returns:
        QuerySet: Filtered jobs
    """
    from company.services import JobSearchService
    return JobSearchService.search_jobs(**filters)


@sync_to_async
def async_paginate_queryset(queryset, page_number, page_size=20):
    """
    Async wrapper for pagination.
    
    Args:
        queryset: Django QuerySet
        page_number: Page number (default: 1)
        page_size: Number of items per page (default: 20)
        
    Returns:
        tuple: (paginated_items, paginator, page_obj)
    """
    paginator = Paginator(queryset, page_size)
    page_obj = paginator.get_page(page_number)
    return list(page_obj.object_list), paginator, page_obj


@sync_to_async
def async_get_user_role(user):
    """
    Async wrapper to get user's role.
    
    Args:
        user: Django User instance
        
    Returns:
        str: Role ('candidate' or 'company')
    """
    if hasattr(user, 'profile'):
        return user.profile.role
    return 'candidate'


@sync_to_async
def async_check_is_candidate(user):
    """Check if user is a candidate (async)"""
    if hasattr(user, 'profile'):
        return user.profile.is_candidate
    return False


@sync_to_async
def async_check_is_company(user):
    """Check if user is a company (async)"""
    if hasattr(user, 'profile'):
        return user.profile.is_company
    return False


class AsyncPaginationMixin:
    """
    Mixin for async pagination support in ViewSets.
    """
    page_size = 20
    
    async def async_get_paginated_response(self, queryset, serializer_class):
        """
        Get paginated response with async support.
        
        Args:
            queryset: Django QuerySet
            serializer_class: DRF Serializer class
            
        Returns:
            Response: Paginated response
        """
        page_number = self.request.query_params.get('page', 1)
        
        items, paginator, page_obj = await async_paginate_queryset(
            queryset,
            page_number,
            self.page_size
        )
        
        serializer = serializer_class(items, many=True)
        
        return Response({
            "count": paginator.count,
            "next": page_obj.next_page_number() if page_obj.has_next() else None,
            "previous": page_obj.previous_page_number() if page_obj.has_previous() else None,
            "total_pages": paginator.num_pages,
            "current_page": page_obj.number,
            "results": serializer.data
        })
