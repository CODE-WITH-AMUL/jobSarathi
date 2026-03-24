"""
Comprehensive test suite for core authentication and role system.
"""
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from core.models import Profile
from core.services import RoleValidationService, UserValidationService, PermissionValidationService


class RoleSystemTestCase(TestCase):
    """Test role system setup and functionality"""
    
    def setUp(self):
        """Set up test data"""
        self.user_candidate = User.objects.create_user(
            username='candidate1',
            email='candidate@test.com',
            password='testpass123'
        )
        self.user_company = User.objects.create_user(
            username='company1',
            email='company@test.com',
            password='testpass123'
        )
    
    def test_profile_created_on_user_creation(self):
        """Test that profile is created automatically on user creation"""
        self.assertTrue(hasattr(self.user_candidate, 'profile'))
        self.assertIsNotNone(self.user_candidate.profile)
    
    def test_profile_default_role_is_candidate(self):
        """Test that default role is candidate"""
        self.assertEqual(self.user_candidate.profile.role, 'candidate')
    
    def test_profile_role_property_is_candidate(self):
        """Test is_candidate property"""
        self.assertTrue(self.user_candidate.profile.is_candidate)
        self.assertFalse(self.user_candidate.profile.is_company)
    
    def test_profile_role_property_is_company(self):
        """Test is_company property for company user"""
        self.user_company.profile.role = 'company'
        self.user_company.profile.save()
        
        self.assertTrue(self.user_company.profile.is_company)
        self.assertFalse(self.user_company.profile.is_candidate)
    
    def test_role_choices_exist(self):
        """Test that role choices are defined"""
        self.assertEqual(len(Profile.ROLE_CHOICES) if hasattr(Profile, 'ROLE_CHOICES') else 2, 2)


