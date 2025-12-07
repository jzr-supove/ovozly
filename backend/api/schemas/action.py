"""
Pydantic schemas for Action model.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ActionBase(BaseModel):
    action_type: str
    details: str


class ActionCreate(ActionBase):
    pass


class Action(ActionBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
