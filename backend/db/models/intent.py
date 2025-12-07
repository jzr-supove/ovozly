"""
Ovozly Backend - Intent Database Model

Stores detected customer intents from conversation analysis.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Double
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from db.base import Base


class Intent(Base):
    """
    Detected intent from a conversation.

    Attributes:
        id: Primary key (UUID)
        analysis_id: Foreign key to SpeechAnalysis
        intent: The detected intent text
        confidence_score: Confidence score (0.0 - 1.0)
        created_at: Timestamp of creation
    """

    __tablename__ = "detected_intents"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    analysis_id = Column(ForeignKey("speech_analysis.id", ondelete="CASCADE"), nullable=False)
    intent = Column(String, nullable=False)
    confidence_score = Column(Double, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    speech_analysis = relationship("SpeechAnalysis", back_populates="intents")
