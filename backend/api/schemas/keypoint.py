from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class KeypointBase(BaseModel):
    analysis_id: Optional[str]
    name: str
    value: str
    confidence_score: float


class KeypointCreate(KeypointBase):
    pass


class KeypointUpdate(KeypointBase):
    pass


class Keypoint(KeypointBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
