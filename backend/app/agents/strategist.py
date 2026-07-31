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
