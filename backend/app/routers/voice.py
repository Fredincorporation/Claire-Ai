import uuid
import logging
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from app.agents.supervisor import SupervisorAgent
from app.core.auth import get_current_user
from app.core.rate_limit import enforce_rate_limit
from app.core.validation import (
    ALLOWED_AUDIO_CONTENT_TYPES,
    MAX_VOICE_FILE_BYTES,
    validate_brand_id,
    validate_conversation_id,
    validate_message,
    validate_mode,
)
from app.memory.manager import memory_manager
from app.routers.chat import ChatResponse
from app.services.groq_service import groq_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/voice", tags=["Voice & Audio"])


class VoiceResponse(BaseModel):
    transcription: str
    chat_response: ChatResponse


@router.post("", response_model=VoiceResponse)
async def voice_endpoint(
    file: UploadFile = File(...),
    conversation_id: Optional[str] = Form(None),
    brand_id: Optional[str] = Form("default"),
    mode: Optional[str] = Form("auto"),
    user_id: str = Depends(get_current_user),
    _rate_limit: None = Depends(enforce_rate_limit),
):
    """
    Transcribes audio via Groq Whisper and passes transcription to Claire multi-agent orchestrator.
    """
    try:
        validated_brand_id = validate_brand_id(brand_id)
        validated_mode = validate_mode(mode)
        validated_conversation_id = validate_conversation_id(conversation_id)

        file_bytes = await file.read()
        if not file_bytes:
            raise HTTPException(status_code=400, detail="Uploaded audio file is empty.")
        if len(file_bytes) > MAX_VOICE_FILE_BYTES:
            raise HTTPException(
                status_code=413,
                detail=f"Audio file exceeds maximum size of {MAX_VOICE_FILE_BYTES // (1024 * 1024)} MB.",
            )

        content_type = (file.content_type or "application/octet-stream").lower()
        if content_type not in ALLOWED_AUDIO_CONTENT_TYPES:
            raise HTTPException(
                status_code=415,
                detail=f"Unsupported audio type '{content_type}'. Upload WAV, MP3, MP4, WebM, OGG, or FLAC.",
            )

        transcription = await groq_service.transcribe_audio(
            file_bytes=file_bytes,
            filename=file.filename or "voice_input.wav",
            content_type=content_type,
        )
        transcription = validate_message(transcription)

        conv_id = validated_conversation_id or f"conv_voice_{uuid.uuid4().hex[:8]}"

        await memory_manager.save_message(
            conversation_id=conv_id,
            role="user",
            content=f"[Voice Input] {transcription}",
            user_id=user_id
        )

        supervisor = SupervisorAgent()
        context = {
            "brand_id": validated_brand_id,
            "mode": validated_mode,
            "platforms": ["x", "linkedin", "instagram", "tiktok", "threads"]
        }

        response = await supervisor.process_message(
            message=transcription,
            context=context
        )

        reply = response.get("reply", "No response generated from voice message.")

        await memory_manager.save_message(
            conversation_id=conv_id,
            role="assistant",
            content=reply,
            agent_name=supervisor.name,
            user_id=user_id
        )

        chat_resp = ChatResponse(
            reply=reply,
            conversation_id=conv_id,
            agent_name=supervisor.name,
            platform_posts=response.get("platform_posts"),
            image_prompts=response.get("image_prompts"),
            agent_steps=response.get("agent_steps"),
            actions=response.get("actions"),
            intent=response.get("intent")
        )

        return VoiceResponse(
            transcription=transcription,
            chat_response=chat_resp
        )
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Voice endpoint error: {e}")
        raise HTTPException(status_code=500, detail=f"Voice processing failed: {str(e)}")
