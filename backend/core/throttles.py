from rest_framework.throttling import AnonRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    """Throttle login attempts by client IP using the 'login' scope."""

    scope = "login"
