import logging
from typing import Dict, Any, List, Optional
from app.agents.base_agent import BaseAgent
from app.tools.tavily import TavilyTool

logger = logging.getLogger(__name__)

class ResearcherAgent(BaseAgent):
    """
    Agent responsible for conducting market research, web trend search, and topic insights.
    """
    def __init__(self):
        system_prompt = """You are Claire's Lead Market & Trend Researcher.
Your job is to analyze topic requests, gather relevant live facts, market statistics, trending keywords, and target audience pain points.
Be concise, fact-focused, and provide structured, high-value key takeaways for social media content creation."""
        
        super().__init__(
            name="Research Agent",
            role="Researcher",
            description="Searches trends, validates facts, and extracts key insights for social strategy.",
            system_prompt=system_prompt
        )
        self.tavily_tool = TavilyTool()

    async def process_message(
        self, 
        message: str, 
        history: Optional[List[Any]] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Conduct search and synthesize research context.
        """
        search_query = message.strip()
        search_data = await self.tavily_tool.execute(query=search_query)

        synthesis_prompt = f"""
User Topic: {message}

Search Results & Context:
Answer: {search_data.get('answer')}
Results: {search_data.get('results')}

Provide a structured research synthesis with:
1. 3 Key Facts / Market Trends
2. Primary Audience Pain Points / Desires
3. Top 3 Keywords / Angles to leverage
        """

        summary = await self.call_llm(user_message=synthesis_prompt, temperature=0.5)

        return {
            "agent_name": self.name,
            "role": self.role,
            "research_summary": summary,
            "raw_search": search_data,
            "status": "success"
        }
