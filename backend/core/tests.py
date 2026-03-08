from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase


class AuthFlowTests(APITestCase):
    def test_register_then_login_with_email(self):
        register_payload = {
            "username": "alice",
            "email": "alice@example.com",
            "password": "StrongPass123",
            "confirm_password": "StrongPass123",
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
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)
