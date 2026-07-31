from typing import Dict, Any, List, Optional
from app.agents.base_agent import BaseAgent
from app.agents.supervisor import SupervisorAgent

class SocialMediaManagerAgent(BaseAgent):
    """
    Primary orchestrator agent for social media tasks: strategy, post creation, scheduling, analytics.
    Delegates multi-agent operations to SupervisorAgent.
    """
    def __init__(self):
        super().__init__(
            name="Claire",
            role="Lead AI Manager",
            description="Your autonomous AI Social Media Manager",
            system_prompt="You are Claire, the Lead AI Social Media Manager."
        )
        self.supervisor = SupervisorAgent()

    async def process_message(
        self,
        message: str,
        history: Optional[List[Any]] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Delegates processing to Supervisor Agent.
        """
        return await self.supervisor.process_message(message, history=history, context=context)

