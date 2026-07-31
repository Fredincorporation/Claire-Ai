import logging
from typing import List, Dict, Any, Optional
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger(__name__)

class MemoryManager:
    """
    Manages brand profiles and conversation history with Supabase,
    falling back seamlessly to in-memory dictionary storage if Supabase is unconfigured or fails.
    """
    def __init__(self):
        self.supabase_url = settings.SUPABASE_URL
        self.supabase_key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
        self.client: Optional[Client] = None

        # In-memory fallbacks
        self._in_memory_conversations: Dict[str, List[Dict[str, Any]]] = {}
        self._in_memory_brands: Dict[str, Dict[str, Any]] = {}

        if self.supabase_url and self.supabase_key:
            try:
                self.client = create_client(self.supabase_url, self.supabase_key)
                logger.info("Supabase client initialized successfully in MemoryManager.")
            except Exception as e:
                logger.warning(f"Failed to initialize Supabase client: {e}. Using in-memory store.")
                self.client = None
        else:
            logger.info("Supabase settings not fully provided. Using in-memory memory manager.")

    def get_default_brand_profile(self) -> Dict[str, Any]:
        return {
            "id": "default",
            "name": "Claire AI",
            "tagline": "The Autonomous AI Social Media Manager",
            "tone_of_voice": "Authoritative, empathetic, engaging, data-backed, zero fluff",
            "target_audience": "Founders, Marketers, Creators, and Growth Teams",
            "content_pillars": ["AI & Automation", "Social Media Strategy", "Growth Analytics", "Content Creation"],
            "style_guidelines": "Use strong hooks, short crisp paragraphs, high formatting readability, clear call-to-actions.",
            "visual_style": "Modern minimalist, high-tech dark mode aesthetic, vibrant accents, sleek typography",
            "do_not_use": ["synergy", "paradigm shift", "leverage (overused)", "buzzwords without context"]
        }

    async def get_brand_profile(self, brand_id: Optional[str] = "default") -> Dict[str, Any]:
        """
        Retrieves brand voice and strategy profile.
        """
        target_id = brand_id or "default"

        if target_id in self._in_memory_brands:
            return self._in_memory_brands[target_id]

        if self.client:
            try:
                response = self.client.table("brand_profiles").select("*").eq("id", target_id).execute()
                if response.data and len(response.data) > 0:
                    profile = response.data[0]
                    self._in_memory_brands[target_id] = profile
                    return profile
            except Exception as e:
                logger.warning(f"Error reading brand profile from Supabase: {e}")

        default_profile = self.get_default_brand_profile()
        default_profile["id"] = target_id
        return default_profile

    async def save_brand_profile(self, brand_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Saves or updates brand profile.
        """
        profile_data["id"] = brand_id
        self._in_memory_brands[brand_id] = profile_data

        if self.client:
            try:
                self.client.table("brand_profiles").upsert(profile_data).execute()
            except Exception as e:
                logger.warning(f"Error saving brand profile to Supabase: {e}")

        return profile_data

    async def get_conversation_history(self, conversation_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Retrieves context history for a given conversation.
        """
        if self.client:
            try:
                response = self.client.table("chat_messages")\
                    .select("role, content, agent_name, created_at")\
                    .eq("conversation_id", conversation_id)\
                    .order("created_at", desc=False)\
                    .limit(limit)\
                    .execute()
                if response.data:
                    return response.data
            except Exception as e:
                logger.warning(f"Error reading chat history from Supabase: {e}")

        return self._in_memory_conversations.get(conversation_id, [])[-limit:]

    async def save_message(
        self,
        conversation_id: str,
        role: str,
        content: str,
        agent_name: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Saves user or assistant message to memory storage.
        """
        message_obj = {
            "conversation_id": conversation_id,
            "role": role,
            "content": content,
            "agent_name": agent_name or ("assistant" if role == "assistant" else "user"),
            "metadata": metadata or {}
        }

        if conversation_id not in self._in_memory_conversations:
            self._in_memory_conversations[conversation_id] = []
        self._in_memory_conversations[conversation_id].append(message_obj)

        if self.client:
            try:
                self.client.table("chat_messages").insert(message_obj).execute()
            except Exception as e:
                logger.warning(f"Error saving chat message to Supabase: {e}")

memory_manager = MemoryManager()

