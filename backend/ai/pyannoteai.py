"""
Ovozly Backend - PyAnnote AI Integration

Client for the PyAnnote AI speaker diarization API service.
Handles job submission, status polling, and result retrieval.
"""

import requests
from enum import StrEnum, auto
from typing import Optional, Tuple

from loguru import logger

from core.config import settings


session = requests.Session()


class PyAnnoteAI_Status(StrEnum):
    """Status codes returned by PyAnnote AI API."""
    PENDING = auto()
    CREATED = auto()
    RUNNING = auto()
    SUCCEEDED = auto()
    FAILED = auto()
    CANCELED = auto()
    INVALID_REQUEST = auto()
    TOO_MANY_REQUESTS = auto()
    PAYMENT_REQUIRED = auto()
    UNKNOWN = auto()


class PyAnnoteAI:
    """
    Client for PyAnnote AI speaker diarization service.

    Provides methods to submit audio files for diarization and
    retrieve job results asynchronously.

    Attributes:
        BASE_URL: API base endpoint
        SUBMIT: Diarization submission endpoint
        GET_JOB: Job status retrieval endpoint
    """

    BASE_URL = "https://api.pyannote.ai/v1/"
    SUBMIT = f"{BASE_URL}diarize"
    GET_JOB = f"{BASE_URL}jobs/{{job_id}}"
    LIST_JOBS = f"{BASE_URL}/jobs"

    def __init__(self, auth_token: str) -> None:
        """Initialize client with API authentication token."""
        self.session = requests.Session()
        self.session.headers.update(
            {
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json",
            }
        )

    def submit(self, audio_url: str) -> Tuple[PyAnnoteAI_Status, Optional[str]]:
        """
        Submit an audio file URL for diarization processing.

        Args:
            audio_url: Public URL to the audio file

        Returns:
            Tuple of (status, job_id) where job_id is None on failure
        """
        data = {"url": audio_url, "numSpeakers": 2}
        resp = self.session.post(self.SUBMIT, json=data)
        logger.debug(f"pyannoteAI.submit | {resp.status_code} | {resp.content=}")

        if resp.status_code == 400:
            return PyAnnoteAI_Status.INVALID_REQUEST, None

        if resp.status_code == 402:
            return PyAnnoteAI_Status.PAYMENT_REQUIRED, None

        if resp.status_code == 429:
            return PyAnnoteAI_Status.TOO_MANY_REQUESTS, None

        data = resp.json()
        st = data.get("status", "unknown")

        return PyAnnoteAI_Status(st), data.get("jobId", None)

    def check_job(self, job_id: str) -> Tuple[PyAnnoteAI_Status, Optional[dict]]:
        """
        Check the status of a diarization job.

        Args:
            job_id: Job ID returned from submit()

        Returns:
            Tuple of (status, data) where data contains diarization results on success
        """
        resp = self.session.get(self.GET_JOB.format(job_id=job_id))
        logger.debug(f"pyannoteAI.check_job | {resp.status_code} | {resp.content=}")

        if resp.status_code == 400:
            return PyAnnoteAI_Status.INVALID_REQUEST, None

        if resp.status_code == 402:
            return PyAnnoteAI_Status.PAYMENT_REQUIRED, None

        if resp.status_code == 429:
            return PyAnnoteAI_Status.TOO_MANY_REQUESTS, None

        data = resp.json()
        st = data.get("status", "unknown")

        return PyAnnoteAI_Status(st.lower()), resp.json()


pyannoteai = PyAnnoteAI(settings.PYANNOTEAI_TOKEN)
