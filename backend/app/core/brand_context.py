"""Helpers to format Supabase brand profiles for agent prompts."""

from typing import Any, Dict, List, Optional


def _as_list(value: Any) -> List[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(v) for v in value if v]
    if isinstance(value, str):
        return [v.strip() for v in value.split(",") if v.strip()]
    return [str(value)]


def format_brand_profile_for_prompt(brand_profile: Optional[Dict[str, Any]]) -> str:
    """
    Render a complete brand profile block for Editor/Writer system context.
    Uses every field stored in Supabase brand_profiles.
    """
    profile = brand_profile or {}
    pillars = _as_list(profile.get("content_pillars"))
    banned = _as_list(profile.get("do_not_use"))

    lines = [
        "=== BRAND PROFILE (MANDATORY — all edits must comply) ===",
        f"Brand Name: {profile.get('name', 'Unknown Brand')}",
        f"Tagline: {profile.get('tagline', 'N/A')}",
        f"Tone of Voice: {profile.get('tone_of_voice', 'Authoritative, engaging, direct')}",
        f"Target Audience: {profile.get('target_audience', 'General professional audience')}",
        f"Content Pillars: {', '.join(pillars) if pillars else 'Not specified'}",
        f"Style Guidelines: {profile.get('style_guidelines', 'Strong hooks, crisp paragraphs, clear CTAs')}",
        f"Visual Style: {profile.get('visual_style', 'Modern, clean, on-brand')}",
        f"Banned Words/Phrases (NEVER use): {', '.join(banned) if banned else 'None specified'}",
        "",
        "Brand compliance rules:",
        "- Preserve the brand's tone_of_voice in every platform post.",
        "- Remove or rewrite any banned words/phrases listed above.",
        "- Align hooks and CTAs with the target audience and content pillars.",
        "- Follow style_guidelines for formatting and readability.",
    ]
    return "\n".join(lines)


def format_brand_profile_summary(brand_profile: Optional[Dict[str, Any]]) -> str:
    """Shorter brand block for Writer prompts."""
    profile = brand_profile or {}
    banned = _as_list(profile.get("do_not_use"))
    pillars = _as_list(profile.get("content_pillars"))

    return (
        f"Brand: {profile.get('name', 'Unknown')} — {profile.get('tagline', '')}\n"
        f"Tone: {profile.get('tone_of_voice', 'Engaging and professional')}\n"
        f"Audience: {profile.get('target_audience', 'General')}\n"
        f"Pillars: {', '.join(pillars) if pillars else 'N/A'}\n"
        f"Style: {profile.get('style_guidelines', 'Strong hooks, clear CTAs')}\n"
        f"Never use: {', '.join(banned) if banned else 'none specified'}"
    )
