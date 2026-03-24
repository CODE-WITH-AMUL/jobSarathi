"""
Search filter classes for job filtering.
Provides validation and filter building functionality.
"""
from rest_framework.exceptions import ValidationError
from company.models import EXPERIENCE_LEVEL_CHOICES, JOB_TYPE


class JobSearchFilter:
    """Filter class for job searches with validation"""
    
    VALID_EXPERIENCE_LEVELS = [level[0] for level in EXPERIENCE_LEVEL_CHOICES]
    VALID_JOB_TYPES = [jt[0] for jt in JOB_TYPE]
    VALID_SORT_OPTIONS = ['newest', 'oldest', 'salary_high', 'salary_low', 'title']
    
    def __init__(self, query_params):
        """
        Initialize filter with query parameters.
        
        Args:
            query_params: Request query parameters dictionary
        """
        self.query_params = query_params
        self.validated_params = {}
    
    def validate_and_build(self):
        """
        Validate all parameters and build filter dictionary.
        
        Returns:
            dict: Validated filter parameters
            
        Raises:
            ValidationError: If any parameter is invalid
        """
        self.validated_params = {}
        
        # Keyword search
        keyword = self.query_params.get('keyword') or self.query_params.get('q')
        if keyword:
            self.validated_params['keyword'] = keyword.strip()
        
        # Location
        location = self.query_params.get('location')
        if location:
            self.validated_params['location'] = location.strip()
        
        # Job type with validation
        job_type = self.query_params.get('type') or self.query_params.get('job_type')
        if job_type:
            if job_type not in self.VALID_JOB_TYPES:
                raise ValidationError(
                    f"Invalid job type: {job_type}. Valid options: {', '.join(self.VALID_JOB_TYPES)}"
                )
            self.validated_params['job_type'] = job_type
        
        # Salary range with validation
        salary_min = self.query_params.get('salary_min')
        salary_max = self.query_params.get('salary_max')
        
        if salary_min is not None or salary_max is not None:
            self._validate_salary_range(salary_min, salary_max)
            if salary_min is not None:
                self.validated_params['salary_min'] = float(salary_min)
            if salary_max is not None:
                self.validated_params['salary_max'] = float(salary_max)
        
        # Company filter
        company = self.query_params.get('company')
        if company:
            self.validated_params['company'] = company.strip()
        
        # Experience level with validation
        experience_level = self.query_params.get('experience_level') or self.query_params.get('exp_level')
        if experience_level:
            if experience_level not in self.VALID_EXPERIENCE_LEVELS:
                raise ValidationError(
                    f"Invalid experience level: {experience_level}. "
                    f"Valid options: {', '.join(self.VALID_EXPERIENCE_LEVELS)}"
                )
            self.validated_params['experience_level'] = experience_level
        
        # Days posted filter with validation
        days_posted = self.query_params.get('days_posted')
        if days_posted:
            try:
                days = int(days_posted)
                if days < 0:
                    raise ValidationError("Days posted must be a positive integer")
                self.validated_params['days_posted'] = days
            except (ValueError, TypeError):
                raise ValidationError("Days posted must be a valid integer")
        
        # Sorting with validation
        sort_by = self.query_params.get('sort') or self.query_params.get('sort_by')
        if sort_by:
            if sort_by not in self.VALID_SORT_OPTIONS:
                raise ValidationError(
                    f"Invalid sort option: {sort_by}. Valid options: {', '.join(self.VALID_SORT_OPTIONS)}"
                )
            self.validated_params['sort_by'] = sort_by
        
        # Pagination
        try:
            page = int(self.query_params.get('page', 1))
            page_size = int(self.query_params.get('page_size', 20))
            
            if page < 1:
                raise ValidationError("Page number must be >= 1")
            if page_size < 1 or page_size > 100:
                raise ValidationError("Page size must be between 1 and 100")
            
            self.validated_params['page'] = page
            self.validated_params['page_size'] = page_size
        except (ValueError, TypeError):
            raise ValidationError("Page and page_size must be valid integers")
        
        return self.validated_params
    
    def _validate_salary_range(self, salary_min, salary_max):
        """
        Validate salary range parameters.
        
        Raises:
            ValidationError: If salary range is invalid
        """
        try:
            if salary_min is not None:
                min_val = float(salary_min)
                if min_val < 0:
                    raise ValidationError("Minimum salary must be positive")
            
            if salary_max is not None:
                max_val = float(salary_max)
                if max_val < 0:
                    raise ValidationError("Maximum salary must be positive")
            
            if salary_min is not None and salary_max is not None:
                if float(salary_min) > float(salary_max):
                    raise ValidationError("Minimum salary cannot exceed maximum salary")
        except (ValueError, TypeError):
            raise ValidationError("Salary values must be valid numbers")
    
    def get_error_summary(self):
        """
        Get a summary of filter options and valid values.
        
        Returns:
            dict: Summary of available filters
        """
        return {
            "available_filters": {
                "keyword": "Search in job title, company, description, skills",
                "location": "Search by city, state, or country",
                "type": "Filter by job type",
                "salary_min": "Filter by minimum salary",
                "salary_max": "Filter by maximum salary",
                "company": "Filter by company name",
                "days_posted": "Filter jobs posted within N days",
                "experience_level": "Filter by experience level",
                "sort": "Sort results",
                "page": "Page number (default: 1)",
                "page_size": "Items per page (default: 20, max: 100)",
            },
            "valid_values": {
                "job_types": self.VALID_JOB_TYPES,
                "experience_levels": self.VALID_EXPERIENCE_LEVELS,
                "sort_options": self.VALID_SORT_OPTIONS,
            }
        }
