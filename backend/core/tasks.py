"""
Ovozly Backend - Celery Background Tasks

This module defines asynchronous background tasks for audio processing.
The main task orchestrates the complete pipeline: diarization, transcription,
and AI-powered conversation analysis.
"""

import sys
from pathlib import Path
from typing import Any, Dict, List

# Ensure the backend directory is in Python path for imports
_backend_dir = Path(__file__).parent.parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

import time
from io import BytesIO

from celery.exceptions import Ignore
from loguru import logger

from ai.openai import analyze_conversation
from ai.pyannoteai import PyAnnoteAI_Status, pyannoteai
from ai.aisha_stt import transcribe_with_diarization
from core.base_task import BaseTask
from core.celery_app import celery
from db import Call, SpeechAnalysis, Intent, ExtractedEntity, Issue, Action, Keypoint


def set_state(self, msg: str) -> None:
    """Update Celery task state with a progress message."""
    logger.debug(msg)
    self.update_state(state="RUNNING", meta={"detail": msg.capitalize()})


def save_analysis_to_db(
    session,
    call_id: int,
    analysis: Dict[str, Any],
    diarization_with_text: List[Dict],
) -> SpeechAnalysis:
    """
    Persist OpenAI analysis results to PostgreSQL.

    Creates SpeechAnalysis record with all related entities (intents, entities,
    issues, actions, keypoints).

    Args:
        session: SQLAlchemy database session
        call_id: ID of the parent Call record
        analysis: OpenAI analysis response dict
        diarization_with_text: Diarization segments with transcribed text

    Returns:
        Created SpeechAnalysis record
    """
    # Extract data from analysis response
    call_metadata = analysis.get("call_metadata", {})
    speech_data = analysis.get("speech_analysis", {})
    summary_data = analysis.get("summary_analysis", {})
    actions_data = analysis.get("action_recommendations", [])

    sentiment = speech_data.get("sentiment_analysis", {})

    # Create main SpeechAnalysis record
    speech_analysis = SpeechAnalysis(
        call_id=call_id,
        language=call_metadata.get("language", "unknown"),
        transcript=speech_data.get("transcript", ""),
        raw_diarization=diarization_with_text,
        customer_sentiment=sentiment.get("customer_sentiment"),
        agent_sentiment=sentiment.get("agent_sentiment"),
        overall_sentiment=summary_data.get("overall_sentiment"),
        call_efficiency=summary_data.get("call_efficiency"),
        resolution_status=summary_data.get("resolution_status"),
    )
    session.add(speech_analysis)
    session.flush()  # Get the ID for related records

    # Save intents
    for intent_data in speech_data.get("intent_detection", []):
        intent = Intent(
            analysis_id=speech_analysis.id,
            intent=intent_data.get("intent", ""),
            confidence_score=intent_data.get("confidence_score"),
        )
        session.add(intent)

    # Save extracted entities
    for entity_data in speech_data.get("entities_extracted", []):
        entity = ExtractedEntity(
            analysis_id=speech_analysis.id,
            entity_type=entity_data.get("entity_type", ""),
            value=entity_data.get("value", ""),
            confidence_score=entity_data.get("confidence_score"),
        )
        session.add(entity)

    # Save identified issues
    for issue_data in speech_data.get("issues_identified", []):
        issue = Issue(
            analysis_id=speech_analysis.id,
            issue_type=issue_data.get("issue_type", ""),
            description=issue_data.get("description", ""),
        )
        session.add(issue)

    # Save recommended actions
    for action_data in actions_data:
        action = Action(
            analysis_id=speech_analysis.id,
            action_type=action_data.get("action_type", ""),
            details=action_data.get("details", ""),
        )
        session.add(action)

    # Save key points
    for point_text in summary_data.get("key_points", []):
        keypoint = Keypoint(
            analysis_id=speech_analysis.id,
            point=point_text,
        )
        session.add(keypoint)

    logger.info(f"Saved analysis for call {call_id} with ID {speech_analysis.id}")
    return speech_analysis


