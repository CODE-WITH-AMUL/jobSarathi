import logging

from django.http import JsonResponse


logger = logging.getLogger("security")


def ratelimited_error(request, exception=None):
    client_ip = request.META.get("HTTP_X_FORWARDED_FOR") or request.META.get("REMOTE_ADDR", "unknown")
    logger.warning(
        "Rate limit exceeded",
        extra={"client_ip": client_ip, "path": request.path},
    )
    return JsonResponse(
        {
            "detail": "Too many requests from this IP. Please try again later.",
            "error_code": "RATE_LIMITED",
        },
        status=429,
    )
