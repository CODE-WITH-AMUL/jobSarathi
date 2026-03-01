#-----------------[IMPORTS]---------------------#
from django.db import models
from company.models import Job
#-----------------[CHOICES]---------------------#
GENDER_CHOICES = [
    ('Male', 'Male'),
    ('Female', 'Female'),
    ('Other', 'Other'),
    ('Prefer not to say', 'Prefer not to say'),
]

JOB_STATUS_CHOICES = [
    ('Pending', 'Pending'),
    ('Interview', 'Interview'),
    ('Selected', 'Selected'),
    ('Rejected', 'Rejected'),
    ('On Hold', 'On Hold'), 
]

USER_STATUS_CHOICES = [
    ('Active', 'Active'),
    ('Inactive', 'Inactive'),
]

DEGREE_CHOICES = [
    ('Bachelors', 'Bachelors'),
    ('Masters', 'Masters'),
    ('PhD', 'PhD'),
    ('Diploma', 'Diploma'),
    ('Certificate', 'Certificate'),
    ('Post Graduation', 'Post Graduation'),
    ('Under Graduation', 'Under Graduation'),
    ('Other', 'Other'),
]

#-----------------[TIME STAMP MODEL]------------------#
class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']

#-----------------[SOCIAL MEDIA MODEL]------------------#
class SocialMedia(models.Model):
    facebook = models.URLField(unique=True, blank=True, null=True)
    instagram = models.URLField(unique=True, blank=True, null=True)
    twitter = models.URLField(unique=True, blank=True, null=True)
    linkedin = models.URLField(unique=True, blank=True, null=True)
    youtube = models.URLField(unique=True, blank=True, null=True)
    tiktok = models.URLField(unique=True, blank=True, null=True)
    reddit = models.URLField(unique=True, blank=True, null=True)
    pinterest = models.URLField(unique=True, blank=True, null=True)
    github = models.URLField(unique=True, blank=True, null=True)
    website = models.URLField(unique=True, blank=True, null=True)
    other = models.URLField(unique=True, blank=True, null=True)

    class Meta:
        verbose_name = "SocialMedia"
        verbose_name_plural = "SocialMedias"

    def __str__(self):
        return f"SocialMedia {self.id}"

#-----------------[CANDIDATE PROFILE MODEL]------------------#
class CandidateProfile(TimeStampedModel):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=20, unique=True)
    address = models.TextField()
    city = models.CharField(max_length=255)
    state = models.CharField(max_length=225, blank=True, null=True)
    country = models.CharField(max_length=255)
    zip_code = models.CharField(max_length=20)
    pincode = models.CharField(max_length=20)
    dob = models.DateField()
    age = models.PositiveIntegerField()
    gender = models.CharField(max_length=50, choices=GENDER_CHOICES)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)
    taglines = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    portfolio = models.URLField(blank=True, null=True)
    social_media = models.ForeignKey(SocialMedia, on_delete=models.SET_NULL, blank=True, null=True, related_name="candidates")

    class Meta:
        verbose_name = "CandidateProfile"
        verbose_name_plural = "CandidateProfiles"
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['phone']),
            models.Index(fields=['first_name']),
            models.Index(fields=['last_name']),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
#-----------------[RESUME MODEL]------------------#
class Resume(TimeStampedModel):
    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='resumes'
    )
    file = models.FileField(upload_to='resumes/')
    title = models.CharField(max_length=255, blank=True, null=True)  
    is_active = models.BooleanField(default=True) 

    class Meta:
        verbose_name = "Resume"
        verbose_name_plural = "Resumes"
        indexes = [models.Index(fields=['candidate'])]

    def __str__(self):
        return f"{self.candidate.first_name} - {self.title or 'Resume'}"
#-----------------[EDUCATION MODEL]------------------#
class Education(TimeStampedModel):
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='educations')
    degree = models.CharField(max_length=225, choices=DEGREE_CHOICES)
    institution = models.CharField(max_length=225, blank=True, null=True)
    field_of_study = models.CharField(max_length=225, blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_current = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        indexes = [
            models.Index(fields=['degree']),
            models.Index(fields=['institution']),
        ]

    def __str__(self):
        return f"{self.degree} - {self.institution}"

#-----------------[SKILLS MODEL]------------------#
class Skill(TimeStampedModel):
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='skills')
    skill = models.CharField(max_length=225)
    description = models.TextField(blank=True, null=True)
    is_current = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        indexes = [models.Index(fields=['skill'])]

    def __str__(self):
        return self.skill

#-----------------[EXPERIENCE MODEL]------------------#
class Experience(TimeStampedModel):
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='experiences')
    company = models.CharField(max_length=225)
    position = models.CharField(max_length=225)
    description = models.TextField(blank=True, null=True)
    is_current = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        indexes = [
            models.Index(fields=['company']),
            models.Index(fields=['position']),
        ]

    def __str__(self):
        return f"{self.position} at {self.company}"

#-----------------[JOB APPLICATION MODEL]------------------#
class JobApplication(TimeStampedModel):
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='job_applications')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    cover_letter = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Application by {self.candidate} for Job {self.job.id}"