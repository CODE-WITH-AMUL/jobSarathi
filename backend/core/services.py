"""
Validation services for role assignment and user validation.
Handles all validation logic for roles and permissions.
"""
from django.contrib.auth.models import User
from core.models import Profile, ROLE_CHOICES
from rest_framework.exceptions import ValidationError


class RoleValidationService:
    """Service for role validation and assignment"""
    
    VALID_ROLES = dict(ROLE_CHOICES)  # {'candidate': 'Candidate', 'company': 'Company / Employer'}
    
    @staticmethod
    def validate_role_assignment(role):
        """
        Validate that a role is valid before assignment.
        
        Args:
            role: Role string ('candidate' or 'company')
        
        Returns:
            bool: True if valid
            
        Raises:
            ValidationError: If role is invalid
        """
        if not role or role not in RoleValidationService.VALID_ROLES:
            valid_roles = ', '.join(RoleValidationService.VALID_ROLES.keys())
            raise ValidationError(
                f"Invalid role: {role}. Valid roles are: {valid_roles}"
            )
        return True
    
    @staticmethod
    def validate_user_role(user):
        """
        Validate that a user has a valid role assigned.
        
        Args:
            user: Django User instance
            
        Returns:
            str: The user's role
            
        Raises:
            ValidationError: If user has no valid role
        """
        if not hasattr(user, 'profile') or not user.profile:
            raise ValidationError("User has no profile assigned")
        
        profile = user.profile
        if profile.role not in RoleValidationService.VALID_ROLES:
            raise ValidationError(f"User has invalid role: {profile.role}")
        
        return profile.role
    
    @staticmethod
    def is_candidate(user):
        """Check if user is a candidate"""
        if not user or not user.is_authenticated:
            return False
        return hasattr(user, 'profile') and user.profile.is_candidate
    
    @staticmethod
    def is_company(user):
        """Check if user is a company"""
        if not user or not user.is_authenticated:
            return False
        return hasattr(user, 'profile') and user.profile.is_company
    
    @staticmethod
    def enforce_role(user, required_role):
        """
        Enforce that user has a specific role.
        
        Args:
            user: Django User instance
            required_role: Required role ('candidate' or 'company')
            
        Raises:
            ValidationError: If user doesn't have required role
        """
        RoleValidationService.validate_role_assignment(required_role)
        current_role = RoleValidationService.validate_user_role(user)
        
        if current_role != required_role:
            raise ValidationError(
                f"User has role '{current_role}', but '{required_role}' is required"
            )


class UserValidationService:
    """Service for general user validation"""
    
    @staticmethod
    def validate_user_exists(username=None, email=None):
        """
        Check if a user exists by username or email.
        
        Args:
            username: Username to check
            email: Email to check
            
        Returns:
            User: User instance if exists, None otherwise
        """
        if username:
            return User.objects.filter(username=username).first()
        if email:
            return User.objects.filter(email__iexact=email).first()
        return None
    
    @staticmethod
    def validate_unique_email(email):
        """
        Validate that an email is not already registered.
        
        Args:
            email: Email to check
            
        Raises:
            ValidationError: If email already exists
        """
        if User.objects.filter(email__iexact=email).exists():
            raise ValidationError("Email is already registered")
    
    @staticmethod
    def validate_unique_username(username):
        """
        Validate that a username is not already taken.
        
        Args:
            username: Username to check
            
        Raises:
            ValidationError: If username already exists
        """
        if User.objects.filter(username=username).exists():
            raise ValidationError("Username is already taken")
    
    @staticmethod
    def validate_authentication_fields(identifier, password):
        """
        Validate that both username/email and password are provided.
        
        Args:
            identifier: Username or email
            password: Password
            
        Raises:
            ValidationError: If required fields are missing
        """
        if not identifier:
            raise ValidationError("Username or email is required")
        if not password:
            raise ValidationError("Password is required")


class PermissionValidationService:
    """Service for permission validation"""
    
    @staticmethod
    def can_access_candidate_endpoints(user):
        """Check if user can access candidate endpoints"""
        if not user or not user.is_authenticated:
            return False
        return RoleValidationService.is_candidate(user)
    
    @staticmethod
    def can_access_company_endpoints(user):
        """Check if user can access company endpoints"""
        if not user or not user.is_authenticated:
            return False
        return RoleValidationService.is_company(user)
    
    @staticmethod
    def can_edit_job(user, job):
        """Check if user can edit a specific job"""
        if not user or not user.is_authenticated:
            return False
        return job.posted_by == user and RoleValidationService.is_company(user)
    
    @staticmethod
    def can_view_job_applicants(user, job):
        """Check if user can view applicants for a job"""
        if not user or not user.is_authenticated:
            return False
        return job.posted_by == user and RoleValidationService.is_company(user)
    
    @staticmethod
    def can_apply_for_job(user):
        """Check if user can apply for jobs"""
        if not user or not user.is_authenticated:
            return False
        return RoleValidationService.is_candidate(user)
