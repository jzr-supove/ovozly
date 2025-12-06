from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ExtractedEntityBase(BaseModel):
    analysis_id: Optional[str]
    name: str
    value: str
    confidence_score: float


class ExtractedEntityCreate(ExtractedEntityBase):
    pass


class ExtractedEntityUpdate(ExtractedEntityBase):
    pass


class ExtractedEntity(ExtractedEntityBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
