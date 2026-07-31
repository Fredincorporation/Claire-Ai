import json
import logging
from typing import Dict, Any, List, Optional
from app.agents.base_agent import BaseAgent

logger = logging.getLogger(__name__)

class OptimizerAgent(BaseAgent):
    """
    Agent responsible for analyzing existing social copy or performance data,
    providing actionable optimization advice, rewritten hooks, performance score boosts,
    content gap analysis, and platform-specific rewrites with 7-day action plans.
    """
    def __init__(self):
        system_prompt = """You are Claire's Growth & Content Optimizer Agent.
Your job is to analyze past social media posts, captions, pasted text, or analytics copy, diagnose engagement bottlenecks, and return high-converting platform rewrites and a 7-day growth plan.

Focus on:
1. Hook Impact & Curiosity Loops
2. Readability & Skimmability (formatting, line breaks, bullet points)
3. High-Conversion Call-to-Action (CTA) clarity
4. Platform-native nuances (X threads, LinkedIn spacing, IG visuals, TikTok scripts)
5. Identifying Content Gaps & Tactical 7-Day Growth Actions"""

        super().__init__(
            name="Optimizer Agent",
            role="Optimizer",
            description="Analyzes existing content, diagnoses bottlenecks, rewrites across platforms, and generates a 7-day action plan.",
            system_prompt=system_prompt
        )

    async def process_message(
        self,
        message: str,
        history: Optional[List[Any]] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Analyze provided content and return comprehensive diagnosis, platform rewrites, and 7-day improvement plan.
        """
        ctx = context or {}
        brand_profile = ctx.get("brand_profile", {})
        platforms = ctx.get("platforms") or ["x", "linkedin", "instagram", "tiktok", "threads"]

        # Collect past posts text from message or context attachments
        content_to_analyze = message
        attachments = ctx.get("attachments") or []
        if attachments and isinstance(attachments, list):
            attached_texts = "\n\n".join([f"--- ATTACHED FILE ({a.get('name', 'file')}): ---\n{a.get('content', '')}" for a in attachments])
            content_to_analyze = f"{message}\n\n{attached_texts}" if message else attached_texts

        past_posts = ctx.get("past_posts") or []
        if past_posts and isinstance(past_posts, list):
            posts_block = "\n---\n".join([str(p) for p in past_posts])
            content_to_analyze = f"{content_to_analyze}\n\n--- PAST POSTS LIST ---\n{posts_block}"

        banned_words = brand_profile.get('do_not_use', [])
        banned_str = ', '.join(banned_words) if banned_words else 'None'

        prompt = f"""
Existing Copy / Past Posts / Text to Analyze and Optimize:
\"\"\"
{content_to_analyze}
\"\"\"

Brand Guidelines:
- Brand Name: {brand_profile.get('name', 'Claire AI')}
- Tone of Voice: {brand_profile.get('tone_of_voice', 'Direct, engaging, authoritative, zero fluff')}
- Target Audience: {brand_profile.get('target_audience', 'Founders, Marketers, Growth Leaders')}
- Content Pillars: {', '.join(brand_profile.get('content_pillars', []))}
- Banned Words/Phrases (DO NOT USE): {banned_str}

Target Platforms for Rewrites: {', '.join(platforms)}

Perform a deep social content audit and return a valid JSON object matching EXACTLY this structure:
{{
  "diagnosis": {{
    "whats_working": [
      "Key strength 1 (e.g. clear core premise)",
      "Key strength 2 (e.g. good value prop)"
    ],
    "whats_not": [
      "Engagement bottleneck 1 (e.g. weak opening hook)",
      "Engagement bottleneck 2 (e.g. text wall lacks line breaks)"
    ],
    "content_gaps": [
      "Missing angle or metric 1 (e.g. lacks concrete data/proof)",
      "Missing angle or metric 2 (e.g. missing platform-native hashtags)"
    ],
    "improvement_plan_7d": [
      {{"day": "Day 1", "focus": "Hook A/B Testing", "action": "Rewrite opening line with curiosity loop or strong contrast statement"}},
      {{"day": "Day 2", "focus": "Mobile Skimmability", "action": "Format body text with short 1-2 sentence paragraphs and bullet points"}},
      {{"day": "Day 3", "focus": "LinkedIn Carousel Adaptation", "action": "Convert core insights into a 5-slide PDF carousel script"}},
      {{"day": "Day 4", "focus": "X Thread Expansion", "action": "Expand primary thesis into a 4-tweet breakdown thread"}},
      {{"day": "Day 5", "focus": "Visual Asset Pairing", "action": "Pair copy with a bold high-contrast graphic prompt"}},
      {{"day": "Day 6", "focus": "CTA & Comment Velocity", "action": "Add explicit open-ended question CTA to drive comment rate"}},
      {{"day": "Day 7", "focus": "Analytics Review", "action": "Assess impressions, save rate, and CTR across channels"}}
    ]
  }},
  "optimized_posts": {{
    "x": "Punchy rewritten X post or thread under 280 chars with strong hook...",
    "linkedin": "Polished LinkedIn post with line breaks, bullet points, and high-converting CTA...",
    "instagram": "Engaging Instagram caption with hook, value points, CTA, and hashtag block...",
    "tiktok": "TikTok video script with [HOOK], [VISUAL], and [ON-SCREEN TEXT]...",
    "threads": "Casual, conversational Threads post starting with bold statement..."
  }},
  "optimized_hooks": [
    "Alternative Hook 1...",
    "Alternative Hook 2...",
    "Alternative Hook 3..."
  ],
  "recommendations": [
    "Actionable growth tip 1...",
    "Actionable growth tip 2..."
  ]
}}
"""

        raw_response = await self.call_llm(user_message=prompt, temperature=0.4, json_mode=True)
        parsed = self._parse_json(raw_response, content_to_analyze, platforms)

        # Generate export options
        exports = self._build_exports(parsed, content_to_analyze)

        return {
            "agent_name": self.name,
            "role": self.role,
            "optimization": parsed,
            "diagnosis": parsed.get("diagnosis"),
            "optimized_posts": parsed.get("optimized_posts"),
            "exports": exports,
            "status": "success"
        }

    def _build_exports(self, parsed: Dict[str, Any], original_msg: str) -> Dict[str, str]:
        diag = parsed.get("diagnosis", {})
        posts = parsed.get("optimized_posts", {})
        plan = diag.get("improvement_plan_7d", [])

        # Markdown Export
        md_lines = ["# Content Audit & Optimization Report\n"]
        md_lines.append("## 🔍 Content Diagnosis")
        md_lines.append("### What's Working")
        for item in diag.get("whats_working", []):
            md_lines.append(f"- ✅ {item}")
        md_lines.append("\n### What Needs Improvement")
        for item in diag.get("whats_not", []):
            md_lines.append(f"- ⚠️ {item}")
        md_lines.append("\n### Content Gaps")
        for item in diag.get("content_gaps", []):
            md_lines.append(f"- 💡 {item}")

        md_lines.append("\n---\n## 📱 Platform Rewrites")
        for platform, text in posts.items():
            md_lines.append(f"### {platform.upper()}\n{text}\n")

        md_lines.append("\n---\n## 📅 7-Day Improvement Plan")
        for item in plan:
            day = item.get("day", "")
            focus = item.get("focus", "")
            action = item.get("action", "")
            md_lines.append(f"- **{day} ({focus})**: {action}")

        markdown_str = "\n".join(md_lines)

        # Buffer / Hootsuite CSV Export
        csv_lines = ["Date,Time,Platform,Post Content"]
        for idx, (platform, text) in enumerate(posts.items(), 1):
            clean_text = text.replace('"', '""').replace("\n", " ")
            csv_lines.append(f"2025-05-0{idx},09:00 AM,{platform.capitalize()},\"{clean_text}\"")
        buffer_csv = "\n".join(csv_lines)

        # Plain Text Export
        txt_lines = ["CLAIRE AI - OPTIMIZED CONTENT SUMMARY\n"]
        for platform, text in posts.items():
            txt_lines.append(f"=== {platform.upper()} ===")
            txt_lines.append(text)
            txt_lines.append("")
        plain_text = "\n".join(txt_lines)

        return {
            "markdown": markdown_str,
            "buffer_csv": buffer_csv,
            "plain_text": plain_text
        }

    def _parse_json(self, raw_text: str, original_msg: str, platforms: List[str]) -> Dict[str, Any]:
        try:
            data = json.loads(raw_text)
            if "diagnosis" in data and "optimized_posts" in data:
                return data
        except Exception as e:
            logger.warning(f"OptimizerAgent failed to parse JSON output: {e}")

        # Fallback dictionary
        fallback_posts = {
            p: f"Optimized version for {p.upper()}:\n{original_msg}" for p in platforms
        }
        return {
            "diagnosis": {
                "whats_working": ["Clear core message and value statement."],
                "whats_not": ["Opening line lacks immediacy and curiosity loop.", "Formatting needs mobile spacing."],
                "content_gaps": ["Lacks social proof or key statistics.", "Missing platform-specific hashtags."],
                "improvement_plan_7d": [
                    {"day": "Day 1", "focus": "Hook Optimization", "action": "A/B test direct statement vs curiosity question"},
                    {"day": "Day 2", "focus": "Readability Formatting", "action": "Add line breaks and bold subheadings"},
                    {"day": "Day 3", "focus": "Multi-Platform Repurposing", "action": "Adapt main insight into X thread & LinkedIn post"},
                    {"day": "Day 4", "focus": "CTA & Engagement", "action": "Add explicit question CTA to boost comment velocity"},
                    {"day": "Day 5", "focus": "Visual Prompt Creation", "action": "Generate accompanying infographic prompt"},
                    {"day": "Day 6", "focus": "Audience Interactions", "action": "Engage with top commenter replies within 1 hour"},
                    {"day": "Day 7", "focus": "Metrics Assessment", "action": "Track impressions, saves, and link clicks"}
                ]
            },
            "optimized_posts": fallback_posts,
            "optimized_hooks": [
                f"Stop scrolling: {original_msg[:60]}...",
                f"Here is why most growth teams fail at this: {original_msg[:50]}..."
            ],
            "recommendations": [
                "Break up long text blocks into 1-2 sentence lines for mobile readers.",
                "Ensure every post ends with a clear, single Call to Action."
            ]
        }
