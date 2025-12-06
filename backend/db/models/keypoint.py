from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Double
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from db.base import Base


class Keypoint(Base):
    __tablename__ = "call_keypoints"

    id = Column(UUID, primary_key=True, index=True)
    analysis_id = Column(ForeignKey("speech_analysis.id"))
    name = Column(String, nullable=False)
    value = Column(String, nullable=False)
    confidence_score = Column(Double, nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    speech_analysis = relationship("SpeechAnalysis", back_populates="keypoints")
