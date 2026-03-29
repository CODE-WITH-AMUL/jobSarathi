from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase

from company.models import CompanyProfile, Job
from user.models import JobApplication


class CandidateDashboardAliasApiTests(APITestCase):
    def setUp(self):
        self.candidate_user = User.objects.create_user(
            username="candidate_alias",
            email="candidate.alias@example.com",
            password="StrongPass123",
        )
        self.candidate_user.profile.role = "candidate"
        self.candidate_user.profile.save(update_fields=["role"])

        self.company_user = User.objects.create_user(
            username="company_alias",
            email="company.alias@example.com",
            password="StrongPass123",
        )
        self.company_user.profile.role = "company"
        self.company_user.profile.save(update_fields=["role"])

        self.company_profile, _ = CompanyProfile.objects.get_or_create(
            user=self.company_user,
            defaults={"name": "Alias Company"},
        )

        self.job = Job.objects.create(
            posted_by=self.company_user,
            company=self.company_profile,
            company_name=self.company_profile.name,
            job_title="Backend Engineer",
            description="Build APIs",
            location_city="Kathmandu",
            location_country="Nepal",
            job_type="Full Time",
            skills_required="Python,Django",
            salary_min=1000,
            salary_max=2000,
            job_status="Open",
        )

        self.client.force_authenticate(self.candidate_user)

    def test_jobs_alias_list_and_detail_endpoints(self):
        list_response = self.client.get("/api/jobs/")
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertIn("results", list_response.data)
        self.assertEqual(list_response.data["count"], 1)

        detail_response = self.client.get(f"/api/jobs/{self.job.id}/")
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.data["id"], self.job.id)
        self.assertEqual(detail_response.data["company_name"], self.company_profile.name)

    def test_candidate_profile_update_alias_supports_dashboard_payload(self):
        resume = SimpleUploadedFile(
            "candidate_resume.pdf",
            b"%PDF-1.4 dashboard resume",
            content_type="application/pdf",
        )

        response = self.client.patch(
            "/api/candidate/profile/update/",
            {
                "full_name": "Candidate Alias",
                "phone": "9800000000",
                "location": "Kathmandu, Nepal",
                "skills": "Python, React",
                "experience": "3 years building API services.",
                "education": "Bachelor in Computer Science",
                "resume": resume,
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["full_name"], "Candidate Alias")
        self.assertEqual(response.data["email"], self.candidate_user.email)
        self.assertIn("Python", response.data["skills"])
        self.assertTrue(response.data["resume"].endswith(".pdf"))

    def test_apply_alias_prevents_duplicate_applications(self):
        first_resume = SimpleUploadedFile(
            "apply_resume.pdf",
            b"%PDF-1.4 first application",
            content_type="application/pdf",
        )

        first_response = self.client.post(
            "/api/applications/apply/",
            {
                "job_id": self.job.id,
                "resume": first_resume,
                "cover_letter": "I am interested in this role.",
            },
            format="multipart",
        )
        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(JobApplication.objects.filter(job=self.job).count(), 1)

        second_response = self.client.post(
            "/api/applications/apply/",
            {"job_id": self.job.id},
            format="multipart",
        )
        self.assertEqual(second_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("already applied", str(second_response.data).lower())

    def test_company_user_cannot_apply_through_candidate_alias(self):
        self.client.force_authenticate(self.company_user)
        response = self.client.post(
            "/api/applications/apply/",
            {"job_id": self.job.id},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
