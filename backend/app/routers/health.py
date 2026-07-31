import time
from fastapi import APIRouter
from app.core.config import settings

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
        "version": "0.1.0"
    }
