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


async def enforce_rate_limit(request: Request) -> None:
    """
    Reject requests that exceed RATE_LIMIT_REQUESTS within RATE_LIMIT_WINDOW_SECONDS.
    """
    if not settings.RATE_LIMIT_ENABLED:
        return

    key = _client_key(request)
    now = time.monotonic()
    window = settings.RATE_LIMIT_WINDOW_SECONDS
    limit = settings.RATE_LIMIT_REQUESTS
    window_start = now - window

    timestamps = _prune_window(_request_log[key], window_start)

    if len(timestamps) >= limit:
        retry_after = int(window - (now - timestamps[0])) + 1
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Try again in {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)},
        )

    timestamps.append(now)
    _request_log[key] = timestamps
