import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.session import get_db
from app.models.assessment import Assessment
from app.schemas.assessment import (
    WasteInput,
    AssessmentResult,
    AssessmentRecord,
    DecisionStep,
    HierarchyEvaluation,
    SustainabilityAssessment
)
from app.ml.model_adapter import evaluate_waste_ml, build_conditions_satisfied, DISCLAIMER_TEXT
from app.ml.config import CONDITION_ORDINAL_MAP, CONTAMINATION_ORDINAL_MAP

router = APIRouter(prefix="/api", tags=["Assessments"])

@router.post("/analyze", response_model=AssessmentResult)
def analyze_waste(waste_input: WasteInput, db: Session = Depends(get_db)):
    """
    Executes the Machine Learning decision support engine on waste characteristics,
    evaluates environmental safety constraints, persists the assessment in SQLite,
    and returns comprehensive explainable results with prediction probabilities.
    """
    result = evaluate_waste_ml(waste_input)

    db_assessment = Assessment(
        material=waste_input.material,
        condition=waste_input.condition,
        contamination=waste_input.contamination,
        quantity=waste_input.quantity,
        unit=waste_input.unit,
        additional_characteristics=json.dumps(waste_input.additional_characteristics or {}),
        recommended_pathway=result.recommended_pathway,
        reason=result.reason,
        matched_rule=result.matched_rule,
        rule_match_strength=result.rule_match_strength,
        applications=json.dumps(result.potential_applications),
        alternatives=json.dumps(result.alternative_options),
        decision_path=json.dumps([s.model_dump() for s in result.decision_steps]),
        sustainability=json.dumps(result.sustainability.model_dump()),
        confidence_score=result.confidence_score,
        model_version=result.model_version,
        prediction_probabilities=json.dumps(result.prediction_probabilities or {}),
        decision_source=result.inference_source or "ML Model"
    )
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)

    result.id = db_assessment.id
    return result

@router.get("/assessments", response_model=List[AssessmentRecord])
def list_assessments(
    material: Optional[str] = None,
    pathway: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Assessment).order_by(desc(Assessment.timestamp))

    if material:
        query = query.filter(Assessment.material.ilike(f"%{material}%"))
    if pathway:
        query = query.filter(Assessment.recommended_pathway.ilike(f"%{pathway}%"))

    records = query.all()
    results = []
    for r in records:
        try:
            apps = json.loads(r.applications or "[]")
        except Exception:
            apps = []
        try:
            alts = json.loads(r.alternatives or "[]")
        except Exception:
            alts = []

        if search:
            s_lower = search.lower()
            if not (s_lower in r.material.lower() or s_lower in r.recommended_pathway.lower() or s_lower in (r.matched_rule or "").lower() or s_lower in r.reason.lower()):
                continue

        results.append(AssessmentRecord(
            id=r.id,
            timestamp=r.timestamp,
            material=r.material,
            condition=r.condition,
            contamination=r.contamination,
            quantity=r.quantity,
            unit=r.unit,
            recommended_pathway=r.recommended_pathway,
            matched_rule=r.matched_rule or "ML Model",
            reason=r.reason,
            applications=apps,
            alternatives=alts,
            confidence_score=r.confidence_score,
            model_version=r.model_version
        ))

    return results

@router.get("/assessments/{assessment_id}", response_model=AssessmentResult)
def get_assessment(assessment_id: int, db: Session = Depends(get_db)):
    """
    Reconstructs the exact result that was persisted at assessment time from
    the stored record, rather than re-running the ML model against today's
    (possibly retrained) model artifact. This keeps this endpoint consistent
    with what `/api/assessments` (the history list) and the original
    `/api/analyze` response showed for the same record.
    """
    rec = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Assessment not found")

    try:
        chars = json.loads(rec.additional_characteristics or "{}")
    except Exception:
        chars = {}

    input_obj = WasteInput(
        material=rec.material,
        condition=rec.condition,
        contamination=rec.contamination,
        quantity=rec.quantity,
        unit=rec.unit,
        additional_characteristics=chars
    )

    try:
        decision_steps = [DecisionStep(**s) for s in json.loads(rec.decision_path or "[]")]
    except Exception:
        decision_steps = []

    def _step_details(stage: str) -> dict:
        for step in decision_steps:
            if step.stage == stage:
                return step.details or {}
        return {}

    safety_details = _step_details("SAFETY_GUARDRAIL")
    inference_details = _step_details("ML_INFERENCE")
    hierarchy_details = _step_details("HIERARCHY_ALIGNMENT")

    try:
        hierarchy_evaluation = [
            HierarchyEvaluation(**h) for h in hierarchy_details.get("hierarchy", [])
        ]
    except Exception:
        hierarchy_evaluation = []

    try:
        sustainability = SustainabilityAssessment(**json.loads(rec.sustainability or "{}"))
    except Exception:
        sustainability = SustainabilityAssessment(
            landfill_avoidance="Unknown", material_recovery="Unknown",
            resource_conservation="Unknown", circularity_potential="Unknown"
        )

    try:
        applications = json.loads(rec.applications or "[]")
    except Exception:
        applications = []
    try:
        alternatives = json.loads(rec.alternatives or "[]")
    except Exception:
        alternatives = []
    try:
        probabilities = json.loads(rec.prediction_probabilities or "{}")
    except Exception:
        probabilities = {}

    model_name = inference_details.get("model_name", "ML Classifier")
    inference_source = rec.decision_source or "ML Model"
    confidence_score = rec.confidence_score if rec.confidence_score is not None else 0.0
    confidence_pct = round(confidence_score * 100, 1)

    conditions_satisfied = build_conditions_satisfied(
        rec.material, rec.condition, rec.contamination,
        CONDITION_ORDINAL_MAP.get(rec.condition, 2.0),
        CONTAMINATION_ORDINAL_MAP.get(rec.contamination, 0.0),
        confidence_pct, model_name, inference_source, chars
    )

    return AssessmentResult(
        id=rec.id,
        timestamp=rec.timestamp,
        input_summary=input_obj,
        recommended_pathway=rec.recommended_pathway,
        rule_match_strength=rec.rule_match_strength or f"ML Confidence: {confidence_pct}%",
        matched_rule=rec.matched_rule,
        reason=rec.reason,
        conditions_satisfied=conditions_satisfied,
        potential_applications=applications,
        alternative_options=alternatives,
        decision_steps=decision_steps,
        hierarchy_evaluation=hierarchy_evaluation,
        sustainability=sustainability,
        safety_disclaimer=DISCLAIMER_TEXT,
        professional_assessment_required=bool(safety_details.get("professional_assessment_required", False)),
        confidence_score=rec.confidence_score,
        prediction_probabilities=probabilities,
        model_name=model_name,
        model_version=rec.model_version,
        inference_source=inference_source
    )

@router.delete("/assessments/{assessment_id}")
def delete_assessment(assessment_id: int, db: Session = Depends(get_db)):
    rec = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Assessment not found")

    db.delete(rec)
    db.commit()
    return {"status": "success", "message": f"Assessment {assessment_id} deleted successfully"}
