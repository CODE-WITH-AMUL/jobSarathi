"""
Async utility functions for company views.
Provides async wrappers for database operations using sync_to_async.

NOTE: Django 6.0 supports async views natively. All ORM operations
must be wrapped with sync_to_async for async contexts.
"""
from asgiref.sync import sync_to_async
from django.core.paginator import Paginator


@sync_to_async
def async_search_jobs_advanced(filters):
    """
    Async wrapper for advanced job search.
    
    Args:
        filters: Dictionary of search filters
        
    Returns:
        QuerySet: Filtered jobs
    """
    from company.services import JobSearchService
    return JobSearchService.search_jobs(**filters)


@sync_to_async
def async_get_company_jobs(user):
    """
    Async wrapper to get all jobs posted by a company.
    
    Args:
        user: Django User instance
        
    Returns:
        QuerySet: Jobs posted by the user
    """
    from company.services import JobService
    return JobService.get_company_jobs(user)


@sync_to_async
def async_get_job_with_stats(job_id):
    """
    Async wrapper to get a job with application statistics.
    
    Args:
        job_id: Job ID
        
    Returns:
        Job: Job instance with stats
    """
    from company.models import Job
    from django.db.models import Count
    
    job = Job.objects.annotate(
        applications_count=Count('applications')
    ).filter(id=job_id).first()
    return job


@sync_to_async
def async_get_job_applicants(job_id, status_filter=None):
    """
    Async wrapper to get applicants for a job.
    
    Args:
        job_id: Job ID
        status_filter: Optional application status filter
        
    Returns:
        QuerySet: Job applications
    """
    from user.models import JobApplication
    
    queryset = JobApplication.objects.select_related(
        'candidate', 'job'
    ).filter(job_id=job_id)
    
    if status_filter:
        queryset = queryset.filter(status=status_filter)
    
    return queryset.order_by('-created_at')


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
def async_count_applications(user):
    """
    Async wrapper to count total applications for company's jobs.
    
    Args:
        user: Django User instance (company)
        
    Returns:
        int: Total number of applications
    """
    from user.models import JobApplication
    from django.db.models import Count
    
    return JobApplication.objects.filter(
        job__posted_by=user
    ).count()


@sync_to_async
def async_count_open_jobs(user):
    """
    Async wrapper to count open jobs posted by company.
    
    Args:
        user: Django User instance (company)
        
    Returns:
        int: Number of open jobs
    """
    from company.models import Job
    
    return Job.objects.filter(
        posted_by=user,
        job_status='Open'
    ).count()
