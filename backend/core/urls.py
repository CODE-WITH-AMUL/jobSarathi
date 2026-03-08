from django.urls import path , include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, ProfileViewSet, EmailOrUsernameTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

# ---------------- Router for Profile ----------------
router = DefaultRouter()
router.include_format_suffixes = False
router.register(r'profile', ProfileViewSet, basename='profile')  # /profile/ endpoints

# ---------------- URL Patterns ----------------
urlpatterns = [
    # JWT Authentication
    path('login/', EmailOrUsernameTokenObtainPairView.as_view(), name='token_obtain_pair'),  # POST username/email + password -> tokens
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # POST refresh token -> new access token

    # User Registration
    path('register/', RegisterView.as_view(), name='register'),

    # Include router URLs for profile
    path('', include(router.urls)),
]
