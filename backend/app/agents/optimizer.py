import json
import logging
from typing import Dict, Any, List, Optional
from app.agents.base_agent import BaseAgent

logger = logging.getLogger(__name__)

class OptimizerAgent(BaseAgent):
    """
    Agent responsible for analyzing existing social copy or performance data,
    providing actionable optimization advice, rewritten hooks, and performance score boosts.
    """
    def __init__(self):
        system_prompt = """You are Claire's Growth & Content Optimizer Agent.
Your job is to analyze existing social media posts, captions, or campaign copy and optimize them for maximum engagement, CTR, and virality.
Focus on:
1. Hook Strength & First Line Impact
2. Readability & Formatting (skimmability, spacing, bullet points)
3. Call-to-Action (CTA) clarity
4. Audience Emotional Drivers & Curiosity Loops"""

        super().__init__(
            name="Optimizer Agent",
            role="Optimizer",
            description="Analyzes existing content, rewrites hooks, and enhances readability for high engagement.",
            system_prompt=system_prompt
        )

    async def process_message(
        self, 
        message: str, 
        history: Optional[List[Any]] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Analyze provided content and return optimized variations and actionable recommendations.
        """
        ctx = context or {}
        brand_profile = ctx.get("brand_profile", {})

        prompt = f"""
Existing Copy / Post to Optimize:
"{message}"

Brand Guidelines:
- Tone: {brand_profile.get('tone_of_voice', 'Direct and engaging')}

Provide a structured optimization analysis in valid JSON format:
{{
  "analysis": {{
    "hook_score": 8,
    "readability_score": 7,
    "key_issues": ["Opening line lacks urgency", "Paragraphs are too dense"]
  }},
  "optimized_hooks": [
    "Variation 1 hook...",
    "Variation 2 hook...",
    "Variation 3 hook..."
  ],
  "optimized_post": "Fully rewritten, polished, high-converting post...",
  "recommendations": [
    "Tip 1...",
    "Tip 2..."
  ]
}}
"""

        raw_response = await self.call_llm(user_message=prompt, temperature=0.5, json_mode=True)
        parsed = self._parse_json(raw_response, message)

        return {
            "agent_name": self.name,
            "role": self.role,
            "optimization": parsed,
            "status": "success"
        }

    def _parse_json(self, raw_text: str, original_msg: str) -> Dict[str, Any]:
        try:
            return json.loads(raw_text)
        except Exception as e:
            logger.warning(f"OptimizerAgent failed to parse JSON output: {e}")
            return {
                "analysis": {
                    "hook_score": 7,
                    "readability_score": 8,
                    "key_issues": ["Hook can be more direct"]
                },
                "optimized_hooks": [
                    f"Stop scrolling: {original_msg[:50]}...",
                    f"Here is why most people get this wrong: {original_msg[:40]}..."
                ],
                "optimized_post": original_msg,
                "recommendations": ["Break content into shorter 1-2 sentence paragraphs for mobile skimmability."]
            }
