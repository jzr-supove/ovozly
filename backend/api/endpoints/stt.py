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
from sqlalchemy.orm import Session, joinedload

from ai import aisha_ai
from ai.audio_utils import get_audio_duration
from api.deps import get_db, get_user
from api.schemas.call import Call as CallSchema, CallWithAnalysis, CallWithAnalysisSummary
from api.schemas.speech_analysis import SpeechAnalysis as SpeechAnalysisSchema
from core.celery_app import celery
from core.tasks import convert_audio_to_text
from db import Call, SpeechAnalysis
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
def get_task_status(
    task_id: str,
    auth_user: User = Depends(get_user),
    db: Session = Depends(get_db),
):
    """
    Check the status of a Celery audio processing task.

    If the task is complete and successful, returns the analysis from the database.
    Otherwise, returns the Celery task status.

    Args:
        task_id: Celery task ID returned from submit-audio endpoint

    Returns:
        Task status and result (analysis data if completed)
    """
    logger.debug(f"User {auth_user.email} is checking task status for {task_id}")

    # Get task status from Celery
    result = celery.AsyncResult(task_id)

    # If task is successful, try to get data from database
    if result.status == "SUCCESS":
        # Find the call by celery_task_id
        call = db.query(Call).filter(Call.celery_task_id == task_id).first()
        if call and call.speech_analysis:
            # Return analysis from database
            return {
                "status": result.status,
                "call_id": call.id,
                "result": {
                    "call_id": call.id,
                    "status": "SUCCESS",
                    "analysis_id": str(call.speech_analysis.id),
                }
            }

    # Return Celery status for pending/running/failed tasks
    return {"status": result.status, "result": result.result}


@router.get("/call/{call_id}", response_model=CallWithAnalysis)
def get_call(
    call_id: int,
    db: Session = Depends(get_db),
    auth_user: User = Depends(get_user),
):
    """
    Retrieve details of a specific call recording with full analysis.

    Args:
        call_id: ID of the call record

    Returns:
        Call object with full analysis data (transcript, intents, entities, etc.)

    Raises:
        HTTPException 404: If call not found
        HTTPException 403: If user not authorized to view
    """
    call = (
        db.query(Call)
        .options(
            joinedload(Call.speech_analysis).joinedload(SpeechAnalysis.intents),
            joinedload(Call.speech_analysis).joinedload(SpeechAnalysis.extracted_entities),
            joinedload(Call.speech_analysis).joinedload(SpeechAnalysis.issues),
            joinedload(Call.speech_analysis).joinedload(SpeechAnalysis.actions),
            joinedload(Call.speech_analysis).joinedload(SpeechAnalysis.keypoints),
        )
        .filter(Call.id == call_id)
        .first()
    )

    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    # Check authorization - only admin or owner can view
    if auth_user.role != "admin" and call.agent_id != auth_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this call")

    return call


@router.get("/call/{call_id}/analysis", response_model=SpeechAnalysisSchema)
def get_call_analysis(
    call_id: int,
    db: Session = Depends(get_db),
    auth_user: User = Depends(get_user),
):
    """
    Retrieve only the analysis data for a specific call.

    Args:
        call_id: ID of the call record

    Returns:
        SpeechAnalysis object with all analysis data

    Raises:
        HTTPException 404: If call or analysis not found
        HTTPException 403: If user not authorized to view
    """
    call = db.query(Call).filter(Call.id == call_id).first()

    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    # Check authorization
    if auth_user.role != "admin" and call.agent_id != auth_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this call")

    # Get analysis with all related data
    analysis = (
        db.query(SpeechAnalysis)
        .options(
            joinedload(SpeechAnalysis.intents),
            joinedload(SpeechAnalysis.extracted_entities),
            joinedload(SpeechAnalysis.issues),
            joinedload(SpeechAnalysis.actions),
            joinedload(SpeechAnalysis.keypoints),
        )
        .filter(SpeechAnalysis.call_id == call_id)
        .first()
    )

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found for this call")

    return analysis


