"""
Ovozly Backend - Celery Background Tasks

This module defines asynchronous background tasks for audio processing.
The main task orchestrates the complete pipeline: diarization, transcription,
and AI-powered conversation analysis.
"""

import time
from io import BytesIO

from celery.exceptions import Ignore
from loguru import logger

from ai.audio_utils import (
    audio_to_text_v2,
    merge_diarization_and_text,
    split_audio_into_segments,
)
from ai.openai import analyze_conversation
from ai.pyannoteai import PyAnnoteAI_Status, pyannoteai
from core.base_task import BaseTask
from core.celery_app import celery
from db import Call


def set_state(self, msg: str) -> None:
    """Update Celery task state with a progress message."""
    logger.debug(msg)
    self.update_state(state="RUNNING", meta={"detail": msg.capitalize()})


@celery.task(base=BaseTask, serializer="pickle", bind=True)
def convert_audio_to_text(self, audio_raw: bytes, audio_ext: str, call_id: int) -> list:
    """
    Process audio file through the complete analysis pipeline.

    This task performs the following steps:
    1. Submit audio to PyAnnote AI for speaker diarization
    2. Split audio into speaker segments based on diarization
    3. Transcribe each segment using the STT model
    4. Merge diarization data with transcription results
    5. Analyze conversation using OpenAI GPT

    Args:
        audio_raw: Raw audio file bytes
        audio_ext: Audio file extension (e.g., 'wav', 'mp3')
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

        # diarization job
        status, job_id = pyannoteai.submit(call.file_id)
        logger.debug(f"pyannoteai {job_id=}")

        # Check if submit successful
        if not job_id:
            logger.error("diarization submit error, status: %s", status)
            call.status = "FAIL"
            self.session.commit()
            self.update_state(
                state="FAIL",
                meta={"status": status, "detail": "pyannoteai submit error"},
            )
            raise Ignore()

        set_state(self, "audio submitted, generating diarization...")

        # Check job status until done
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

        diarization_data = diarization_data["output"]["diarization"]

        # Split audio into segments
        set_state(self, "got diarization result, splitting audio into segments")
        segments = split_audio_into_segments(audio, audio_ext, diarization_data, do_merge=False)

        # Speech To Text
        set_state(self, "converting audio segments into text")
        texts = []
        for segment in segments:
            segment.seek(0)
            text = audio_to_text_v2(segment)
            texts.append(text)

        # Merge Diarization with STT results
        set_state(self, "preparing results")
        result = merge_diarization_and_text(diarization_data, texts)

        # Analyze the text using openai api
        set_state(self, "generating analysis")
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
