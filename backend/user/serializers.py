import re

from rest_framework import serializers

from company.models import Job

from .models import CandidateProfile, Education, Experience, JobApplication, Resume, SavedJob, Skill


class CandidateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateProfile
        exclude = ["social_media"]
        read_only_fields = ["id", "user", "created_at", "updated_at"]


class CandidateDashboardProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()
    experience = serializers.SerializerMethodField()
    education = serializers.SerializerMethodField()
    resume_url = serializers.SerializerMethodField()

    class Meta:
        model = CandidateProfile
        fields = [
            "id",
            "full_name",
            "first_name",
            "last_name",
            "email",
            "phone",
            "location",
            "city",
            "state",
            "country",
            "address",
            "resume",
            "resume_url",
            "skills",
            "experience",
            "education",
        ]
        read_only_fields = [
            "id",
            "email",
            "resume_url",
        ]

    def get_full_name(self, obj):
        return obj.full_name

    def get_location(self, obj):
        parts = [obj.city, obj.state, obj.country]
        cleaned = [part.strip() for part in parts if part and str(part).strip()]
        return ", ".join(cleaned)

    def get_skills(self, obj):
        return list(obj.skills.values_list("skill", flat=True))

    def get_experience(self, obj):
        latest = obj.experiences.order_by("-updated_at", "-created_at").first()
        if latest and latest.description:
            return latest.description
        return obj.description or ""

    def get_education(self, obj):
        latest = obj.educations.order_by("-updated_at", "-created_at").first()
        if latest and latest.description:
            return latest.description
        if latest and latest.institution:
            return latest.institution
        return obj.taglines or ""

    def get_resume_url(self, obj):
        if not obj.resume:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.resume.url)
        return obj.resume.url


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = "__all__"
        read_only_fields = ["id", "candidate", "created_at", "updated_at"]


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = "__all__"
        read_only_fields = ["id", "candidate", "created_at", "updated_at"]


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = "__all__"
        read_only_fields = ["id", "candidate", "created_at", "updated_at"]


class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = "__all__"
        read_only_fields = ["id", "candidate", "created_at", "updated_at"]


class JobListSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            "id",
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
            "status",
        ]

    def get_status(self, obj):
        return "active" if obj.job_status == "Open" else "closed"


class JobApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source="job.job_title", read_only=True)
    company_name = serializers.CharField(source="job.company_name", read_only=True)
    applied_date = serializers.DateTimeField(source="created_at", read_only=True)
    resume_url = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()

    class Meta:
        model = JobApplication
        fields = [
            "id",
            "candidate",
            "job",
            "job_title",
            "company_name",
            "status",
            "source",
            "cover_letter",
            "resume_file",
            "resume_url",
            "location",
            "applied_date",
            "resume_match_score",
            "resume_analysis",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "candidate",
            "status",
            "created_at",
            "updated_at",
            "job_title",
            "company_name",
            "resume_match_score",
            "resume_analysis",
            "resume_url",
            "location",
            "applied_date",
        ]

    def get_resume_url(self, obj):
        if obj.resume_file:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.resume_file.url)
            return obj.resume_file.url
        return None

    def get_location(self, obj):
        city = getattr(obj.job, "location_city", "") or ""
        country = getattr(obj.job, "location_country", "") or ""
        if city and country:
            return f"{city}, {country}"
        return city or country or None

    def validate_job(self, value):
        if value.job_status != "Open":
            raise serializers.ValidationError("You can only apply to open jobs.")
        return value

    def validate(self, attrs):
        attrs = super().validate(attrs)
        if self.instance is None:
            candidate = attrs.get("candidate")
            job = attrs.get("job")
            uploaded_resume = attrs.get("resume_file")

            if candidate and job and JobApplication.objects.filter(candidate=candidate, job=job).exists():
                raise serializers.ValidationError({"job": "You have already applied to this job."})

            if not uploaded_resume and candidate and not candidate.resume:
                raise serializers.ValidationError({"resume_file": "Resume is required to apply."})
        return attrs

    def create(self, validated_data):
        application = super().create(validated_data)
        self._run_resume_analysis(application)
        return application

    def _run_resume_analysis(self, application):
        resume_file = application.resume_file or application.candidate.resume
        if not resume_file:
            return

        try:
            resume_file.open("rb")
            resume_text = resume_file.read().decode("utf-8", errors="ignore").lower()
        except Exception:
            resume_text = ""
        finally:
            try:
                resume_file.close()
            except Exception:
                pass

        skills_raw = application.job.skills_required or ""
        skills = [s.strip().lower() for s in re.split(r"[,\n;/]+", skills_raw) if s.strip()]

        if not skills:
            application.resume_match_score = 0
            application.resume_analysis = "No required skills were defined for this job."
            application.save(update_fields=["resume_match_score", "resume_analysis", "updated_at"])
            return

        matched = [skill for skill in skills if skill in resume_text]
        score = int((len(matched) / len(skills)) * 100)
        missing = [skill for skill in skills if skill not in matched]
        application.resume_match_score = score
        application.resume_analysis = (
            f"Matched {len(matched)} of {len(skills)} required skills. "
            f"Matched: {', '.join(matched) if matched else 'none'}. "
            f"Missing: {', '.join(missing[:8]) if missing else 'none'}."
        )
        application.save(update_fields=["resume_match_score", "resume_analysis", "updated_at"])


class SavedJobSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source="job.job_title", read_only=True)
    company_name = serializers.CharField(source="job.company_name", read_only=True)

    class Meta:
        model = SavedJob
        fields = [
            "id",
            "candidate",
            "job",
            "job_title",
            "company_name",
            "created_at",
        ]
        read_only_fields = ["id", "candidate", "job_title", "company_name", "created_at"]

    def validate_job(self, value):
        if value.job_status != "Open":
            raise serializers.ValidationError("You can only save open jobs.")
        return value
