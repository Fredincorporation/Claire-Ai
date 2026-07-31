import time
import logging
from typing import List, Dict, Any, Optional
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger(__name__)

CACHE_TTL_SECONDS = 300  # 5-minute in-memory cache for profiles & listings

class MemoryManager:
    """
    Manages brand profiles and conversation history with Supabase,
    with multi-user isolation, TTL caching, and seamless in-memory fallback.
    """
    def __init__(self):
        self.supabase_url = settings.SUPABASE_URL
        self.supabase_key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
        self.client: Optional[Client] = None

        # In-memory fallbacks & caches
        self._in_memory_conversations: Dict[str, List[Dict[str, Any]]] = {}
        self._in_memory_brands: Dict[str, Dict[str, Any]] = {}
        self._cache_timestamps: Dict[str, float] = {}

        if self.supabase_url and self.supabase_key:
            try:
                self.client = create_client(self.supabase_url, self.supabase_key)
                logger.info("Supabase client initialized in MemoryManager.")
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

    async def get_brand_profile(self, brand_id: Optional[str] = "default", user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Retrieves brand voice and strategy profile with TTL caching and user filtering.
        """
        target_id = brand_id or "default"
        keys_to_check = [
            f"brand_{user_id}_{target_id}" if user_id else None,
            f"brand_anon_{target_id}",
            f"brand_{target_id}"
        ]

        now = time.time()
        for k in keys_to_check:
            if k and k in self._in_memory_brands and (now - self._cache_timestamps.get(k, 0)) < CACHE_TTL_SECONDS:
                return self._in_memory_brands[k]

        if self.client:
            try:
                query = self.client.table("brand_profiles").select("*").eq("id", target_id)
                if user_id:
                    query = query.eq("user_id", user_id)
                response = query.execute()
                if response.data and len(response.data) > 0:
                    profile = response.data[0]
                    cache_key = f"brand_{user_id or 'anon'}_{target_id}"
                    self._in_memory_brands[cache_key] = profile
                    self._cache_timestamps[cache_key] = now
                    return profile
            except Exception as e:
                logger.warning(f"Error reading brand profile from Supabase: {e}")

        default_profile = self.get_default_brand_profile()
        default_profile["id"] = target_id
        default_profile["user_id"] = user_id if user_id else None
        return default_profile

    async def save_brand_profile(self, brand_id: str, profile_data: Dict[str, Any], user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Saves or updates brand profile and immediately updates all in-memory cache keys.
        """
        profile_data["id"] = brand_id
        profile_data["user_id"] = user_id if user_id else None

        now = time.time()
        keys_to_update = [
            f"brand_{user_id}_{brand_id}" if user_id else None,
            f"brand_anon_{brand_id}",
            f"brand_{brand_id}"
        ]
        for k in keys_to_update:
            if k:
                self._in_memory_brands[k] = profile_data
                self._cache_timestamps[k] = now

        if self.client:
            try:
                self.client.table("brand_profiles").upsert(profile_data).execute()
            except Exception as e:
                logger.warning(f"Error saving brand profile to Supabase: {e}")

        return profile_data

    async def get_full_conversation_messages(self, conversation_id: str, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Retrieves complete messages with full metadata for restoring session state.
        """
        if self.client:
            try:
                query = self.client.table("chat_messages").select("*").eq("conversation_id", conversation_id)
                if user_id:
                    query = query.eq("user_id", user_id)
                response = query.order("created_at", desc=False).execute()
                if response.data:
                    for msg in response.data:
                        if not msg.get("agent_name"):
                            meta = msg.get("metadata") or {}
                            if isinstance(meta, dict) and meta.get("agent_name"):
                                msg["agent_name"] = meta["agent_name"]
                    return response.data
            except Exception as e:
                logger.warning(f"Error reading full chat history from Supabase: {e}")

        return self._in_memory_conversations.get(conversation_id, [])

    async def list_conversations(self, user_id: Optional[str] = None) -> List[str]:
        """
        Lists distinct conversation IDs.
        """
        if self.client:
            try:
                query = self.client.table("chat_messages").select("conversation_id")
                if user_id:
                    query = query.eq("user_id", user_id)
                response = query.execute()
                if response.data:
                    ids = list({row["conversation_id"] for row in response.data if row.get("conversation_id")})
                    return ids
            except Exception as e:
                logger.warning(f"Error listing conversations from Supabase: {e}")

        return list(self._in_memory_conversations.keys())

    async def save_message(
        self,
        conversation_id: str,
        role: str,
        content: str,
        agent_name: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None
    ) -> None:
        """
        Saves user or assistant message to memory storage.
        Handles user_id being None for guest users (NULL in DB).
        Safely handles agent_name both in column and inside metadata for schema resilience.
        """
        resolved_agent_name = agent_name or ("assistant" if role == "assistant" else "user")

        meta_copy = dict(metadata or {})
        if resolved_agent_name and "agent_name" not in meta_copy:
            meta_copy["agent_name"] = resolved_agent_name

        message_obj = {
            "conversation_id": conversation_id,
            "role": role,
            "content": content,
            "agent_name": resolved_agent_name,
            "metadata": meta_copy,
            "user_id": user_id if user_id else None
        }

        if conversation_id not in self._in_memory_conversations:
            self._in_memory_conversations[conversation_id] = []
        self._in_memory_conversations[conversation_id].append(message_obj)

        if self.client:
            try:
                self.client.table("chat_messages").insert(message_obj).execute()
            except Exception as e:
                err_str = str(e)
                logger.warning(f"Error saving chat message to Supabase: {e}")
                if "agent_name" in err_str or "PGRST204" in err_str or "column" in err_str.lower():
                    try:
                        fallback_obj = {k: v for k, v in message_obj.items() if k != "agent_name"}
                        self.client.table("chat_messages").insert(fallback_obj).execute()
                        logger.info("Saved message using fallback schema (omitted top-level agent_name column).")
                    except Exception as fallback_err:
                        logger.warning(f"Fallback message insert to Supabase failed: {fallback_err}")

memory_manager = MemoryManager()


