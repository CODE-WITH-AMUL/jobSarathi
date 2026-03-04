#--------------------------[IMPORT MODEL]---------------------#
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework import viewsets
from .serializers import ProfileSerializer , UserRegisterSerializer
from .models import Profile


class RegisterView(APIView):
    permission_classes = [AllowAny]
    serializer_class = UserRegisterSerializer


class ProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own profile
        return Profile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Ensure profile is linked to the logged-in user
        serializer.save(user=self.request.user)