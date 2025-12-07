"""
Ovozly Backend - Speech-to-Text API Endpoints

This module provides REST API endpoints for audio processing and speech analysis.
Supports both async (Celery-based) and sync (AISHA API) processing modes.
"""

import secrets
import uuid
from io import BytesIO
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from loguru import logger
from sqlalchemy import desc, asc
from sqlalchemy.orm import Session

from ai import aisha_ai
from ai.audio_utils import get_audio_duration
from api.deps import get_db, get_user
from api.schemas.call import Call as CallSchema
from core.celery_app import celery
from core.tasks import convert_audio_to_text
from db import Call
from db.models.user import User
from utils.bucket import upload_bytesio_and_make_public, delete_blob_from_url
from utils.text import get_extension


router = APIRouter(prefix="/stt", tags=["Speech-to-Text"])


def generate_unique_filename(db: Session, original_filename: str) -> str:
    """
    Generate a unique filename by adding random suffix if filename already exists.

    Args:
        db: Database session
        original_filename: Original uploaded filename

    Returns:
        Unique filename (original or with random suffix)
    """
    # Check if filename already exists
    existing = db.query(Call).filter(Call.file_name == original_filename).first()

    if not existing:
        return original_filename

    # Split filename into name and extension
    if "." in original_filename:
        name_parts = original_filename.rsplit(".", 1)
        base_name = name_parts[0]
        extension = name_parts[1]
    else:
        base_name = original_filename
        extension = ""

    # Generate unique filename with random suffix
    while True:
        random_suffix = secrets.token_hex(3)  # 6 characters
        if extension:
            new_filename = f"{base_name}_{random_suffix}.{extension}"
        else:
            new_filename = f"{base_name}_{random_suffix}"

        # Check if this new filename exists
        existing = db.query(Call).filter(Call.file_name == new_filename).first()
        if not existing:
            return new_filename


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

    # Generate unique filename if duplicate exists
    unique_filename = generate_unique_filename(db, file.filename)
    blob_name = f"{uuid.uuid4()}_{unique_filename}"

    logger.debug(f"{audio_ext=} {blob_name=} {unique_filename=}")

    # upload audio to blob storage
    audio = BytesIO(audio_raw)
    blob_url = upload_bytesio_and_make_public(audio, blob_name, file.content_type)
    logger.debug("File uploaded:", blob_url)

    # save call in db
    call = Call(
        file_id=blob_url,
        file_name=unique_filename,
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
def get_calls(
    db: Session = Depends(get_db),
    auth_user: User = Depends(get_user),
    status: Optional[str] = Query(None, description="Filter by status (SUCCESS, RUNNING, FAILED, PENDING)"),
    sort_by: Optional[str] = Query("created_at", description="Sort by field (created_at, call_duration, file_name)"),
    sort_order: Optional[str] = Query("desc", description="Sort order (asc, desc)"),
):
    """
    List all call recordings accessible to the current user.

    Admin users see all calls. Agent users see only their own calls.
    Supports filtering by status and sorting.

    Args:
        status: Optional status filter
        sort_by: Field to sort by (created_at, call_duration, file_name)
        sort_order: Sort direction (asc, desc)

    Returns:
        List of Call objects
    """
    logger.debug(f"User {auth_user.email} is fetching calls")

    # Build base query based on user role
    if auth_user.role == "admin":
        query = db.query(Call)
    else:
        query = db.query(Call).filter(Call.agent_id == auth_user.id)

    # Apply status filter if provided
    if status:
        # Normalize status to uppercase
        status_upper = status.upper()
        valid_statuses = ["SUCCESS", "RUNNING", "FAILED", "PENDING", "FAIL"]
        if status_upper in valid_statuses:
            # Handle FAILED/FAIL as the same
            if status_upper == "FAILED":
                query = query.filter(Call.status.in_(["FAILED", "FAIL"]))
            elif status_upper == "FAIL":
                query = query.filter(Call.status.in_(["FAILED", "FAIL"]))
            else:
                query = query.filter(Call.status == status_upper)

    # Apply sorting
    sort_column = {
        "created_at": Call.created_at,
        "call_duration": Call.call_duration,
        "file_name": Call.file_name,
        "date": Call.created_at,
        "duration": Call.call_duration,
    }.get(sort_by, Call.created_at)

    if sort_order == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    return query.all()


@router.delete("/call/{call_id}")
def delete_call(
    call_id: uuid.UUID,
    db: Session = Depends(get_db),
    auth_user: User = Depends(get_user),
):
    """
    Delete a call recording and its associated audio file.

    Only admins or the agent who created the call can delete it.

    Args:
        call_id: UUID of the call record to delete

    Returns:
        Success message

    Raises:
        HTTPException 404: If call not found
        HTTPException 403: If user not authorized to delete
    """
    call = db.query(Call).filter(Call.id == call_id).first()

    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    # Check authorization - only admin or owner can delete
    if auth_user.role != "admin" and call.agent_id != auth_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this call")

    # Delete the audio file from GCS
    try:
        if call.file_id:
            delete_blob_from_url(call.file_id)
            logger.info(f"Deleted audio file: {call.file_id}")
    except Exception as e:
        logger.error(f"Error deleting audio file: {e}")
        # Continue with database deletion even if file deletion fails

    # Delete the call record from database
    db.delete(call)
    db.commit()

    logger.info(f"User {auth_user.email} deleted call {call_id}")
    return {"message": "Call deleted successfully"}
