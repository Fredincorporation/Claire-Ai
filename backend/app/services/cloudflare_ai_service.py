"""Cloudflare Workers AI image generation with simulation fallback."""

import base64
import logging
from typing import Any, Dict, Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

SIMULATION_IMAGE_URL = (
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe"
    "?q=80&w=1000&auto=format&fit=crop"
)


class CloudflareAIService:
    def __init__(self) -> None:
        self.account_id = settings.CLOUDFLARE_ACCOUNT_ID
        self.api_token = settings.CLOUDFLARE_API_TOKEN
        self.model = settings.CLOUDFLARE_AI_IMAGE_MODEL

    @property
    def is_configured(self) -> bool:
        return bool(self.account_id and self.api_token)

    async def generate_image(
        self,
        prompt: str,
        *,
        aspect_ratio: Optional[str] = None,
    ) -> Dict[str, Any]:
        cleaned_prompt = prompt.strip()
        if not cleaned_prompt:
            raise ValueError("prompt cannot be empty.")

        if self.is_configured:
            try:
                return await self._generate_via_cloudflare(cleaned_prompt, aspect_ratio)
            except Exception as exc:
                logger.warning("Cloudflare Workers AI failed, using simulation fallback: %s", exc)

        return self._simulation_response(cleaned_prompt)

    async def _generate_via_cloudflare(
        self,
        prompt: str,
        aspect_ratio: Optional[str],
    ) -> Dict[str, Any]:
        url = (
            f"https://api.cloudflare.com/client/v4/accounts/"
            f"{self.account_id}/ai/run/{self.model}"
        )
        payload: Dict[str, Any] = {"prompt": prompt}
        if aspect_ratio:
            payload["aspect_ratio"] = aspect_ratio

        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()

            content_type = response.headers.get("content-type", "")
            if content_type.startswith("image/"):
                encoded = base64.b64encode(response.content).decode("ascii")
                mime = content_type.split(";")[0]
                return {
                    "image_url": f"data:{mime};base64,{encoded}",
                    "source": "cloudflare",
                    "model": self.model,
                }

            # Some models return JSON with base64 image field
            data = response.json()
            if isinstance(data, dict):
                result = data.get("result")
                if isinstance(result, dict) and result.get("image"):
                    img = result["image"]
                    if not img.startswith("data:"):
                        img = f"data:image/png;base64,{img}"
                    return {
                        "image_url": img,
                        "source": "cloudflare",
                        "model": self.model,
                    }

            raise RuntimeError("Unexpected Cloudflare AI response format.")

    def _simulation_response(self, prompt: str) -> Dict[str, Any]:
        return {
            "image_url": SIMULATION_IMAGE_URL,
            "source": "simulation",
            "model": "flux-simulation",
            "note": "Cloudflare Workers AI not configured — showing preview placeholder.",
        }


cloudflare_ai_service = CloudflareAIService()
