from django.contrib.auth.models import User
from django.db import models


ROLE_CHOICES = [
    ('candidate', 'Candidate'),
    ('company', 'Company / Employer'),
]


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='candidate',
        db_index=True,
        help_text="User role determines access permissions and available features"
    )
    bio = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(upload_to="profile_avatars/", blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f"{self.user.username}'s Profile ({self.get_role_display()})"
    
    @property
    def is_candidate(self):
        return self.role == 'candidate'
    
    @property
    def is_company(self):
        return self.role == 'company'
