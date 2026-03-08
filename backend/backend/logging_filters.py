import logging


class IgnoreDevServerHTTPSNoise(logging.Filter):
    """Suppress TLS handshake noise when HTTPS is sent to HTTP runserver."""

    NOISE_PATTERNS = (
        "You're accessing the development server over HTTPS, but it only supports HTTP.",
        "Bad request version",
        "Bad request syntax",
        "Bad HTTP/0.9 request type",
    )

    def filter(self, record: logging.LogRecord) -> bool:
        message = record.getMessage()
        return not any(pattern in message for pattern in self.NOISE_PATTERNS)
