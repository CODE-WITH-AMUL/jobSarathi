# ---------------------[IMPORTS]-------------------- #
import os
from pathlib import Path
from datetime import timedelta
from environ import Env
# from .security import *

# ---------------------[BASE DIRECTORY]-------------------- #
BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent

# ---------------------[ENVIRONMENT CONFIG]-------------------- #
env = Env()

# Load .env from project root
Env.read_env(str(PROJECT_ROOT / ".env"))

SECRET_KEY = env("SECRET_KEY")
DEBUG = env.bool("DJANGO_DEBUG")
# Prevent weak JWT signing keys in local misconfigured .env files.
if len(SECRET_KEY) < 32:
    if DEBUG:
        SECRET_KEY = (SECRET_KEY + "-dev-unsafe-key-padding-please-change-me").ljust(32, "_")
    else:
        raise ValueError("SECRET_KEY must be at least 32 characters in production.")

# ---------------------[APPLICATIONS INSTALLED]-------------------- #
INSTALLED_APPS = [
    "jazzmin",
    "django_cleanup",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

# Backend / API apps
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
    "whitenoise.middleware.WhiteNoiseMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ---------------------[CSRF SETTINGS]-------------------- #
CSRF_TRUSTED_ORIGINS=env.list("CSRF_TRUSTED_ORIGINS_ADDRESS")


# ---------------------[REST FRAMEWORK CONFIG]-------------------- #
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.BasicAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
        "rest_framework.parsers.FormParser",
        "rest_framework.parsers.MultiPartParser",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/day",
        "user": "1000/day",
    },
}


SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": False,
    "AUTH_HEADER_TYPES": ("Bearer",),
}


# ---------------------[CORS SETTINGS]-------------------- #
CORS_ALLOW_ALL_ORIGINS = env.bool("CORS_ALLOW_ALL_ORIGINS", default=True)
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])


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
# -------------------------
# DATABASE CONFIGURATION
# -------------------------
DATABASES = {
    "default": {
        "ENGINE": env("DJANGO_DB_ENGINE"),
        "NAME": env("DJANGO_DB_NAME"),
    }
}

# ---------------------[PASSWORD VALIDATION]-------------------- #
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },

    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"
    },

    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"
    },

    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"
    },
]


# ---------------------[INTERNATIONALIZATION]-------------------- #
LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# ---------------------[STATIC FILES]-------------------- #
STATIC_URL = "/static/"

STATICFILES_DIRS = [
    BASE_DIR / "static"
]

STATIC_ROOT = BASE_DIR / "staticfiles"


# ---------------------[MEDIA FILES - UPLOADS]-------------------- #
MEDIA_URL = "/media/"

MEDIA_ROOT = BASE_DIR / "media"


# ---------------------[DEFAULT AUTO FIELD]-------------------- #
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# File upload settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
FILE_UPLOAD_PERMISSIONS = 0o644

# Logging configuration
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {
        "ignore_dev_https_noise": {
            "()": "backend.logging_filters.IgnoreDevServerHTTPSNoise",
        },
    },
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "level": "INFO",
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
        "django_server_console": {
            "level": "INFO",
            "class": "logging.StreamHandler",
            "formatter": "verbose",
            "filters": ["ignore_dev_https_noise"],
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": True,
        },
        "django.server": {
            "handlers": ["django_server_console"],
            "level": "INFO",
            "propagate": False,
        },
        "profiles": {
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": True,
        },
    },
}
# ---------------------[SECURITY FOR DEPLOYMENT]-------------------- #
# SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Extend CSRF_TRUSTED_ORIGINS for production
# CSRF_TRUSTED_ORIGINS += [
#     "https://*.vercel.app",
#     "https://*.onrender.com",
# ]


# ---------------------[JAZZMIN ADMIN THEME]-------------------- #
# ─────────────────────────────────────────────────────────────
# JAZZMIN ADMIN THEME — Job Sarathi (Production-Ready)
# ─────────────────────────────────────────────────────────────
JAZZMIN_SETTINGS = {
    "site_title": "Job Sarathi Admin",
    "site_header": "Job Sarathi",
    "site_brand": "Job Sarathi",

    "welcome_sign": "Welcome to the Job Sarathi Admin Panel",

    "site_logo": None,
    "login_logo": None,
    "login_logo_dark": None,
    "site_icon": None,

    "search_model": [
        "auth.User",
        "company.Job",
    ],

    "topmenu_links": [
        {"name": "Dashboard", "url": "admin:index"},
        {"name": "View Site", "url": "/", "new_window": True},
    ],

    "show_sidebar": True,
    "navigation_expanded": True,

    "order_with_respect_to": [
        "auth",
        "AdminPanal",
        "company",
        "user",
    ],

    "icons": {
        "auth":                    "fas fa-users-cog",
        "auth.user":               "fas fa-user",
        "auth.group":              "fas fa-users",

        "AdminPanal":              "fas fa-cog",

        "company":                 "fas fa-building",
        "company.Job":             "fas fa-briefcase",

        "user":                    "fas fa-user-tie",
        "user.CandidateProfile":   "fas fa-id-badge",
        "user.JobApplication":     "fas fa-file-signature",
        "user.Resume":             "fas fa-file-alt",
        "user.Education":          "fas fa-graduation-cap",
        "user.Experience":         "fas fa-briefcase",
        "user.Skill":              "fas fa-star",
    },

    "default_icon_parents":  "fas fa-chevron-right",
    "default_icon_children": "fas fa-circle",

    "related_modal_active": True,

    "changeform_format": "horizontal_tabs",

    "custom_css": "css/admin-custom.css",
}





