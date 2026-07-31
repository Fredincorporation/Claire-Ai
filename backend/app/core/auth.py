import logging
from typing import Optional
from fastapi import Request, HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)

def get_supabase_client() -> Optional[Client]:
    if settings.SUPABASE_URL and (settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY):
        try:
            return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY)
        except Exception as e:
            logger.warning(f"Failed to create Supabase client for auth: {e}")
    return None

async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[str]:
    """
    Extracts user_id from Bearer JWT token if present. Returns None if unauthenticated.
    """
    if not credentials or not credentials.credentials:
        return None

    token = credentials.credentials
    client = get_supabase_client()

    if not client:
        return None

    try:
        user_res = client.auth.get_user(token)
        if user_res and user_res.user:
            return user_res.user.id
    except Exception as e:
        logger.debug(f"Auth token verification fallback: {e}")

    return None

async def get_current_user(
    user_id: Optional[str] = Depends(get_optional_user)
) -> Optional[str]:
    """
    Returns user_id (UUID string) for authenticated users.
    If unauthenticated and REQUIRE_AUTH is True, raises 401.
    If unauthenticated and REQUIRE_AUTH is False, returns None (guest / demo mode).
    Never returns non-UUID strings like 'guest_user'.
    """
    if not user_id:
        if settings.REQUIRE_AUTH:
            raise HTTPException(status_code=401, detail="Authentication required. Please sign in.")
        return None
    return user_id
