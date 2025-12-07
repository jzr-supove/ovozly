from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

__all__ = ["CallCreate", "CallUpdate", "Call"]


class CallBase(BaseModel):
    file_id: str
    file_name: str
    agent_id: int
    call_duration: int


class CallCreate(CallBase):
    pass


class CallUpdate(CallBase):
    pass


class Call(CallBase):
    id: int
    file_id: str
    file_name: str
    agent_id: int
    call_duration: float
    status: str
    celery_task_id: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True
