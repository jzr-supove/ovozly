"""
Pydantic schemas for Issue model.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class IssueBase(BaseModel):
    issue_type: str
    description: str


class IssueCreate(IssueBase):
    pass


class Issue(IssueBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
