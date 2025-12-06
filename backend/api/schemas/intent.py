from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class IntentBase(BaseModel):
    analysis_id: Optional[str]
    intent: str
    confidence_score: Optional[float]


class IntentCreate(IntentBase):
    pass


class IntentUpdate(IntentBase):
    pass


class Intent(IntentBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
