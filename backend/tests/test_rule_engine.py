import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.assessment import WasteInput
from app.rules.engine import evaluate_waste

client = TestClient(app)

def test_concrete_c2_proposal_mandatory():
    """
    Mandatory demonstration test:
    Concrete, 500 kg, Damaged, None contamination
    Must yield RECYCLE, Rule C2, and exact proposal rationale.
    """
    inp = WasteInput(
        material="Concrete",
        condition="Damaged",
        contamination="None",
        quantity=500.0,
        unit="kg",
        additional_characteristics={"cracks": "Moderate"}
    )
    res = evaluate_waste(inp)

    assert res.recommended_pathway == "RECYCLE"
    assert res.matched_rule == "C2"
    assert "Direct reuse is unsuitable due to the material condition, while clean concrete remains suitable for processing into recycled aggregate." in res.reason
    assert any("Recycled aggregate" in app for app in res.potential_applications)
    assert any("Controlled reuse" in alt for alt in res.alternative_options)
    assert res.sustainability.landfill_avoidance == "HIGH"
    assert res.sustainability.circularity_potential.startswith("HIGH")

def test_concrete_c1_reuse():
    inp = WasteInput(
        material="Concrete",
        condition="Good",
        contamination="None",
        quantity=1000.0,
        unit="kg"
    )
    res = evaluate_waste(inp)
    assert res.recommended_pathway == "REUSE"
    assert res.matched_rule == "C1"

def test_concrete_c3_hazardous():
    inp = WasteInput(
        material="Concrete",
        condition="Damaged",
        contamination="Hazardous",
        quantity=500.0,
        unit="kg"
    )
    res = evaluate_waste(inp)
    assert "DISPOSAL" in res.recommended_pathway
    assert res.matched_rule == "C3"
    assert res.professional_assessment_required is True

def test_brick_b1_and_b2():
    b1_inp = WasteInput(material="Brick", condition="Good", contamination="None", quantity=300.0, unit="kg")
    res_b1 = evaluate_waste(b1_inp)
    assert res_b1.recommended_pathway == "REUSE"
    assert res_b1.matched_rule == "B1"

    b2_inp = WasteInput(material="Brick", condition="Damaged", contamination="None", quantity=300.0, unit="kg")
    res_b2 = evaluate_waste(b2_inp)
    assert res_b2.recommended_pathway == "RECYCLE"
    assert res_b2.matched_rule == "B2"

def test_steel_s1_and_s2():
    s1_inp = WasteInput(material="Steel", condition="Good", contamination="None", quantity=250.0, unit="kg")
    res_s1 = evaluate_waste(s1_inp)
    assert res_s1.recommended_pathway == "REUSE"
    assert res_s1.matched_rule == "S1"

    s2_inp = WasteInput(material="Steel", condition="Damaged", contamination="Low", quantity=250.0, unit="kg")
    res_s2 = evaluate_waste(s2_inp)
    assert res_s2.recommended_pathway == "RECYCLE"
    assert res_s2.matched_rule == "S2"

def test_wood_w1_w2_w3():
    w1_inp = WasteInput(material="Wood", condition="Good", contamination="None", quantity=100.0, unit="kg")
    res_w1 = evaluate_waste(w1_inp)
    assert res_w1.recommended_pathway == "REUSE"
    assert res_w1.matched_rule == "W1"

    w2_inp = WasteInput(material="Wood", condition="Damaged", contamination="None", quantity=100.0, unit="kg")
    res_w2 = evaluate_waste(w2_inp)
    assert res_w2.recommended_pathway == "RECOVER"
    assert res_w2.matched_rule == "W2"

    w3_inp = WasteInput(material="Wood", condition="Damaged", contamination="Hazardous", quantity=100.0, unit="kg")
    res_w3 = evaluate_waste(w3_inp)
    assert "DISPOSAL" in res_w3.recommended_pathway
    assert res_w3.matched_rule == "W3"

def test_soil_so1_so2():
    so1 = WasteInput(material="Soil", condition="Good", contamination="None", quantity=800.0, unit="kg")
    res_so1 = evaluate_waste(so1)
    assert res_so1.recommended_pathway == "REUSE"
    assert res_so1.matched_rule == "SO1"

    so2 = WasteInput(material="Soil", condition="Good", contamination="Hazardous", quantity=800.0, unit="kg")
    res_so2 = evaluate_waste(so2)
    assert "DISPOSAL" in res_so2.recommended_pathway
    assert res_so2.matched_rule == "SO2"

def test_api_analyze_and_flow():
    """
    `/api/analyze` is served by the ML decision engine (see test_ml_pipeline.py
    for ML-specific assertions), so this test only checks the end-to-end API
    flow (persistence, history, statistics, rules, materials) rather than
    hardcoding a rule-engine label that the ML model is not bound to reproduce.
    """
    payload = {
        "material": "Concrete",
        "condition": "Damaged",
        "contamination": "None",
        "quantity": 500,
        "unit": "kg"
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["recommended_pathway"] in [
        "REUSE", "REPAIR", "RECYCLE", "RECOVER", "DISPOSAL / SPECIALIZED HANDLING"
    ]
    assert data["id"] is not None

    # Test history retrieval
    hist = client.get("/api/assessments")
    assert hist.status_code == 200
    assert len(hist.json()) > 0

    # Test statistics
    stats = client.get("/api/statistics")
    assert stats.status_code == 200
    assert stats.json()["total_assessments"] > 0

    # Test rules
    rules = client.get("/api/rules")
    assert rules.status_code == 200
    assert len(rules.json()) >= 15

    # Test materials
    mats = client.get("/api/materials")
    assert mats.status_code == 200
    assert len(mats.json()) >= 10
