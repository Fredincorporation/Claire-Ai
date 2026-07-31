"""Shared request validation constants and helpers."""

import re
from typing import List, Optional

from app.core.platform_specs import VALID_PLATFORMS

VALID_MODES = frozenset({"auto", "create", "optimize", "research", "chat"})

BRAND_ID_PATTERN = re.compile(r"^[a-zA-Z0-9_-]{1,64}$")
CONVERSATION_ID_PATTERN = re.compile(r"^[a-zA-Z0-9_-]{1,128}$")

MAX_MESSAGE_LENGTH = 10_000
MAX_HISTORY_MESSAGES = 50
MAX_HISTORY_CONTENT_LENGTH = 5_000
MAX_VOICE_FILE_BYTES = 25 * 1024 * 1024  # 25 MB
ALLOWED_AUDIO_CONTENT_TYPES = frozenset({
    "audio/wav",
    "audio/x-wav",
    "audio/mpeg",
    "audio/mp3",
    "audio/mp4",
    "audio/webm",
    "audio/ogg",
    "audio/flac",
    "audio/x-m4a",
    "application/octet-stream",
})


def validate_brand_id(value: Optional[str]) -> str:
    brand_id = (value or "default").strip()
    if not BRAND_ID_PATTERN.match(brand_id):
        raise ValueError("brand_id must be 1-64 alphanumeric characters, hyphens, or underscores.")
    return brand_id


def validate_conversation_id(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    conv_id = value.strip()
    if not conv_id:
        return None
    if not CONVERSATION_ID_PATTERN.match(conv_id):
        raise ValueError("conversation_id must be 1-128 alphanumeric characters, hyphens, or underscores.")
    return conv_id


def validate_message(value: str) -> str:
    message = value.strip()
    if not message:
        raise ValueError("message cannot be empty or whitespace only.")
    if len(message) > MAX_MESSAGE_LENGTH:
        raise ValueError(f"message must be at most {MAX_MESSAGE_LENGTH} characters.")
    return message


def validate_mode(value: Optional[str]) -> str:
    mode = (value or "auto").strip().lower()
    if mode not in VALID_MODES:
        raise ValueError(f"mode must be one of: {', '.join(sorted(VALID_MODES))}.")
    return mode


def validate_platforms(value: Optional[List[str]]) -> List[str]:
    if not value:
        return list(VALID_PLATFORMS)
    normalized = [p.strip().lower() for p in value if p and p.strip()]
    if not normalized:
        raise ValueError("platforms must include at least one valid platform.")
    invalid = [p for p in normalized if p not in VALID_PLATFORMS]
    if invalid:
        raise ValueError(
            f"Invalid platforms: {', '.join(invalid)}. "
            f"Allowed: {', '.join(sorted(VALID_PLATFORMS))}."
        )
    # Preserve order while deduplicating
    seen = set()
    unique: List[str] = []
    for p in normalized:
        if p not in seen:
            seen.add(p)
            unique.append(p)
    return unique
