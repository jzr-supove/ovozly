"""
Ovozly Backend - Extracted Entity Database Model

Stores named entities extracted from conversation analysis.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Double
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from db.base import Base


class ExtractedEntity(Base):
    """
    Named entity extracted from a conversation.

    Attributes:
        id: Primary key (UUID)
        analysis_id: Foreign key to SpeechAnalysis
        entity_type: Type of entity (e.g., person, location, product)
        value: The extracted entity value
        confidence_score: Confidence score (0.0 - 1.0)
        created_at: Timestamp of creation
    """

    __tablename__ = "extracted_entities"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    analysis_id = Column(ForeignKey("speech_analysis.id", ondelete="CASCADE"), nullable=False)
    entity_type = Column(String, nullable=False)
    value = Column(String, nullable=False)
    confidence_score = Column(Double, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    speech_analysis = relationship("SpeechAnalysis", back_populates="extracted_entities")
