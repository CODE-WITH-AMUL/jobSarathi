"""Company app domain models."""

from django.conf import settings
from django.db import models


#-----------------------[STATUS TYPES]-----------------#
JOB_TYPE = [
    ('Remote', 'Remote'),
    ('Full Time', 'Full Time'),
    ('Part Time', 'Part Time'),
    ('Internship', 'Internship'),
]

JOB_STATUS_CHOICES = [
    ('Open', 'Open'),
    ('Closed', 'Closed'),
]


#------------------------[TIME STAMP]------------------------#
class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']



#--------------------------[JOB MODELS]-----------------------------#
class CompanyProfile(TimeStampedModel):
    """Profile managed by a company account."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="company_profile",
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    logo = models.ImageField(upload_to="company_logos/", blank=True, null=True)

    class Meta:
        verbose_name = "Company profile"
        verbose_name_plural = "Company profiles"
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["location"]),
        ]

    def __str__(self):
        return self.name


class Job(TimeStampedModel):
    """Published job post."""

    posted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="posted_jobs",
        null=True,
        blank=True,
    )
    company = models.ForeignKey(
        CompanyProfile,
        on_delete=models.SET_NULL,
        related_name="jobs",
        null=True,
        blank=True,
    )
    company_name = models.CharField(max_length=255)
    job_title = models.CharField(max_length=250)
    description = models.TextField()
    location_city = models.CharField(max_length=255)
    location_state = models.CharField(max_length=255, blank=True, null=True)
    location_country = models.CharField(max_length=255)
    job_type = models.CharField(max_length=50, choices=JOB_TYPE)
    job_status = models.CharField(max_length=50, choices=JOB_STATUS_CHOICES, default='Open')
    
    skills_required = models.CharField(max_length=250)
    salary_min = models.DecimalField(max_digits=10, decimal_places=2)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2)
    
    posting_date = models.DateField(auto_now_add=True)
    expiration_date = models.DateField(blank=True, null=True)
    
    class Meta:
        verbose_name = 'Job'
        verbose_name_plural = 'Jobs'
        indexes = [
            models.Index(fields=['job_title']),
            models.Index(fields=['company_name']),
            models.Index(fields=['location_city']),
        ]
    
    def __str__(self):
        return f"{self.job_title} - {self.company_name}"
