from fastapi import APIRouter
from datetime import datetime, timezone

from app.ml.model_adapter import get_model_status

router = APIRouter(prefix="/api", tags=["Health"])

@router.get("/health")
def health_check():
    ml_status = get_model_status()
    return {
        "status": "healthy",
        "service": "Construction Waste Recovery Planner API",
        "version": "2.0.0",
        "mode": "machine-learning-engine",
        "ai_ml_enabled": True,
        "ml_model_loaded": ml_status["is_user_trained_model_loaded"],
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
