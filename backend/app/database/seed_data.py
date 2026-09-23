import json
from datetime import datetime, timezone, timedelta
from app.database.session import SessionLocal, engine, Base
from app.models.assessment import Assessment
from app.models.rule import Rule
from app.models.material import Material
from app.rules.rule_base import RULES_DATABASE
from app.rules.materials_data import MATERIALS_DATABASE
from app.ml.model_adapter import evaluate_waste_ml
from app.schemas.assessment import WasteInput

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Rules
        if db.query(Rule).count() == 0:
            for r in RULES_DATABASE:
                rule_record = Rule(
                    rule_id=r["rule_id"],
                    material=r["material"],
                    pathway=r["pathway"],
                    priority=r["priority"],
                    conditions_description=r["conditions_description"],
                    reason=r["reason"],
                    applications=json.dumps(r.get("applications", [])),
                    alternatives=json.dumps(r.get("alternatives", []))
                )
                db.add(rule_record)
            db.commit()

        # 2. Seed Materials
        if db.query(Material).count() == 0:
            for m in MATERIALS_DATABASE:
                mat_record = Material(
                    name=m["name"],
                    category=m.get("category", "Inert / Structural"),
                    description=m["description"],
                    typical_waste_source=m["typical_waste_source"],
                    reuse_potential=m["reuse_potential"],
                    recycling_potential=m["recycling_potential"],
                    common_applications=json.dumps(m.get("common_applications", [])),
                    important_considerations=m["important_considerations"]
                )
                db.add(mat_record)
            db.commit()

        # 3. Seed Initial Demo Assessments
        if db.query(Assessment).count() == 0:
            sample_demos = [
                WasteInput(material="Concrete", condition="Damaged", contamination="None", quantity=500.0, unit="kg", additional_characteristics={"cracks": "Moderate", "structural_integrity": "Compromised"}),
                WasteInput(material="Brick", condition="Good", contamination="None", quantity=300.0, unit="kg", additional_characteristics={"broken_percentage": 5, "mortar_attached": "Cleanable"}),
                WasteInput(material="Steel", condition="Damaged", contamination="Low", quantity=250.0, unit="kg", additional_characteristics={"rust_level": "Moderate", "structural_integrity": "Deformed"}),
                WasteInput(material="Wood", condition="Good", contamination="None", quantity=100.0, unit="kg", additional_characteristics={"rot": "No", "paint_coating": "Unpainted"}),
                WasteInput(material="Glass", condition="Damaged", contamination="None", quantity=150.0, unit="kg", additional_characteristics={"cracked": "Yes", "intact_percentage": 10}),
                WasteInput(material="Concrete", condition="Good", contamination="None", quantity=1000.0, unit="kg", additional_characteristics={"cracks": "None", "structural_integrity": "Sound"}),
                WasteInput(material="Soil", condition="Good", contamination="Hazardous", quantity=800.0, unit="kg", additional_characteristics={"chemical_spill": "Yes", "tested_clean": "No"}),
                WasteInput(material="Ceramic / Tiles", condition="Damaged", contamination="None", quantity=120.0, unit="kg", additional_characteristics={"intact_percentage": 20}),
                WasteInput(material="Gypsum", condition="Good", contamination="None", quantity=200.0, unit="kg", additional_characteristics={"moisture": "Dry", "wet": "No"}),
                WasteInput(material="Asphalt", condition="Good", contamination="None", quantity=1500.0, unit="kg", additional_characteristics={"reclaimed_milled": "Yes"})
            ]

            now = datetime.now(timezone.utc)
            for i, demo_input in enumerate(sample_demos):
                result = evaluate_waste_ml(demo_input)
                past_time = now - timedelta(days=(len(sample_demos) - i - 1), hours=i * 2)

                record = Assessment(
                    timestamp=past_time,
                    material=demo_input.material,
                    condition=demo_input.condition,
                    contamination=demo_input.contamination,
                    quantity=demo_input.quantity,
                    unit=demo_input.unit,
                    additional_characteristics=json.dumps(demo_input.additional_characteristics or {}),
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
                db.add(record)
            db.commit()

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
