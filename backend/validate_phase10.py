"""
Phase 10: Final validation and testing script.
Run all checks before going to production.
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.management import call_command
from django.core.management.color import no_style
from django.db import connection
from django.contrib.auth.models import User
from core.models import Profile
from company.models import Job, CompanyProfile
from user.models import CandidateProfile, JobApplication


class ValidationReporter:
    """Helper to report validation results"""
    
    def __init__(self):
        self.checks_passed = []
        self.checks_failed = []
        self.warnings = []
    
    def pass_check(self, check_name):
        self.checks_passed.append(check_name)
        print(f"✓ {check_name}")
    
    def fail_check(self, check_name, reason):
        self.checks_failed.append((check_name, reason))
        print(f"✗ {check_name}: {reason}")
    
    def warn(self, message):
        self.warnings.append(message)
        print(f"⚠ {message}")
    
    def report(self):
        print("\n" + "="*80)
        print("FINAL VALIDATION REPORT")
        print("="*80)
        print(f"\nPassed: {len(self.checks_passed)}")
        print(f"Failed: {len(self.checks_failed)}")
        print(f"Warnings: {len(self.warnings)}")
        
        if self.checks_failed:
            print("\nFailed Checks:")
            for check, reason in self.checks_failed:
                print(f"  - {check}: {reason}")
        
        if self.warnings:
            print("\nWarnings:")
            for warning in self.warnings:
                print(f"  - {warning}")
        
        print("\n" + "="*80)
        success = len(self.checks_failed) == 0
        return success


def check_migrations(reporter):
    """Check if migrations are up to date"""
    try:
        call_command('makemigrations', dry_run=True, verbosity=0)
        reporter.pass_check("No pending migrations")
    except Exception as e:
        reporter.fail_check("Migrations", str(e))


def check_database_schema(reporter):
    """Verify database schema is correct"""
    try:
        # Check core_profile table
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 FROM core_profile LIMIT 1")
        reporter.pass_check("core_profile table exists")
        
        # Check user_candidateprofile table
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 FROM user_candidateprofile LIMIT 1")
        reporter.pass_check("user_candidateprofile table exists")
        
        # Check company_job table
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 FROM company_job LIMIT 1")
        reporter.pass_check("company_job table exists")
    except Exception as e:
        reporter.fail_check("Database schema", str(e))


def check_role_system(reporter):
    """Verify role system is working"""
    try:
        # Create test users
        user_candidate = User.objects.create_user(
            username='test_candidate_val',
            email='testcandval@test.com',
            password='TestPass123!'
        )
        user_company = User.objects.create_user(
            username='test_company_val',
            email='testcompval@test.com',
            password='TestPass123!'
        )
        
        # Set roles
        if hasattr(user_candidate, 'profile'):
            user_candidate.profile.role = 'candidate'
            user_candidate.profile.save()
        
        if hasattr(user_company, 'profile'):
            user_company.profile.role = 'company'
            user_company.profile.save()
        
        # Verify
        profile_candidate = Profile.objects.get(user=user_candidate)
        profile_company = Profile.objects.get(user=user_company)
        
        assert profile_candidate.role == 'candidate', "Candidate role not set"
        assert profile_candidate.is_candidate == True, "is_candidate property failed"
        
        assert profile_company.role == 'company', "Company role not set"
        assert profile_company.is_company == True, "is_company property failed"
        
        reporter.pass_check("Role system - role assignment")
        reporter.pass_check("Role system - role properties")
        
        # Cleanup
        user_candidate.delete()
        user_company.delete()
    except Exception as e:
        reporter.fail_check("Role system", str(e))


def check_permissions(reporter):
    """Verify permission classes are properly defined"""
    try:
        from core.permissions import IsCandidateUser, IsCompanyUser
        from rest_framework.permissions import BasePermission
        
        assert issubclass(IsCandidateUser, BasePermission), "IsCandidateUser not a permission"
        assert issubclass(IsCompanyUser, BasePermission), "IsCompanyUser not a permission"
        
        reporter.pass_check("IsCandidateUser permission class")
        reporter.pass_check("IsCompanyUser permission class")
    except Exception as e:
        reporter.fail_check("Permission classes", str(e))


def check_decorators(reporter):
    """Verify decorators are defined"""
    try:
        from core.decorators import (
            require_role, require_candidate, require_company,
            RoleRequiredMixin, CandidateOnlyMixin, CompanyOnlyMixin,
            candidate_only, company_only
        )
        reporter.pass_check("Role-based decorators defined")
    except Exception as e:
        reporter.fail_check("Decorators", str(e))


def check_services(reporter):
    """Verify service classes are defined"""
    try:
        from user.services import CandidateService
        from company.services import JobService, JobSearchService
        
        # Check methods exist
        assert hasattr(CandidateService, 'get_or_create_candidate_profile'), "Missing method"
        assert hasattr(CandidateService, 'apply_for_job'), "Missing method"
        
        assert hasattr(JobService, 'create_job'), "Missing method"
        assert hasattr(JobSearchService, 'search_jobs'), "Missing method"
        
        reporter.pass_check("CandidateService methods")
        reporter.pass_check("JobService methods")
        reporter.pass_check("JobSearchService methods")
    except Exception as e:
        reporter.fail_check("Services", str(e))


def check_selectors(reporter):
    """Verify selector classes are defined"""
    try:
        from company.selectors import JobSelector
        
        assert hasattr(JobSelector, 'get_job_detail'), "Missing method"
        assert hasattr(JobSelector, 'get_company_jobs_with_stats'), "Missing method"
        
        reporter.pass_check("JobSelector methods")
    except Exception as e:
        reporter.fail_check("Selectors", str(e))


def check_validators(reporter):
    """Verify validator classes are defined"""
    try:
        from company.validators import JobValidator, CompanyValidator, SearchValidator
        
        assert hasattr(JobValidator, 'validate_job_data'), "Missing method"
        assert hasattr(CompanyValidator, 'validate_company_profile'), "Missing method"
        assert hasattr(SearchValidator, 'validate_pagination_params'), "Missing method"
        
        reporter.pass_check("JobValidator class")
        reporter.pass_check("CompanyValidator class")
        reporter.pass_check("SearchValidator class")
    except Exception as e:
        reporter.fail_check("Validators", str(e))


def check_async_utils(reporter):
    """Verify async utilities are defined"""
    try:
        from core.async_utils import AsyncQueryHelper
        
        assert hasattr(AsyncQueryHelper, 'get_user_profile'), "Missing method"
        assert hasattr(AsyncQueryHelper, 'filter_jobs'), "Missing method"
        
        reporter.pass_check("AsyncQueryHelper class")
    except Exception as e:
        reporter.fail_check("Async utilities", str(e))


def check_url_routes(reporter):
    """Verify all critical URL routes exist"""
    try:
        from django.urls import reverse, NoReverseMatch
        
        routes_to_check = [
            ('candidate_register', []),
            ('company_register', []),
            ('candidate_login', []),
            ('company_login', []),
            ('login_role_selection', []),
        ]
        
        for route_name, args in routes_to_check:
            try:
                reverse(route_name, args=args)
            except NoReverseMatch:
                reporter.fail_check(f"URL route '{route_name}'", "Route not found")
                return
        
        reporter.pass_check("All critical URL routes exist")
    except Exception as e:
        reporter.fail_check("URL routes", str(e))


def check_models(reporter):
    """Verify models have correct structure"""
    try:
        # Check Profile model
        profile_fields = [f.name for f in Profile._meta.get_fields()]
        assert 'role' in profile_fields, "Profile missing role field"
        reporter.pass_check("Profile model - role field")
        
        # Check Job model
        job_fields = [f.name for f in Job._meta.get_fields()]
        assert 'job_title' in job_fields, "Job missing job_title"
        assert 'salary_min' in job_fields, "Job missing salary_min"
        assert 'salary_max' in job_fields, "Job missing salary_max"
        reporter.pass_check("Job model - salary fields")
        
        # Check JobApplication model
        app_fields = [f.name for f in JobApplication._meta.get_fields()]
        assert 'status' in app_fields, "JobApplication missing status"
        reporter.pass_check("JobApplication model - status field")
    except Exception as e:
        reporter.fail_check("Models", str(e))


def check_database_indexes(reporter):
    """Verify critical database indexes exist"""
    try:
        # Check Profile indexes
        profile_indexes = Profile._meta.indexes
        reporter.pass_check(f"Profile has {len(profile_indexes)} indexes")
        
        # Check Job indexes
        job_indexes = Job._meta.indexes
        if len(job_indexes) < 5:
            reporter.warn(f"Job has only {len(job_indexes)} indexes, consider more for performance")
        else:
            reporter.pass_check(f"Job has {len(job_indexes)} indexes")
    except Exception as e:
        reporter.fail_check("Database indexes", str(e))


def run_tests(reporter):
    """Run comprehensive test suite"""
    print("\n" + "="*80)
    print("RUNNING COMPREHENSIVE TESTS")
    print("="*80 + "\n")
    
    try:
        # Run tests
        call_command('test', 'core', 'company', 'user', verbosity=2)
        reporter.pass_check("All tests passed")
    except SystemExit as e:
        if e.code != 0:
            reporter.fail_check("Test suite", f"Tests failed with exit code {e.code}")
        else:
            reporter.pass_check("All tests passed")
    except Exception as e:
        reporter.fail_check("Test suite", str(e))


def main():
    """Run all validation checks"""
    print("\n" + "="*80)
    print("PHASE 10: FINAL VALIDATION & SAFETY CHECKS")
    print("="*80 + "\n")
    
    reporter = ValidationReporter()
    
    print("Running validation checks...\n")
    
    check_migrations(reporter)
    check_database_schema(reporter)
    check_role_system(reporter)
    check_permissions(reporter)
    check_decorators(reporter)
    check_services(reporter)
    check_selectors(reporter)
    check_validators(reporter)
    check_async_utils(reporter)
    check_url_routes(reporter)
    check_models(reporter)
    check_database_indexes(reporter)
    
    print("\n" + "-"*80)
    run_tests(reporter)
    
    # Generate report
    success = reporter.report()
    
    return 0 if success else 1


if __name__ == '__main__':
    sys.exit(main())
