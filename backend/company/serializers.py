from rest_framework import serializers

from user.models import JobApplication

from .models import CompanyProfile, Job


class CompanyProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = CompanyProfile
        fields = [
            "id",
            "name",
            "description",
            "website",
            "location",
            "logo",
            "user_email",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class JobSerializer(serializers.ModelSerializer):
    applications_count = serializers.IntegerField(read_only=True)
    application_count = serializers.IntegerField(source="applications_count", read_only=True)
    status = serializers.SerializerMethodField()
    view_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Job
        fields = [
            "id",
            "posted_by",
            "company",
            "company_name",
            "job_title",
            "description",
            "location_city",
            "location_state",
            "location_country",
            "job_type",
            "job_status",
            "skills_required",
            "salary_min",
            "salary_max",
            "posting_date",
            "expiration_date",
            "created_at",
            "updated_at",
            "applications_count",
            "application_count",
            "status",
            "view_count",
        ]
        read_only_fields = [
            "id",
            "posted_by",
            "company",
            "company_name",
            "posting_date",
            "created_at",
            "updated_at",
            "applications_count",
            "application_count",
            "status",
            "view_count",
        ]

    def get_status(self, obj):
        return "active" if obj.job_status == "Open" else "closed"


class CompanyJobApplicationSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source="candidate.full_name", read_only=True)
    candidate_email = serializers.EmailField(source="candidate.email", read_only=True)
    email = serializers.EmailField(source="candidate.email", read_only=True)
    phone = serializers.CharField(source="candidate.phone", read_only=True)
    location = serializers.SerializerMethodField()
    job_title = serializers.CharField(source="job.job_title", read_only=True)
    applied_date = serializers.DateTimeField(source="created_at", read_only=True)
    resume_url = serializers.SerializerMethodField()

    class Meta:
        model = JobApplication
        fields = [
            "id",
            "job",
            "job_title",
            "candidate",
            "candidate_name",
            "candidate_email",
            "email",
            "phone",
            "location",
            "status",
            "source",
            "cover_letter",
            "resume_file",
            "resume_url",
            "applied_date",
            "resume_match_score",
            "resume_analysis",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "job",
            "candidate",
            "source",
            "cover_letter",
            "created_at",
            "updated_at",
            "job_title",
            "candidate_name",
            "candidate_email",
            "email",
            "phone",
            "location",
            "resume_url",
            "applied_date",
        ]

    def get_location(self, obj):
        city = getattr(obj.candidate, "city", "") or ""
        country = getattr(obj.candidate, "country", "") or ""
        if city and country:
            return f"{city}, {country}"
        return city or country or None

    def get_resume_url(self, obj):
        if obj.resume_file:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.resume_file.url)
            return obj.resume_file.url
        return None


class CompanyApplicationReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ["status"]

    def validate_status(self, value):
        allowed = {"under_review", "shortlisted", "selected", "rejected"}
        if value not in allowed:
            raise serializers.ValidationError("Invalid review status.")
        return value
