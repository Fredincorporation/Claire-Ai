from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import health_router, chat_router, voice_router, images_router, brands_router, conversations_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for Claire - AI Social Media Manager Platform",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for local development, Vercel frontend deployments, and Render
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX if getattr(settings, "CORS_ORIGIN_REGEX", None) else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(voice_router, prefix="/api/v1")
app.include_router(images_router, prefix="/api/v1")
app.include_router(brands_router, prefix="/api/v1")
app.include_router(conversations_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "message": "Welcome to Claire AI Backend API",
        "docs": "/docs",
        "health": "/api/v1/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
