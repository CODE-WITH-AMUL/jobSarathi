from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase

from company.models import CompanyProfile, Job


class CandidateApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="candidate1",
            email="candidate1@example.com",
            password="StrongPass123",
        )
        self.client.force_authenticate(self.user)

    def test_candidate_dashboard_returns_profile_and_latest_jobs(self):
        Job.objects.create(
            company_name="Acme",
            job_title="Backend Engineer",
            description="Build APIs",
            location_city="Kathmandu",
            location_country="Nepal",
            job_type="Full Time",
            skills_required="Python,Django",
            salary_min=1000,
            salary_max=2000,
        )

        response = self.client.get("/api/candidate/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("profile", response.data)
        self.assertEqual(len(response.data["latest_jobs"]), 1)

    def test_apply_to_job(self):
        job = Job.objects.create(
            company_name="Acme",
            job_title="Frontend Engineer",
            description="Build UI",
            location_city="Kathmandu",
            location_country="Nepal",
            job_type="Full Time",
            skills_required="React",
            salary_min=1000,
            salary_max=2000,
        )

        response = self.client.post(
            "/api/candidate/applications/",
            {
                "job": job.id,
                "source": "Portal",
                "cover_letter": "Interested",
                "resume_file": SimpleUploadedFile("resume.txt", b"python django react", content_type="text/plain"),
            },
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("resume_match_score", response.data)
        self.assertIn("resume_analysis", response.data)

    def test_candidate_can_view_all_available_jobs(self):
        Job.objects.create(
            company_name="Acme",
            job_title="Frontend Engineer",
            description="Build UI",
            location_city="Kathmandu",
            location_country="Nepal",
            job_type="Full Time",
            skills_required="React",
            salary_min=1000,
            salary_max=2000,
        )
        Job.objects.create(
            company_name="Globex",
            job_title="Backend Engineer",
            description="Build API",
            location_city="Pokhara",
            location_country="Nepal",
            job_type="Remote",
            skills_required="Django",
            salary_min=1500,
            salary_max=2500,
        )

        response = self.client.get("/api/candidate/jobs/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_company_user_cannot_access_candidate_application_endpoints(self):
        company_user = User.objects.create_user(
            username="company1",
            email="company1@example.com",
            password="StrongPass123",
        )
        CompanyProfile.objects.create(user=company_user, name="company1")
        self.client.force_authenticate(company_user)

        response = self.client.get("/api/candidate/applications/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_candidate_can_save_and_list_saved_jobs(self):
        job = Job.objects.create(
            company_name="Acme",
            job_title="Data Engineer",
            description="ETL pipelines",
            location_city="Kathmandu",
            location_country="Nepal",
            job_type="Full Time",
            skills_required="Python,SQL",
            salary_min=1000,
            salary_max=2000,
        )
        save_response = self.client.post(
            "/api/candidate/saved-jobs/",
            {"job": job.id},
            format="json",
        )
        self.assertEqual(save_response.status_code, status.HTTP_201_CREATED)

        list_response = self.client.get("/api/candidate/saved-jobs/")
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(list_response.data[0]["job"], job.id)

    def test_job_catalog_filters_by_location(self):
        Job.objects.create(
            company_name="Acme",
            job_title="Data Analyst",
            description="Analyze",
            location_city="Pokhara",
            location_country="Nepal",
            job_type="Full Time",
            skills_required="SQL",
            salary_min=900,
            salary_max=1500,
        )
        response = self.client.get("/api/candidate/jobs/?location=Pokhara")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
