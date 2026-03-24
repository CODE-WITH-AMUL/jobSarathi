"""
Async utilities for Django 6.0.
Provides async wrappers for database operations.
"""
from asgiref.sync import sync_to_async
from typing import List, Dict, Any


class AsyncQueryHelper:
    """Helper class for async database operations."""
    
    @staticmethod
    @sync_to_async
    def get_user_profile(user):
        """Get user profile asynchronously."""
        if not hasattr(user, 'profile'):
            return None
        return user.profile
    
    @staticmethod
    @sync_to_async
    def get_candidate_profile(user):
        """Get candidate profile asynchronously."""
        from user.models import CandidateProfile
        return CandidateProfile.objects.filter(user=user).first()
    
    @staticmethod
    @sync_to_async
    def get_company_profile(user):
        """Get company profile asynchronously."""
        from company.models import CompanyProfile
        return CompanyProfile.objects.filter(user=user).first()
    
    @staticmethod
    @sync_to_async
    def filter_jobs(filters: Dict[str, Any]):
        """Filter jobs asynchronously."""
        from company.models import Job
        queryset = Job.objects.filter(job_status='Open')
        
        if filters.get('keyword'):
            from django.db.models import Q
            queryset = queryset.filter(
                Q(job_title__icontains=filters['keyword']) |
                Q(company_name__icontains=filters['keyword']) |
                Q(description__icontains=filters['keyword'])
            )
        
        return queryset.select_related('company', 'posted_by')
    
    @staticmethod
    @sync_to_async
    def count_jobs(queryset):
        """Count jobs asynchronously."""
        return queryset.count()
    
    @staticmethod
    @sync_to_async
    def get_paginated_jobs(queryset, page: int, page_size: int):
        """Get paginated jobs asynchronously."""
        start = (page - 1) * page_size
        end = start + page_size
        return list(queryset[start:end])
