from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional

from app.core.auth import get_current_user
from app.memory.manager import memory_manager

router = APIRouter(prefix="/conversations", tags=["Conversations History"])


@router.get("")
async def list_conversations(user_id: Optional[str] = Depends(get_current_user)):
    """
    List all active/saved conversation IDs for the user.
    """
    conv_ids = await memory_manager.list_conversations(user_id=user_id)
    return {"conversations": conv_ids}


@router.get("/{conversation_id}")
async def get_conversation(conversation_id: str, user_id: Optional[str] = Depends(get_current_user)):
    """
    Get full conversation messages and generated assets for restoration.
    """
    messages = await memory_manager.get_full_conversation_messages(conversation_id, user_id=user_id)
    return {
        "conversation_id": conversation_id,
        "messages": messages
    }
