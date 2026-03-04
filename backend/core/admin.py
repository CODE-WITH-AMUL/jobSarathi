from django.contrib import admin
from .models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    fields = [field.name for field in Profile._meta.fields]
    readonly_fields = ('created_at', 'updated_at')   # keep timestamps read-only
    list_display = ('user', 'bio', 'location', 'phone', 'created_at', 'updated_at')
    search_fields = ('user__username', 'user__email', 'location', 'phone')
    list_filter = ('created_at', 'updated_at')