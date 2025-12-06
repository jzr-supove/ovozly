from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from db.base import Base


class Action(Base):
    __tablename__ = "recommended_actions"

    id = Column(UUID, primary_key=True, index=True)
    analysis_id = Column(ForeignKey("speech_analysis.id"))
    name = Column(String, nullable=False)
    details = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    speech_analysis = relationship("SpeechAnalysis", back_populates="actions")
