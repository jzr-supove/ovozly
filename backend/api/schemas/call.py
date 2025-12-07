"""
Pydantic schemas for Call model.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from api.schemas.speech_analysis import SpeechAnalysis, SpeechAnalysisSummary


__all__ = ["CallCreate", "CallUpdate", "Call", "CallWithAnalysis"]


class CallBase(BaseModel):
    file_id: str
    file_name: str
    agent_id: int
    call_duration: float


class CallCreate(CallBase):
    pass


class CallUpdate(BaseModel):
    status: Optional[str] = None


class Call(CallBase):
    id: int
    status: str
    celery_task_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CallWithAnalysisSummary(Call):
    """Call with simplified analysis summary for list views."""
    speech_analysis: Optional[SpeechAnalysisSummary] = None

    class Config:
        from_attributes = True


class CallWithAnalysis(Call):
    """Call with full analysis data for detail views."""
    speech_analysis: Optional[SpeechAnalysis] = None

    class Config:
        from_attributes = True
