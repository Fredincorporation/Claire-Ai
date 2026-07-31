from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.core.auth import get_current_user
from app.memory.manager import memory_manager

router = APIRouter(prefix="/brands", tags=["Brand Profiles"])


class BrandProfilePayload(BaseModel):
    id: Optional[str] = "default"
    name: str = Field("Claire AI", min_length=1, max_length=128)
    tagline: Optional[str] = ""
    tone_of_voice: str = Field(..., min_length=1, max_length=500)
    target_audience: str = Field(..., min_length=1, max_length=500)
    content_pillars: List[str] = Field(default_factory=list)
    style_guidelines: Optional[str] = ""
    visual_style: Optional[str] = ""
    do_not_use: List[str] = Field(default_factory=list)


@router.get("/{brand_id}")
async def get_brand(brand_id: str, user_id: Optional[str] = Depends(get_current_user)):
    """
    Get brand voice profile from Supabase or memory store.
    """
    profile = await memory_manager.get_brand_profile(brand_id, user_id=user_id)
    return profile


@router.post("/{brand_id}")
async def save_brand(brand_id: str, payload: BrandProfilePayload, user_id: Optional[str] = Depends(get_current_user)):
    """
    Save or update brand voice profile in Supabase & memory.
    """
    data = payload.model_dump()
    data["id"] = brand_id
    saved = await memory_manager.save_brand_profile(brand_id, data, user_id=user_id)
    return {"status": "success", "brand_profile": saved}
