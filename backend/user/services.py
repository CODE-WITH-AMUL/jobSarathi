"""
Business logic layer for candidate management.
"""
from django.db.models import Count, Q
from user.models import CandidateProfile, JobApplication, SavedJob
from company.services import JobSearchService


class CandidateService:
    """Service class for candidate-related operations"""
    
    @staticmethod
    def get_or_create_candidate_profile(user):
        """Get or create candidate profile for a user"""
        profile = CandidateProfile.objects.filter(user=user).first()
        if profile:
            return profile
        
        # Fallback: try to find by email
        profile = CandidateProfile.objects.filter(email=user.email).first() if user.email else None
        if profile:
            profile.user = user
            profile.save(update_fields=["user"])
            return profile
        
        # Create new profile with defaults
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
    
    @staticmethod
    def apply_for_job(candidate, job, resume_file=None, cover_letter=None):
        """
        Create a job application for a candidate.
        
        Args:
            candidate: CandidateProfile instance
            job: Job instance
            resume_file: Optional resume file
            cover_letter: Optional cover letter text
            
        Returns:
            tuple: (application, created) - JobApplication instance and created flag
        """
        application, created = JobApplication.objects.get_or_create(
            candidate=candidate,
            job=job,
            defaults={
                'cover_letter': cover_letter,
                'resume_file': resume_file,
                'status': 'applied'
            }
        )
        return application, created
    
    @staticmethod
    def get_candidate_applications(candidate):
        """
        Get all applications for a candidate with related data.
        
        Args:
            candidate: CandidateProfile instance
            
        Returns:
            QuerySet: Job applications ordered by most recent first
        """
        return JobApplication.objects.filter(
            candidate=candidate
        ).select_related('job', 'job__company').annotate(
            job_applications_count=Count('job__applications')
        ).order_by('-created_at')
    
    @staticmethod
    def get_candidate_application_stats(candidate):
        """
        Get application statistics for a candidate.
        
        Args:
            candidate: CandidateProfile instance
            
        Returns:
            dict: Statistics including total, by status, pending reviews
        """
        applications = JobApplication.objects.filter(candidate=candidate)
        
        return {
            'total_applications': applications.count(),
            'pending': applications.filter(status='applied').count(),
            'under_review': applications.filter(status='under_review').count(),
            'shortlisted': applications.filter(status='shortlisted').count(),
            'selected': applications.filter(status='selected').count(),
            'rejected': applications.filter(status='rejected').count(),
            'withdrawn': applications.filter(status='withdrawn').count(),
        }
    
    @staticmethod
    def save_job(candidate, job):
        """
        Save a job for later.
        
        Args:
            candidate: CandidateProfile instance
            job: Job instance
            
        Returns:
            tuple: (saved_job, created) - SavedJob instance and created flag
        """
        saved, created = SavedJob.objects.get_or_create(
            candidate=candidate,
            job=job
        )
        return saved, created
    
    @staticmethod
    def unsave_job(candidate, job):
        """
        Remove a saved job.
        
        Args:
            candidate: CandidateProfile instance
            job: Job instance
        """
        SavedJob.objects.filter(
            candidate=candidate,
            job=job
        ).delete()
    
    @staticmethod
    def get_saved_jobs(candidate):
        """
        Get all saved jobs for a candidate.
        
        Args:
            candidate: CandidateProfile instance
            
        Returns:
            QuerySet: Saved jobs with related data
        """
        return SavedJob.objects.filter(
            candidate=candidate
        ).select_related('job', 'job__company').order_by('-created_at')
    
    @staticmethod
    def get_recommended_jobs(candidate, limit=10):
        """
        Get recommended jobs for a candidate based on their profile.
        (Basic implementation - can be enhanced with ML)
        
        Args:
            candidate: CandidateProfile instance
            limit: Number of recommendations
            
        Returns:
            QuerySet: Recommended jobs
        """
        # For now, return recent open jobs not yet applied to
        from company.models import Job
        
        # Get jobs candidate hasn't applied to
        applied_jobs = JobApplication.objects.filter(
            candidate=candidate
        ).values_list('job_id', flat=True)
        
        recommended = Job.objects.filter(
            job_status='Open'
        ).exclude(
            id__in=applied_jobs
        ).select_related('company', 'posted_by').order_by('-created_at')[:limit]
        
        return recommended
    
    @staticmethod
    def withdraw_application(candidate, job):
        """
        Withdraw a job application.
        
        Args:
            candidate: CandidateProfile instance
            job: Job instance
            
        Returns:
            bool: True if withdrawn, False if not found
        """
        try:
            application = JobApplication.objects.get(
                candidate=candidate,
                job=job
            )
            application.status = 'withdrawn'
            application.save(update_fields=['status'])
            return True
        except JobApplication.DoesNotExist:
            return False
    
    @staticmethod
    def search_jobs_for_candidate(candidate, filters):
        """
        Search jobs with candidate-specific context.
        
        Args:
            candidate: CandidateProfile instance
            filters: Search filters dictionary
            
        Returns:
            tuple: (queryset, metadata) - Results and application status info
        """
        # Get search results
        result = JobSearchService.search_jobs(**filters)
        queryset = result.get('queryset')
        
        # Get jobs candidate has already applied to
        applied_job_ids = JobApplication.objects.filter(
            candidate=candidate
        ).values_list('job_id', flat=True)
        
        # Get saved job IDs
        saved_job_ids = SavedJob.objects.filter(
            candidate=candidate
        ).values_list('job_id', flat=True)
        
        # Add metadata to each job
        for job in queryset:
            job.already_applied = job.id in applied_job_ids
            job.is_saved = job.id in saved_job_ids
        
        return queryset, {
            'total_count': result.get('total_count'),
            'total_pages': result.get('total_pages'),
            'page': result.get('page'),
            'page_size': result.get('page_size'),
        }


class SearchService:
    """Service wrapping JobSearchService with additional functionality"""
    
    @staticmethod
    def search_jobs(**filters):
        """Wrapper for job search"""
        return JobSearchService.search_jobs(**filters)
    
    @staticmethod
    def get_search_filters_metadata():
        """Get available filters for frontend"""
        from company.services import JobFilterService
        return JobFilterService.get_filter_metadata()

