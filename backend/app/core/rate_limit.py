"""In-memory sliding-window rate limiter for API endpoints."""

import time
from collections import defaultdict
from typing import DefaultDict, List, Tuple

from fastapi import HTTPException, Request

from app.core.config import settings

# (timestamp, ) tuples per client key
_request_log: DefaultDict[str, List[float]] = defaultdict(list)


def _client_key(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


def _prune_window(timestamps: List[float], window_start: float) -> List[float]:
    return [ts for ts in timestamps if ts > window_start]


def _get_path_limit(path: str) -> int:
    """Returns specific request limits per minute depending on endpoint resource intensity."""
    if "/voice" in path or "/generate" in path or "/image" in path:
        return 10  # Tighter limit for AI voice transcription and image generation
    return settings.RATE_LIMIT_REQUESTS  # Default 30 req/min for chat & standard endpoints


async def enforce_rate_limit(request: Request) -> None:
    """
    Reject requests that exceed path-specific limits within RATE_LIMIT_WINDOW_SECONDS.
    """
    if not settings.RATE_LIMIT_ENABLED:
        return

    client_ip = _client_key(request)
    path = request.url.path
    key = f"{client_ip}:{path}"

    now = time.monotonic()
    window = settings.RATE_LIMIT_WINDOW_SECONDS
    limit = _get_path_limit(path)
    window_start = now - window

    timestamps = _prune_window(_request_log[key], window_start)

    if len(timestamps) >= limit:
        retry_after = int(window - (now - timestamps[0])) + 1
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded for {path}. Try again in {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)},
        )

    timestamps.append(now)
    _request_log[key] = timestamps