@celery.task(base=BaseTask, serializer="pickle", bind=True)
def convert_audio_to_text(self, audio_raw: bytes, audio_ext: str, call_id: int) -> Dict[str, Any]:
    """
    Process audio file through the complete analysis pipeline.

    Pipeline steps:
    1. Submit audio to PyAnnote AI for speaker diarization
    2. Wait for diarization to complete
    3. Split audio by diarization segments and transcribe with AISHA
    4. Analyze conversation using OpenAI GPT
    5. Persist all results to PostgreSQL

    Args:
        audio_raw: Raw audio file bytes
        audio_ext: Audio file extension (e.g., 'wav', 'mp3', 'm4a')
        call_id: Database ID of the Call record

    Returns:
        Analysis results dict with call_id for reference

    Raises:
        Ignore: When diarization fails (task marked as FAIL)
        Exception: On any processing error (task marked as FAIL)
    """
    call = self.session.query(Call).filter(Call.id == call_id).one()
    try:
        audio = BytesIO(audio_raw)
        set_state(self, "loading audio file")

        # Step 1: Submit to PyAnnote for diarization
        status, job_id = pyannoteai.submit(call.file_id)
        logger.debug(f"pyannoteai {job_id=}")

        if not job_id:
            logger.error("diarization submit error, status: %s", status)
            call.status = "FAIL"
            self.session.commit()
            self.update_state(
                state="FAIL",
                meta={"status": status, "detail": "pyannoteai submit error"},
            )
            raise Ignore()

        set_state(self, "audio submitted, waiting for diarization...")

        # Step 2: Wait for diarization to complete
        status, diarization_data = pyannoteai.check_job(job_id)
        while status in (
            PyAnnoteAI_Status.CREATED,
            PyAnnoteAI_Status.PENDING,
            PyAnnoteAI_Status.RUNNING,
        ):
            time.sleep(1)
            status, diarization_data = pyannoteai.check_job(job_id)

        if status != PyAnnoteAI_Status.SUCCEEDED:
            logger.error("diarization error, status: %s, details: %s", status, diarization_data)
            call.status = "FAIL"
            self.session.commit()
            self.update_state(
                state="FAIL",
                meta={
                    "status": status,
                    "detail": f"pyannoteai check_job error: {diarization_data}",
                },
            )
            raise Ignore()

        if not diarization_data.get("output"):
            logger.error(
                "diarization error, status: %s, details: %s",
                status,
                "diarization got no `output` field",
            )
            call.status = "FAIL"
            self.session.commit()
            self.update_state(
                state="FAIL",
                meta={"status": "FAIL", "detail": "diarization got no `output` field"},
            )
            raise Ignore()

        if "diarization" not in diarization_data["output"]:
            logger.error(
                "diarization error, status: %s, details: %s",
                status,
                "diarization got no `diarization` field",
            )
            call.status = "FAIL"
            self.session.commit()
            self.update_state(
                state="FAIL",
                meta={
                    "status": "FAIL",
                    "detail": "diarization got no `diarization` field",
                },
            )
            raise Ignore()

        diarization_segments = diarization_data["output"]["diarization"]
        logger.debug(f"Got {len(diarization_segments)} diarization segments")

        # Step 3: Transcribe audio segments using AISHA (with speaker mapping)
        set_state(self, "transcribing audio with AISHA...")
        audio.seek(0)
        diarization_with_text = transcribe_with_diarization(
            audio_file=audio,
            audio_ext=audio_ext,
            diarization_segments=diarization_segments,
            language="uz",
        )
        logger.debug(f"AISHA transcription complete: {len(diarization_with_text)} segments")

        # Step 4: Analyze the conversation using OpenAI
        set_state(self, "generating analysis...")
        analysis = analyze_conversation(diarization_with_text)

        # Step 5: Persist analysis to PostgreSQL
        set_state(self, "saving analysis results...")
        save_analysis_to_db(
            session=self.session,
            call_id=call_id,
            analysis=analysis,
            diarization_with_text=diarization_with_text,
        )

        call.status = "SUCCESS"
        self.session.commit()

        # Return analysis with call_id for reference
        return {"call_id": call_id, "status": "SUCCESS", **analysis}

    except Exception as e:
        logger.error(f"error occurred while processing the audio: {e}")
        self.update_state(
            state="FAIL",
            meta={
                "status": "FAIL",
                "detail": f"error occurred while processing the audio: {e}",
            },
        )
        call.status = "FAIL"
        self.session.commit()
        raise
