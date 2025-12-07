"""
Ovozly Backend - Call Database Model

Represents a call recording submitted for analysis.
"""

from datetime import datetime

from sqlalchemy import Column, DateTime, Double, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from db.base import Base


class Call(Base):
    """
    Call recording entity for audio analysis.

    Attributes:
        id: Primary key (auto-increment)
        file_id: Google Cloud Storage URL for the audio file
        file_name: Original filename of the uploaded audio
        agent_id: Foreign key to the user who uploaded the call
        call_duration: Duration of the call in seconds
        status: Processing status (RUNNING, SUCCESS, FAIL)
        celery_task_id: Celery task ID for async processing
        created_at: Timestamp of record creation
    """

    __tablename__ = "calls"

    id = Column(Integer, primary_key=True, autoincrement=True)
    file_id = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    agent_id = Column(ForeignKey("users.id"), nullable=False)
    call_duration = Column(Double, nullable=False)
    status = Column(String, nullable=False)
    celery_task_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    user = relationship("User", back_populates="calls")
    speech_analysis = relationship("SpeechAnalysis", back_populates="call", uselist=False, cascade="all, delete-orphan")
