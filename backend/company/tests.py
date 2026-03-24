from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from company.models import CompanyProfile, Job
from user.models import CandidateProfile, JobApplication
from decimal import Decimal


class CompanyApiTests(APITestCase):
    def setUp(self):
        self.company_user = User.objects.create_user(
            username="company1",
            email="company1@example.com",
            password="StrongPass123",
        )
        self.candidate_user = User.objects.create_user(
            username="candidate1",
            email="candidate1@example.com",
            password="StrongPass123",
        )
        self.candidate_profile = CandidateProfile.objects.create(
            user=self.candidate_user,
            first_name="Jane",
            last_name="Doe",
            email="candidate1@example.com",
            phone="9800000000",
            address="Kathmandu",
            city="Kathmandu",
            country="Nepal",
            zip_code="44600",
            pincode="44600",
            dob="1999-01-01",
            age=26,
            gender="Female",
        )
        CompanyProfile.objects.create(user=self.company_user, name="company1")
        self.client.force_authenticate(self.company_user)

    def test_company_can_create_job(self):
        response = self.client.post(
            "/api/company/jobs/",
            {
                "job_title": "Django Dev",
                "description": "Build backend",
                "location_city": "Kathmandu",
                "location_country": "Nepal",
                "job_type": "Full Time",
                "skills_required": "Django,DRF",
                "salary_min": 1000,
                "salary_max": 2000,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_company_can_review_application(self):
        job = Job.objects.create(
            posted_by=self.company_user,
            company_name="company1",
            job_title="QA Engineer",
            description="Test software",
            location_city="Kathmandu",
            location_country="Nepal",
            job_type="Full Time",
            skills_required="Testing",
            salary_min=1000,
            salary_max=2000,
        )
        application = JobApplication.objects.create(
            candidate=self.candidate_profile,
            job=job,
            cover_letter="Please consider me.",
        )

        response = self.client.patch(
            f"/api/company/applications/{application.id}/review/",
            {"status": "shortlisted"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "shortlisted")

    def test_company_sees_only_own_jobs(self):
        other_company_user = User.objects.create_user(
            username="company2",
            email="company2@example.com",
            password="StrongPass123",
        )
        CompanyProfile.objects.create(user=other_company_user, name="company2")
        Job.objects.create(
            posted_by=self.company_user,
            company_name="company1",
            job_title="Own Job",
            description="Owned by company1",
            location_city="Kathmandu",
            location_country="Nepal",
            job_type="Full Time",
            skills_required="Django",
            salary_min=1000,
            salary_max=2000,
        )
        Job.objects.create(
            posted_by=other_company_user,
            company_name="company2",
            job_title="Other Job",
            description="Owned by company2",
            location_city="Pokhara",
            location_country="Nepal",
            job_type="Full Time",
            skills_required="React",
            salary_min=1000,
            salary_max=2000,
        )

        response = self.client.get("/api/company/jobs/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["job_title"], "Own Job")

    def test_applications_are_visible_only_to_job_owner_company(self):
        other_company_user = User.objects.create_user(
            username="company2",
            email="company2@example.com",
            password="StrongPass123",
        )
        CompanyProfile.objects.create(user=other_company_user, name="company2")
        own_job = Job.objects.create(
            posted_by=self.company_user,
            company_name="company1",
            job_title="Own Job",
            description="Owned by company1",
            location_city="Kathmandu",
            location_country="Nepal",
            job_type="Full Time",
            skills_required="Testing",
            salary_min=1000,
            salary_max=2000,
        )
        other_job = Job.objects.create(
            posted_by=other_company_user,
            company_name="company2",
            job_title="Other Job",
            description="Owned by company2",
            location_city="Pokhara",
            location_country="Nepal",
            job_type="Full Time",
            skills_required="Testing",
            salary_min=1000,
            salary_max=2000,
        )
        own_application = JobApplication.objects.create(
            candidate=self.candidate_profile,
            job=own_job,
            cover_letter="Own company should see this.",
        )
        JobApplication.objects.create(
            candidate=self.candidate_profile,
            job=other_job,
            cover_letter="Other company should not see this.",
        )

        response = self.client.get("/api/company/applications/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], own_application.id)


# ============================================================================
# PHASE 9: COMPREHENSIVE JOB AND SEARCH TESTS
# ============================================================================

class JobPostingTestCase(APITestCase):
    """Test suite for job posting operations"""
    
    def setUp(self):
        self.client = APITestCase().client_class()
        
        # Create company user
        self.company_data = {
            'username': 'companyuser',
            'email': 'company@test.com',
            'password': 'TestPass123!',
            'confirm_password': 'TestPass123!',
        }
        response = self.client.post('/api/auth/company/register/', self.company_data)
        self.company_token = response.data.get('access')
        
        self.company_user = User.objects.get(username=self.company_data['username'])
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.company_token}')
        
        self.job_data = {
            'job_title': 'Python Developer',
            'company_name': 'Tech Corp',
            'description': 'We are looking for an experienced Python developer with 5+ years of experience.',
            'location_city': 'San Francisco',
            'location_state': 'California',
            'location_country': 'United States',
            'job_type': 'Full Time',
            'experience_level': 'Mid Level',
            'skills_required': 'Python, Django, REST',
            'salary_min': Decimal('80000.00'),
            'salary_max': Decimal('120000.00'),
        }
    
    def test_company_can_post_job(self):
        """Test that company users can post jobs"""
        response = self.client.post('/api/company/jobs/', self.job_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['job_title'], self.job_data['job_title'])
        self.assertEqual(response.data['job_status'], 'Open')
    
    def test_candidate_cannot_post_job(self):
        """Test that candidate users cannot post jobs"""
        # Create candidate user
        candidate_data = {
            'username': 'candidateuser',
            'email': 'candidate@test.com',
            'password': 'TestPass123!',
            'confirm_password': 'TestPass123!',
        }
        response = self.client.post('/api/auth/candidate/register/', candidate_data)
        candidate_token = response.data.get('access')
        
        # Try to post job as candidate
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {candidate_token}')
        response = self.client.post('/api/company/jobs/', self.job_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class JobSearchTestCase(APITestCase):
    """Test suite for job search and filtering"""
    
    def setUp(self):
        self.client = APITestCase().client_class()
        
        # Create company and post jobs
        self.company_data = {
            'username': 'company1',
            'email': 'company1@test.com',
            'password': 'TestPass123!',
            'confirm_password': 'TestPass123!',
        }
        response = self.client.post('/api/auth/company/register/', self.company_data)
        company_token = response.data.get('access')
        company_user = User.objects.get(username='company1')
        
        # Create company profile
        CompanyProfile.objects.create(
            user=company_user,
            name='Tech Corp',
            location='San Francisco'
        )
        
        # Post multiple jobs
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {company_token}')
        
        self.jobs_data = [
            {
                'job_title': 'Python Developer',
                'company_name': 'Tech Corp',
                'description': 'Senior Python developer position.',
                'location_city': 'San Francisco',
                'location_country': 'United States',
                'job_type': 'Full Time',
                'experience_level': 'Senior',
                'skills_required': 'Python, Django',
                'salary_min': Decimal('100000.00'),
                'salary_max': Decimal('150000.00'),
            },
            {
                'job_title': 'JavaScript Developer',
                'company_name': 'Tech Corp',
                'description': 'Frontend JavaScript developer.',
                'location_city': 'New York',
                'location_country': 'United States',
                'job_type': 'Remote',
                'experience_level': 'Mid Level',
                'skills_required': 'JavaScript, React',
                'salary_min': Decimal('70000.00'),
                'salary_max': Decimal('100000.00'),
            },
        ]
        
        for job_data in self.jobs_data:
            self.client.post('/api/company/jobs/', job_data, format='json')
        
        # Switch to anonymous access for job search
        self.client.credentials()
    
    def test_search_jobs_by_keyword(self):
        """Test searching jobs by keyword"""
        response = self.client.get('/api/user/jobs/?keyword=Python')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data['results']), 0)
    
    def test_search_jobs_by_location(self):
        """Test searching jobs by location"""
        response = self.client.get('/api/user/jobs/?location=San Francisco')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data['results']), 0)
    
    def test_search_jobs_pagination(self):
        """Test job search pagination"""
        response = self.client.get('/api/user/jobs/?page=1&page_size=2')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('page', response.data)
        self.assertIn('page_size', response.data)
