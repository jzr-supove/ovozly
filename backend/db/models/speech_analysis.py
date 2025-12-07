"""
Ovozly Backend - Speech Analysis Database Model

Represents the AI-generated analysis results for a call recording.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from db.base import Base


class SpeechAnalysis(Base):
    """
    AI-generated analysis results for a call recording.

    Stores the complete analysis output from OpenAI including transcripts,
    sentiment analysis, diarization data, and summary metrics.

    Attributes:
        id: Primary key (UUID)
        call_id: Foreign key to the parent Call record
        language: Detected language code (uzbek, russian, english)
        transcript: Full formatted transcript with speaker labels
        raw_diarization: Original diarization segments with timestamps (JSON)
        customer_sentiment: Customer sentiment (positive, neutral, negative)
        agent_sentiment: Agent sentiment (positive, neutral, negative)
        overall_sentiment: Combined sentiment analysis
        call_efficiency: Call efficiency rating (efficient, average, inefficient)
        resolution_status: Issue resolution status (resolved, unresolved, escalated)
        created_at: Timestamp of analysis completion

    Relationships:
        call: Parent Call record
        extracted_entities: Named entities found in conversation
        keypoints: Key summary points from the call
        actions: Recommended follow-up actions
        issues: Identified problems or concerns
        intents: Detected customer intents
    """

    __tablename__ = "speech_analysis"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    call_id = Column(ForeignKey("calls.id"), nullable=False, unique=True)

    # Language and transcript
    language = Column(String, nullable=False)
    transcript = Column(Text, nullable=False)

    # Raw diarization data - stores the original segments with timestamps
    # Format: [{"speaker": "SPEAKER_00", "start": 0.0, "end": 2.5, "text": "..."}, ...]
    raw_diarization = Column(JSONB, nullable=True)

    # Sentiment analysis
    customer_sentiment = Column(String, nullable=True)  # positive, neutral, negative
    agent_sentiment = Column(String, nullable=True)  # positive, neutral, negative

    # Summary analysis
    overall_sentiment = Column(String, nullable=True)  # positive, neutral, negative
    call_efficiency = Column(String, nullable=True)  # efficient, average, inefficient
    resolution_status = Column(String, nullable=True)  # resolved, unresolved, escalated

    created_at = Column(DateTime, default=datetime.now)

    # Relationships
    call = relationship("Call", back_populates="speech_analysis")
    extracted_entities = relationship("ExtractedEntity", back_populates="speech_analysis", cascade="all, delete-orphan")
    keypoints = relationship("Keypoint", back_populates="speech_analysis", cascade="all, delete-orphan")
    actions = relationship("Action", back_populates="speech_analysis", cascade="all, delete-orphan")
    issues = relationship("Issue", back_populates="speech_analysis", cascade="all, delete-orphan")
    intents = relationship("Intent", back_populates="speech_analysis", cascade="all, delete-orphan")
