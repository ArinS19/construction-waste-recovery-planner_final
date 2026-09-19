# Construction Waste Recovery Planner
### *A Machine Learning Decision Support System for Sustainable Material Recovery and Circular Economy*

[![Decision Engine](https://img.shields.io/badge/Decision%20Engine-Machine%20Learning%20Classifier-059669.svg)](#machine-learning-architecture)
[![Safety Guardrails](https://img.shields.io/badge/Guardrails-Civil%20Engineering%20Safety-blue.svg)](#environmental-safety-guardrails)
[![Stack](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Scikit--Learn%20%7C%20SQLite-0284c7.svg)](#technology-stack)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript%20%7C%20Tailwind-6366f1.svg)](#technology-stack)

---

## 1. Executive Summary & Project Concept

The **Construction Waste Recovery Planner** is a full-stack decision support application designed to optimize the recovery of construction and demolition (C&D) waste.

The application utilizes a **modular Machine Learning (ML) decision architecture** paired with environmental and civil engineering safety guardrails. It vectorizes material characteristics (physical condition, contamination level, quantity, unit, and material-specific attributes) and predicts the optimal recovery pathway along the circular waste hierarchy:

$$\text{REUSE} \longrightarrow \text{REPAIR} \longrightarrow \text{RECYCLE} \longrightarrow \text{RECOVER} \longrightarrow \text{DISPOSE}$$

> [!TIP]
> **Machine Learning Integration Notice:**
> For full technical details on feature engineering, the modular empty model slot, and step-by-step instructions on training your own model, see [ML_MODEL_INTEGRATION_SPECIFICATION.md](./ML_MODEL_INTEGRATION_SPECIFICATION.md).

---

## 2. Core Problem & Academic Research Contributions

### Problem Statement
Over 35% of all solid waste generated globally originates from construction and demolition operations. While much of this debris retains structural and material integrity, site managers lack accessible tools to answer:
> *"What should be done with this specific batch of construction waste, and WHY?"*

### Academic Research Contributions
1. **Condition-Aware Circular Recovery Framework:** Integrates physical condition (cracks, deformation, rot) and contamination metrics into recovery decision rules.
2. **Explainable Rule-Based Inference:** Delivers an explicit execution trace showing which candidate rules were evaluated, which conditions were satisfied, and why higher-tier recovery options were ruled out.
3. **Circular Value Prioritization:** Enforces a top-down evaluation hierarchy that prioritizes direct component reuse and refurbishing over aggregate downcycling.
4. **Transparent Full-Stack Demonstration Prototype:** A functional research tool with SQLite audit persistence, RESTful APIs, and an academic dashboard.

---

## 3. The Circular Recovery Hierarchy

The engine prioritizes recovery pathways in strictly descending order of preserved circular value:

| Priority | Pathway | Technical Definition & Objective |
|:---:|:---|:---|
| **Tier 1** | **REUSE** | Direct salvage and re-installation of components in their original structural or architectural form without remelting or crushing. |
| **Tier 2** | **REPAIR** | Minor refurbishment, re-edging, cleaning, or de-nailing to restore full functional utility. |
| **Tier 3** | **RECYCLE** | Mechanical crushing, shredding, or melting into secondary raw materials (e.g. Recycled Concrete Aggregate, steel scrap melting, glass cullet). |
| **Tier 4** | **RECOVER** | Materials Recovery Facility (MRF) bulk sorting or energy recovery (e.g. clean biomass fuel) where secondary manufacturing is unviable. |
| **Tier 5** | **DISPOSE** | Controlled sanitary containment or specialized hazardous handling when toxic contamination precludes circular loops. |

---

## 4. Required Sequential Decision Pipeline

The application visualizes and executes this exact deterministic decision flow:

```
Waste Characteristics (Material, Quantity, Condition, Contamination, Attributes)
       ↓
Material & Condition Assessment (Safety thresholds & structural degradation checks)
       ↓
Rule Evaluation (Predicate matching against structured rule database)
       ↓
Recovery Pathway Prioritization (Testing highest-value feasible circular tier)
       ↓
Recommended Action (Primary Recovery Pathway)
       ↓
Traceable Reasoning + Conditions Checklist + Applications + Viable Alternatives
```

---

## 5. Technology Stack

- **Backend:**
  - **Python 3.14 / 3.11+**
  - **FastAPI**: Modern, high-performance asynchronous REST API framework
  - **Pydantic v2**: Strict schema validation and data integrity enforcement
  - **SQLAlchemy 2.0**: ORM for database modeling and query execution
  - **SQLite**: Local relational database for persistent assessment audit logs
  - **Pytest**: Automated test suite for rule logic and API endpoints
- **Frontend:**
  - **React 19 + TypeScript**: Modern component architecture with type safety
  - **Vite 6 / 8**: Lightning-fast build tooling and hot-module replacement
  - **Tailwind CSS v3**: Clean, responsive academic/environmental design system
  - **Lucide React**: Clean iconography for material workflows
- **Architecture:** Decoupled Client-Server with JSON REST API communication.

---

## 6. Initial Rule Base Coverage (Sample)

The system covers 11 major construction materials with structured production rules:

| Rule ID | Material | Predicate Conditions (IF) | Pathway (THEN) | Primary Engineering Rationale |
|:---:|:---|:---|:---:|:---|
| **C1** | Concrete | Condition $\in$ {Excellent, Good} $\land$ Contamination $\in$ {None, Low} | **REUSE** | Clean, intact concrete retains structural geometry for direct salvage in landscaping, paving, or precast blocks. |
| **C2** | Concrete | Condition $\in$ {Moderate, Damaged} $\land$ Contamination $\in$ {None, Low} | **RECYCLE** | *Direct reuse is unsuitable due to the material condition, while clean concrete remains suitable for processing into recycled aggregate.* |
| **C3** | Concrete | Contamination $\in$ {High, Hazardous} | **SPECIALIZED DISPOSAL** | Contaminants prevent safe crushing; hazardous handling and regulatory chemical testing required. |
| **B1** | Brick | Condition $\in$ {Excellent, Good} $\land$ Contamination $\in$ {None, Low} $\land$ Broken $\le 25\%$ | **REUSE** | Clean masonry bricks retain high mechanical compressive strength for direct wall salvage and paving. |
| **B2** | Brick | Condition $\in$ {Damaged, Moderate} $\lor$ Broken $> 25\%$ | **RECYCLE** | Fractured bricks cannot support masonry loads, but make high-quality crushed aggregate and road base. |
| **S1** | Steel | Structural integrity is Sound $\land$ Contamination $\in$ {None, Low} | **REUSE** | Undamaged structural steel sections retain yield strength for direct refabrication with near-zero embodied carbon. |
| **S2** | Steel | Condition is Damaged $\lor$ Deformed $\lor$ Rust is Moderate | **RECYCLE** | Steel maintains 100% metallurgical recyclability through electric arc furnace remelting into new rebar. |
| **W1** | Wood | Condition $\in$ {Good, Excellent} $\land$ Rot = No $\land$ Contamination $\in$ {None, Low} | **REUSE** | Architectural timber and joists can be directly reused for framing, furniture, and temporary structures. |
| **W2** | Wood | Damaged clean timber $\land$ Non-hazardous | **RECOVER** | Wood fibers recovered into particle boards, engineered wood panels, or clean biomass fuel. |
| **W3** | Wood | Preservative = CCA / Creosote $\lor$ Hazardous | **SPECIALIZED DISPOSAL** | Toxic chemical preservatives emit arsenic/creosote volatiles if burned; certified containment required. |
| **G1** | Glass | Intact pane $\land$ Contamination $\in$ {None, Low} | **REUSE** | Architectural glazing panels salvaged for greenhouse construction or secondary partition walls. |
| **G2** | Glass | Broken / shattered cullet $\land$ Clean | **RECYCLE** | Glass cullet melts at 20-30% lower temperatures than virgin sand, saving significant furnace energy. |
| **SO1**| Soil | Tested clean $\land$ Condition $\in$ {Good, Excellent} | **REUSE** | Clean excavated subsoil preserved for on-site cut-and-fill balancing and civil embankment grading. |
| **SO2**| Soil | Contamination $\in$ {Moderate, High, Hazardous} | **SPECIALIZED DISPOSAL** | Chemical spills or heavy metals threaten aquifers; requires ex-situ bioremediation or containment. |

---

## 7. Installation & Quickstart

### Prerequisites
- Python 3.10+ installed
- Node.js 18+ and npm installed

### 1-Click Launch

**Windows** — double-click, or run from a terminal in the project root:
```cmd
run_all.bat
```

**Linux / macOS** — run from a terminal in the project root:
```bash
./run_all.sh
```

Either script launches both the FastAPI backend (port 8000) and the Vite
React frontend (port 5173), auto-creating the Python virtual environment and
installing `node_modules` on first run.

---

### Manual Setup & Execution

#### 1. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run automated test suite (rule engine + ML pipeline)
python -m pytest tests/ -v

# Start FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* Backend API runs at: `http://127.0.0.1:8000`
* Interactive OpenAPI Documentation: `http://127.0.0.1:8000/docs`

#### 2. Frontend Setup
```bash
cd frontend

# Install packages
npm install

# Start Vite development server
npm run dev -- --host 127.0.0.1 --port 5173
```
* Frontend Application runs at: `http://127.0.0.1:5173`

---

## 8. Verification & Demonstration Walkthrough

### Primary Academic Demonstration Scenario (Mandatory Proposal Benchmark)
1. Open the application at `http://127.0.0.1:5173`.
2. Click **"New Assessment"** or select **"Demo 1 – Damaged Concrete"**.
3. Input parameters:
   - **Material Type:** `Concrete`
   - **Quantity:** `500`
   - **Unit:** `kg`
   - **Condition:** `Damaged`
   - **Contamination:** `None`
4. Click **[Analyze Waste]**.
5. **Verified System Output:**
   - **Recommended Recovery Pathway:** `RECYCLE` (Badge: Blue, Tier 3)
   - **Rule Match Strength:** `Strong Rule Match`
   - **Matched Rule:** `C2`
   - **Reason for Recommendation:** *"Direct reuse is unsuitable due to the material condition, while clean concrete remains suitable for processing into recycled aggregate."*
   - **Potential Applications:** Recycled aggregate, Road base, Sub-base, Fill material where appropriate.
   - **Alternative Option:** Controlled reuse for suitable non-structural applications.
   - **Traceable Decision Path:**
     - `Reuse ✕` (Direct reuse rejected due to damaged structural condition)
     - `Repair ✕` (Refurbishment not applicable to fractured concrete)
     - `Recycle ✓` (Clean concrete suitable for processing into aggregate)
     - `Recover` (Superseded by higher tier)
     - `Dispose` (Avoided through recycling)
   - **Qualitative Sustainability Indicators:**
     - Landfill Avoidance: `HIGH`
     - Material Recovery: `HIGH`
     - Resource Conservation: `HIGH`
     - Circularity Potential: `HIGH`

---

## 9. REST API Reference

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/analyze` | Runs the ML decision engine (with safety-guardrail overrides) on waste inputs, persists the result, and returns an explainable response including confidence score and per-class probabilities. |
| `GET` | `/api/assessments` | Returns all recorded assessments with optional `?material=`, `?pathway=`, `?search=` filters. |
| `GET` | `/api/assessments/{id}` | Retrieves full decision path and checklist for a specific assessment. |
| `DELETE` | `/api/assessments/{id}` | Deletes an assessment audit record from the database. |
| `GET` | `/api/ml/status` | Reports whether a trained model is loaded, its version/accuracy, and the required feature schema. |
| `GET` | `/api/rules` | Catalogs all production rules in the (legacy, still-tested) rule base with optional filters. |
| `GET` | `/api/rules/{rule_id}` | Returns predicate rules and rationale for a single rule ID (e.g. `C2`). |
| `GET` | `/api/materials` | Lists knowledge base entries for all 11 construction waste materials. |
| `GET` | `/api/statistics` | Aggregates real-time metrics (counts, pathway distribution, material streams). |
| `GET` | `/api/health` | Service health status. |

---

## 10. Database Schema (SQLite)

Located at `backend/app/database/waste_planner.db`:
- **`assessments`**: Stores evaluation runs (`id`, `timestamp`, `material`, `condition`, `contamination`, `quantity`, `unit`, `recommended_pathway`, `matched_rule`, `reason`, `applications`, `alternatives`, `decision_path`, `sustainability`, plus ML fields `confidence_score`, `model_version`, `prediction_probabilities`, `decision_source`).
- **`rules`**: Stores production rule catalog (`rule_id`, `material`, `pathway`, `priority`, `conditions_description`, `reason`, `applications`, `alternatives`).
- **`materials`**: Stores knowledge base items (`name`, `category`, `description`, `typical_waste_source`, `reuse_potential`, `recycling_potential`, `common_applications`, `important_considerations`).

---

## 11. Limitations & Future Scope

### Current Version 1 Prototype Limitations
1. Does not dynamically calculate live transportation freight costs or tip fees at specific regional transfer stations.
2. Relies on visual and on-site engineering assessments rather than real-time spectral or chemical laboratory testing.
3. Provides qualitative rather than numerically certified ISO 14040 Life-Cycle Assessment (LCA) embodied carbon metrics.

### Future Research Extensions
- **BIM Deconstruction Integration:** Direct import of deconstruction schedules from Revit / IFC files.
- **Quantitative Carbon Accounting:** Integration with regional EPD (Environmental Product Declaration) databases for exact $kg\text{ CO}_2\text{e}$ savings calculation.
- **Geographic Information Systems (GIS):** Proximity routing to nearest verified secondary material exchanges.
