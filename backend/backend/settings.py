# ---------------------[IMPORTS]-------------------- #
import os
from pathlib import Path
from environ import Env

# ---------------------[BASE DIRECTORY]-------------------- #
BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent

# ---------------------[ENVIRONMENT CONFIG]-------------------- #
env = Env()

# Load .env from project root
Env.read_env(PROJECT_ROOT / ".env")

SECRET_KEY = env("SECRET_KEY", default="unsafe-secret-key")
DEBUG = env.bool("DJANGO_DEBUG", default=True)

ALLOWED_HOSTS = env.list(
    "DJANGO_ALLOWED_HOSTS",
    default=["localhost", "127.0.0.1"]
)

# ---------------------[APPLICATIONS INSTALLED]-------------------- #
INSTALLED_APPS = [
    "jazzmin",

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


# ---------------------[REST FRAMEWORK CONFIG]-------------------- #
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
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
        "ENGINE": env(
            "DJANGO_DB_ENGINE",
            default="django.db.backends.sqlite3"
        ),

        "NAME": PROJECT_ROOT / env(
            "DJANGO_DB_NAME",
            default="db.sqlite3"
        ),
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


# ---------------------[SECURITY FOR DEPLOYMENT]-------------------- #
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

CSRF_TRUSTED_ORIGINS = [
    "https://*.vercel.app",
    "https://*.onrender.com",
]


# ---------------------[JAZZMIN ADMIN THEME]-------------------- #
JAZZMIN_SETTINGS = {
    "site_title": "Job Sarathi Admin",
    "site_header": "Job Sarathi",
    "site_brand": "Job Sarathi",

    "welcome_sign": "Welcome to Job Sarathi Admin",

    "site_logo": None,
    "login_logo": None,
    "login_logo_dark": None,
    "site_icon": None,

    "search_model": [
        "auth.User",
        "company.Job"
    ],

    "topmenu_links": [
        {"name": "Dashboard", "url": "admin:index"},
        {"name": "View site", "url": "/", "new_window": True},
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
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.group": "fas fa-users",

        "AdminPanal": "fas fa-cog",

        "company": "fas fa-building",
        "company.Job": "fas fa-briefcase",

        "user": "fas fa-user-tie",
        "user.CandidateProfile": "fas fa-id-badge",
        "user.JobApplication": "fas fa-file-signature",
        "user.Resume": "fas fa-file-alt",
        "user.Education": "fas fa-graduation-cap",
        "user.Experience": "fas fa-briefcase",
        "user.Skill": "fas fa-star",
    },

    "default_icon_parents": "fas fa-chevron-right",
    "default_icon_children": "fas fa-circle",

    "related_modal_active": True,

    "changeform_format": "horizontal_tabs",

    "custom_css": "css/admin-custom.css",
}


# ---------------------[JAZZMIN UI TWEAKS]-------------------- #
JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": True,

    "body_small_text": False,
    "brand_small_text": False,

    "brand_colour": "navbar-primary",
    "accent": "accent-primary",

    "navbar": "navbar-white navbar-light",

    "no_navbar_border": False,
    "navbar_fixed": True,

    "layout_boxed": False,

    "footer_fixed": False,

    "sidebar_fixed": True,

    "sidebar": "sidebar-dark-primary",

    "sidebar_nav_small_text": False,

    "sidebar_disable_expand": False,

    "sidebar_nav_child_indent": True,

    "sidebar_nav_compact_style": False,

    "sidebar_nav_legacy_style": False,

    "sidebar_nav_flat_style": False,

    "theme": "default",
    "dark_mode_theme": None,

    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success",
    },

    "actions_sticky_top": True,
}