from pydantic import BaseModel
from typing import List
from datetime import datetime

from db.models.action import Action
from db.models.extracted_entity import ExtractedEntity
from db.models.intent import Intent
from db.models.issue import Issue
from db.models.keypoint import Keypoint


class SpeechAnalysisBase(BaseModel):
    call_id: str
    language: str
    transcript: int


class SpeechAnalysisCreate(SpeechAnalysisBase):
    pass


class SpeechAnalysisUpdate(SpeechAnalysisBase):
    pass


class SpeechAnalysis(SpeechAnalysisBase):
    id: str
    created_at: datetime
    extracted_entities: List["ExtractedEntity"] = []
    keypoints: List["Keypoint"] = []
    actions: List["Action"] = []
    issues: List["Issue"] = []
    intents: List["Intent"] = []

    class Config:
        from_attributes = True
