import os
from datetime import timedelta
from pathlib import Path

from environ import Env


# ---------------------[BASE DIRECTORY]-------------------- #
BASE_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_ROOT = BASE_DIR.parent


# ---------------------[ENVIRONMENT CONFIG]-------------------- #
env = Env()
Env.read_env(str(PROJECT_ROOT / ".env"))


# ---------------------[CORE SETTINGS]-------------------- #
SECRET_KEY = env("SECRET_KEY", default="django-insecure-change-me-in-env")
if len(SECRET_KEY) < 32:
    raise ValueError("SECRET_KEY must be at least 32 characters.")

DEBUG = env.bool("DJANGO_DEBUG", default=False)

ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=["127.0.0.1", "localhost"])


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
    "corsheaders",
    "rest_framework",
    "rest_framework.authtoken",
    "rest_framework_simplejwt",
    "core",
    "AdminPanal",
    "user",
    "company",
]


# ---------------------[MIDDLEWARE]-------------------- #
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "backend.middleware.BlockSuspiciousIPMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "django_ratelimit.middleware.RatelimitMiddleware",
]


# ---------------------[CORS/CSRF SETTINGS]-------------------- #
CORS_ALLOW_ALL_ORIGINS = env.bool("CORS_ALLOW_ALL_ORIGINS", default=False)
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])
CORS_ALLOW_CREDENTIALS = env.bool("CORS_ALLOW_CREDENTIALS", default=True)

CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS_ADDRESS", default=[])


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
        "anon": env("DRF_THROTTLE_ANON", default="100/day"),
        "user": env("DRF_THROTTLE_USER", default="1000/day"),
        "login": env("DRF_THROTTLE_LOGIN", default="10/min"),
    },
}


# ---------------------[JWT SETTINGS]-------------------- #
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(
        minutes=env.int("JWT_ACCESS_TOKEN_MINUTES", default=30)
    ),
    "REFRESH_TOKEN_LIFETIME": timedelta(
        days=env.int("JWT_REFRESH_TOKEN_DAYS", default=7)
    ),
    "ROTATE_REFRESH_TOKENS": env.bool("JWT_ROTATE_REFRESH_TOKENS", default=True),
    "BLACKLIST_AFTER_ROTATION": env.bool("JWT_BLACKLIST_AFTER_ROTATION", default=False),
    "AUTH_HEADER_TYPES": tuple(env.list("JWT_AUTH_HEADER_TYPES", default=["Bearer"])),
    "SIGNING_KEY": env("JWT_SIGNING_KEY", default=SECRET_KEY),
}


# ---------------------[SECURITY / RATE LIMIT CONTROL]-------------------- #
RATELIMIT_ENABLE = env.bool("RATELIMIT_ENABLE", default=True)
RATELIMIT_VIEW = "backend.security_views.ratelimited_error"
BLOCKED_IPS = {
    ip.strip()
    for ip in env.list("BLOCKED_IPS", default=[])
    if ip and ip.strip()
}


# ---------------------[URL CONFIG]-------------------- #
ROOT_URLCONF = "backend.urls"


# ---------------------[ADMIN PATH CONFIG]-------------------- #
ADMIN_URL = env("DJANGO_ADMIN_URL", default="admin/")
if ADMIN_URL.startswith("/"):
    ADMIN_URL = ADMIN_URL[1:]
if not ADMIN_URL.endswith("/"):
    ADMIN_URL = f"{ADMIN_URL}/"


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


# ---------------------[WSGI/ASGI]-------------------- #
WSGI_APPLICATION = "backend.wsgi.application"
ASGI_APPLICATION = "backend.asgi.application"


# ---------------------[DATABASE CONFIG]-------------------- #
DB_ENGINE = env("DJANGO_DB_ENGINE", default="django.db.backends.sqlite3")
DB_NAME = env("DJANGO_DB_NAME", default=str(BASE_DIR / "db.sqlite3"))

if DB_ENGINE == "django.db.backends.sqlite3":
    DATABASES = {
        "default": {
            "ENGINE": DB_ENGINE,
            "NAME": DB_NAME,
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": DB_ENGINE,
            "NAME": DB_NAME,
            "USER": env("DJANGO_DB_USER", default=""),
            "PASSWORD": env("DJANGO_DB_PASSWORD", default=""),
            "HOST": env("DJANGO_DB_HOST", default="127.0.0.1"),
            "PORT": env("DJANGO_DB_PORT", default="5432"),
            "CONN_MAX_AGE": env.int("DJANGO_DB_CONN_MAX_AGE", default=60),
        }
    }

    if "postgresql" in DB_ENGINE:
        DATABASES["default"]["OPTIONS"] = {
            "sslmode": env("DJANGO_DB_SSLMODE", default="prefer")
        }


