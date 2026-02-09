import os

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from utils.get_env import get_can_change_keys_env
from utils.user_config import update_env_with_user_config


class UserConfigEnvUpdateMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if get_can_change_keys_env() != "false":
            update_env_with_user_config()
        return await call_next(request)


class ApiKeyAuthMiddleware(BaseHTTPMiddleware):
    """Require a valid X-API-Key header on /api/v1/ routes.

    Requests are allowed through if:
    - The path does NOT start with /api/v1/ (e.g. static assets, Next.js pages)
    - The X-API-Key header matches the AHLAN_API_KEY env var

    If AHLAN_API_KEY is not set, all requests are allowed (open mode).
    """

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Only protect API routes
        if not path.startswith("/api/v1/"):
            return await call_next(request)

        api_key = os.getenv("AHLAN_API_KEY")
        if not api_key:
            # No key configured — open mode (backwards compatible)
            return await call_next(request)

        # Check API key header
        request_key = request.headers.get("X-API-Key")
        if request_key == api_key:
            return await call_next(request)

        return JSONResponse(
            status_code=401,
            content={"detail": "Invalid or missing API key"},
        )
