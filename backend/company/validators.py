"""
Validation layer for company operations.
Provides validation logic for jobs and company data.
"""
from decimal import Decimal
from typing import Dict, List, Tuple, Optional
from django.core.exceptions import ValidationError


class JobValidator:
    """Validator for job-related operations"""
    
    VALID_JOB_TYPES = ['Remote', 'Full Time', 'Part Time', 'Internship']
    VALID_JOB_STATUSES = ['Open', 'Closed']
    VALID_EXPERIENCE_LEVELS = ['Entry Level', 'Mid Level', 'Senior', 'Executive', 'Any']
    
    @classmethod
    def validate_job_data(cls, job_data: Dict) -> Tuple[bool, Optional[str]]:
        """
        Validate job creation/update data.
        
        Args:
            job_data: Dictionary containing job fields
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Validate job_type
        if 'job_type' in job_data:
            if job_data['job_type'] not in cls.VALID_JOB_TYPES:
                return False, f"Invalid job_type. Must be one of: {', '.join(cls.VALID_JOB_TYPES)}"
        
        # Validate job_status
        if 'job_status' in job_data:
            if job_data['job_status'] not in cls.VALID_JOB_STATUSES:
                return False, f"Invalid job_status. Must be one of: {', '.join(cls.VALID_JOB_STATUSES)}"
        
        # Validate experience_level
        if 'experience_level' in job_data:
            if job_data['experience_level'] not in cls.VALID_EXPERIENCE_LEVELS:
                return False, f"Invalid experience_level. Must be one of: {', '.join(cls.VALID_EXPERIENCE_LEVELS)}"
        
        # Validate required fields
        required_fields = ['job_title', 'description', 'location_city', 'location_country']
        for field in required_fields:
            if field not in job_data or not job_data[field]:
                return False, f"Field '{field}' is required"
        
        # Validate salary range
        is_valid, salary_error = cls.validate_salary_range(
            job_data.get('salary_min'),
            job_data.get('salary_max')
        )
        if not is_valid:
            return False, salary_error
        
        # Validate description length
        if len(job_data.get('description', '')) < 10:
            return False, "Job description must be at least 10 characters long"
        
        return True, None
    
    @classmethod
    def validate_salary_range(cls, salary_min: Optional[Decimal], 
                            salary_max: Optional[Decimal]) -> Tuple[bool, Optional[str]]:
        """
        Validate salary range values.
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        if salary_min is None or salary_max is None:
            return False, "Both salary_min and salary_max are required"
        
        try:
            min_val = Decimal(str(salary_min))
            max_val = Decimal(str(salary_max))
        except (ValueError, TypeError):
            return False, "Salary values must be valid decimal numbers"
        
        if min_val < 0 or max_val < 0:
            return False, "Salary values cannot be negative"
        
        if min_val > max_val:
            return False, f"salary_min ({min_val}) cannot be greater than salary_max ({max_val})"
        
        return True, None
    
    @classmethod
    def validate_location(cls, city: str, country: str) -> Tuple[bool, Optional[str]]:
        """
        Validate location fields.
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not city or not city.strip():
            return False, "City is required"
        
        if not country or not country.strip():
            return False, "Country is required"
        
        return True, None


class CompanyValidator:
    """Validator for company-related operations"""
    
    @classmethod
    def validate_company_profile(cls, company_data: Dict) -> Tuple[bool, Optional[str]]:
        """
        Validate company profile data.
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Validate company name
        if 'name' not in company_data or not company_data['name'].strip():
            return False, "Company name is required"
        
        if len(company_data['name']) < 2:
            return False, "Company name must be at least 2 characters"
        
        if len(company_data['name']) > 255:
            return False, "Company name cannot exceed 255 characters"
        
        # Validate description if provided
        if 'description' in company_data and company_data['description']:
            if len(company_data['description']) < 10:
                return False, "Description must be at least 10 characters"
        
        # Validate website URL if provided
        if 'website' in company_data and company_data['website']:
            if not cls._is_valid_url(company_data['website']):
                return False, "Invalid website URL"
        
        return True, None
    
    @staticmethod
    def _is_valid_url(url: str) -> bool:
        """Check if URL is valid."""
        try:
            from django.core.validators import URLValidator
            validator = URLValidator()
            validator(url)
            return True
        except:
            return False


class SearchValidator:
    """Validator for search and filter parameters"""
    
    @staticmethod
    def validate_pagination_params(page: int, page_size: int) -> Tuple[bool, Optional[str]]:
        """
        Validate pagination parameters.
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            page = int(page) if page else 1
            page_size = int(page_size) if page_size else 10
        except (ValueError, TypeError):
            return False, "page and page_size must be integers"
        
        if page < 1:
            return False, "page must be >= 1"
        
        if page_size < 1:
            return False, "page_size must be >= 1"
        
        if page_size > 100:
            return False, "page_size cannot exceed 100"
        
        return True, None
    
    @staticmethod
    def validate_sort_option(sort_by: str) -> Tuple[bool, Optional[str]]:
        """
        Validate sort_by parameter.
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        valid_options = ['newest', 'oldest', 'salary_high', 'salary_low', 'relevance']
        
        if sort_by not in valid_options:
            return False, f"Invalid sort_by. Must be one of: {', '.join(valid_options)}"
        
        return True, None
    
    @staticmethod
    def validate_search_params(filters: Dict) -> Tuple[bool, Optional[str]]:
        """
        Validate all search filter parameters.
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Validate job_type if provided
        if filters.get('job_type'):
            valid_types = ['Remote', 'Full Time', 'Part Time', 'Internship']
            if filters['job_type'] not in valid_types:
                return False, f"Invalid job_type. Must be one of: {', '.join(valid_types)}"
        
        # Validate experience_level if provided
        if filters.get('experience_level'):
            valid_levels = ['Entry Level', 'Mid Level', 'Senior', 'Executive', 'Any']
            if filters['experience_level'] not in valid_levels:
                return False, f"Invalid experience_level. Must be one of: {', '.join(valid_levels)}"
        
        # Validate days_posted if provided
        if filters.get('days_posted'):
            try:
                days = int(filters['days_posted'])
                if days < 0:
                    return False, "days_posted cannot be negative"
            except ValueError:
                return False, "days_posted must be an integer"
        
        return True, None
