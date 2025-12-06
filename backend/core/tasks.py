"""
Ovozly Backend - Celery Background Tasks

This module defines asynchronous background tasks for audio processing.
The main task orchestrates the complete pipeline: diarization, transcription,
and AI-powered conversation analysis.
"""

import sys
from pathlib import Path

# Ensure the backend directory is in Python path for imports
_backend_dir = Path(__file__).parent.parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

import time
from io import BytesIO

from celery.exceptions import Ignore
from loguru import logger

from ai.audio_utils import get_audio_duration
from ai.openai import analyze_conversation
from ai.pyannoteai import PyAnnoteAI_Status, pyannoteai
from ai.aisha_stt import transcribe_with_diarization
from core.base_task import BaseTask
from core.celery_app import celery
from core.config import settings
from db import Call


def set_state(self, msg: str) -> None:
    """Update Celery task state with a progress message."""
    logger.debug(msg)
    self.update_state(state="RUNNING", meta={"detail": msg.capitalize()})


@celery.task(base=BaseTask, serializer="pickle", bind=True)
def convert_audio_to_text(self, audio_raw: bytes, audio_ext: str, call_id: int) -> list:
    """
    Process audio file through the complete analysis pipeline.

    Pipeline steps:
    1. Submit audio to PyAnnote AI for speaker diarization
    2. Wait for diarization to complete
    3. Split audio by diarization segments and transcribe with AISHA
    4. Analyze conversation using OpenAI GPT

    Args:
        audio_raw: Raw audio file bytes
        audio_ext: Audio file extension (e.g., 'wav', 'mp3', 'm4a')
        call_id: Database ID of the Call record

    Returns:
        Analysis results from OpenAI containing intents, entities, etc.

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
        result = transcribe_with_diarization(
            audio_file=audio,
            audio_ext=audio_ext,
            diarization_segments=diarization_segments,
            language="uz",
        )
        logger.debug(f"AISHA transcription complete: {len(result)} segments")

        # Step 4: Analyze the conversation using OpenAI
        set_state(self, "generating analysis...")
        analysis = analyze_conversation(result)

        call.status = "SUCCESS"
        self.session.commit()

        return analysis

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
