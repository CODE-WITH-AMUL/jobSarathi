#--------------------------------[IMPORTS MODELS]--------------------------------#
from django.shortcuts import render
from django.shortcuts import redirect
from rest_framework import permissions
from rest_framework.permissions import AllowAny, IsAdminUser
from .serializers import WebsiteSettingsSerializer
from .models import WebsiteSettings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


#-----------------[SETINGS CODE]--------------------------------#
class WebsiteSettingsViews(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, *args, **kwargs):
        settings = WebsiteSettings.objects.first()
        if not settings:
            return Response({"detail": "Website settings not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = WebsiteSettingsSerializer(settings)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        # Only allow creating if no settings exist
        if WebsiteSettings.objects.exists():
            return Response({"detail": "Settings already exist. Use PUT to update."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = WebsiteSettingsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, *args, **kwargs):
        settings = WebsiteSettings.objects.first()
        if not settings:
            return Response({"detail": "Settings not found. Use POST to create."}, status=status.HTTP_404_NOT_FOUND)

        serializer = WebsiteSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        settings = WebsiteSettings.objects.first()
        if not settings:
            return Response({"detail": "Settings not found."}, status=status.HTTP_404_NOT_FOUND)
        settings.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Public read-only endpoint for frontend (logo + name when admin changes them)
class PublicWebsiteSettingsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        settings = WebsiteSettings.objects.first()
        if not settings:
            return Response({"name": None, "logo": None}, status=status.HTTP_200_OK)
        logo_url = request.build_absolute_uri(settings.logo.url) if settings.logo else None
        return Response({"name": settings.name, "logo": logo_url}, status=status.HTTP_200_OK)