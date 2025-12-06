from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from db.base import Base


class Issue(Base):
    __tablename__ = "identified_issues"

    id = Column(UUID, primary_key=True, index=True)
    analysis_id = Column(ForeignKey("speech_analysis.id"))
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    speech_analysis = relationship("SpeechAnalysis", back_populates="issues")
