"""
Comprehensive test suite for company operations.
"""
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from company.models import Job, CompanyProfile
from company.validators import JobValidator, CompanyValidator, SearchValidator


class JobValidatorTestCase(TestCase):
    """Test job validation"""
    
    def test_validate_valid_job_data(self):
        """Test validation of valid job data"""
        job_data = {
            'job_title': 'Senior Developer',
            'description': 'We are looking for a senior developer with 5+ years experience',
            'location_city': 'New York',
            'location_country': 'USA',
            'job_type': 'Full Time',
            'experience_level': 'Senior',
            'skills_required': 'Python, Django, REST APIs',
            'salary_min': 100000,
            'salary_max': 150000,
        }
        
        is_valid, error = JobValidator.validate_job_data(job_data)
        self.assertTrue(is_valid)
        self.assertIsNone(error)
    
    def test_validate_missing_job_title(self):
        """Test validation fails without job title"""
        job_data = {
            'description': 'Some description',
            'location_city': 'NYC',
            'location_country': 'USA',
            'job_type': 'Full Time',
            'experience_level': 'Senior',
            'skills_required': 'Python',
            'salary_min': 100000,
            'salary_max': 150000,
        }
        
        is_valid, error = JobValidator.validate_job_data(job_data)
        self.assertFalse(is_valid)
        self.assertIn('job_title', error)
    
    def test_validate_invalid_job_type(self):
        """Test validation with invalid job type"""
        job_data = {
            'job_title': 'Senior Developer',
            'description': 'Some description here',
            'location_city': 'NYC',
            'location_country': 'USA',
            'job_type': 'Invalid Type',
            'experience_level': 'Senior',
            'skills_required': 'Python',
            'salary_min': 100000,
            'salary_max': 150000,
        }
        
        is_valid, error = JobValidator.validate_job_data(job_data)
        self.assertFalse(is_valid)
    
    def test_validate_salary_range_invalid(self):
        """Test validation of invalid salary range"""
        is_valid, error = JobValidator.validate_salary_range(150000, 100000)
        self.assertFalse(is_valid)
        self.assertIn('cannot be greater', error)


class CompanyValidatorTestCase(TestCase):
    """Test company validation"""
    
    def test_validate_valid_company_profile(self):
        """Test validation of valid company profile"""
        company_data = {
            'name': 'Tech Company Inc',
            'description': 'A leading technology company',
            'website': 'https://example.com',
        }
        
        is_valid, error = CompanyValidator.validate_company_profile(company_data)
        self.assertTrue(is_valid)
        self.assertIsNone(error)
    
    def test_validate_missing_company_name(self):
        """Test validation fails without company name"""
        company_data = {
            'description': 'A leading technology company',
        }
        
        is_valid, error = CompanyValidator.validate_company_profile(company_data)
        self.assertFalse(is_valid)
        self.assertIn('name', error)


class SearchValidatorTestCase(TestCase):
    """Test search validation"""
    
    def test_validate_pagination_params_valid(self):
        """Test validation of valid pagination params"""
        is_valid, error = SearchValidator.validate_pagination_params(1, 20)
        self.assertTrue(is_valid)
        self.assertIsNone(error)
    
    def test_validate_pagination_page_zero(self):
        """Test validation fails with page 0"""
        is_valid, error = SearchValidator.validate_pagination_params(0, 20)
        self.assertFalse(is_valid)
    
    def test_validate_pagination_page_size_too_large(self):
        """Test validation fails with page_size > 100"""
        is_valid, error = SearchValidator.validate_pagination_params(1, 200)
        self.assertFalse(is_valid)
    
    def test_validate_sort_option_valid(self):
        """Test validation of valid sort options"""
        for sort_option in ['newest', 'oldest', 'salary_high', 'salary_low']:
            is_valid, error = SearchValidator.validate_sort_option(sort_option)
            self.assertTrue(is_valid)
    
    def test_validate_sort_option_invalid(self):
        """Test validation of invalid sort option"""
        is_valid, error = SearchValidator.validate_sort_option('invalid_sort')
        self.assertFalse(is_valid)


