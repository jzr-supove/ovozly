from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class IssueBase(BaseModel):
    analysis_id: Optional[str]
    name: str
    description: str


class IssueCreate(IssueBase):
    pass


class IssueUpdate(IssueBase):
    pass


class Issue(IssueBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
