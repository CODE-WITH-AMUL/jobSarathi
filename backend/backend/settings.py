# ---------------------[IMPORTS]-------------------- #
import os
from pathlib import Path
from environ import Env
from django.contrib import admin

# ---------------------[BASE DIRECTORY]-------------------- #
BASE_DIR = Path(__file__).resolve().parent.parent

# ---------------------[ENVIRONMENT CONFIG]-------------------- #
env = Env()
Env.read_env(BASE_DIR / ".env")

SECRET_KEY = env("SECRET_KEY", default="unsafe-secret-key")
DEBUG = env.bool("DJANGO_DEBUG")
ALLOWED_HOSTS = ["*"]

# ---------------------[APPLICATIONS INSTALLED]-------------------- #
INSTALLED_APPS = [
    'jet',
    'jet.dashboard',
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

# Backend/API apps
DJANGO_BACKEND_APPS = [
    "corsheaders",
    "rest_framework",
    "rest_framework.authtoken",
    "rest_framework_simplejwt",
]

# Project apps
EXTRA_APPS = [
    "core",
    "AdminPanal",
    "user",
    "company",
]

INSTALLED_APPS += DJANGO_BACKEND_APPS
INSTALLED_APPS += EXTRA_APPS

# ---------------------[MIDDLEWARE]-------------------- #
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# ---------------------[REST FRAMEWORK CONFIG]-------------------- #
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
        "rest_framework.permissions.IsAuthenticated",
        "rest_framework.permissions.IsAdminUser",
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
        "rest_framework.permissions.DjangoModelPermissions",
        "rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.BasicAuthentication",
    ],
}

# ---------------------[CORS SETTINGS]-------------------- #
CORS_ALLOW_ALL_ORIGINS = True

# ---------------------[URL CONFIG]-------------------- #
ROOT_URLCONF = "backend.urls"

# ---------------------[TEMPLATES]-------------------- #
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ---------------------[WSGI]-------------------- #
WSGI_APPLICATION = "backend.wsgi.application"

# ---------------------[DATABASE CONFIG]-------------------- #
DATABASES = {
    "default": {
        "ENGINE": env("DJANGO_DB_ENGINE"),  # django.db.backends.sqlite3 from .env
        "NAME": BASE_DIR / env("DJANGO_DB_NAME"),  # db.sqlite3 from .env
    }
}

# ---------------------[PASSWORD VALIDATION]-------------------- #
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ---------------------[INTERNATIONALIZATION]-------------------- #
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ---------------------[STATIC FILES]-------------------- #
STATIC_URL = "/static/"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATIC_ROOT = BASE_DIR / "staticfiles"

# ---------------------[MEDIA FILES - UPLOADS]-------------------- #
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ---------------------[DEFAULT AUTO FIELD]-------------------- #
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ---------------------[DJANGO JET SETTINGS]-------------------- #
JET_DEFAULT_THEME = "light-blue"  # modern, clean theme
JET_SIDE_MENU_COMPACT = True      # slim, collapsible sidebar
JET_INDEX_DASHBOARD = "backend.dashboard.CustomIndexDashboard"

# ---------------------[ADMIN BRANDING]-------------------- #
admin.site.site_header = "JobSarathi Admin"
admin.site.site_title = "JobSarathi Admin"
admin.site.index_title = "Job Portal Dashboard"