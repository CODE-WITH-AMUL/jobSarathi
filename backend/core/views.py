from django.db import OperationalError
from rest_framework import status, viewsets
from rest_framework.exceptions import APIException
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from company.models import CompanyProfile

from .models import Profile
from .serializers import (
    EmailOrUsernameTokenObtainPairSerializer,
    ProfileSerializer,
    ProfileUpdateSerializer,
    UserRegisterSerializer,
)

class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenObtainPairSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]
    serializer_class = UserRegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        role = "company" if CompanyProfile.objects.filter(user=user).exists() else "candidate"
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": role,
            },
            status=status.HTTP_201_CREATED,
        )


class ProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            profile, _ = Profile.objects.get_or_create(user=self.request.user)
        except OperationalError as exc:
            if "no such column: core_profile.avatar" in str(exc):
                raise APIException("Database schema is outdated. Run: python manage.py migrate")
            raise
        return Profile.objects.filter(pk=profile.pk)

    def get_serializer_class(self):
        if self.action in ["update", "partial_update", "create"]:
            return ProfileUpdateSerializer
        return ProfileSerializer
