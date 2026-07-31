import json
import logging
from typing import Dict, Any, List, Optional

from app.agents.base_agent import BaseAgent
from app.core.brand_context import format_brand_profile_summary
from app.core.platform_specs import PLATFORM_SPECS, format_platform_instructions

logger = logging.getLogger(__name__)


class WriterAgent(BaseAgent):
    """
    Agent responsible for generating platform-native copy (X, LinkedIn, Instagram, TikTok, Threads)
    and generating high-quality image prompts for visual assets.
    """
    def __init__(self):
        system_prompt = """You are Claire's Master Content Writer & Creative Copywriter.
You write platform-native social media content that drives high engagement, clicks, and conversions.

CORE RULE: Each platform gets a COMPLETELY DIFFERENT piece of content.
Never copy-paste or lightly reword the same text across platforms.
Adapt the core message to each platform's native tone, structure, and audience expectations.

Platform differentiation checklist:
- X: punchy, ≤280 chars, thread-friendly, zero corporate fluff
- LinkedIn: professional hook, white-space paragraphs, bullet insights
- Instagram: visual storytelling caption, emoji anchors, hashtag block at end
- TikTok: labeled video script ([HOOK], [VISUAL], [VOICEOVER], [ON-SCREEN TEXT], [CTA], [AUDIO VIBE])
- Threads: personal, conversational, community question at the end

Image Prompts:
Generate high-fidelity, production-grade image prompts suitable for Midjourney / DALL-E 3 / Flux.
Include aspect ratios (1:1 for IG/LinkedIn, 9:16 for TikTok/Reels, 16:9 for X)."""

        super().__init__(
            name="Writer Agent",
            role="Writer",
            description="Creates platform-native social posts and detailed visual image prompts.",
            system_prompt=system_prompt
        )

    async def process_message(
        self,
        message: str,
        history: Optional[List[Any]] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate platform-specific content drafts and image prompts.
        """
        ctx = context or {}
        strategy = ctx.get("strategy", message)
        brand_profile = ctx.get("brand_profile", {})
        target_platforms = ctx.get("platforms") or ["x", "linkedin", "instagram", "tiktok", "threads"]

        platform_instructions = format_platform_instructions(target_platforms)
        brand_block = format_brand_profile_summary(brand_profile)

        # Build JSON schema example only for requested platforms
        platform_json_example = ",\n    ".join(
            f'"{p}": "<native {PLATFORM_SPECS.get(p, {}).get("display_name", p)} copy>"'
            for p in target_platforms
        )

        prompt = f"""
Topic / Goal: {message}

Strategy Plan:
{strategy}

Brand Guidelines (apply tone and avoid banned phrases, but adapt per platform):
{brand_block}

{platform_instructions}

Write ONLY for these platforms: {', '.join(target_platforms)}

Before outputting, verify each post:
1. Uses that platform's native format (not a copy of another platform)
2. Matches the brand tone while sounding native to the channel
3. Respects length and structural rules for that platform

Output a strictly valid JSON object:
{{
  "platform_posts": {{
    {platform_json_example}
  }},
  "image_prompts": [
    {{
      "platform": "instagram",
      "prompt": "Detailed Midjourney style prompt --ar 1:1...",
      "description": "Visual concept explanation"
    }}
  ]
}}
Include image_prompts for visual platforms in the request ({', '.join(target_platforms)}).
Only output valid JSON. Include ONLY the requested platforms in platform_posts.
"""

        raw_response = await self.call_llm(user_message=prompt, temperature=0.7, json_mode=True)

        parsed_data = self._parse_json(raw_response, target_platforms)

        return {
            "agent_name": self.name,
            "role": self.role,
            "platform_posts": parsed_data.get("platform_posts", {}),
            "image_prompts": parsed_data.get("image_prompts", []),
            "status": "success"
        }

    def _parse_json(self, raw_text: str, platforms: List[str]) -> Dict[str, Any]:
        try:
            data = json.loads(raw_text)
            posts = data.get("platform_posts", {})
            # Keep only requested platforms
            data["platform_posts"] = {p: posts[p] for p in platforms if p in posts}
            return data
        except Exception as e:
            logger.warning(f"Failed to parse json from WriterAgent LLM output: {e}")
            posts = {p: f"Generated draft for {p} based on strategy." for p in platforms}
            return {
                "platform_posts": posts,
                "image_prompts": [
                    {
                        "platform": "general",
                        "prompt": "A modern, sleek dark-mode tech graphic with glowing neon accents and minimalist typography, 8k resolution --ar 1:1",
                        "description": "Hero visual for social campaign"
                    }
                ]
            }
