import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from app.services.groq_service import groq_service

logger = logging.getLogger(__name__)

class BaseAgent(ABC):
    """
    Abstract base class for all AI agents in Claire platform.
    """
    def __init__(self, name: str, role: str, description: str, system_prompt: str):
        self.name = name
        self.role = role
        self.description = description
        self.system_prompt = system_prompt

    @abstractmethod
    async def process_message(
        self,
        message: str,
        history: Optional[List[Any]] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process message and context, returning agent execution results.
        """
        pass

    async def call_llm(
        self,
        user_message: str,
        temperature: float = 0.7,
        json_mode: bool = False,
        extra_system_context: str = ""
    ) -> str:
        """
        Helper method to query Groq service with system prompt and user message.
        """
        system_content = f"{self.system_prompt}\n\n{extra_system_context}".strip()
        messages = [{"role": "user", "content": user_message}]
        return await groq_service.generate_chat_completion(
            messages=messages,
            temperature=temperature,
            json_mode=json_mode,
            system_prompt=system_content
        )