@router.get("/calls", response_model=List[CallWithAnalysisSummary])
def get_calls(
    db: Session = Depends(get_db),
    auth_user: User = Depends(get_user),
    status: Optional[str] = Query(None, description="Filter by status (SUCCESS, RUNNING, FAILED, PENDING)"),
    sentiment: Optional[str] = Query(None, description="Filter by overall sentiment (positive, neutral, negative)"),
    resolution: Optional[str] = Query(None, description="Filter by resolution status (resolved, unresolved, escalated)"),
    sort_by: Optional[str] = Query("created_at", description="Sort by field (created_at, call_duration, file_name)"),
    sort_order: Optional[str] = Query("desc", description="Sort order (asc, desc)"),
):
    """
    List all call recordings accessible to the current user.

    Admin users see all calls. Agent users see only their own calls.
    Supports filtering by status, sentiment, resolution and sorting.
    Returns calls with analysis summary for efficient list views.

    Args:
        status: Optional status filter
        sentiment: Optional overall sentiment filter
        resolution: Optional resolution status filter
        sort_by: Field to sort by (created_at, call_duration, file_name)
        sort_order: Sort direction (asc, desc)

    Returns:
        List of Call objects with analysis summary
    """
    logger.debug(f"User {auth_user.email} is fetching calls")

    # Build base query with analysis summary
    query = (
        db.query(Call)
        .options(joinedload(Call.speech_analysis))
    )

    # Filter by user role
    if auth_user.role != "admin":
        query = query.filter(Call.agent_id == auth_user.id)

    # Apply status filter if provided
    if status:
        status_upper = status.upper()
        valid_statuses = ["SUCCESS", "RUNNING", "FAILED", "PENDING", "FAIL"]
        if status_upper in valid_statuses:
            if status_upper in ["FAILED", "FAIL"]:
                query = query.filter(Call.status.in_(["FAILED", "FAIL"]))
            else:
                query = query.filter(Call.status == status_upper)

    # Apply sentiment filter if provided
    if sentiment:
        query = query.join(Call.speech_analysis).filter(
            SpeechAnalysis.overall_sentiment == sentiment.lower()
        )

    # Apply resolution filter if provided
    if resolution:
        query = query.join(Call.speech_analysis, isouter=True).filter(
            SpeechAnalysis.resolution_status == resolution.lower()
        )

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


@router.get("/analytics/summary")
def get_analytics_summary(
    db: Session = Depends(get_db),
    auth_user: User = Depends(get_user),
):
    """
    Get aggregated analytics summary for dashboard widgets.

    Returns counts and distributions for sentiments, resolutions,
    call efficiency, and other metrics.

    Returns:
        Analytics summary with counts and distributions
    """
    from sqlalchemy import func

    # Base query filtered by user role
    if auth_user.role == "admin":
        base_query = db.query(SpeechAnalysis)
        call_query = db.query(Call)
    else:
        base_query = (
            db.query(SpeechAnalysis)
            .join(Call)
            .filter(Call.agent_id == auth_user.id)
        )
        call_query = db.query(Call).filter(Call.agent_id == auth_user.id)

    # Total calls
    total_calls = call_query.count()
    total_analyzed = base_query.count()

    # Sentiment distribution
    sentiment_counts = (
        base_query
        .with_entities(
            SpeechAnalysis.overall_sentiment,
            func.count(SpeechAnalysis.id)
        )
        .group_by(SpeechAnalysis.overall_sentiment)
        .all()
    )

    # Resolution status distribution
    resolution_counts = (
        base_query
        .with_entities(
            SpeechAnalysis.resolution_status,
            func.count(SpeechAnalysis.id)
        )
        .group_by(SpeechAnalysis.resolution_status)
        .all()
    )

    # Call efficiency distribution
    efficiency_counts = (
        base_query
        .with_entities(
            SpeechAnalysis.call_efficiency,
            func.count(SpeechAnalysis.id)
        )
        .group_by(SpeechAnalysis.call_efficiency)
        .all()
    )

    # Call status distribution
    status_counts = (
        call_query
        .with_entities(
            Call.status,
            func.count(Call.id)
        )
        .group_by(Call.status)
        .all()
    )

    # Average call duration
    avg_duration = call_query.with_entities(func.avg(Call.call_duration)).scalar() or 0

    return {
        "total_calls": total_calls,
        "total_analyzed": total_analyzed,
        "average_duration_seconds": round(avg_duration, 2),
        "sentiment_distribution": {s[0] or "unknown": s[1] for s in sentiment_counts},
        "resolution_distribution": {r[0] or "unknown": r[1] for r in resolution_counts},
        "efficiency_distribution": {e[0] or "unknown": e[1] for e in efficiency_counts},
        "status_distribution": {s[0]: s[1] for s in status_counts},
    }


@router.delete("/call/{call_id}")
def delete_call(
    call_id: int,
    db: Session = Depends(get_db),
    auth_user: User = Depends(get_user),
):
    """
    Delete a call recording and its associated audio file and analysis.

    Only admins or the agent who created the call can delete it.
    Cascade delete will remove associated speech analysis and all related records.

    Args:
        call_id: ID of the call record to delete

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

    # Delete the call record from database (cascade will delete analysis)
    db.delete(call)
    db.commit()

    logger.info(f"User {auth_user.email} deleted call {call_id}")
    return {"message": "Call deleted successfully"}
