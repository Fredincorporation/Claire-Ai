import logging
from typing import Dict, Any, List, Optional
from app.agents.base_agent import BaseAgent

logger = logging.getLogger(__name__)

class StrategistAgent(BaseAgent):
    """
    Agent responsible for crafting social media content strategy, positioning, and multi-channel hooks.
    """
    def __init__(self):
        system_prompt = """You are Claire's Chief Social Media Strategist.
Your task is to take user goals, topic details, and research context to formulate a high-performing social media content strategy.
Determine:
1. Core Content Angle / Main Hook Theme
2. Target Audience Value Proposition
3. Recommended Platform Strategy (X, LinkedIn, Instagram, TikTok, Threads)
4. Key Takeaway & Call to Action (CTA)"""

        super().__init__(
            name="Strategy Agent",
            role="Strategist",
            description="Develops positioning, hooks, target audience angles, and multi-platform distribution strategy.",
            system_prompt=system_prompt
        )

    async def process_message(
        self,
        message: str,
        history: Optional[List[Any]] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Develop multi-platform strategy based on topic and optional research context.
        """
        ctx = context or {}
        research_info = ctx.get("research_summary", "No external search required.")
        brand_profile = ctx.get("brand_profile", {})

        prompt = f"""
User Goal/Topic: {message}

Brand Tone & Guidelines:
{brand_profile.get('tone_of_voice', 'Authoritative, engaging, direct')}

Research Context:
{research_info}

Develop a clear, tactical Content Strategy Plan for this campaign/post.
Specify high-converting hooks and distribution angles per platform.
"""

        strategy_output = await self.call_llm(user_message=prompt, temperature=0.6)

        return {
            "agent_name": self.name,
            "role": self.role,
            "strategy": strategy_output,
            "status": "success"
        }

    async def generate_calendar(
        self,
        message: str,
        timeframe: str = "weekly",
        context: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Generate a structured content calendar (weekly 7-day or monthly schedule).
        """
        ctx = context or {}
        brand_profile = ctx.get("brand_profile", {})
        platforms = ctx.get("platforms") or ["x", "linkedin", "instagram", "tiktok", "threads"]

        days_count = 7 if timeframe != "monthly" else 14

        prompt = f"""
Campaign/Topic Goal: {message}
Timeframe: {timeframe.capitalize()} ({days_count} scheduled posts)
Target Platforms: {', '.join(platforms)}

Brand Voice & Guidelines:
- Tone: {brand_profile.get('tone_of_voice', 'Authoritative, engaging, direct')}
- Content Pillars: {', '.join(brand_profile.get('content_pillars', ['AI', 'Strategy', 'Growth']))}

Generate a structured {days_count}-day Content Calendar.
Return a valid JSON array of objects, where each object has EXACTLY this structure:
[
  {{
    "day_number": 1,
    "day_label": "Day 1 (Mon)",
    "platform": "x",
    "theme": "Educational / How-To",
    "post_content": "Full platform-native post copy with hook, body, and CTA...",
    "best_time": "09:00 AM EST",
    "image_prompt": "A modern, high-tech graphic showing..."
  }}
]
"""
        import json
        raw_response = await self.call_llm(user_message=prompt, temperature=0.5, json_mode=True)
        try:
            parsed = json.loads(raw_response)
            if isinstance(parsed, list):
                return parsed
            if isinstance(parsed, dict) and "calendar" in parsed:
                return parsed["calendar"]
        except Exception as e:
            logger.warning(f"StrategistAgent calendar parsing failed: {e}")

        # Fallback calendar
        fallback = []
        for i in range(1, days_count + 1):
            plat = platforms[(i - 1) % len(platforms)]
            fallback.append({
                "day_number": i,
                "day_label": f"Day {i}",
                "platform": plat,
                "theme": f"Pillar Insight #{i}",
                "post_content": f"Day {i} Content for {plat.upper()}: {message} - High-value insights and engagement hook.",
                "best_time": "09:00 AM EST",
                "image_prompt": f"Minimalist professional graphic illustration for {message}."
            })
        return fallback