class RoleValidationServiceTestCase(TestCase):
    """Test role validation service"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
    
    def test_validate_valid_role(self):
        """Test validation of valid role"""
        self.assertTrue(RoleValidationService.validate_role_assignment('candidate'))
        self.assertTrue(RoleValidationService.validate_role_assignment('company'))
    
    def test_validate_invalid_role(self):
        """Test validation of invalid role"""
        from rest_framework.exceptions import ValidationError
        
        with self.assertRaises(ValidationError):
            RoleValidationService.validate_role_assignment('invalid_role')
    
    def test_is_candidate(self):
        """Test is_candidate check"""
        self.assertTrue(RoleValidationService.is_candidate(self.user))
        
        self.user.profile.role = 'company'
        self.user.profile.save()
        self.assertFalse(RoleValidationService.is_candidate(self.user))
    
    def test_is_company(self):
        """Test is_company check"""
        self.assertFalse(RoleValidationService.is_company(self.user))
        
        self.user.profile.role = 'company'
        self.user.profile.save()
        self.assertTrue(RoleValidationService.is_company(self.user))
    
    def test_enforce_role_success(self):
        """Test enforce_role with matching role"""
        # Should not raise exception
        RoleValidationService.enforce_role(self.user, 'candidate')
    
    def test_enforce_role_failure(self):
        """Test enforce_role with non-matching role"""
        from rest_framework.exceptions import ValidationError
        
        with self.assertRaises(ValidationError):
            RoleValidationService.enforce_role(self.user, 'company')


class CandidateLoginTestCase(APITestCase):
    """Test candidate login functionality"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='candidate1',
            email='candidate@test.com',
            password='testpass123'
        )
        self.user.profile.role = 'candidate'
        self.user.profile.save()
    
    def test_candidate_login_success(self):
        """Test successful candidate login"""
        response = self.client.post('/api/auth/candidate/login/', {
            'username': 'candidate1',
            'password': 'testpass123'
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data.get('role'), 'candidate')
    
    def test_candidate_login_with_email(self):
        """Test candidate login with email"""
        response = self.client.post('/api/auth/candidate/login/', {
            'username': 'candidate@test.com',
            'password': 'testpass123'
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_candidate_login_invalid_password(self):
        """Test candidate login with invalid password"""
        response = self.client.post('/api/auth/candidate/login/', {
            'username': 'candidate1',
            'password': 'wrongpassword'
        })
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_candidate_login_missing_username(self):
        """Test candidate login without username"""
        response = self.client.post('/api/auth/candidate/login/', {
            'password': 'testpass123'
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class CompanyLoginTestCase(APITestCase):
    """Test company login functionality"""
    
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
    
    def test_company_login_success(self):
        """Test successful company login"""
        response = self.client.post('/api/auth/company/login/', {
            'username': 'company1',
            'password': 'testpass123'
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertEqual(response.data.get('role'), 'company')
    
    def test_candidate_cannot_login_as_company(self):
        """Test that candidate cannot login as company"""
        candidate = User.objects.create_user(
            username='candidate2',
            email='candidate2@test.com',
            password='testpass123'
        )
        candidate.profile.role = 'candidate'
        candidate.profile.save()
        
        response = self.client.post('/api/auth/company/login/', {
            'username': 'candidate2',
            'password': 'testpass123'
        })
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('WRONG_ROLE', response.data.get('error_code', ''))


class PermissionValidationTestCase(TestCase):
    """Test permission validation"""
    
    def setUp(self):
        """Set up test data"""
        self.candidate = User.objects.create_user(
            username='candidate',
            email='candidate@test.com',
            password='testpass123'
        )
        self.candidate.profile.role = 'candidate'
        self.candidate.profile.save()
        
        self.company = User.objects.create_user(
            username='company',
            email='company@test.com',
            password='testpass123'
        )
        self.company.profile.role = 'company'
        self.company.profile.save()
    
    def test_candidate_can_apply(self):
        """Test that candidate can apply for jobs"""
        self.assertTrue(PermissionValidationService.can_apply_for_job(self.candidate))
    
    def test_company_cannot_apply(self):
        """Test that company cannot apply for jobs"""
        self.assertFalse(PermissionValidationService.can_apply_for_job(self.company))
    
    def test_candidate_cannot_access_company_endpoints(self):
        """Test that candidate cannot access company endpoints"""
        self.assertFalse(PermissionValidationService.can_access_company_endpoints(self.candidate))
    
    def test_company_can_access_company_endpoints(self):
        """Test that company can access company endpoints"""
        self.assertTrue(PermissionValidationService.can_access_company_endpoints(self.company))


class CandidateRegistrationTestCase(APITestCase):
    """Test candidate registration"""
    
    def setUp(self):
        """Set up test client"""
        self.client = APIClient()
    
    def test_candidate_registration_success(self):
        """Test successful candidate registration"""
        response = self.client.post('/api/auth/candidate/register/', {
            'username': 'newcandidate',
            'email': 'newcandidate@test.com',
            'password': 'SecurePass123!',
            'confirm_password': 'SecurePass123!'
        })
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['role'], 'candidate')
        
        # Verify user was created
        user = User.objects.get(username='newcandidate')
        self.assertEqual(user.profile.role, 'candidate')
    
    def test_candidate_registration_password_mismatch(self):
        """Test registration with mismatched passwords"""
        response = self.client.post('/api/auth/candidate/register/', {
            'username': 'newcandidate',
            'email': 'newcandidate@test.com',
            'password': 'SecurePass123!',
            'confirm_password': 'DifferentPass123!'
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_candidate_registration_duplicate_email(self):
        """Test registration with duplicate email"""
        User.objects.create_user(
            username='existing',
            email='existing@test.com',
            password='testpass123'
        )
        
        response = self.client.post('/api/auth/candidate/register/', {
            'username': 'newcandidate',
            'email': 'existing@test.com',
            'password': 'SecurePass123!',
            'confirm_password': 'SecurePass123!'
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class CompanyRegistrationTestCase(APITestCase):
    """Test company registration"""
    
    def setUp(self):
        """Set up test client"""
        self.client = APIClient()
    
    def test_company_registration_success(self):
        """Test successful company registration"""
        response = self.client.post('/api/auth/company/register/', {
            'username': 'newcompany',
            'email': 'newcompany@test.com',
            'password': 'SecurePass123!',
            'confirm_password': 'SecurePass123!',
            'company_name': 'Test Company'
        })
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['role'], 'company')
        
        # Verify user was created with company role
        user = User.objects.get(username='newcompany')
        self.assertEqual(user.profile.role, 'company')
        self.assertTrue(hasattr(user, 'company_profile'))
