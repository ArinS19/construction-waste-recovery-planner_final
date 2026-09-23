"""
Deterministic reference knowledge base engine (material/condition/contamination
-> pathway heuristics). Not on the live decision path: POST /api/analyze uses
the ML engine in app/ml/model_adapter.py exclusively. This module is the
domain logic the ML training dataset was derived from, still exposed
read-only via GET /api/rules and directly unit-tested in its own right.
"""

from typing import Dict, Any, List, Tuple
from datetime import datetime, timezone
from app.schemas.assessment import (
    WasteInput,
    AssessmentResult,
    DecisionStep,
    HierarchyEvaluation,
    SustainabilityAssessment
)
from app.rules.rule_base import RULES_DATABASE

DISCLAIMER_TEXT = (
    "This prototype provides decision support based on predefined rules. "
    "It does not replace engineering judgment, laboratory testing, regulatory "
    "requirements, or certified waste-management procedures."
)

def evaluate_waste(waste_input: WasteInput) -> AssessmentResult:
    """
    Executes the transparent decision support pipeline:
    1. Waste Characteristics
    2. Material & Condition Assessment
    3. Rule Evaluation
    4. Recovery Pathway Prioritization
    5. Recommended Action
    6. Reasoning, Applications, Alternatives, and Qualitative Sustainability
    """
    material = waste_input.material
    condition = waste_input.condition
    contamination = waste_input.contamination
    quantity = waste_input.quantity
    unit = waste_input.unit
    chars = waste_input.additional_characteristics or {}

    decision_steps: List[DecisionStep] = []

    # Step 1: Input Summary
    decision_steps.append(DecisionStep(
        stage="INPUT",
        title="Waste Characteristics Received",
        description=f"{material} ({quantity:g} {unit}), Condition: {condition}, Contamination: {contamination}",
        status="completed",
        details={
            "material": material,
            "condition": condition,
            "contamination": contamination,
            "quantity": quantity,
            "unit": unit,
            "additional_characteristics": chars
        }
    ))

    # Step 2: Safety & Condition Assessment
    is_hazardous = contamination in ["High", "Hazardous"]
    professional_req = is_hazardous or condition == "Severely Damaged" or chars.get("structural_integrity") == "Compromised"

    assessment_notes = []
    if is_hazardous:
        assessment_notes.append("High or Hazardous chemical contamination detected. Direct reuse/recycling blocked by safety constraints.")
    elif condition in ["Excellent", "Good"]:
        assessment_notes.append(f"Material condition is {condition}. High structural and geometric integrity preserved.")
    elif condition in ["Moderate", "Damaged"]:
        assessment_notes.append(f"Material is {condition}. Direct structural reuse not preferred; secondary processing evaluated.")
    else:
        assessment_notes.append("Material is severely damaged; downcycling or specialized handling required.")

    decision_steps.append(DecisionStep(
        stage="ASSESSMENT",
        title="Material & Condition Assessment",
        description="; ".join(assessment_notes),
        status="completed",
        details={"professional_assessment_required": professional_req}
    ))

    # Step 3: Rule Evaluation
    matched_rules = []
    material_rules = [r for r in RULES_DATABASE if r["material"].lower() == material.lower()]

    if not material_rules:
        material_rules = [r for r in RULES_DATABASE if r["material"] == "Mixed Construction Waste"]

    for rule in material_rules:
        try:
            if rule["evaluator"](condition, contamination, chars):
                matched_rules.append(rule)
        except Exception:
            continue

    rule_match_names = [r["rule_id"] for r in matched_rules]
    decision_steps.append(DecisionStep(
        stage="RULE MATCH",
        title="Rule Evaluation",
        description=f"Evaluated {len(material_rules)} material rules. Matched: {', '.join(rule_match_names) if rule_match_names else 'Default fallback rule'}",
        status="completed",
        details={"evaluated_rules": [r["rule_id"] for r in material_rules], "matched_rules": rule_match_names}
    ))

    # Step 4: Prioritization Logic
    if matched_rules:
        matched_rules.sort(key=lambda x: x["priority"])
        selected_rule = matched_rules[0]
    else:
        if is_hazardous:
            selected_rule = {
                "rule_id": "GEN-DISP",
                "material": material,
                "pathway": "SPECIALIZED DISPOSAL / HANDLING",
                "priority": 5,
                "conditions_description": "Contamination is Hazardous",
                "reason": "Hazardous contamination precludes standard circular recovery pathways. Specialized disposal required.",
                "applications": ["Regulated hazardous containment facility"],
                "alternatives": ["Professional environmental testing"]
            }
        elif condition in ["Damaged", "Severely Damaged"]:
            selected_rule = {
                "rule_id": "GEN-REC",
                "material": material,
                "pathway": "RECYCLE",
                "priority": 3,
                "conditions_description": "Clean damaged material",
                "reason": "Direct reuse is unsuitable due to material damage, while uncontaminated fraction remains suitable for recycling.",
                "applications": ["Secondary material reprocessing", "Recycled aggregate/feedstock"],
                "alternatives": ["Controlled non-structural fill"]
            }
        else:
            selected_rule = {
                "rule_id": "GEN-REU",
                "material": material,
                "pathway": "REUSE",
                "priority": 1,
                "conditions_description": "Clean material in good condition",
                "reason": "Material condition and cleanliness satisfy criteria for direct salvage and reuse.",
                "applications": ["Direct reuse in secondary construction"],
                "alternatives": ["Recycling"]
            }

    # Generate Hierarchy Matrix explanation
    hierarchy_eval: List[HierarchyEvaluation] = []
    selected_pathway_tier = selected_rule["pathway"].upper()

    # Tier 1: REUSE
    if "REUSE" in selected_pathway_tier:
        hierarchy_eval.append(HierarchyEvaluation(
            tier="1", name="REUSE", selected=True, status="Selected",
            reason="Highest value circular pathway. Material condition and cleanliness meet direct salvage criteria."
        ))
    else:
        hierarchy_eval.append(HierarchyEvaluation(
            tier="1", name="REUSE", selected=False, status="Not preferred / Infeasible",
            reason=f"Direct reuse unsuitable due to {condition.lower()} condition or {contamination.lower()} contamination."
        ))

    # Tier 2: REPAIR
    if "REPAIR" in selected_pathway_tier:
        hierarchy_eval.append(HierarchyEvaluation(
            tier="2", name="REPAIR", selected=True, status="Selected",
            reason="Component can be refurbished or reconditioned to restore functional utility."
        ))
    else:
        hierarchy_eval.append(HierarchyEvaluation(
            tier="2", name="REPAIR", selected=False, status="Not applicable",
            reason=f"Refurbishment not technically or economically viable for bulk {material.lower()}."
        ))

    # Tier 3: RECYCLE
    if "RECYCLE" in selected_pathway_tier:
        hierarchy_eval.append(HierarchyEvaluation(
            tier="3", name="RECYCLE", selected=True, status="Selected",
            reason="Clean secondary material retains high value for reprocessing into secondary aggregate or raw feedstock."
        ))
    else:
        is_higher = selected_rule["priority"] < 3
        hierarchy_eval.append(HierarchyEvaluation(
            tier="3", name="RECYCLE", selected=False,
            status="Superseded by higher tier" if is_higher else "Infeasible",
            reason="Higher circular pathway (Reuse) selected." if is_higher else "Contamination prevents safe mechanical recycling."
        ))

    # Tier 4: RECOVER
    if "RECOVER" in selected_pathway_tier:
        hierarchy_eval.append(HierarchyEvaluation(
            tier="4", name="RECOVER", selected=True, status="Selected",
            reason="Material recovery facility (MRF) mechanical sorting or clean biomass energy recovery."
        ))
    else:
        is_higher = selected_rule["priority"] < 4
        hierarchy_eval.append(HierarchyEvaluation(
            tier="4", name="RECOVER", selected=False,
            status="Superseded by higher tier" if is_higher else "Not applicable",
            reason="Higher circular pathway prioritized over energy/bulk recovery." if is_higher else "Not suitable for thermal or MRF recovery."
        ))

    # Tier 5: DISPOSE
    if "DISPOS" in selected_pathway_tier:
        hierarchy_eval.append(HierarchyEvaluation(
            tier="5", name="DISPOSE / SPECIALIZED HANDLING", selected=True, status="Selected",
            reason="Required to prevent environmental harm due to contamination or degradation."
        ))
    else:
        hierarchy_eval.append(HierarchyEvaluation(
            tier="5", name="DISPOSE", selected=False, status="Avoided",
            reason="Landfill avoided through higher-tier circular pathway."
        ))

    decision_steps.append(DecisionStep(
        stage="PRIORITIZATION",
        title="Recovery Pathway Prioritization",
        description=f"Prioritized highest-feasible pathway: {selected_rule['pathway']}",
        status="completed",
        details={"hierarchy": [h.model_dump() for h in hierarchy_eval]}
    ))

    decision_steps.append(DecisionStep(
        stage="RECOMMENDATION",
        title="Final Pathway Recommended",
        description=f"Primary Pathway: {selected_rule['pathway']} (Triggered by Rule {selected_rule['rule_id']})",
        status="completed"
    ))

    # Step 5: Conditions checklist
    conditions_satisfied = [
        f"Material = {material}",
        f"Condition = {condition}",
        f"Contamination = {contamination}"
    ]
    for k, v in chars.items():
        if v not in [None, ""]:
            readable_k = k.replace("_", " ").title()
            conditions_satisfied.append(f"{readable_k} = {v}")

    # Step 6: Qualitative Sustainability Calculation
    p_tier = selected_rule["pathway"].upper()
    if "REUSE" in p_tier:
        s_landfill = "VERY HIGH"
        s_recovery = "MAXIMUM (100% Whole Component)"
        s_resource = "VERY HIGH (Eliminates Virgin Production)"
        s_circularity = "VERY HIGH (Closed-loop / direct reuse)"
    elif "REPAIR" in p_tier:
        s_landfill = "HIGH"
        s_recovery = "HIGH"
        s_resource = "HIGH"
        s_circularity = "HIGH"
    elif "RECYCLE" in p_tier:
        s_landfill = "HIGH"
        s_recovery = "HIGH (Processed Aggregate/Feedstock)"
        s_resource = "HIGH (Offsets Virgin Material)"
        s_circularity = "HIGH (Secondary loop)"
    elif "RECOVER" in p_tier:
        s_landfill = "MODERATE"
        s_recovery = "MODERATE (Energy/Downcycled fiber)"
        s_resource = "MODERATE"
        s_circularity = "MODERATE"
    else:
        s_landfill = "NONE (Regulated containment)"
        s_recovery = "LOW (Zero material recovery)"
        s_resource = "NONE"
        s_circularity = "LINEAR (Containment/Disposal)"

    sustainability = SustainabilityAssessment(
        landfill_avoidance=s_landfill,
        material_recovery=s_recovery,
        resource_conservation=s_resource,
        circularity_potential=s_circularity,
        assessment_type="Qualitative sustainability assessment",
        note="Indicative assessment for prototype demonstration."
    )

    reason = selected_rule["reason"]
    if material.lower() == "concrete" and condition.lower() == "damaged" and contamination.lower() == "none":
        reason = "Direct reuse is unsuitable due to the material condition, while clean concrete remains suitable for processing into recycled aggregate."

    alternatives = selected_rule.get("alternatives", [])
    if not alternatives:
        if "REUSE" in p_tier:
            alternatives = ["Recycling into secondary material"]
        elif "RECYCLE" in p_tier:
            alternatives = ["Controlled reuse for suitable non-structural applications"]
        else:
            alternatives = ["Secondary sorting if contamination can be isolated"]

    return AssessmentResult(
        timestamp=datetime.now(timezone.utc),
        input_summary=waste_input,
        recommended_pathway=selected_rule["pathway"],
        rule_match_strength="Strong Rule Match",
        matched_rule=selected_rule["rule_id"],
        reason=reason,
        conditions_satisfied=conditions_satisfied,
        potential_applications=selected_rule.get("applications", []),
        alternative_options=alternatives,
        decision_steps=decision_steps,
        hierarchy_evaluation=hierarchy_eval,
        sustainability=sustainability,
        safety_disclaimer=DISCLAIMER_TEXT,
        professional_assessment_required=professional_req
    )
