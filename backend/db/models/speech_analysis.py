"""
Ovozly Backend - Speech Analysis Database Model

Represents the AI-generated analysis results for a call recording.
"""

from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from db.base import Base


class SpeechAnalysis(Base):
    """
    AI-generated analysis results for a call recording.

    Attributes:
        id: Primary key (UUID)
        call_id: Foreign key to the parent Call record
        language: Detected language code (uz, ru, en)
        transcript: Reference to processed transcript
        created_at: Timestamp of analysis completion

    Relationships:
        extracted_entities: Named entities found in conversation
        keypoints: Key summary points from the call
        actions: Recommended follow-up actions
        issues: Identified problems or concerns
        intents: Detected customer intents
    """

    __tablename__ = "speech_analysis"

    id = Column(UUID, primary_key=True, index=True)
    call_id = Column(ForeignKey("calls.id"), nullable=False)
    language = Column(String, nullable=False)
    transcript = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    call = relationship("Call", back_populates="speech_analysis")

    extracted_entities = relationship("ExtractedEntity", back_populates="speech_analysis")
    keypoints = relationship("Keypoint", back_populates="speech_analysis")
    actions = relationship("Action", back_populates="speech_analysis")
    issues = relationship("Issue", back_populates="speech_analysis")
    intents = relationship("Intent", back_populates="speech_analysis")
