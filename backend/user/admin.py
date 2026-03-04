from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import (
    CandidateProfile,
    Resume,
    Education,
    Experience,
    Skill,
    JobApplication,
)


class ResumeInline(admin.StackedInline):
    """
    Inline resume panel under candidate profiles.
    """
    model = Resume
    extra = 0
    can_delete = True


class EducationInline(admin.TabularInline):
    """
    Inline education entries under candidate profiles.
    """
    model = Education
    extra = 0


class ExperienceInline(admin.TabularInline):
    """
    Inline experience entries under candidate profiles.
    """
    model = Experience
    extra = 0


class SkillInline(admin.TabularInline):
    """
    Inline skills under candidate profiles.
    """
    model = Skill
    extra = 0


class JobApplicationInline(admin.TabularInline):
    """
    Inline applications under candidate profiles.
    """
    model = JobApplication
    extra = 0
    raw_id_fields = ('job',)
    show_change_link = True


@admin.register(CandidateProfile)
class CandidateProfileAdmin(admin.ModelAdmin):
    list_display = (
        'full_name',
        'email',
        'phone',
        'city',
        'state',
        'country',
        'gender',
        'created_at',
    )
    list_filter = (
        'gender',
        'city',
        'state',
        'country',
        'created_at',
    )
    search_fields = (
        'first_name',
        'last_name',
        'email',
        'phone',
        'city',
        'state',
        'country',
    )
    ordering = ('-created_at',)
    inlines = [ResumeInline, EducationInline, ExperienceInline, SkillInline, JobApplicationInline]
    list_per_page = 50
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        (None, {
            'fields': (
                ('first_name', 'last_name'),
                'email',
                'phone',
            )
        }),
        (_('Address'), {
            'fields': (
                'address',
                ('city', 'state', 'country'),
                ('zip_code', 'pincode'),
            )
        }),
        (_('Personal info'), {
            'fields': (
                'dob',
                'age',
                'gender',
                'profile_picture',
            )
        }),
        (_('Profile'), {
            'fields': (
                'taglines',
                'description',
                'portfolio',
                'social_media',
            )
        }),
        (_('Metadata'), {
            'fields': (
                'created_at',
                'updated_at',
            )
        }),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.prefetch_related('skills', 'educations', 'experiences', 'job_applications', 'resumes')


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ('title', 'candidate', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('title', 'candidate__first_name', 'candidate__last_name', 'candidate__email')
    ordering = ('-created_at',)
    raw_id_fields = ('candidate',)
    list_per_page = 50


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = (
        'candidate',
        'degree',
        'institution',
        'field_of_study',
        'is_current',
        'is_verified',
        'is_active',
        'created_at',
    )
    list_filter = (
        'degree',
        'institution',
        'is_current',
        'is_verified',
        'is_active',
        'created_at',
    )
    search_fields = (
        'candidate__first_name',
        'candidate__last_name',
        'candidate__email',
        'degree',
        'institution',
        'field_of_study',
    )
    ordering = ('-created_at',)
    raw_id_fields = ('candidate',)
    list_per_page = 50


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = (
        'candidate',
        'company',
        'position',
        'is_current',
        'is_verified',
        'is_active',
        'created_at',
    )
    list_filter = (
        'company',
        'position',
        'is_current',
        'is_verified',
        'is_active',
        'created_at',
    )
    search_fields = (
        'candidate__first_name',
        'candidate__last_name',
        'candidate__email',
        'company',
        'position',
    )
    ordering = ('-created_at',)
    raw_id_fields = ('candidate',)
    list_per_page = 50


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = (
        'skill',
        'candidate',
        'is_current',
        'is_verified',
        'is_active',
        'created_at',
    )
    list_filter = (
        'is_current',
        'is_verified',
        'is_active',
        'created_at',
    )
    search_fields = (
        'skill',
        'candidate__first_name',
        'candidate__last_name',
        'candidate__email',
    )
    ordering = ('skill',)
    raw_id_fields = ('candidate',)
    prepopulated_fields = {'slug': ('skill',)}
    list_per_page = 50


def mark_selected(modeladmin, request, queryset):
    queryset.update(status='selected')
mark_selected.short_description = _('Mark selected as Selected')


def mark_rejected(modeladmin, request, queryset):
    queryset.update(status='rejected')
mark_rejected.short_description = _('Mark selected as Rejected')


def mark_under_review(modeladmin, request, queryset):
    queryset.update(status='under_review')
mark_under_review.short_description = _('Mark selected as Under review')


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = (
        'job',
        'candidate',
        'status',
        'source',
        'created_at',
    )
    list_filter = (
        'status',
        'job__company_name',
        'job__job_type',
        'job__job_status',
        'created_at',
    )
    search_fields = (
        'job__job_title',
        'job__company_name',
        'candidate__first_name',
        'candidate__last_name',
        'candidate__email',
    )
    ordering = ('-created_at',)
    raw_id_fields = ('job', 'candidate')
    list_per_page = 50
    actions = [mark_selected, mark_rejected, mark_under_review]

    fieldsets = (
        (None, {
            'fields': (
                'job',
                'candidate',
                'status',
            )
        }),
        (_('Details'), {
            'fields': (
                'source',
                'cover_letter',
            )
        }),
        (_('Metadata'), {
            'fields': (
                'created_at',
                'updated_at',
            )
        }),
    )

    readonly_fields = ('created_at', 'updated_at')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('job', 'candidate')