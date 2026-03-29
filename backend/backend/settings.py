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
    # ============================================================
    # TITLE & BRANDING - Modern, Clean, Professional
    # ============================================================
    "site_title": "Job Sarathi Admin",
    "site_header": "Job Sarathi",
    "site_brand": "Job Sarathi",
    
    # Welcome text with a touch of personality
    "welcome_sign": "Welcome to Job Sarathi — Manage your ecosystem with ease",
    
    # Optional: Add custom logo paths if available (use high-quality PNG/SVG)
    "site_logo": None,          # e.g., "images/logo_light.png"
    "login_logo": None,         # e.g., "images/logo_dark.png"
    "login_logo_dark": None,
    "site_icon": None,          # favicon
    
    # ============================================================
    # SEARCH & NAVIGATION - Quick Access to Key Models
    # ============================================================
    "search_model": [
        "auth.User",
        "company.Job",
        "user.CandidateProfile",
        "user.JobApplication",
    ],
    
    "topmenu_links": [
        {"name": "Dashboard", "url": "admin:index", "permanent": True},
        {"name": "Analytics", "url": "admin:index", "permanent": False},  # Placeholder
        {"name": "View Site", "url": "/", "new_window": True},
        {"name": "Support", "url": "/support", "new_window": True},        # Optional
    ],
    
    # ============================================================
    # LAYOUT & SIDEBAR - Streamlined & Expansive
    # ============================================================
    "show_sidebar": True,
    "navigation_expanded": True,          # Keep main sections expanded for productivity
    "hide_apps": [],                      # No apps hidden — full visibility
    "hide_models": [],                    # No models hidden
    "order_with_respect_to": [
        "auth",
        "user",                           # Core user profiles first
        "company",                        # Then company and jobs
        "AdminPanal",                     # Admin utilities
    ],
    
    # ============================================================
    # ICONS - Consistent, Modern, Semantic Icon Set
    # ============================================================
    "icons": {
        # Authentication & Users
        "auth":                    "fas fa-shield-alt",
        "auth.user":               "fas fa-user-circle",
        "auth.group":              "fas fa-users",
        
        # Admin utilities
        "AdminPanal":              "fas fa-sliders-h",
        
        # Company & Jobs
        "company":                 "fas fa-building",
        "company.Job":             "fas fa-briefcase",
        
        # User profile & applications
        "user":                    "fas fa-user-tie",
        "user.CandidateProfile":   "fas fa-id-card",
        "user.JobApplication":     "fas fa-paper-plane",
        "user.Resume":             "fas fa-file-pdf",
        "user.Education":          "fas fa-university",
        "user.Experience":         "fas fa-chart-line",
        "user.Skill":              "fas fa-code-branch",
    },
    
    "default_icon_parents":  "fas fa-folder-open",
    "default_icon_children": "fas fa-file",
    
    # ============================================================
    # UI ENHANCEMENTS - Smooth, Modal, Tabs & More
    # ============================================================
    "related_modal_active": True,                # Modals for related fields (cleaner UX)
    "custom_css": None,                          # Optional path to custom CSS
    "custom_js": None,                           # Optional custom JS
    
    # Form layout: horizontal tabs for cleaner edit forms
    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {
        "auth.user": "collapsible",              # Override for user form if needed
        "user.CandidateProfile": "vertical_tabs",
    },
    
    # ============================================================
    # ADVANCED PRODUCTIVITY TOGGLES
    # ============================================================
    "show_ui_builder": False,                    # Keep off unless developing
    
    # ============================================================
    # COLORS (Optional: can be further customized via custom CSS)
    # ============================================================
    # These are general Jazzmin defaults; you can override them
    # with a custom CSS file for deeper theming.
    "theme": "flatly",                           # 'flatly', 'litera', 'cosmo', etc.
    "dark_mode_theme": "darkly",                 # Optional dark mode
    
    # ============================================================
    # ADDITIONAL TWEAKS FOR POLISH
    # ============================================================
    "show_ui_builder": False,
    "use_google_fonts": True,
    "language_chooser": False,                   # Set to True if multi-language
}