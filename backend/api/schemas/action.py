from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ActionBase(BaseModel):
    analysis_id: Optional[str]
    name: str
    details: str


class ActionCreate(ActionBase):
    pass


class ActionUpdate(ActionBase):
    pass


class Action(ActionBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
