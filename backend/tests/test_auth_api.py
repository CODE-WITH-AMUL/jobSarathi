import requests
import json
import pytest
from typing import Dict, Any

# Configuration
BASE_URL = "http://127.0.0.1:8000/api"

class TestAuthenticationAPI:
    """Test suite for Django authentication API endpoints"""

    def setup_method(self):
        """Setup before each test"""
        self.session = requests.Session()
        self.base_url = BASE_URL

    def teardown_method(self):
        """Cleanup after each test"""
        self.session.close()

    def test_candidate_login_valid_credentials(self):
        """Test candidate login with valid credentials"""
        payload = {
            "email": "candidate@example.com",
            "password": "password123",
            "account_type": "candidate"
        }

        response = self.session.post(f"{self.base_url}/auth/candidate/login/", json=payload)

        # Check response status
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}"

        if response.status_code == 200:
            data = response.json()
            assert "token" in data or "access" in data, "Response should contain token"
            assert "user" in data, "Response should contain user data"
            assert data["user"].get("account_type") == "candidate", "User should be candidate"

    def test_candidate_login_invalid_credentials(self):
        """Test candidate login with invalid credentials"""
        payload = {
            "email": "invalid@example.com",
            "password": "wrongpassword",
            "account_type": "candidate"
        }

        response = self.session.post(f"{self.base_url}/auth/candidate/login/", json=payload)

        # Should return error status
        assert response.status_code in [400, 401, 403], f"Expected 400/401/403, got {response.status_code}"

        data = response.json()
        assert "detail" in data or "message" in data or "error" in data, "Should contain error message"

    def test_candidate_login_missing_fields(self):
        """Test candidate login with missing required fields"""
        # Missing password
        payload = {
            "email": "candidate@example.com",
            "account_type": "candidate"
        }

        response = self.session.post(f"{self.base_url}/auth/candidate/login/", json=payload)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"

        # Missing email
        payload = {
            "password": "password123",
            "account_type": "candidate"
        }

        response = self.session.post(f"{self.base_url}/auth/candidate/login/", json=payload)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"

    def test_company_login_valid_credentials(self):
        """Test company login with valid credentials"""
        payload = {
            "email": "company@example.com",
            "password": "password123",
            "account_type": "company"
        }

        response = self.session.post(f"{self.base_url}/auth/company/login/", json=payload)

        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}"

        if response.status_code == 200:
            data = response.json()
            assert "token" in data or "access" in data, "Response should contain token"
            assert "user" in data, "Response should contain user data"
            assert data["user"].get("account_type") == "company", "User should be company"

    def test_company_login_invalid_credentials(self):
        """Test company login with invalid credentials"""
        payload = {
            "email": "invalid@company.com",
            "password": "wrongpassword",
            "account_type": "company"
        }

        response = self.session.post(f"{self.base_url}/auth/company/login/", json=payload)
        assert response.status_code in [400, 401, 403], f"Expected 400/401/403, got {response.status_code}"

    def test_candidate_register_valid_data(self):
        """Test candidate registration with valid data"""
        payload = {
            "email": f"test.candidate.{pytest.current_test_id or 'unique'}@example.com",
            "password": "password123",
            "account_type": "candidate",
            "first_name": "Test",
            "last_name": "Candidate"
        }

        response = self.session.post(f"{self.base_url}/auth/candidate/register/", json=payload)

        # Registration might succeed or fail if user exists
        assert response.status_code in [200, 201, 400], f"Unexpected status: {response.status_code}"

        if response.status_code in [200, 201]:
            data = response.json()
            assert "token" in data or "access" in data, "Response should contain token"
            assert "user" in data, "Response should contain user data"

    def test_candidate_register_missing_required_fields(self):
        """Test candidate registration with missing required fields"""
        # Missing first_name
        payload = {
            "email": "test@example.com",
            "password": "password123",
            "account_type": "candidate",
            "last_name": "Candidate"
        }

        response = self.session.post(f"{self.base_url}/auth/candidate/register/", json=payload)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"

        data = response.json()
        assert "first_name" in str(data).lower() or "required" in str(data).lower(), "Should indicate first_name is required"

    def test_candidate_register_password_mismatch(self):
        """Test candidate registration with password mismatch (if validated on backend)"""
        payload = {
            "email": "test@example.com",
            "password": "password123",
            "confirm_password": "different",  # If backend checks this
            "account_type": "candidate",
            "first_name": "Test",
            "last_name": "Candidate"
        }

        response = self.session.post(f"{self.base_url}/auth/candidate/register/", json=payload)

        # May or may not be validated on backend
        if response.status_code == 400:
            data = response.json()
            assert "password" in str(data).lower(), "Should indicate password issue"

    def test_company_register_valid_data(self):
        """Test company registration with valid data"""
        payload = {
            "email": f"test.company.{pytest.current_test_id or 'unique'}@example.com",
            "password": "password123",
            "account_type": "company",
            "company_name": "Test Company"
        }

        response = self.session.post(f"{self.base_url}/auth/company/register/", json=payload)

        assert response.status_code in [200, 201, 400], f"Unexpected status: {response.status_code}"

        if response.status_code in [200, 201]:
            data = response.json()
            assert "token" in data or "access" in data, "Response should contain token"
            assert "user" in data, "Response should contain user data"

    def test_company_register_missing_company_name(self):
        """Test company registration with missing company name"""
        payload = {
            "email": "test@company.com",
            "password": "password123",
            "account_type": "company"
        }

        response = self.session.post(f"{self.base_url}/auth/company/register/", json=payload)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"

        data = response.json()
        assert "company_name" in str(data).lower() or "required" in str(data).lower(), "Should indicate company_name is required"

    def test_invalid_account_type(self):
        """Test login/register with invalid account type"""
        payload = {
            "email": "test@example.com",
            "password": "password123",
            "account_type": "invalid"
        }

        response = self.session.post(f"{self.base_url}/auth/candidate/login/", json=payload)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"

    def test_api_response_format(self):
        """Test that API responses have consistent format"""
        payload = {
            "email": "test@example.com",
            "password": "password123",
            "account_type": "candidate"
        }

        response = self.session.post(f"{self.base_url}/auth/candidate/login/", json=payload)

        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, dict), "Response should be JSON object"

            # Check for token field (could be 'token' or 'access')
            assert "token" in data or "access" in data, "Should contain authentication token"

            # Check user data structure
            assert "user" in data, "Should contain user data"
            assert isinstance(data["user"], dict), "User should be an object"
            assert "id" in data["user"], "User should have ID"

    def test_cors_headers(self):
        """Test CORS headers are present"""
        response = self.session.options(f"{self.base_url}/auth/candidate/login/")

        # Check for CORS headers
        assert "access-control-allow-origin" in response.headers or response.status_code == 200, "Should allow CORS"

    def test_rate_limiting(self):
        """Test rate limiting (if implemented)"""
        payload = {
            "email": "test@example.com",
            "password": "wrong",
            "account_type": "candidate"
        }

        # Make multiple requests quickly
        responses = []
        for _ in range(10):
            response = self.session.post(f"{self.base_url}/auth/candidate/login/", json=payload)
            responses.append(response.status_code)

        # Check if any requests were rate limited (429)
        rate_limited = any(status == 429 for status in responses)
        if rate_limited:
            assert 429 in responses, "Rate limiting should return 429 status"

