from django.contrib import admin

from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "phone", "location", "created_at", "updated_at"]
    search_fields = ["user__username", "user__email", "phone", "location"]
    readonly_fields = ["created_at", "updated_at"]
