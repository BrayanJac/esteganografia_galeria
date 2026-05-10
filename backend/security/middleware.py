from fastapi import Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware
import logging
from config.config import ALLOWED_ORIGINS, MAX_FILE_SIZE

# Rate limiting
limiter = Limiter(key_func=get_remote_address)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Content Security Policy
        csp = (
            "default-src 'self'; "
            "img-src 'self' data: blob: https://fastapi.tiangolo.com; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; "
            "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
            "font-src 'self' https://cdn.jsdelivr.net; "
            "connect-src 'self'; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self'"
        )

        response.headers["Content-Security-Policy"] = csp
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response


class SecurityLoggingMiddleware(BaseHTTPMiddleware):
    """Log security events and suspicious activities."""

    def __init__(self, app):
        super().__init__(app)
        self.suspicious_patterns = [
            r'<script[^>]*>',
            r'javascript:',
            r'vbscript:',
            r'onload\s*=',
            r'onerror\s*=',
            r'eval\s*\(',
            r'document\.cookie',
            r'union\s+select',
            r'drop\s+table',
            r'insert\s+into',
            r'delete\s+from'
        ]

    async def dispatch(self, request: Request, call_next):
        client_ip = get_remote_address(request)
        user_agent = request.headers.get("user-agent", "")
        method = request.method
        path = request.url.path

        is_suspicious, threat_type = self._inspect_request(request)

        # Log the request
        response = await call_next(request)

        # Log security events
        if is_suspicious or response.status_code >= 400:
            self._log_security_event(
                event_type="SUSPICIOUS_REQUEST" if is_suspicious else "HTTP_ERROR",
                description=f"{threat_type or f'HTTP {response.status_code}'} - {method} {path}",
                client_ip=client_ip,
                user_agent=user_agent,
                severity="HIGH" if is_suspicious else "MEDIUM"
            )

        return response

    def _inspect_request(self, request: Request):
        query_string = str(request.url.query)
        suspicious_query = self._find_suspicious_query(query_string)
        if suspicious_query:
            return True, suspicious_query

        suspicious_header = self._find_suspicious_headers(request)
        if suspicious_header:
            return True, suspicious_header

        return False, None

    def _find_suspicious_query(self, query_string: str):
        import re

        for pattern in self.suspicious_patterns:
            if re.search(pattern, query_string, re.IGNORECASE):
                return f"Suspicious pattern detected: {pattern}"

        return None

    def _find_suspicious_headers(self, request: Request):
        for header_name, header_value in request.headers.items():
            if header_name.lower() in ["x-forwarded-for", "x-real-ip"] and "," in header_value:
                ips = [ip.strip() for ip in header_value.split(",")]
                if len(ips) > 5:
                    return "Suspicious proxy chain"

        return None

    def _log_security_event(self, event_type: str, description: str, client_ip: str,
                            user_agent: str, severity: str):
        """Log security event to database."""
        try:
            # This would need to be async in a real implementation
            # For now, we'll use logging
            logging.warning(
                f"Security Event [{severity}]: {event_type} - {description} from {client_ip} (UA: {user_agent})"
            )
        except Exception as e:
            logging.error(f"Failed to log security event: {e}")


class InputValidationMiddleware(BaseHTTPMiddleware):
    """Validate and sanitize input data."""

    async def dispatch(self, request: Request, call_next):
        # Skip validation for static files and health checks
        if request.url.path.startswith("/static") or request.url.path == "/health":
            return await call_next(request)

        # Validate request size
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Request entity too large"
            )

        # Check for common attack patterns
        suspicious_agents = [
            "sqlmap", "nikto", "dirbuster", "nmap", "masscan",
            "zap", "burp", "owasp", "w3af", "skipfish"
        ]

        user_agent = request.headers.get("user-agent", "").lower()
        for suspicious in suspicious_agents:
            if suspicious in user_agent:
                self._log_security_event(
                    event_type="SUSPICIOUS_USER_AGENT",
                    description=f"Suspicious user agent detected: {user_agent}",
                    client_ip=get_remote_address(request),
                    user_agent=user_agent,
                    severity="MEDIUM"
                )
                break

        return await call_next(request)

    def _log_security_event(self, event_type: str, description: str, client_ip: str,
                            user_agent: str, severity: str):
        """Log security event."""
        logging.warning(
            f"Security Event [{severity}]: {event_type} - {description} from {client_ip} (UA: {user_agent})"
        )


def setup_cors_middleware(app):
    """Setup CORS middleware with strict settings."""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["*"],
        expose_headers=["*"]
    )


def setup_trusted_host_middleware(app):
    """Setup trusted host middleware."""
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["localhost", "127.0.0.1", "*.yourdomain.com"]
    )


def setup_security_middleware(app):
    """Setup all security middleware."""
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(SecurityLoggingMiddleware)
    app.add_middleware(InputValidationMiddleware)

    # Setup rate limiting
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
