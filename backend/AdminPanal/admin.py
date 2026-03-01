from django.contrib import admin
from django.shortcuts import redirect
from django.urls import path, reverse
from .models import WebsiteSettings


@admin.register(WebsiteSettings)
class WebsiteSettingsAdmin(admin.ModelAdmin):
    list_display = ("name", "logo")
    fields = ("logo", "name")

    def has_add_permission(self, request):
        # Same as API: only allow create if no settings exist
        return not WebsiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        # Same as API: allow delete when settings exist
        return True

    def changelist_view(self, request, extra_context=None):
        # Same logic as API: one settings object — go straight to it or to add
        count = WebsiteSettings.objects.count()
        if count == 0:
            return redirect(reverse("admin:AdminPanal_websitesettings_add"))
        if count == 1:
            obj = WebsiteSettings.objects.first()
            return redirect(
                reverse("admin:AdminPanal_websitesettings_change", args=[obj.pk])
            )
        return super().changelist_view(request, extra_context)
