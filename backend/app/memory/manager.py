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

    async def ensure_conversation_exists(
        self,
        conversation_id: str,
        user_id: Optional[str] = None,
        title: Optional[str] = None,
        brand_id: Optional[str] = "default",
        mode: Optional[str] = "auto"
    ) -> Dict[str, Any]:
        """
        Ensures a parent conversation record exists in Supabase 'conversations' table and in-memory cache.
        Always uses an upsert strategy with multi-tier fallback to ensure foreign key constraints
        on 'chat_messages' are satisfied, even for guest users or invalid user_id tokens.

        Special handling for default/guest conversations (e.g. 'conv_default_1').
        """
        if not conversation_id:
            import uuid
            conversation_id = f"conv_{uuid.uuid4().hex[:8]}"

        # Special title resolution for guest / default conversations
        default_title = title
        if not default_title:
            if conversation_id in ("conv_default_1", "default", "guest") or conversation_id.startswith("conv_default"):
                default_title = "Default Conversation"
            else:
                default_title = "New Conversation"

        clean_user_id = user_id if user_id else None

        conv_obj = {
            "id": conversation_id,
            "title": default_title,
            "user_id": clean_user_id,
            "brand_id": brand_id or "default",
            "mode": mode or "auto"
        }

        # Initialize in-memory storage for this conversation
        if conversation_id not in self._in_memory_conversations:
            self._in_memory_conversations[conversation_id] = []

        if self.client:
            success = False

            # Tier 1: Try full upsert with provided user_id
            try:
                self.client.table("conversations").upsert(conv_obj).execute()
                success = True
                logger.info(f"Successfully upserted conversation '{conversation_id}' in Supabase.")
            except Exception as e:
                logger.warning(f"Primary upsert for conversation '{conversation_id}' failed: {e}. Attempting fallbacks...")

            # Tier 2: Try upsert without user_id (bypasses auth.users FK constraints for guests/invalid tokens)
            if not success and clean_user_id is not None:
                try:
                    fallback_obj = dict(conv_obj)
                    fallback_obj["user_id"] = None
                    self.client.table("conversations").upsert(fallback_obj).execute()
                    success = True
                    conv_obj["user_id"] = None
                    logger.info(f"Fallback upsert for conversation '{conversation_id}' without user_id succeeded.")
                except Exception as e2:
                    logger.warning(f"Fallback upsert without user_id failed for conversation '{conversation_id}': {e2}")

            # Tier 3: Try minimal schema upsert (id, title, user_id=None)
            if not success:
                try:
                    minimal_obj = {
                        "id": conversation_id,
                        "title": default_title,
                        "user_id": None
                    }
                    self.client.table("conversations").upsert(minimal_obj).execute()
                    success = True
                    logger.info(f"Minimal upsert for conversation '{conversation_id}' succeeded.")
                except Exception as e3:
                    logger.warning(f"Minimal upsert for conversation '{conversation_id}' failed: {e3}")

            # Tier 4: Verification check - does row exist in Supabase?
            if not success:
                try:
                    res = self.client.table("conversations").select("id").eq("id", conversation_id).execute()
                    if res.data and len(res.data) > 0:
                        logger.info(f"Verified conversation '{conversation_id}' exists in Supabase.")
                except Exception as e4:
                    logger.error(f"Failed to verify existence of conversation '{conversation_id}': {e4}")

        return conv_obj

    async def ensure_conversation(
        self,
        conversation_id: str,
        user_id: Optional[str] = None,
        title: Optional[str] = None,
        brand_id: Optional[str] = "default",
        mode: Optional[str] = "auto"
    ) -> Dict[str, Any]:
        """
        Alias for ensure_conversation_exists for backward compatibility.
        """
        return await self.ensure_conversation_exists(
            conversation_id=conversation_id,
            user_id=user_id,
            title=title,
            brand_id=brand_id,
            mode=mode
        )

    async def list_conversations(self, user_id: Optional[str] = None) -> List[str]:
        """
        Lists distinct conversation IDs.
        Checks 'conversations' table first, falling back to 'chat_messages' table and in-memory cache.
        """
        if self.client:
            try:
                query = self.client.table("conversations").select("id")
                if user_id:
                    query = query.eq("user_id", user_id)
                response = query.execute()
                if response.data:
                    return [row["id"] for row in response.data if row.get("id")]
            except Exception as e:
                logger.debug(f"Could not list from 'conversations' table: {e}, checking 'chat_messages'.")

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
        user_id: Optional[str] = None,
        brand_id: Optional[str] = "default",
        mode: Optional[str] = "auto",
        title: Optional[str] = None
    ) -> None:
        """
        Saves user or assistant message to memory storage.
        Always calls ensure_conversation_exists() FIRST to guarantee parent conversation exists.
        Handles both authenticated users and guest users (user_id = None).
        Provides robust fallbacks against foreign key violations and schema mismatches.
        """
        if not conversation_id:
            conversation_id = "conv_default_1"

        # Special title formatting
        conv_title = title
        if not conv_title:
            if conversation_id in ("conv_default_1", "default", "guest") or conversation_id.startswith("conv_default"):
                conv_title = "Default Conversation"
            elif role == "user" and content:
                clean_content = content.replace("[Voice Input]", "").strip()
                conv_title = clean_content[:40] + ("..." if len(clean_content) > 40 else "")

        # 1. ALWAYS ensure parent conversation exists in Supabase table 'conversations' BEFORE saving message
        await self.ensure_conversation_exists(
            conversation_id=conversation_id,
            user_id=user_id,
            title=conv_title,
            brand_id=brand_id,
            mode=mode
        )

        # 2. Prepare message object
        resolved_agent_name = agent_name or ("assistant" if role == "assistant" else "user")
        meta_copy = dict(metadata or {})
        if resolved_agent_name and "agent_name" not in meta_copy:
            meta_copy["agent_name"] = resolved_agent_name

        clean_user_id = user_id if user_id else None

        message_obj = {
            "conversation_id": conversation_id,
            "role": role,
            "content": content,
            "agent_name": resolved_agent_name,
            "metadata": meta_copy,
            "user_id": clean_user_id
        }

        # 3. Always cache in-memory
        if conversation_id not in self._in_memory_conversations:
            self._in_memory_conversations[conversation_id] = []
        self._in_memory_conversations[conversation_id].append(message_obj)

        # 4. Insert into Supabase 'chat_messages' table with robust retries & fallbacks
        if self.client:
            msg_inserted = False

            # Primary Attempt
            try:
                self.client.table("chat_messages").insert(message_obj).execute()
                msg_inserted = True
            except Exception as e:
                err_str = str(e)
                logger.warning(f"Error saving chat message to Supabase (conv_id={conversation_id}): {e}")

                # If conversation foreign key error, force minimal guest conversation upsert and retry
                if "conversations" in err_str or "foreign key" in err_str.lower() or "23503" in err_str:
                    logger.warning(f"Foreign key issue detected. Force-upserting guest conversation for '{conversation_id}'...")
                    await self.ensure_conversation_exists(
                        conversation_id=conversation_id,
                        user_id=None,  # Force None to bypass auth.users FK
                        title=conv_title or "Default Conversation",
                        brand_id=brand_id,
                        mode=mode
                    )

                # Fallback Attempt A: Try without user_id (if chat_messages.user_id FK constraint failed)
                if clean_user_id is not None:
                    try:
                        fallback_msg = dict(message_obj)
                        fallback_msg["user_id"] = None
                        self.client.table("chat_messages").insert(fallback_msg).execute()
                        msg_inserted = True
                        logger.info(f"Saved message to Supabase without user_id for conv '{conversation_id}'.")
                    except Exception as fallback_user_err:
                        logger.warning(f"Message insert without user_id failed: {fallback_user_err}")

                # Fallback Attempt B: Try without agent_name top-level column
                if not msg_inserted:
                    try:
                        fallback_msg = {k: v for k, v in message_obj.items() if k != "agent_name"}
                        fallback_msg["user_id"] = None
                        self.client.table("chat_messages").insert(fallback_msg).execute()
                        msg_inserted = True
                        logger.info(f"Saved message using schema fallback (omitted agent_name and user_id).")
                    except Exception as fallback_err:
                        logger.error(f"All message insert attempts to Supabase failed for conv '{conversation_id}': {fallback_err}")

memory_manager = MemoryManager()