class CompanyAPITestCase(APITestCase):
    """Test company API endpoints"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='company1',
            email='company@test.com',
            password='testpass123'
        )
        self.user.profile.role = 'company'
        self.user.profile.save()
        
        self.candidate = User.objects.create_user(
            username='candidate1',
            email='candidate@test.com',
            password='testpass123'
        )
        self.candidate.profile.role = 'candidate'
        self.candidate.profile.save()
    
    def test_company_can_create_job(self):
        """Test that company user can create job"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post('/api/jobs/', {
            'job_title': 'Senior Developer',
            'description': 'We are looking for a senior developer with 5+ years experience',
            'location_city': 'New York',
            'location_country': 'USA',
            'job_type': 'Full Time',
            'experience_level': 'Senior',
            'skills_required': 'Python, Django',
            'salary_min': 100000,
            'salary_max': 150000,
            'company_name': 'Tech Company',
        })
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_candidate_cannot_create_job(self):
        """Test that candidate cannot create job"""
        self.client.force_authenticate(user=self.candidate)
        
        response = self.client.post('/api/jobs/', {
            'job_title': 'Senior Developer',
            'description': 'Some description',
            'location_city': 'New York',
            'location_country': 'USA',
            'job_type': 'Full Time',
            'experience_level': 'Senior',
            'skills_required': 'Python',
            'salary_min': 100000,
            'salary_max': 150000,
        })
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class JobPostingTestCase(APITestCase):
    """Test job posting workflow"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.company_user = User.objects.create_user(
            username='company1',
            email='company@test.com',
            password='testpass123'
        )
        self.company_user.profile.role = 'company'
        self.company_user.profile.save()
        
        self.company_profile, _ = CompanyProfile.objects.get_or_create(
            user=self.company_user,
            defaults={'name': 'Tech Company'}
        )
        
        self.job = Job.objects.create(
            posted_by=self.company_user,
            company=self.company_profile,
            company_name='Tech Company',
            job_title='Senior Developer',
            description='We are looking for a senior developer',
            location_city='New York',
            location_country='USA',
            job_type='Full Time',
            experience_level='Senior',
            skills_required='Python, Django',
            salary_min=100000,
            salary_max=150000,
        )
    
    def test_job_created_successfully(self):
        """Test job was created"""
        self.assertEqual(self.job.job_title, 'Senior Developer')
        self.assertEqual(self.job.job_status, 'Open')
    
    def test_company_can_view_own_jobs(self):
        """Test company can view their own jobs"""
        self.client.force_authenticate(user=self.company_user)
        
        response = self.client.get('/api/jobs/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_company_can_edit_job(self):
        """Test company can edit their job"""
        self.client.force_authenticate(user=self.company_user)
        
        response = self.client.patch(f'/api/jobs/{self.job.id}/', {
            'job_title': 'Lead Developer',
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify update
        self.job.refresh_from_db()
        self.assertEqual(self.job.job_title, 'Lead Developer')


class JobSearchTestCase(APITestCase):
    """Test job search functionality"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        self.company_user = User.objects.create_user(
            username='company1',
            email='company@test.com',
            password='testpass123'
        )
        self.company_user.profile.role = 'company'
        self.company_user.profile.save()
        
        self.company_profile, _ = CompanyProfile.objects.get_or_create(
            user=self.company_user,
            defaults={'name': 'Tech Company'}
        )
        
        # Create multiple jobs
        self.job1 = Job.objects.create(
            posted_by=self.company_user,
            company=self.company_profile,
            company_name='Tech Company',
            job_title='Python Developer',
            description='We are looking for a python developer',
            location_city='New York',
            location_country='USA',
            job_type='Full Time',
            experience_level='Mid Level',
            skills_required='Python, Django',
            salary_min=80000,
            salary_max=120000,
        )
        
        self.job2 = Job.objects.create(
            posted_by=self.company_user,
            company=self.company_profile,
            company_name='Tech Company',
            job_title='Senior Data Scientist',
            description='We are looking for a data scientist',
            location_city='San Francisco',
            location_country='USA',
            job_type='Remote',
            experience_level='Senior',
            skills_required='Python, Machine Learning',
            salary_min=120000,
            salary_max=180000,
        )
    
    def test_search_jobs_by_keyword(self):
        """Test searching jobs by keyword"""
        response = self.client.get('/api/jobs/?keyword=python')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(self.job1.id, [job['id'] for job in response.data.get('results', [])])
    
    def test_search_jobs_by_location(self):
        """Test searching jobs by location"""
        response = self.client.get('/api/jobs/?location=San Francisco')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(self.job2.id, [job['id'] for job in response.data.get('results', [])])
    
    def test_search_jobs_by_job_type(self):
        """Test searching jobs by job type"""
        response = self.client.get('/api/jobs/?type=Remote')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(self.job2.id, [job['id'] for job in response.data.get('results', [])])
    
    def test_search_jobs_by_salary_range(self):
        """Test searching jobs by salary range"""
        response = self.client.get('/api/jobs/?salary_min=100000&salary_max=150000')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
