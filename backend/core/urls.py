from django.urls import path , include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, ProfileViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# ---------------- Router for Profile ----------------
router = DefaultRouter()
router.register(r'profile', ProfileViewSet, basename='profile')  # /profile/ endpoints

# ---------------- URL Patterns ----------------
urlpatterns = [
    # JWT Authentication
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # POST username+password -> tokens
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # POST refresh token -> new access token

    # User Registration
    path('register/', RegisterView.as_view(), name='register'),

    # Include router URLs for profile
    path('', include(router.urls)),
]