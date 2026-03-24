"""
Data access layer for job queries.
Provides optimized querysets for different use cases.
"""
from django.db.models import Q, Count, Prefetch
from company.models import Job, CompanyProfile
from user.models import JobApplication


class JobSelector:
    """Selector class for optimized job queries"""
    
    @staticmethod
    def get_job_detail(job_id):
        """Get a job with all related data"""
        return Job.objects.select_related(
            'company', 
            'posted_by'
        ).prefetch_related(
            'applications',
            Prefetch('applications', JobApplication.objects.select_related('candidate'))
        ).filter(id=job_id).first()
    
    @staticmethod
    def get_jobs_list(limit=None):
        """Get list of published jobs for browsing"""
        queryset = Job.objects.filter(
            job_status='Open'
        ).select_related(
            'company', 
            'posted_by'
        ).values(
            'id', 'job_title', 'company_name', 'location_city', 
            'location_country', 'job_type', 'salary_min', 'salary_max', 
            'posting_date'
        ).order_by('-posting_date')
        
        if limit:
            queryset = queryset[:limit]
        
        return queryset
    
    @staticmethod
    def get_company_jobs_with_stats(company_user):
        """Get company's jobs with application stats"""
        return Job.objects.filter(
            posted_by=company_user
        ).select_related(
            'company'
        ).annotate(
            applications_count=Count('applications'),
            shortlisted_count=Count(
                'applications',
                filter=Q(applications__status='shortlisted')
            ),
            rejected_count=Count(
                'applications',
                filter=Q(applications__status='rejected')
            )
        ).order_by('-created_at')
    
    @staticmethod
    def search_jobs_optimized(filters=None):
        """
        Get jobs matching search filters with optimized queries.
        
        Args:
            filters: Dict with keys: keyword, location, job_type, salary_min, salary_max
        
        Returns:
            Optimized QuerySet
        """
        if filters is None:
            filters = {}
        
        queryset = Job.objects.filter(
            job_status='Open'
        ).select_related(
            'company', 
            'posted_by'
        ).values(
            'id', 'job_title', 'company_name', 'location_city', 
            'location_country', 'job_type', 'salary_min', 'salary_max'
        )
        
        # Apply filters
        q_objects = Q()
        
        if filters.get('keyword'):
            q_objects |= (
                Q(job_title__icontains=filters['keyword']) |
                Q(company_name__icontains=filters['keyword']) |
                Q(description__icontains=filters['keyword'])
            )
        
        if filters.get('location'):
            q_objects |= (
                Q(location_city__icontains=filters['location']) |
                Q(location_country__icontains=filters['location'])
            )
        
        if filters.get('job_type'):
            q_objects &= Q(job_type__iexact=filters['job_type'])
        
        if filters.get('salary_min'):
            q_objects &= Q(salary_max__gte=filters['salary_min'])
        
        if filters.get('salary_max'):
            q_objects &= Q(salary_min__lte=filters['salary_max'])
        
        if q_objects:
            queryset = queryset.filter(q_objects)
        
        return queryset.order_by('-created_at')