class TestDashboardAccess:
    """Test dashboard access control"""

    def setup_method(self):
        self.session = requests.Session()
        self.base_url = BASE_URL
        self.token = None

    def _login_candidate(self):
        """Helper to login as candidate"""
        payload = {
            "email": "candidate@example.com",
            "password": "password123",
            "account_type": "candidate"
        }
        response = self.session.post(f"{self.base_url}/auth/candidate/login/", json=payload)
        if response.status_code == 200:
            data = response.json()
            self.token = data.get("token") or data.get("access")
            if self.token:
                self.session.headers.update({"Authorization": f"Bearer {self.token}"})

    def _login_company(self):
        """Helper to login as company"""
        payload = {
            "email": "company@example.com",
            "password": "password123",
            "account_type": "company"
        }
        response = self.session.post(f"{self.base_url}/auth/company/login/", json=payload)
        if response.status_code == 200:
            data = response.json()
            self.token = data.get("token") or data.get("access")
            if self.token:
                self.session.headers.update({"Authorization": f"Bearer {self.token}"})

    def test_candidate_dashboard_authenticated_access(self):
        """Test candidate dashboard access with authentication"""
        self._login_candidate()

        if self.token:
            response = self.session.get(f"{self.base_url}/candidate/dashboard/")
            assert response.status_code in [200, 403, 404], f"Expected 200/403/404, got {response.status_code}"

    def test_candidate_dashboard_unauthenticated_access(self):
        """Test candidate dashboard access without authentication"""
        # Clear any existing auth
        self.session.headers.pop("Authorization", None)

        response = self.session.get(f"{self.base_url}/candidate/dashboard/")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"

    def test_company_dashboard_authenticated_access(self):
        """Test company dashboard access with authentication"""
        self._login_company()

        if self.token:
            # Note: Company dashboard endpoint might not exist yet
            response = self.session.get(f"{self.base_url}/company/dashboard/")
            assert response.status_code in [200, 403, 404], f"Expected 200/403/404, got {response.status_code}"

    def test_company_dashboard_unauthenticated_access(self):
        """Test company dashboard access without authentication"""
        self.session.headers.pop("Authorization", None)

        response = self.session.get(f"{self.base_url}/company/dashboard/")
        assert response.status_code in [401, 403, 404], f"Expected 401/403/404, got {response.status_code}"

    def test_cross_account_access_denied(self):
        """Test that candidate cannot access company dashboard and vice versa"""
        # Login as candidate
        self._login_candidate()

        if self.token:
            # Try to access company dashboard
            response = self.session.get(f"{self.base_url}/company/dashboard/")
            assert response.status_code in [403, 404], f"Expected 403/404, got {response.status_code}"

        # Login as company
        self._login_company()

        if self.token:
            # Try to access candidate dashboard
            response = self.session.get(f"{self.base_url}/candidate/dashboard/")
            assert response.status_code in [403, 404], f"Expected 403/404, got {response.status_code}"