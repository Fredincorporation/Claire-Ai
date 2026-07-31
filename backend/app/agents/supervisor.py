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
        mode = ctx.get("mode", "auto")
        target_platforms = ctx.get("platforms") or ["x", "linkedin", "instagram", "tiktok", "threads"]

        # Fetch brand voice context
        brand_profile = await memory_manager.get_brand_profile(brand_id)
        ctx["brand_profile"] = brand_profile

        # Determine workflow mode
        intent = self._determine_intent(message, mode)
        logger.info(f"Supervisor intent resolved as: '{intent}'")

        agent_steps: List[Dict[str, Any]] = []
        platform_posts: Dict[str, str] = {}
        image_prompts: List[Dict[str, Any]] = []
        reply_text = ""
        actions: List[Dict[str, str]] = []

        if intent == "optimize":
            # Optimization Pipeline: Optimizer -> Editor
            opt_result = await self.optimizer.process_message(message, context=ctx)
            agent_steps.append({
                "agent_name": self.optimizer.name,
                "role": self.optimizer.role,
                "summary": "Analyzed post hooks, readability, and engagement structure.",
                "data": opt_result.get("optimization", {})
            })

            ctx["platform_posts"] = {"primary": opt_result.get("optimization", {}).get("optimized_post", message)}
            ctx["brand_id"] = brand_id
            edit_result = await self.editor.process_message(message, context=ctx)
            agent_steps.append({
                "agent_name": self.editor.name,
                "role": self.editor.role,
                "summary": "Polished optimized draft to ensure perfect brand voice alignment.",
                "data": edit_result.get("editor_notes")
            })

            platform_posts = edit_result.get("platform_posts", {})
            reply_text = f"I've optimized your post! Here is the performance breakdown and brand-aligned version:\n\n{opt_result.get('optimization', {}).get('optimized_post', message)}"
            actions = [
                {"label": "Copy Optimized Post", "action": "copy"},
                {"label": "Generate Image Prompt", "action": "generate_image"}
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

        return {
            "reply": reply_text,
            "platform_posts": platform_posts,
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
        if explicit_mode in ["create", "optimize", "research", "chat"]:
            return explicit_mode

        msg_lower = message.lower()
        if any(k in msg_lower for k in ["optimize", "rewrite", "improve", "critique", "fix my post", "better hook"]):
            return "optimize"
        if any(k in msg_lower for k in ["research", "search", "stats", "data on", "find trends"]):
            return "research"
        if any(k in msg_lower for k in ["what should i post", "strategy for", "how do i grow", "ideas for"]):
            return "chat"

        return "create"
