from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Double
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from db.base import Base


class Intent(Base):
    __tablename__ = "detected_intents"

    id = Column(UUID, primary_key=True, index=True)
    analysis_id = Column(ForeignKey("speech_analysis.id"))
    intent = Column(String, nullable=False)
    confidence_score = Column(Double, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    speech_analysis = relationship("SpeechAnalysis", back_populates="intents")
