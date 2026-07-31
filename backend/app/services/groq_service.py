import logging
from typing import List, Dict, Any, Optional
from groq import AsyncGroq
from app.core.config import settings

logger = logging.getLogger(__name__)

class GroqService:
    """
    Wrapper service for Groq LLM and Groq Whisper Transcription APIs.
    Includes automatic fallback when API keys are unconfigured or calls fail.
    """
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        self.whisper_model = settings.GROQ_WHISPER_MODEL
        
        if self.api_key:
            self.client: Optional[AsyncGroq] = AsyncGroq(api_key=self.api_key)
        else:
            self.client = None
            logger.warning("GROQ_API_KEY is not set. GroqService running in fallback mode.")

    async def generate_chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        json_mode: bool = False,
        system_prompt: Optional[str] = None
    ) -> str:
        """
        Generate chat completion using Groq LLM.
        """
        full_messages = []
        if system_prompt:
            full_messages.append({"role": "system", "content": system_prompt})
        full_messages.extend(messages)

        if not self.client:
            return self._mock_llm_response(full_messages, json_mode)

        try:
            kwargs: Dict[str, Any] = {
                "model": self.model,
                "messages": full_messages,
                "temperature": temperature,
            }
            if json_mode:
                kwargs["response_format"] = {"type": "json_object"}

            response = await self.client.chat.completions.create(**kwargs)
            return response.choices[0].message.content or ""
        except Exception as e:
            logger.error(f"Groq API call error: {e}. Falling back to simulated response.")
            return self._mock_llm_response(full_messages, json_mode)

    async def transcribe_audio(
        self,
        file_bytes: bytes,
        filename: str = "audio.wav",
        content_type: str = "audio/wav"
    ) -> str:
        """
        Transcribe audio using Groq Whisper.
        """
        if not self.client:
            return "Create a viral strategy for launching our new AI tool next week on X and LinkedIn."

        try:
            transcription = await self.client.audio.transcriptions.create(
                file=(filename, file_bytes, content_type or "audio/wav"),
                model=self.whisper_model,
                response_format="json"
            )
            return transcription.text.strip()
        except Exception as e:
            logger.error(f"Groq Whisper transcription error: {e}")
            raise RuntimeError(f"Voice transcription failed: {str(e)}")

    def _mock_llm_response(self, messages: List[Dict[str, str]], json_mode: bool) -> str:
        """
        Provides fallback responses when Groq API key is missing or fails.
        """
        user_msg = ""
        for m in reversed(messages):
            if m.get("role") == "user":
                user_msg = m.get("content", "")
                break

        if json_mode:
            import json
            return json.dumps({
                "summary": f"Analyzed prompt: '{user_msg}'",
                "content": f"High quality response generated for '{user_msg}'",
                "platforms": ["x", "linkedin", "instagram", "tiktok", "threads"],
                "status": "success"
            })
        
        return f"Simulated Claire AI response: I received '{user_msg}'. Configure your GROQ_API_KEY in .env for live Groq LLM generations."

groq_service = GroqService()
