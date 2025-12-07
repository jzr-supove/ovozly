"""
Ovozly Backend - Issue Database Model

Stores identified issues from conversation analysis.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from db.base import Base


class Issue(Base):
    """
    Issue identified during a conversation.

    Attributes:
        id: Primary key (UUID)
        analysis_id: Foreign key to SpeechAnalysis
        issue_type: Type/category of the issue
        description: Detailed description of the issue
        created_at: Timestamp of creation
    """

    __tablename__ = "identified_issues"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    analysis_id = Column(ForeignKey("speech_analysis.id", ondelete="CASCADE"), nullable=False)
    issue_type = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    speech_analysis = relationship("SpeechAnalysis", back_populates="issues")
