from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from app.database.session import Base

def _utcnow() -> datetime:
    return datetime.now(timezone.utc)

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=_utcnow, nullable=False)
    material = Column(String(100), nullable=False, index=True)
    condition = Column(String(50), nullable=False)
    contamination = Column(String(50), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(30), nullable=False)
    additional_characteristics = Column(Text, default="{}")
    recommended_pathway = Column(String(100), nullable=False, index=True)
    reason = Column(Text, nullable=False)
    matched_rule = Column(String(50), nullable=False)
    rule_match_strength = Column(String(50), default="Strong Rule Match")
    applications = Column(Text, default="[]")
    alternatives = Column(Text, default="[]")
    decision_path = Column(Text, default="[]")
    sustainability = Column(Text, default="{}")
    confidence_score = Column(Float, nullable=True)
    model_version = Column(String(100), default="v1.0")
    prediction_probabilities = Column(Text, default="{}")
    decision_source = Column(String(50), default="ML Model")
