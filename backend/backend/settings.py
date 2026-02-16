import os
from environ import Env
from pathlib import Path

env = Env()

BASE_DIR = Path(__file__).resolve().parent.parent

# django-environ expects a file path or file-like object; pass a string path
env.read_env(str(BASE_DIR.parent / ".env"))




SECRET_KEY = env('DAJNGO_SECRET_KEY', default='unsafe-secret-key')


# Read DEBUG as a boolean, default to False
DEBUG = env.bool('DAJNGO_DEBUG', default=False)

ALLOWED_HOSTS = ['*']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    
    # This app path is for the apis to interact with the frontend
    'corsheaders',
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
]

'''
This is an extra app where we store the list of the path
'''
EXTRA_APPS = [
    'core',
]

INSTALLED_APPS += EXTRA_APPS

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    "corsheaders.middleware.CorsMiddleware",
]

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    'DEFAULT_AUTHENTICATION_CLASSES': ('rest_framework_simplejwt.authentication.JWTAuthentication',),
}

CORS_ALLOW_ALL_ORIGINS = True

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'



DATABASES = {
    'default': {
        'ENGINE': env('DAJNGO_DB_ENGINE', default='django.db.backends.sqlite3'),
        'NAME': env('DAJNGO_DB_NAME', default=str(BASE_DIR / 'db.sqlite3')),
    }
}


# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = 'static/'
