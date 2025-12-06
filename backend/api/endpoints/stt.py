"""
Ovozly Backend - Speech-to-Text API Endpoints

This module provides REST API endpoints for audio processing and speech analysis.
Supports both async (Celery-based) and sync (AISHA API) processing modes.
"""

import uuid
from io import BytesIO
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from loguru import logger
from sqlalchemy.orm import Session

from ai import aisha_ai
from ai.audio_utils import get_audio_duration
from api.deps import get_db, get_user
from api.schemas.call import Call as CallSchema
from core.celery_app import celery
from core.tasks import convert_audio_to_text
from db import Call
from db.models.user import User
from utils.bucket import upload_bytesio_and_make_public
from utils.text import get_extension


router = APIRouter(prefix="/stt", tags=["Speech-to-Text"])


@router.post("/submit-audio", response_model=CallSchema)
async def upload_audio(
    file: UploadFile = File(...),
    auth_user: User = Depends(get_user),
    db: Session = Depends(get_db),
):
    """
    Upload an audio file for asynchronous processing.

    The audio is stored in GCS and a Celery task is queued for processing.
    Use the task-status endpoint to check processing progress.

    Args:
        file: Audio file (WAV, MP3, OGG supported)

    Returns:
        Call object with task_id for status tracking
    """
    logger.debug(f"User {auth_user.email} is uploading an audio file")
    # Validate file type
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File must be an audio file.")

    # read audio
    audio_raw = await file.read()
    audio_ext = get_extension(file.filename)
    blob_name = f"{uuid.uuid4()}_{file.filename}"

    logger.debug(f"{audio_ext=} {blob_name=}")

    # upload audio to blob storage
    audio = BytesIO(audio_raw)
    blob_url = upload_bytesio_and_make_public(audio, blob_name)
    logger.debug("File uploaded:", blob_url)

    # save call in db
    call = Call(
        file_id=blob_url,
        agent_id=auth_user.id,
        status="RUNNING",
        call_duration=get_audio_duration(audio, audio_ext),
    )
    db.add(call)
    db.commit()
    db.refresh(call)

    # create celery task for analysis
    result = convert_audio_to_text.delay(audio_raw, audio_ext, call.id)
    call.celery_task_id = result.task_id
    db.commit()

    return call


@router.post("/submit-audio-v2")
async def upload_audio_v2(
    file: UploadFile = File(...),
    auth_user: User = Depends(get_user),
    db: Session = Depends(get_db),
):
    """
    Upload an audio file for synchronous processing via AISHA API.

    This endpoint processes the audio immediately and returns results.
    Supports MP3, WAV, and OGG formats.

    Args:
        file: Audio file to process

    Returns:
        Transcription result from AISHA API
    """
    logger.debug(f"User {auth_user.email} is uploading an audio file")

    content_type = file.content_type
    logger.debug(f"File Content Type: {content_type}")  # Debugging

    # Validate file type
    if not content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File must be an audio file.")

    if content_type not in ["audio/mpeg", "audio/wav", "audio/ogg"]:
        return {"error": "Invalid file format. Please upload a .mp3, .wav, or .ogg file."}

    audio = (file.filename, await file.read(), file.content_type)
    result = aisha_ai.stt(audio, title=file.filename, has_diarization=False, language="uz")
    return result


@router.get("/task-status")
def get_task_status(task_id: str, auth_user: User = Depends(get_user)):
    """
    Check the status of a Celery audio processing task.

    Args:
        task_id: Celery task ID returned from submit-audio endpoint

    Returns:
        Task status and result (if completed)
    """
    logger.debug(f"User {auth_user.email} is checking task status")
    result = celery.AsyncResult(task_id)
    return {"status": result.status, "result": result.result}


@router.get("/call/{call_id}", response_model=CallSchema)
def get_call(
    call_id: uuid.UUID,
    db: Session = Depends(get_db),
    auth_user: User = Depends(get_user),
):
    """
    Retrieve details of a specific call recording.

    Args:
        call_id: UUID of the call record

    Returns:
        Call object with processing status and analysis results

    Raises:
        HTTPException 404: If call not found
    """
    call = db.query(Call).filter(Call.id == call_id).first()

    if not call:
        raise HTTPException(status_code=404, detail="Not Found")

    return call


@router.get("/calls", response_model=List[CallSchema])
def get_calls(db: Session = Depends(get_db), auth_user: User = Depends(get_user)):
    """
    List all call recordings accessible to the current user.

    Admin users see all calls. Agent users see only their own calls.

    Returns:
        List of Call objects
    """
    logger.debug(f"User {auth_user.email} is fetching calls")

    if auth_user.role == "admin":
        return db.query(Call).all()

    return db.query(Call).filter(Call.agent_id == auth_user.id).all()
