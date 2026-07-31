from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from typing import Optional

from app.core.rate_limit import enforce_rate_limit
from app.core.auth import get_current_user
from app.core.validation import validate_message
from app.services.cloudflare_ai_service import cloudflare_ai_service

router = APIRouter(tags=["Images"])


class ImageGenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=2000)
    aspect_ratio: Optional[str] = Field(default=None, max_length=16)
    platform: Optional[str] = Field(default=None, max_length=32)

    @field_validator("prompt")
    @classmethod
    def check_prompt(cls, value: str) -> str:
        return validate_message(value)[:2000]


class ImageGenerateResponse(BaseModel):
    prompt: str
    image_url: Optional[str] = None
    source: str
    model: str
    status: str
    note: Optional[str] = None


@router.post("/generate-image", response_model=ImageGenerateResponse)
@router.post("/images/generate", response_model=ImageGenerateResponse)
async def generate_image(
    request: ImageGenerateRequest,
    user_id: Optional[str] = Depends(get_current_user),
    _rate_limit: None = Depends(enforce_rate_limit),
):
    """
    Generate an image via Cloudflare Workers AI when configured,
    otherwise return prompt and preview placeholder status.
    """
    try:
        result = await cloudflare_ai_service.generate_image(
            request.prompt,
            aspect_ratio=request.aspect_ratio,
        )
        return ImageGenerateResponse(
            prompt=request.prompt,
            image_url=result.get("image_url"),
            source=result.get("source", "simulation"),
            model=result.get("model", "flux-simulation"),
            status="generated" if result.get("source") == "cloudflare" else "prompt_only",
            note=result.get("note"),
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {exc}")

