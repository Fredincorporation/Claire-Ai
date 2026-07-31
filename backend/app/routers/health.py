import time
from fastapi import APIRouter
from app.core.config import settings
from app.services.cloudflare_ai_service import cloudflare_ai_service

router = APIRouter(tags=["Health"])

start_time = time.time()

@router.get("/health", summary="Health Check")
async def health_check():
    """
    Returns application health status, uptime, and configuration meta.
    """
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "uptime_seconds": round(time.time() - start_time, 2),
        "version": "0.1.0",
        "cloudflare_ai_configured": cloudflare_ai_service.is_configured,
        "supabase_configured": bool(settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY),
        "groq_configured": bool(settings.GROQ_API_KEY),
    }


@router.get("/keep-alive", summary="Render Keep Alive Ping")
@router.get("/status", summary="System Status")
async def keep_alive():
    """
    Lightweight keep-alive endpoint for Render free tier prevention and uptime pinging.
    """
    return {
        "status": "online",
        "timestamp": time.time(),
        "uptime_seconds": round(time.time() - start_time, 2),
        "primary_model": settings.GROQ_MODEL,
        "voice_model": settings.GROQ_WHISPER_MODEL,
    }
