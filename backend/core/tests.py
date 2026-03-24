from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from core.models import Profile


class AuthFlowTests(APITestCase):
    def test_register_then_login_with_email(self):
        register_payload = {
            "username": "alice",
            "email": "alice@example.com",
            "password": "StrongPass123",
            "confirm_password": "StrongPass123",
            "role": "candidate",  # Added role field
        }
        register_response = self.client.post("/api/register/", register_payload, format="json")
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)

        login_response = self.client.post(
            "/api/login/",
            {"username": "alice@example.com", "password": "StrongPass123"},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", login_response.data)
        self.assertIn("refresh", login_response.data)
        self.assertEqual(login_response.data["role"], "candidate")

    def test_register_company_then_login_returns_company_role(self):
        register_response = self.client.post(
            "/api/register/",
            {
                "username": "acme_hr",
                "email": "hr@acme.com",
                "password": "StrongPass123",
                "confirm_password": "StrongPass123",
                "role": "company",
            },
            format="json",
        )
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(register_response.data["role"], "company")

        login_response = self.client.post(
            "/api/login/",
            {"username": "hr@acme.com", "password": "StrongPass123"},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertEqual(login_response.data["role"], "company")

    def test_register_rejects_duplicate_email(self):
        User.objects.create_user(username="u1", email="dup@example.com", password="StrongPass123")
        response = self.client.post(
            "/api/register/",
            {
                "username": "u2",
                "email": "dup@example.com",
                "password": "StrongPass123",
                "confirm_password": "StrongPass123",
                "role": "candidate",  # Added role field
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)


# ============================================================================
# PHASE 9: COMPREHENSIVE TEST SUITE
# ============================================================================

class CandidateAuthTestCase(APITestCase):
    """Test suite for candidate authentication"""
    
    def setUp(self):
        self.client = APITestCase().client_class()
        self.register_url = '/api/auth/candidate/register/'
        self.login_url = '/api/auth/candidate/login/'
        self.candidate_data = {
            'username': 'candidateuser',
            'email': 'candidate@test.com',
            'password': 'TestPass123!',
            'confirm_password': 'TestPass123!',
        }
    
    def test_candidate_registration_success(self):
        """Test successful candidate registration"""
        response = self.client.post(self.register_url, self.candidate_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['role'], 'candidate')
        self.assertIn('message', response.data)
        
        # Verify user was created
        user = User.objects.get(username=self.candidate_data['username'])
        self.assertEqual(user.email, self.candidate_data['email'])
        
        # Verify profile was created with correct role
        self.assertTrue(hasattr(user, 'profile'))
        self.assertEqual(user.profile.role, 'candidate')
    
    def test_candidate_registration_password_mismatch(self):
        """Test candidate registration with mismatched passwords"""
        data = self.candidate_data.copy()
        data['confirm_password'] = 'DifferentPass123!'
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_candidate_registration_duplicate_username(self):
        """Test candidate registration with existing username"""
        self.client.post(self.register_url, self.candidate_data)
        response = self.client.post(self.register_url, self.candidate_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_candidate_login_success(self):
        """Test successful candidate login"""
        # Register first
        self.client.post(self.register_url, self.candidate_data)
        
        # Login
        login_data = {
            'username': self.candidate_data['username'],
            'password': self.candidate_data['password'],
        }
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data.get('role'), 'candidate')
    
    def test_candidate_login_invalid_credentials(self):
        """Test candidate login with invalid credentials"""
        # Register first
        self.client.post(self.register_url, self.candidate_data)
        
        # Try login with wrong password
        login_data = {
            'username': self.candidate_data['username'],
            'password': 'WrongPassword123!',
        }
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_company_user_cannot_login_as_candidate(self):
        """Test that company users cannot login to candidate endpoint"""
        # Register as company
        company_data = {
            'username': 'companyuser',
            'email': 'company@test.com',
            'password': 'TestPass123!',
            'confirm_password': 'TestPass123!',
        }
        self.client.post('/api/auth/company/register/', company_data)
        
        # Try to login to candidate endpoint
        login_data = {
            'username': company_data['username'],
            'password': company_data['password'],
        }
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class CompanyAuthTestCase(APITestCase):
    """Test suite for company authentication"""
    
    def setUp(self):
        self.client = APITestCase().client_class()
        self.register_url = '/api/auth/company/register/'
        self.login_url = '/api/auth/company/login/'
        self.company_data = {
            'username': 'companyuser',
            'email': 'company@test.com',
            'password': 'TestPass123!',
            'confirm_password': 'TestPass123!',
        }
    
    def test_company_registration_success(self):
        """Test successful company registration"""
        response = self.client.post(self.register_url, self.company_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['role'], 'company')
        self.assertIn('company_name', response.data)
        
        # Verify user was created
        user = User.objects.get(username=self.company_data['username'])
        
        # Verify profile role
        self.assertEqual(user.profile.role, 'company')
    
    def test_company_login_success(self):
        """Test successful company login"""
        # Register first
        self.client.post(self.register_url, self.company_data)
        
        # Login
        login_data = {
            'username': self.company_data['username'],
            'password': self.company_data['password'],
        }
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertEqual(response.data.get('role'), 'company')
    
    def test_candidate_user_cannot_login_as_company(self):
        """Test that candidate users cannot login to company endpoint"""
        # Register as candidate
        candidate_data = {
            'username': 'candidateuser',
            'email': 'candidate@test.com',
            'password': 'TestPass123!',
            'confirm_password': 'TestPass123!',
        }
        self.client.post('/api/auth/candidate/register/', candidate_data)
        
        # Try to login to company endpoint
        login_data = {
            'username': candidate_data['username'],
            'password': candidate_data['password'],
        }
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class RoleSelectionTestCase(APITestCase):
    """Test suite for role selection endpoint"""
    
    def setUp(self):
        self.client = APITestCase().client_class()
        self.role_selection_url = '/api/auth/login-role/'
    
    def test_role_selection_endpoint_exists(self):
        """Test that role selection endpoint returns available options"""
        response = self.client.get(self.role_selection_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('roles', response.data)
        self.assertGreaterEqual(len(response.data['roles']), 2)
    
    def test_role_selection_contains_candidate(self):
        """Test that candidate option is available"""
        response = self.client.get(self.role_selection_url)
        role_ids = [r['id'] for r in response.data['roles']]
        self.assertIn('candidate', role_ids)
    
    def test_role_selection_contains_company(self):
        """Test that company option is available"""
        response = self.client.get(self.role_selection_url)
        role_ids = [r['id'] for r in response.data['roles']]
        self.assertIn('company', role_ids)


class ProfileCreationTestCase(APITestCase):
    """Test suite for automatic profile creation on registration"""
    
    def setUp(self):
        self.client = APITestCase().client_class()
    
    def test_profile_created_on_candidate_registration(self):
        """Test that Profile is automatically created for candidates"""
        data = {
            'username': 'testuser',
            'email': 'test@test.com',
            'password': 'TestPass123!',
            'confirm_password': 'TestPass123!',
        }
        self.client.post('/api/auth/candidate/register/', data)
        
        user = User.objects.get(username=data['username'])
        self.assertTrue(hasattr(user, 'profile'))
        self.assertEqual(user.profile.role, 'candidate')
    
    def test_profile_created_on_company_registration(self):
        """Test that Profile is automatically created for companies"""
        data = {
            'username': 'testcompany',
            'email': 'test@company.com',
            'password': 'TestPass123!',
            'confirm_password': 'TestPass123!',
        }
        self.client.post('/api/auth/company/register/', data)
        
        user = User.objects.get(username=data['username'])
        self.assertTrue(hasattr(user, 'profile'))
        self.assertEqual(user.profile.role, 'company')
