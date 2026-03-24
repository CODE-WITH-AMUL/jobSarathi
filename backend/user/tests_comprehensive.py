"""
Comprehensive test suite for candidate operations.
"""
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from company.models import Job, CompanyProfile
from user.models import CandidateProfile, JobApplication, SavedJob
from user.services import CandidateService


class CandidateProfileTestCase(TestCase):
    """Test candidate profile management"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='candidate1',
            email='candidate@test.com',
            password='testpass123'
        )
    
    def test_candidate_profile_auto_created(self):
        """Test that candidate profile is auto-created or can be created"""
        profile = CandidateService.get_or_create_candidate_profile(self.user)
        
        self.assertIsNotNone(profile)
        self.assertEqual(profile.user, self.user)
    
    def test_candidate_profile_defaults(self):
        """Test that candidate profile has default values"""
        profile = CandidateService.get_or_create_candidate_profile(self.user)
        
        self.assertIsNotNone(profile.first_name)
        self.assertIsNotNone(profile.email)
        self.assertIsNotNone(profile.phone)
    
    def test_candidate_profile_reuses_existing(self):
        """Test that get_or_create returns existing profile"""
        profile1 = CandidateService.get_or_create_candidate_profile(self.user)
        profile2 = CandidateService.get_or_create_candidate_profile(self.user)
        
        self.assertEqual(profile1.id, profile2.id)


class JobApplicationTestCase(APITestCase):
    """Test job application workflow"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create candidate
        self.candidate_user = User.objects.create_user(
            username='candidate1',
            email='candidate@test.com',
            password='testpass123'
        )
        self.candidate_user.profile.role = 'candidate'
        self.candidate_user.profile.save()
        
        self.candidate_profile = CandidateService.get_or_create_candidate_profile(self.candidate_user)
        
        # Create company and job
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
    
    def test_candidate_can_apply_for_job(self):
        """Test that candidate can apply for job"""
        self.client.force_authenticate(user=self.candidate_user)
        
        response = self.client.post('/api/applications/', {
            'job': self.job.id,
            'cover_letter': 'I am interested in this position',
        })
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_candidate_cannot_apply_twice_for_same_job(self):
        """Test that candidate cannot apply twice for same job"""
        application1, created1 = CandidateService.apply_for_job(
            self.candidate_profile,
            self.job,
            cover_letter='First application'
        )
        
        application2, created2 = CandidateService.apply_for_job(
            self.candidate_profile,
            self.job,
            cover_letter='Second application'
        )
        
        self.assertTrue(created1)
        self.assertFalse(created2)
        self.assertEqual(application1.id, application2.id)
    
    def test_company_cannot_apply_for_job(self):
        """Test that company cannot apply for job"""
        self.client.force_authenticate(user=self.company_user)
        
        response = self.client.post('/api/applications/', {
            'job': self.job.id,
            'cover_letter': 'I want this job',
        })
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_get_candidate_applications(self):
        """Test retrieving candidate's applications"""
        # Create an application
        CandidateService.apply_for_job(
            self.candidate_profile,
            self.job,
            cover_letter='I am interested'
        )
        
        # Retrieve applications
        applications = CandidateService.get_candidate_applications(self.candidate_profile)
        
        self.assertEqual(applications.count(), 1)
        self.assertEqual(applications.first().job, self.job)
    
    def test_candidate_application_stats(self):
        """Test getting application statistics"""
        # Create an application
        CandidateService.apply_for_job(
            self.candidate_profile,
            self.job,
            cover_letter='I am interested'
        )
        
        stats = CandidateService.get_candidate_application_stats(self.candidate_profile)
        
        self.assertEqual(stats['total_applications'], 1)
        self.assertEqual(stats['pending'], 1)


class SavedJobTestCase(APITestCase):
    """Test saved job functionality"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create candidate
        self.candidate_user = User.objects.create_user(
            username='candidate1',
            email='candidate@test.com',
            password='testpass123'
        )
        self.candidate_user.profile.role = 'candidate'
        self.candidate_user.profile.save()
        
        self.candidate_profile = CandidateService.get_or_create_candidate_profile(self.candidate_user)
        
        # Create company and job
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
            job_title='Developer',
            description='A developer position',
            location_city='New York',
            location_country='USA',
            job_type='Full Time',
            experience_level='Mid Level',
            skills_required='Python',
            salary_min=80000,
            salary_max=120000,
        )
    
    def test_candidate_can_save_job(self):
        """Test that candidate can save job"""
        saved, created = CandidateService.save_job(self.candidate_profile, self.job)
        
        self.assertTrue(created)
        self.assertIsNotNone(saved)
    
    def test_candidate_cannot_save_job_twice(self):
        """Test that candidate cannot save same job twice"""
        saved1, created1 = CandidateService.save_job(self.candidate_profile, self.job)
        saved2, created2 = CandidateService.save_job(self.candidate_profile, self.job)
        
        self.assertTrue(created1)
        self.assertFalse(created2)
        self.assertEqual(saved1.id, saved2.id)
    
    def test_candidate_can_unsave_job(self):
        """Test that candidate can unsave job"""
        CandidateService.save_job(self.candidate_profile, self.job)
        
        # Verify it was saved
        self.assertTrue(SavedJob.objects.filter(
            candidate=self.candidate_profile,
            job=self.job
        ).exists())
        
        # Unsave
        CandidateService.unsave_job(self.candidate_profile, self.job)
        
        # Verify it was unsaved
        self.assertFalse(SavedJob.objects.filter(
            candidate=self.candidate_profile,
            job=self.job
        ).exists())
    
    def test_get_saved_jobs(self):
        """Test retrieving saved jobs"""
        CandidateService.save_job(self.candidate_profile, self.job)
        
        saved_jobs = CandidateService.get_saved_jobs(self.candidate_profile)
        
        self.assertEqual(saved_jobs.count(), 1)
        self.assertEqual(saved_jobs.first().job, self.job)


class JobBrowsingTestCase(APITestCase):
    """Test job browsing for candidates"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create candidate
        self.candidate_user = User.objects.create_user(
            username='candidate1',
            email='candidate@test.com',
            password='testpass123'
        )
        self.candidate_user.profile.role = 'candidate'
        self.candidate_user.profile.save()
        
        # Create company and jobs
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
        for i in range(5):
            Job.objects.create(
                posted_by=self.company_user,
                company=self.company_profile,
                company_name='Tech Company',
                job_title=f'Developer {i}',
                description=f'A developer position {i}',
                location_city='New York',
                location_country='USA',
                job_type='Full Time',
                experience_level='Mid Level',
                skills_required='Python',
                salary_min=80000,
                salary_max=120000,
            )
    
    def test_candidate_can_browse_jobs(self):
        """Test that candidate can browse jobs"""
        response = self.client.get('/api/jobs/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data.get('results', [])), 0)
    
    def test_unauthenticated_user_can_browse_jobs(self):
        """Test that unauthenticated user can browse jobs"""
        response = self.client.get('/api/jobs/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_get_single_job(self):
        """Test retrieving single job"""
        job = Job.objects.first()
        
        response = self.client.get(f'/api/jobs/{job.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
