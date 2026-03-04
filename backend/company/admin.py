from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Job


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = (
        'job_title',
        'company_name',
        'job_type',
        'job_status',
        'location_city',
        'location_country',
        'posting_date',
        'created_at',
    )
    list_filter = (
        'job_status',
        'job_type',
        'location_city',
        'location_country',
        'posting_date',
        'created_at',
    )
    search_fields = (
        'job_title',
        'company_name',
        'location_city',
        'location_country',
        'skills_required',
    )
    ordering = ('-created_at',)
    list_per_page = 50
    readonly_fields = ('created_at', 'updated_at', 'posting_date')

    fieldsets = (
        (None, {
            'fields': (
                'company_name',
                'job_title',
                'description',
            )
        }),
        (_('Classification'), {
            'fields': (
                'job_type',
                'job_status',
            )
        }),
        (_('Location'), {
            'fields': (
                'location_city',
                'location_state',
                'location_country',
            )
        }),
        (_('Details'), {
            'fields': (
                'skills_required',
                ('salary_min', 'salary_max'),
                ('posting_date', 'expiration_date'),
            )
        }),
        (_('Metadata'), {
            'fields': (
                'created_at',
                'updated_at',
            )
        }),
    )