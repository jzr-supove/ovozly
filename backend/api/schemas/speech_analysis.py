"""
Pydantic schemas for SpeechAnalysis model.
"""

from datetime import datetime
from typing import List, Optional, Any, Dict
from uuid import UUID

from pydantic import BaseModel

from api.schemas.action import Action
from api.schemas.extracted_entity import ExtractedEntity
from api.schemas.intent import Intent
from api.schemas.issue import Issue
from api.schemas.keypoint import Keypoint


class DiarizationSegment(BaseModel):
    """A single diarization segment with speaker, timestamps, and text."""
    speaker: str
    start: float
    end: float
    text: Optional[str] = None


class SpeechAnalysisBase(BaseModel):
    language: str
    transcript: str
    customer_sentiment: Optional[str] = None
    agent_sentiment: Optional[str] = None
    overall_sentiment: Optional[str] = None
    call_efficiency: Optional[str] = None
    resolution_status: Optional[str] = None


class SpeechAnalysisCreate(SpeechAnalysisBase):
    call_id: int
    raw_diarization: Optional[List[Dict[str, Any]]] = None


class SpeechAnalysis(SpeechAnalysisBase):
    id: UUID
    call_id: int
    raw_diarization: Optional[List[Dict[str, Any]]] = None
    created_at: datetime

    # Related entities
    intents: List[Intent] = []
    extracted_entities: List[ExtractedEntity] = []
    issues: List[Issue] = []
    actions: List[Action] = []
    keypoints: List[Keypoint] = []

    class Config:
        from_attributes = True


class SpeechAnalysisSummary(BaseModel):
    """Simplified analysis summary for list views."""
    id: UUID
    language: str
    overall_sentiment: Optional[str] = None
    call_efficiency: Optional[str] = None
    resolution_status: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
