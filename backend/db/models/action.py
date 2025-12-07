"""
Ovozly Backend - Action Database Model

Stores recommended actions from conversation analysis.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from db.base import Base


class Action(Base):
    """
    Recommended action from a conversation analysis.

    Attributes:
        id: Primary key (UUID)
        analysis_id: Foreign key to SpeechAnalysis
        action_type: Type/category of the action
        details: Detailed description of the recommended action
        created_at: Timestamp of creation
    """

    __tablename__ = "recommended_actions"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    analysis_id = Column(ForeignKey("speech_analysis.id", ondelete="CASCADE"), nullable=False)
    action_type = Column(String, nullable=False)
    details = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    speech_analysis = relationship("SpeechAnalysis", back_populates="actions")
