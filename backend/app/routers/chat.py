import uuid
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any

from app.agents.supervisor import SupervisorAgent
from app.core.auth import get_current_user
from app.core.rate_limit import enforce_rate_limit
from app.core.validation import (
    MAX_HISTORY_CONTENT_LENGTH,
    MAX_HISTORY_MESSAGES,
    validate_brand_id,
    validate_conversation_id,
    validate_message,
    validate_mode,
    validate_platforms,
)
from app.memory.manager import memory_manager

router = APIRouter(prefix="/chat", tags=["Chat & Agents"])


class ChatMessage(BaseModel):
    role: str
    content: str
    agent_name: Optional[str] = None

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: str) -> str:
        role = value.strip().lower()
        if role not in {"user", "assistant", "system"}:
            raise ValueError("role must be 'user', 'assistant', or 'system'.")
        return role

    @field_validator("content")
    @classmethod
    def validate_content(cls, value: str) -> str:
        content = value.strip()
        if not content:
            raise ValueError("history message content cannot be empty.")
        if len(content) > MAX_HISTORY_CONTENT_LENGTH:
            raise ValueError(f"history message content must be at most {MAX_HISTORY_CONTENT_LENGTH} characters.")
        return content


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10_000)
    conversation_id: Optional[str] = None
    brand_id: Optional[str] = "default"
    history: Optional[List[ChatMessage]] = Field(default_factory=list)
    platforms: Optional[List[str]] = Field(default_factory=lambda: ["x", "linkedin", "instagram", "tiktok", "threads"])
    mode: Optional[str] = "auto"

    @field_validator("message")
    @classmethod
    def check_message(cls, value: str) -> str:
        return validate_message(value)

    @field_validator("brand_id")
    @classmethod
    def check_brand_id(cls, value: Optional[str]) -> str:
        return validate_brand_id(value)

    @field_validator("conversation_id")
    @classmethod
    def check_conversation_id(cls, value: Optional[str]) -> Optional[str]:
        return validate_conversation_id(value)

    @field_validator("mode")
    @classmethod
    def check_mode(cls, value: Optional[str]) -> str:
        return validate_mode(value)

    @field_validator("platforms")
    @classmethod
    def check_platforms(cls, value: Optional[List[str]]) -> List[str]:
        return validate_platforms(value)

    @field_validator("history")
    @classmethod
    def check_history(cls, value: Optional[List[ChatMessage]]) -> List[ChatMessage]:
        history = value or []
        if len(history) > MAX_HISTORY_MESSAGES:
            raise ValueError(f"history may contain at most {MAX_HISTORY_MESSAGES} messages.")
        return history


class ActionItem(BaseModel):
    label: str
    action: str


class ChatResponse(BaseModel):
    reply: str
    conversation_id: str
    agent_name: str
    platform_posts: Optional[Dict[str, str]] = None
    optimized_posts: Optional[Dict[str, str]] = None
    diagnosis: Optional[Dict[str, Any]] = None
    calendar: Optional[List[Dict[str, Any]]] = None
    exports: Optional[Dict[str, str]] = None
    image_prompts: Optional[List[Dict[str, Any]]] = None
    agent_steps: Optional[List[Dict[str, Any]]] = None
    actions: Optional[List[Dict[str, Any]]] = None
    intent: Optional[str] = None


@router.post("", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    user_id: str = Depends(get_current_user),
    _rate_limit: None = Depends(enforce_rate_limit),
):
    """
    Main chat endpoint to interact with Claire multi-agent social media orchestrator.
    """
    try:
        conv_id = request.conversation_id or f"conv_{uuid.uuid4().hex[:8]}"

        await memory_manager.save_message(
            conversation_id=conv_id,
            role="user",
            content=request.message,
            user_id=user_id
        )

        supervisor = SupervisorAgent()
        context = {
            "brand_id": request.brand_id,
            "mode": request.mode,
            "platforms": request.platforms,
            "user_id": user_id
        }

        response = await supervisor.process_message(
            message=request.message,
            history=request.history,
            context=context
        )

        reply = response.get("reply", "No response generated.")

        # Save assistant message with full metadata
        metadata = {
            "platform_posts": response.get("platform_posts"),
            "optimized_posts": response.get("optimized_posts"),
            "diagnosis": response.get("diagnosis"),
            "calendar": response.get("calendar"),
            "exports": response.get("exports"),
            "image_prompts": response.get("image_prompts"),
            "agent_steps": response.get("agent_steps"),
            "actions": response.get("actions"),
            "intent": response.get("intent")
        }

        await memory_manager.save_message(
            conversation_id=conv_id,
            role="assistant",
            content=reply,
            agent_name=supervisor.name,
            metadata=metadata,
            user_id=user_id
        )

        return ChatResponse(
            reply=reply,
            conversation_id=conv_id,
            agent_name=supervisor.name,
            platform_posts=response.get("platform_posts"),
            optimized_posts=response.get("optimized_posts"),
            diagnosis=response.get("diagnosis"),
            calendar=response.get("calendar"),
            exports=response.get("exports"),
            image_prompts=response.get("image_prompts"),
            agent_steps=response.get("agent_steps"),
            actions=response.get("actions"),
            intent=response.get("intent")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in chat processing: {str(e)}")
