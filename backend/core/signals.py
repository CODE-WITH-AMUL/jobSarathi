# core/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Profile  # your profile model


@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    """
    Create or update user profile when user is created/updated.
    Auto-detect role based on CompanyProfile existence for backward compatibility.
    """
    if created:
        # For new users, default role is 'candidate'
        # Role can be explicitly set during registration via UserRegisterSerializer
        profile, _ = Profile.objects.get_or_create(
            user=instance,
            defaults={'role': 'candidate'}
        )
    else:
        # Update existing profile if exists
        if hasattr(instance, 'profile'):
            # If profile doesn't exist, create it
            profile, _ = Profile.objects.get_or_create(user=instance)


@receiver(post_save, sender='company.CompanyProfile')
def update_profile_role_on_company_creation(sender, instance, created, **kwargs):
    """
    When CompanyProfile is created, update the user's profile role to 'company'.
    Maintains backward compatibility with existing company users.
    """
    if created and instance.user:
        profile = instance.user.profile
        if profile.role != 'company':
            profile.role = 'company'
            profile.save(update_fields=['role'])