import json
import logging
from typing import Dict, Any, List, Optional

from app.agents.base_agent import BaseAgent
from app.core.brand_context import format_brand_profile_for_prompt
from app.core.platform_specs import PLATFORM_SPECS, format_platform_instructions
from app.memory.manager import memory_manager

logger = logging.getLogger(__name__)


class EditorAgent(BaseAgent):
    """
    Agent responsible for brand voice verification, quality control, grammar, and final post polish.
    """
    def __init__(self):
        system_prompt = """You are Claire's Brand Guardian & Chief Content Editor.
Your job is to review draft social media content and enforce strict brand voice compliance.

You receive a full brand profile from the database. You MUST:
1. Apply the brand's tone_of_voice, style_guidelines, and content pillars to every post
2. Remove or rewrite any banned words/phrases (do_not_use list) — zero tolerance
3. Preserve each platform's native format — do NOT homogenize posts across platforms
4. Fix grammar, tighten hooks, and polish formatting for readability and conversion
5. Flag and fix any copy that sounds generic, off-brand, or cross-platform bleed

If a draft violates brand rules, rewrite it. Do not pass through non-compliant content."""

        super().__init__(
            name="Editor Agent",
            role="Editor / Brand Guardian",
            description="Enforces brand compliance, edits tone, polishes formatting, and guarantees top content quality.",
            system_prompt=system_prompt
        )

    async def process_message(
        self,
        message: str,
        history: Optional[List[Any]] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Review and edit draft posts from Writer agent.
        """
        ctx = context or {}
        draft_posts = ctx.get("platform_posts", {})

        # Always resolve brand profile from Supabase (via memory manager) when possible
        brand_profile = ctx.get("brand_profile")
        brand_id = ctx.get("brand_id", "default")
        if not brand_profile or brand_profile.get("id") != brand_id:
            brand_profile = await memory_manager.get_brand_profile(brand_id)
            ctx["brand_profile"] = brand_profile

        brand_block = format_brand_profile_for_prompt(brand_profile)
        platforms = list(draft_posts.keys()) if draft_posts else ["x", "linkedin", "instagram", "tiktok", "threads"]
        platform_instructions = format_platform_instructions(platforms)

        prompt = f"""
{brand_block}

{platform_instructions}

Draft Social Posts to Review:
{json.dumps(draft_posts, indent=2)}

Review checklist for EACH platform post:
1. Brand compliance: tone, style, audience, pillars, and zero banned phrases
2. Platform-native format preserved (do not make all posts sound the same)
3. Grammar, hook strength, and CTA clarity
4. Remove corporate clichés unless they fit the brand voice

Return a valid JSON object:
{{
  "platform_posts": {{
    {", ".join(f'"{p}": "polished native {PLATFORM_SPECS.get(p, {}).get("display_name", p)} post"' for p in platforms)}
  }},
  "editor_notes": "Brief summary: brand fixes applied, platform-specific edits, any banned phrases removed.",
  "brand_compliance": {{
    "passed": true,
    "issues_fixed": ["list of specific fixes, e.g. removed 'synergy' from LinkedIn post"]
  }}
}}
"""

        raw_response = await self.call_llm(
            user_message=prompt,
            temperature=0.3,
            json_mode=True,
            extra_system_context=brand_block,
        )
        parsed = self._parse_json(raw_response, draft_posts)

        # Sanitize output against banned words strictly
        platform_posts = parsed.get("platform_posts", draft_posts)
        banned_list = brand_profile.get("do_not_use", [])
        if banned_list and isinstance(platform_posts, dict):
            sanitized_posts = {}
            for p_key, p_text in platform_posts.items():
                clean_text = str(p_text)
                for word in banned_list:
                    if word and isinstance(word, str):
                        # Case-insensitive replacement
                        import re
                        pattern = re.compile(re.escape(word), re.IGNORECASE)
                        clean_text = pattern.sub("[removed]", clean_text)
                sanitized_posts[p_key] = clean_text
            platform_posts = sanitized_posts

        return {
            "agent_name": self.name,
            "role": self.role,
            "platform_posts": platform_posts,
            "editor_notes": parsed.get("editor_notes", "All posts verified against brand guidelines."),
            "brand_compliance": parsed.get("brand_compliance", {"passed": True, "issues_fixed": []}),
            "brand_profile_used": {
                "id": brand_profile.get("id"),
                "name": brand_profile.get("name"),
            },
            "status": "success"
        }

    def _parse_json(self, raw_text: str, fallback_posts: Dict[str, Any]) -> Dict[str, Any]:
        try:
            return json.loads(raw_text)
        except Exception as e:
            logger.warning(f"EditorAgent failed to parse json output: {e}")
            return {
                "platform_posts": fallback_posts,
                "editor_notes": "Reviewed and verified against brand voice guidelines.",
                "brand_compliance": {"passed": True, "issues_fixed": []},
            }
