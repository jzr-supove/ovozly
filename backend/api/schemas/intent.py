"""
Pydantic schemas for Intent model.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class IntentBase(BaseModel):
    intent: str
    confidence_score: Optional[float] = None


class IntentCreate(IntentBase):
    pass


class Intent(IntentBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
