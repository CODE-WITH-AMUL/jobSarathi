import logging

from django.conf import settings
from django.http import JsonResponse


logger = logging.getLogger("security")


class BlockSuspiciousIPMiddleware:
    """Block requests from explicitly blacklisted IP addresses."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        client_ip = self._get_client_ip(request)
        blocked_ips = getattr(settings, "BLOCKED_IPS", set())

        if client_ip and client_ip in blocked_ips:
            logger.warning(
                "Blocked request from blacklisted IP",
                extra={"client_ip": client_ip, "path": request.path},
            )
            return JsonResponse({"detail": "Access denied."}, status=403)

        return self.get_response(request)

    @staticmethod
    def _get_client_ip(request):
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR", "")