# ---------------------[PASSWORD VALIDATION]-------------------- #
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {
            "min_length": env.int("DJANGO_PASSWORD_MIN_LENGTH", default=8)
        },
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


# ---------------------[STATIC/MEDIA FILES]-------------------- #
STATIC_URL = "/static/"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = env(
    "DJANGO_STATICFILES_STORAGE",
    default="whitenoise.storage.CompressedStaticFilesStorage",
)

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"


# ---------------------[DEFAULT AUTO FIELD]-------------------- #
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ---------------------[UPLOAD LIMITS]-------------------- #
FILE_UPLOAD_MAX_MEMORY_SIZE = env.int("FILE_UPLOAD_MAX_MEMORY_SIZE", default=5242880)
DATA_UPLOAD_MAX_MEMORY_SIZE = env.int("DATA_UPLOAD_MAX_MEMORY_SIZE", default=5242880)
FILE_UPLOAD_PERMISSIONS = 0o644


# ---------------------[EMAIL SETTINGS]-------------------- #
EMAIL_BACKEND = env(
    "DJANGO_EMAIL_BACKEND",
    default="django.core.mail.backends.smtp.EmailBackend",
)
EMAIL_HOST = env("DJANGO_EMAIL_HOST", default="localhost")
EMAIL_PORT = env.int("DJANGO_EMAIL_PORT", default=587)
EMAIL_HOST_USER = env("DJANGO_EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("DJANGO_EMAIL_HOST_PASSWORD", default="")
EMAIL_USE_TLS = env.bool("DJANGO_EMAIL_USE_TLS", default=True)
EMAIL_USE_SSL = env.bool("DJANGO_EMAIL_USE_SSL", default=False)
DEFAULT_FROM_EMAIL = env("DJANGO_DEFAULT_FROM_EMAIL", default="no-reply@jobsarathi.local")


# ---------------------[THIRD-PARTY KEYS]-------------------- #
THIRD_PARTY_API_KEY = env("THIRD_PARTY_API_KEY", default="")
OPENAI_API_KEY = env("OPENAI_API_KEY", default="")


# ---------------------[LOGGING CONFIG]-------------------- #
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
        "security": {
            "handlers": ["console"],
            "level": env("SECURITY_LOG_LEVEL", default="WARNING"),
            "propagate": False,
        },
    },
}


# ---------------------[JAZZMIN ADMIN THEME]-------------------- #
JAZZMIN_SETTINGS = {
    "site_title": "Job Sarathi Admin",
    "site_header": "Job Sarathi",
    "site_brand": "Job Sarathi",
    "welcome_sign": "Welcome to Job Sarathi - Manage your ecosystem with ease",
    "site_logo": None,
    "login_logo": None,
    "login_logo_dark": None,
    "site_icon": None,
    "search_model": [
        "auth.User",
        "company.Job",
        "user.CandidateProfile",
        "user.JobApplication",
    ],
    "topmenu_links": [
        {"name": "Dashboard", "url": "admin:index", "permanent": True},
        {"name": "View Site", "url": "/", "new_window": True},
    ],
    "show_sidebar": True,
    "navigation_expanded": True,
    "hide_apps": [],
    "hide_models": [],
    "order_with_respect_to": [
        "auth",
        "user",
        "company",
        "AdminPanal",
    ],
    "icons": {
        "auth": "fas fa-shield-alt",
        "auth.user": "fas fa-user-circle",
        "auth.group": "fas fa-users",
        "AdminPanal": "fas fa-sliders-h",
        "company": "fas fa-building",
        "company.Job": "fas fa-briefcase",
        "user": "fas fa-user-tie",
        "user.CandidateProfile": "fas fa-id-card",
        "user.JobApplication": "fas fa-paper-plane",
        "user.Resume": "fas fa-file-pdf",
        "user.Education": "fas fa-university",
        "user.Experience": "fas fa-chart-line",
        "user.Skill": "fas fa-code-branch",
    },
    "default_icon_parents": "fas fa-folder-open",
    "default_icon_children": "fas fa-file",
    "related_modal_active": True,
    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {
        "auth.user": "collapsible",
        "user.CandidateProfile": "vertical_tabs",
    },
    "show_ui_builder": False,
    "theme": "flatly",
    "dark_mode_theme": "darkly",
    "use_google_fonts": True,
    "language_chooser": False,
}
