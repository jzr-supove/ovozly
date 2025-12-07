"""
Pydantic schemas for ExtractedEntity model.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class ExtractedEntityBase(BaseModel):
    entity_type: str
    value: str
    confidence_score: Optional[float] = None


class ExtractedEntityCreate(ExtractedEntityBase):
    pass


class ExtractedEntity(ExtractedEntityBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
