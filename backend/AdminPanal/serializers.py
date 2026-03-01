#--------------------------------[IMPORTS MODELS]--------------------------------#
from rest_framework import serializers
from .models import WebsiteSettings

#--------------------------------[SERIALIZERS]--------------------------------#
class WebsiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebsiteSettings
        fields = "__all__"
        
        verbose_name = "Website Settings"
        verbose_name_plural = "Website Settings"
        
        