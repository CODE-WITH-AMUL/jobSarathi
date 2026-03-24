"""
Business logic layer for job management.
Handles job creation, updates, retrieval, and related operations.
"""
from django.db.models import Q, Count, F
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from company.models import Job, CompanyProfile


VALID_SORT_OPTIONS = ['newest', 'oldest', 'salary_high', 'salary_low', 'relevance']
VALID_EXPERIENCE_LEVELS = ['Entry Level', 'Mid Level', 'Senior', 'Executive', 'Any']
VALID_JOB_TYPES = ['Remote', 'Full Time', 'Part Time', 'Internship']


class JobService:
    """Service class for job-related operations"""
    
    @staticmethod
    def get_job_by_id(job_id):
        """Get a single job by ID"""
        return Job.objects.select_related('company', 'posted_by').filter(id=job_id).first()
    
    @staticmethod
    def get_published_jobs():
        """Get all published (open) jobs"""
        return Job.objects.filter(job_status='Open').select_related('company', 'posted_by')
    
    @staticmethod
    def get_company_jobs(user):
        """Get all jobs posted by a specific company user"""
        return Job.objects.filter(posted_by=user).select_related('company').annotate(
            applications_count=Count('applications')
        )
    
    @staticmethod
    def create_job(user, job_data):
        """Create a new job posting"""
        company_profile, _ = CompanyProfile.objects.get_or_create(
            user=user,
            defaults={"name": user.username},
        )
        
        job = Job.objects.create(
            posted_by=user,
            company=company_profile,
            company_name=company_profile.name,
            **job_data
        )
        return job
    
    @staticmethod
    def update_job(job, job_data):
        """Update an existing job"""
        for key, value in job_data.items():
            setattr(job, key, value)
        job.save()
        return job
    
    @staticmethod
    def delete_job(job):
        """Delete a job"""
        job.delete()
    
    @staticmethod
    def validate_salary_range(salary_min, salary_max):
        """Validate salary range parameters"""
        if salary_min is None and salary_max is None:
            return True
        
        try:
            if salary_min is not None:
                salary_min = Decimal(str(salary_min))
                if salary_min < 0:
                    return False
            
            if salary_max is not None:
                salary_max = Decimal(str(salary_max))
                if salary_max < 0:
                    return False
            
            if salary_min is not None and salary_max is not None:
                if salary_min > salary_max:
                    return False
            
            return True
        except (ValueError, TypeError):
            return False


class CompanyService:
    """Service class for company-related operations"""
    
    @staticmethod
    def get_or_create_company_profile(user):
        """Get or create company profile for a user"""
        company_profile, created = CompanyProfile.objects.get_or_create(
            user=user,
            defaults={"name": user.username}
        )
        return company_profile, created
    
    @staticmethod
    def get_company_stats(user):
        """
        Get statistics for a company.
        
        Args:
            user: Django User instance (company)
            
        Returns:
            dict: Statistics including jobs, applications, etc.
        """
        from user.models import JobApplication
        
        jobs = Job.objects.filter(posted_by=user)
        open_jobs = jobs.filter(job_status='Open')
        closed_jobs = jobs.filter(job_status='Closed')
        
        total_applications = JobApplication.objects.filter(
            job__posted_by=user
        ).count()
        
        application_stats = JobApplication.objects.filter(
            job__posted_by=user
        ).values('status').annotate(count=Count('id'))
        
        return {
            'total_jobs': jobs.count(),
            'open_jobs': open_jobs.count(),
            'closed_jobs': closed_jobs.count(),
            'total_applications': total_applications,
            'application_stats': {item['status']: item['count'] for item in application_stats},
        }
    
    @staticmethod
    def get_company_profile(user):
        """Get company profile for a user"""
        return CompanyProfile.objects.filter(user=user).first()


class JobManagementService:
    """Service for managing job postings"""
    
    @staticmethod
    def close_job(job):
        """Close a job posting"""
        job.job_status = 'Closed'
        job.save(update_fields=['job_status'])
        return job
    
    @staticmethod
    def reopen_job(job):
        """Reopen a closed job posting"""
        job.job_status = 'Open'
        job.save(update_fields=['job_status'])
        return job
    
    @staticmethod
    def get_job_with_applications(job_id):
        """Get job with all applications and stats"""
        from user.models import JobApplication
        
        job = Job.objects.annotate(
            total_applications=Count('applications'),
            pending_applications=Count('applications', filter=Q(applications__status='applied')),
            shortlisted_applications=Count('applications', filter=Q(applications__status='shortlisted')),
            rejected_applications=Count('applications', filter=Q(applications__status='rejected')),
            selected_applications=Count('applications', filter=Q(applications__status='selected')),
        ).filter(id=job_id).first()
        
        if job:
            job.applications = JobApplication.objects.filter(job=job).select_related(
                'candidate'
            ).order_by('-created_at')
        
        return job


