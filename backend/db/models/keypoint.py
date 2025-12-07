"""
Ovozly Backend - Keypoint Database Model

Stores key summary points from conversation analysis.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from db.base import Base


class Keypoint(Base):
    """
    Key summary point from a conversation analysis.

    Attributes:
        id: Primary key (UUID)
        analysis_id: Foreign key to SpeechAnalysis
        point: The key point text
        created_at: Timestamp of creation
    """

    __tablename__ = "call_keypoints"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    analysis_id = Column(ForeignKey("speech_analysis.id", ondelete="CASCADE"), nullable=False)
    point = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    speech_analysis = relationship("SpeechAnalysis", back_populates="keypoints")
