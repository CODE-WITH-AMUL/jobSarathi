# """
# Centralized security settings for Django production deployment.
# Import this file in your main settings.py with:
#     from .security import *
# """

# from pathlib import Path
# from environ import Env

# # ---------------------[BASE DIRECTORY]-------------------- #
# BASE_DIR = Path(__file__).resolve().parent.parent
# PROJECT_ROOT = BASE_DIR.parent

# # ---------------------[ENVIRONMENT CONFIG]-------------------- #
# env = Env()

# # Load .env from project root
# Env.read_env(str(PROJECT_ROOT / ".env"))

# # -------------------------
# # SSL / HTTPS
# # -------------------------
# SECURE_SSL_REDIRECT = env.bool('SECURE_SSL_REDIRECT_KEY')
# SESSION_COOKIE_SECURE = env.bool('SESSION_COOKIE_SECURE_KEY')
# CSRF_COOKIE_SECURE = env.bool('CSRF_COOKIE_SECURE_KEY')
# SECURE_HSTS_SECONDS = env.int('SECURE_HSTS_SECONDS_KEY')  
# SECURE_HSTS_INCLUDE_SUBDOMAINS = env.bool('SECURE_HSTS_INCLUDE_SUBDOMAINS_KEY')
# SECURE_HSTS_PRELOAD = env.bool('SECURE_HSTS_PRELOAD_KEY')

# # -------------------------
# # Clickjacking Protection
# # -------------------------
# X_FRAME_OPTIONS = env.str('X_FRAME_OPTIONS_KEY')

# # -------------------------
# # XSS & Content Security
# # -------------------------
# SECURE_BROWSER_XSS_FILTER = env.bool('SECURE_BROWSER_XSS_FILTER_KEY')
# SECURE_CONTENT_TYPE_NOSNIFF = env.bool('SECURE_CONTENT_TYPE_NOSNIFF_KEY')

# # -------------------------
# # Session & Authentication
# # -------------------------
# SESSION_EXPIRE_AT_BROWSER_CLOSE = env.bool('SESSION_EXPIRE_AT_BROWSER_CLOSE_KEY')
# SESSION_COOKIE_HTTPONLY = env.bool('SESSION_COOKIE_HTTPONLY_KEY')
# CSRF_COOKIE_HTTPONLY = env.bool('CSRF_COOKIE_HTTPONLY_KEY')

# # -------------------------
# # Additional Security Headers
# # -------------------------
# # SECURE_REFERRER_POLICY = env.str('SECURE_REFERRER_POLICY_KEY')
# # SECURE_PROXY_SSL_HEADER = tuple(env.str('SECURE_PROXY_SSL_HEADER_KEY').split(','))

# # -------------------------
# # Password Validators
# # -------------------------
# AUTH_PASSWORD_VALIDATORS = [
#     {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
#     {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 12}},
#     {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
#     {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
# ]

 