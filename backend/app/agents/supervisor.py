import logging
from typing import Dict, Any, List, Optional
from app.agents.base_agent import BaseAgent
from app.agents.researcher import ResearcherAgent
from app.agents.strategist import StrategistAgent
from app.agents.writer import WriterAgent
from app.agents.editor import EditorAgent
from app.agents.optimizer import OptimizerAgent
from app.memory.manager import memory_manager

logger = logging.getLogger(__name__)

class SupervisorAgent(BaseAgent):
    """
    Supervisor Agent (Claire) that orchestrates the custom multi-agent workflow
    without external heavy frameworks (No CrewAI / LangGraph).
    """
    def __init__(self):
        system_prompt = """You are Claire, an elite autonomous AI Social Media Manager and Lead Supervisor.
You coordinate a specialized team of AI agents (Researcher, Strategist, Writer, Editor, Optimizer)
to deliver top-tier social media strategies, platform-native content, and growth insights."""

        super().__init__(
            name="Claire Supervisor",
            role="Supervisor",
            description="Main orchestrator that coordinates specialized agents for end-to-end social media operations.",
            system_prompt=system_prompt
        )

        # Initialize sub-agents
        self.researcher = ResearcherAgent()
        self.strategist = StrategistAgent()
        self.writer = WriterAgent()
        self.editor = EditorAgent()
        self.optimizer = OptimizerAgent()

    async def process_message(
        self,
        message: str,
        history: Optional[List[Any]] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Main orchestration logic.
        """
        ctx = context or {}
        brand_id = ctx.get("brand_id", "default")
        user_id = ctx.get("user_id")
        mode = ctx.get("mode", "auto")
        target_platforms = ctx.get("platforms") or ["x", "linkedin", "instagram", "tiktok", "threads"]

        # Fetch brand voice context
        brand_profile = await memory_manager.get_brand_profile(brand_id, user_id=user_id)
        ctx["brand_profile"] = brand_profile

        # Determine workflow mode
        intent = self._determine_intent(message, mode)
        logger.info(f"Supervisor intent resolved as: '{intent}'")

        agent_steps: List[Dict[str, Any]] = []
        platform_posts: Dict[str, str] = {}
        optimized_posts: Dict[str, str] = {}
        diagnosis: Optional[Dict[str, Any]] = None
        calendar: Optional[List[Dict[str, Any]]] = None
        exports: Optional[Dict[str, str]] = None
        image_prompts: List[Dict[str, Any]] = []
        reply_text = ""
        actions: List[Dict[str, str]] = []

        if intent == "calendar":
            # Dedicated Content-Calendar Pipeline: Strategist -> Editor
            timeframe = "monthly" if any(w in message.lower() for w in ["month", "monthly", "30 days", "30-day", "4 weeks"]) else "weekly"
            calendar = await self.strategist.generate_calendar(message, timeframe=timeframe, context=ctx)
            agent_steps.append({
                "agent_name": self.strategist.name,
                "role": self.strategist.role,
                "summary": f"Generated a {len(calendar)}-item content schedule ({timeframe}).",
                "data": {"item_count": len(calendar), "timeframe": timeframe}
            })

            # Pass calendar posts through Editor for brand voice verification
            draft_posts = {f"Day {item.get('day_number', idx+1)} ({item.get('platform', 'x')})": item.get("post_content", "") for idx, item in enumerate(calendar)}
            ctx["platform_posts"] = draft_posts
            edit_result = await self.editor.process_message(message, context=ctx)
            agent_steps.append({
                "agent_name": self.editor.name,
                "role": self.editor.role,
                "summary": "Verified content calendar against brand guidelines and tone.",
                "data": edit_result.get("editor_notes")
            })

            # Build export formats for calendar
            from datetime import datetime, timedelta
            start_date = datetime.now() + timedelta(days=1)
            csv_lines = ["Date,Time,Text,Platform,Theme"]
            md_lines = ["# Content Calendar Plan\n"]
            txt_lines = ["CONTENT CALENDAR SCHEDULE\n"]

            for idx, item in enumerate(calendar):
                post_date = (start_date + timedelta(days=idx)).strftime("%Y-%m-%d")
                d_label = item.get("day_label", f"Day {idx+1}")
                plat = item.get("platform", "x").upper()
                thm = item.get("theme", "General")
                tme = item.get("best_time", "09:00 AM")
                cnt = item.get("post_content", "")

                md_lines.append(f"### {d_label} | {plat} ({tme}) - *{thm}*\n{cnt}\n")
                txt_lines.append(f"[{d_label} - {plat} @ {tme}]\nTheme: {thm}\nContent: {cnt}\n")
                clean_cnt = cnt.replace('"', '""')
                csv_lines.append(f"\"{post_date}\",\"{tme}\",\"{clean_cnt}\",\"{plat}\",\"{thm}\"")

            exports = {
                "markdown": "\n".join(md_lines),
                "buffer_csv": "\n".join(csv_lines),
                "plain_text": "\n".join(txt_lines)
            }

            reply_text = f"I've generated a comprehensive {len(calendar)}-day Content Calendar tailored for your target channels with optimal posting times and theme pillars."
            actions = [
                {"label": "Download Markdown", "action": "download_md"},
                {"label": "Export Buffer CSV", "action": "download_csv"}
            ]

        elif intent == "optimize":
            # Optimization Pipeline: Optimizer -> Editor
            opt_result = await self.optimizer.process_message(message, context=ctx)
            agent_steps.append({
                "agent_name": self.optimizer.name,
                "role": self.optimizer.role,
                "summary": "Analyzed post hooks, readability, engagement structure, and content gaps.",
                "data": opt_result.get("optimization", {})
            })

            opt_data = opt_result.get("optimization", {})
            diagnosis = opt_data.get("diagnosis", {})
            optimized_posts = opt_data.get("optimized_posts", {})
            exports = opt_result.get("exports")

            # Editor pass
            ctx["platform_posts"] = optimized_posts if optimized_posts else {"primary": opt_data.get("optimized_post", message)}
            ctx["brand_id"] = brand_id
            edit_result = await self.editor.process_message(message, context=ctx)
            agent_steps.append({
                "agent_name": self.editor.name,
                "role": self.editor.role,
                "summary": "Polished optimized drafts to ensure strict brand voice compliance.",
                "data": edit_result.get("editor_notes")
            })

            platform_posts = edit_result.get("platform_posts", optimized_posts)
            reply_text = f"I've completed a full content audit and optimized your copy across all target channels! Check the diagnosis, platform rewrites, and 7-day action plan below."
            actions = [
                {"label": "Copy All Rewrites", "action": "copy_all"},
                {"label": "Download Audit Report", "action": "download_md"}
            ]

        elif intent == "research":
            # Research Pipeline: Researcher -> Strategist
            res_result = await self.researcher.process_message(message, context=ctx)
            agent_steps.append({
                "agent_name": self.researcher.name,
                "role": self.researcher.role,
                "summary": "Gathered live web research and industry trends via Tavily.",
                "data": res_result.get("research_summary")
            })

            ctx["research_summary"] = res_result.get("research_summary")
            strat_result = await self.strategist.process_message(message, context=ctx)
            agent_steps.append({
                "agent_name": self.strategist.name,
                "role": self.strategist.role,
                "summary": "Formulated research-backed strategy and audience positioning.",
                "data": strat_result.get("strategy")
            })

            reply_text = f"Here is the market research and strategy synthesis for '{message}':\n\n{strat_result.get('strategy')}"
            actions = [
                {"label": "Create Posts from Research", "action": "create_posts"},
                {"label": "Save Strategy", "action": "save_strategy"}
            ]

        elif intent == "chat":
            # Direct Strategy Chat
            strat_result = await self.strategist.process_message(message, context=ctx)
            agent_steps.append({
                "agent_name": self.strategist.name,
                "role": self.strategist.role,
                "summary": "Provided direct social media strategic counsel.",
                "data": strat_result.get("strategy")
            })
            reply_text = strat_result.get("strategy", "How else can I assist with your social strategy?")
            actions = [
                {"label": "Generate Campaign Posts", "action": "create_posts"}
            ]

        else:
            # Full Content Creation Pipeline: Researcher -> Strategist -> Writer -> Editor
            # 1. Researcher
            res_result = await self.researcher.process_message(message, context=ctx)
            agent_steps.append({
                "agent_name": self.researcher.name,
                "role": self.researcher.role,
                "summary": "Researched audience trends, keywords, and market insights.",
                "data": res_result.get("research_summary")
            })

            # 2. Strategist
            ctx["research_summary"] = res_result.get("research_summary")
            strat_result = await self.strategist.process_message(message, context=ctx)
            agent_steps.append({
                "agent_name": self.strategist.name,
                "role": self.strategist.role,
                "summary": "Formulated channel hooks and distribution angles.",
                "data": strat_result.get("strategy")
            })

            # 3. Writer
            ctx["strategy"] = strat_result.get("strategy")
            ctx["platforms"] = target_platforms
            write_result = await self.writer.process_message(message, context=ctx)
            agent_steps.append({
                "agent_name": self.writer.name,
                "role": self.writer.role,
                "summary": f"Drafted platform-native posts for {', '.join(target_platforms)} and visual prompts.",
                "data": write_result.get("platform_posts")
            })

            # 4. Editor
            ctx["platform_posts"] = write_result.get("platform_posts", {})
            ctx["brand_id"] = brand_id
            edit_result = await self.editor.process_message(message, context=ctx)
            agent_steps.append({
                "agent_name": self.editor.name,
                "role": self.editor.role,
                "summary": "Polished drafts for brand alignment, tone, formatting, and impact.",
                "data": edit_result.get("editor_notes")
            })

            platform_posts = edit_result.get("platform_posts", write_result.get("platform_posts", {}))
            image_prompts = write_result.get("image_prompts", [])

            reply_text = f"I've created custom content across {len(platform_posts)} platforms based on your strategy! Here is a summary of the campaign:\n\n**Strategy Hook:** {strat_result.get('strategy', '')[:200]}...\n\nCheck out the platform posts and visual prompts generated below."
            actions = [
                {"label": "Schedule All Posts", "action": "schedule"},
                {"label": "Copy Content", "action": "copy_all"},
                {"label": "Regenerate Image Prompts", "action": "regen_visuals"}
            ]

        # Generate default export bundle if not built by specific mode
        if not exports and platform_posts:
            from datetime import datetime, timedelta
            start_date = datetime.now() + timedelta(days=1)
            md_lines = ["# Campaign Content Export\n"]
            csv_lines = ["Date,Time,Text,Platform"]
            txt_lines = ["CAMPAIGN CONTENT SUMMARY\n"]
            for idx, (plat, content) in enumerate(platform_posts.items()):
                post_date = (start_date + timedelta(days=idx)).strftime("%Y-%m-%d")
                md_lines.append(f"### {plat.upper()}\n{content}\n")
                txt_lines.append(f"=== {plat.upper()} ===\n{content}\n")
                clean_c = content.replace('"', '""')
                csv_lines.append(f"\"{post_date}\",\"09:00 AM\",\"{clean_c}\",\"{plat.capitalize()}\"")
            exports = {
                "markdown": "\n".join(md_lines),
                "buffer_csv": "\n".join(csv_lines),
                "plain_text": "\n".join(txt_lines)
            }

        return {
            "reply": reply_text,
            "platform_posts": platform_posts,
            "optimized_posts": optimized_posts,
            "diagnosis": diagnosis,
            "calendar": calendar,
            "exports": exports,
            "image_prompts": image_prompts,
            "agent_steps": agent_steps,
            "actions": actions,
            "intent": intent,
            "status": "success"
        }

    def _determine_intent(self, message: str, explicit_mode: str) -> str:
        """
        Infers user intent from explicit parameter or message keywords.
        """
        if explicit_mode in ["create", "optimize", "research", "calendar", "chat"]:
            return explicit_mode

        msg_lower = message.lower()
        if any(k in msg_lower for k in ["calendar", "schedule", "content plan", "weekly plan", "monthly plan", "planner"]):
            return "calendar"
        if any(k in msg_lower for k in ["optimize", "rewrite", "improve", "critique", "fix my post", "better hook"]):
            return "optimize"
        if any(k in msg_lower for k in ["research", "search", "stats", "data on", "find trends"]):
            return "research"
        if any(k in msg_lower for k in ["what should i post", "strategy for", "how do i grow", "ideas for"]):
            return "chat"

        return "create"
