"""
Pydantic schemas for Keypoint model.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class KeypointBase(BaseModel):
    point: str


class KeypointCreate(KeypointBase):
    pass


class Keypoint(KeypointBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