class JobSearchService:
    """Service class for job search and filtering with enhanced features"""
    
    @staticmethod
    def search_jobs(keyword=None, location=None, job_type=None, 
                   salary_min=None, salary_max=None, company=None, 
                   days_posted=None, experience_level=None, 
                   sort_by='newest', page=1, page_size=10):
        """
        Search and filter jobs with multiple criteria.
        
        Args:
            keyword: Search in job_title, company_name, description, skills_required
            location: Filter by location_city, location_state, or location_country
            job_type: Filter by job_type (Remote, Full Time, Part Time, Internship)
            salary_min: Minimum salary range (must be positive number)
            salary_max: Maximum salary range (must be positive number)
            company: Filter by company name (partial match)
            days_posted: Filter jobs posted within last N days
            experience_level: Filter by experience level
            sort_by: Sort options: newest (default), oldest, salary_high, salary_low
            page: Page number for pagination (default: 1)
            page_size: Items per page (default: 10, max: 100)
        
        Returns:
            Dict with 'queryset', 'total_count', 'page', 'page_size', 'total_pages'
        
        Raises:
            ValueError: If parameters are invalid
        """
        # Validate inputs
        if page_size > 100:
            page_size = 100
        if page < 1:
            page = 1
        
        if sort_by not in VALID_SORT_OPTIONS:
            sort_by = 'newest'
        
        queryset = Job.objects.filter(job_status='Open').select_related('company', 'posted_by')
        
        # Keyword search
        if keyword and keyword.strip():
            queryset = queryset.filter(
                Q(job_title__icontains=keyword) |
                Q(company_name__icontains=keyword) |
                Q(description__icontains=keyword) |
                Q(skills_required__icontains=keyword)
            )
        
        # Location filter
        if location and location.strip():
            queryset = queryset.filter(
                Q(location_city__icontains=location) |
                Q(location_state__icontains=location) |
                Q(location_country__icontains=location)
            )
        
        # Job type filter
        if job_type:
            if job_type not in VALID_JOB_TYPES:
                raise ValueError(f"Invalid job_type. Must be one of {VALID_JOB_TYPES}")
            queryset = queryset.filter(job_type__iexact=job_type)
        
        # Experience level filter
        if experience_level:
            if experience_level not in VALID_EXPERIENCE_LEVELS:
                raise ValueError(f"Invalid experience_level. Must be one of {VALID_EXPERIENCE_LEVELS}")
            queryset = queryset.filter(experience_level=experience_level)
        
        # Salary range filter
        if salary_min is not None:
            try:
                salary_min_dec = Decimal(str(salary_min))
                if salary_min_dec < 0:
                    raise ValueError("salary_min must be non-negative")
                queryset = queryset.filter(salary_max__gte=salary_min_dec)
            except (ValueError, TypeError) as e:
                raise ValueError(f"Invalid salary_min: {e}")
        
        if salary_max is not None:
            try:
                salary_max_dec = Decimal(str(salary_max))
                if salary_max_dec < 0:
                    raise ValueError("salary_max must be non-negative")
                queryset = queryset.filter(salary_min__lte=salary_max_dec)
            except (ValueError, TypeError) as e:
                raise ValueError(f"Invalid salary_max: {e}")
        
        # Company filter
        if company and company.strip():
            queryset = queryset.filter(company_name__icontains=company)
        
        # Days posted filter
        if days_posted is not None:
            try:
                days = int(days_posted)
                if days < 0:
                    raise ValueError("days_posted must be non-negative")
                threshold_date = timezone.now() - timedelta(days=days)
                queryset = queryset.filter(created_at__gte=threshold_date)
            except (ValueError, TypeError) as e:
                raise ValueError(f"Invalid days_posted: {e}")
        
        # Apply sorting
        sort_mapping = {
            'newest': '-created_at',
            'oldest': 'created_at',
            'salary_high': '-salary_max',
            'salary_low': 'salary_min',
            'relevance': '-created_at',  # Default to newest for relevance
        }
        queryset = queryset.order_by(sort_mapping.get(sort_by, '-created_at'))
        
        # Count total before pagination
        total_count = queryset.count()
        total_pages = (total_count + page_size - 1) // page_size
        
        # Apply pagination
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_queryset = queryset[start_idx:end_idx]
        
        return {
            'queryset': paginated_queryset,
            'total_count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': total_pages,
        }
