from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from company.models import CompanyProfile, Job
from user.models import CandidateProfile, JobApplication


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
