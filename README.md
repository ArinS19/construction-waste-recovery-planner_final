# Construction Waste Recovery Planner

*A Machine Learning decision-support system for sustainable construction & demolition (C&D) waste recovery, built around the circular-economy hierarchy.*

This is the single reference document for the project. It replaces every other Markdown file that used to be scattered across this repository — if you want to understand what this system is, why it's built the way it is, how to run it, or how to extend it, this file is the whole story, top to bottom. A second, much shorter file — [`ML_EXPLANATION.md`](./ML_EXPLANATION.md) — exists purely to explain the ML side in plain language (e.g. for a course instructor); this file is the full technical reference.

---

## Table of Contents

1. [What This Project Does](#1-what-this-project-does)
2. [The Circular Recovery Hierarchy](#2-the-circular-recovery-hierarchy)
3. [System Architecture](#3-system-architecture)
4. [Technology Stack](#4-technology-stack)
5. [The Machine Learning Decision Engine](#5-the-machine-learning-decision-engine)
6. [The Pathway Reference Knowledge Base](#6-the-pathway-reference-knowledge-base)
7. [Project Structure](#7-project-structure)
8. [REST API Reference](#8-rest-api-reference)
9. [Database Schema](#9-database-schema)
10. [Running the Project](#10-running-the-project)
11. [Testing](#11-testing)
12. [Training / Replacing the ML Model](#12-training--replacing-the-ml-model)
13. [Known Limitations & Honest Caveats](#13-known-limitations--honest-caveats)
14. [Future Scope](#14-future-scope)

---

## 1. What This Project Does

Construction and demolition (C&D) activity accounts for a huge share of global solid waste. Much of that debris still has real structural or material value, but the people handling it on-site rarely have a fast, standardized way to decide: *"What should actually happen to this specific batch of waste, and why?"* In practice that usually means everything gets crushed into low-grade aggregate or sent to landfill, even when direct reuse or repair would have preserved far more value.

This application takes a description of a batch of waste — material type, physical condition, contamination level, quantity, and a few material-specific characteristics (cracks, rust, rot, moisture, coatings, etc.) — and returns:

- A **recommended recovery pathway** (see hierarchy below), chosen by a trained Machine Learning classifier
- A **confidence score** and the **full probability distribution** across all five pathways
- A **traceable, step-by-step decision path** (preprocessing → safety screening → ML inference → hierarchy alignment → recommendation)
- **Potential applications** and **alternative recovery options** for the recommended pathway
- A **qualitative sustainability assessment** (landfill avoidance, material recovery, resource conservation, circularity potential)
- A **safety flag** if the batch requires certified professional/regulatory assessment before any action is taken

Every assessment is persisted to a local SQLite database, so there's a full audit history, searchable and filterable by material/pathway, with aggregate statistics on top.

## 2. The Circular Recovery Hierarchy

The model's five target classes map directly onto the circular-economy waste hierarchy, in strictly descending order of preserved value:

| Tier | Pathway | What it means |
|:---:|:---|:---|
| 1 | **REUSE** | Direct salvage and re-installation in original form — no crushing, no remelting. |
| 2 | **REPAIR** | Minor refurbishment, cleaning, re-welding, re-milling — restores full functional utility. |
| 3 | **RECYCLE** | Mechanical crushing/shredding/melting into secondary raw material (recycled aggregate, scrap steel, glass cullet, etc.). |
| 4 | **RECOVER** | Materials Recovery Facility sorting or energy/thermal recovery, when secondary manufacturing isn't viable. |
| 5 | **DISPOSAL / SPECIALIZED HANDLING** | Regulated containment or hazardous-waste protocol — used when contamination or degradation rules out every circular option. |

A **hard safety guardrail** always overrides the model for hazardous contamination, regardless of what the classifier predicts — see [§5](#5-the-machine-learning-decision-engine).

## 3. System Architecture

```
┌─────────────────────┐        HTTP/JSON        ┌──────────────────────────┐
│   React + TS + Vite   │ ───────────────────────▶ │   FastAPI (Python)       │
│   frontend/            │ ◀─────────────────────── │   backend/app/           │
└─────────────────────┘                           └──────────────────────────┘
                                                              │
                                    ┌─────────────────────────┼─────────────────────────┐
                                    ▼                         ▼                         ▼
                          app/ml/model_adapter.py   app/database/session.py   app/rules/ (reference data)
                          Loads the trained model,   SQLite persistence for    Domain heuristics — power
                          runs inference, enforces    every assessment run      /api/rules and seed the
                          the safety guardrail                                 ML training labels

```

**Request flow for `POST /api/analyze`:**

1. `WasteInput` (material, condition, contamination, quantity, unit, free-form characteristics) is validated by Pydantic.
2. `app/ml/preprocessor.py` extracts a fixed **15-feature vector** (4 categorical + 11 numerical/engineered) from the input.
3. `app/ml/model_adapter.py::evaluate_waste_ml()` runs the feature vector through the trained scikit-learn pipeline (or a probabilistic fallback if no model file is present — see §5), producing a probability for each of the 5 pathways.
4. A **safety guardrail** checks contamination level / hazardous-coating flags and, if triggered, force-overrides the prediction to `DISPOSAL / SPECIALIZED HANDLING` regardless of model confidence.
5. The result — recommendation, confidence, full probability breakdown, reasoning, applications, alternatives, sustainability assessment, and a traceable list of decision steps — is persisted to SQLite and returned to the frontend.
6. The frontend renders it: a hero card with the recommended pathway and confidence, a probability-distribution bar chart, a 5-stage decision-pipeline visualization, and the qualitative sustainability panel.

## 4. Technology Stack

**Backend**
- Python 3.10+ (developed/tested against 3.14)
- FastAPI — async REST API framework
- Pydantic v2 — request/response validation
- SQLAlchemy 2.0 + SQLite — persistence
- scikit-learn, pandas, numpy, joblib — the ML pipeline
- Pytest — automated test suite (13 tests: ML pipeline + reference-engine unit tests + full API flow)

**Frontend**
- React 19 + TypeScript
- Vite 8 — dev server & build tooling
- Tailwind CSS v3 — styling
- lucide-react — icons

**Architecture:** decoupled client/server, JSON over REST, CORS-open for local development.

## 5. The Machine Learning Decision Engine

This is the core of the system. Every call to `POST /api/analyze` is answered by `app/ml/model_adapter.py::evaluate_waste_ml()`.

### 5.1 Feature schema (15 features)

| # | Feature | Type | Notes |
|---|---|---|---|
| 1 | `material` | categorical | One-hot encoded. 11 materials (Concrete, Brick, Steel, Wood, Glass, Plastic, Gypsum, Asphalt, Soil, Ceramic/Tiles, Mixed) |
| 2 | `condition` | categorical | One-hot encoded. Excellent / Good / Moderate / Damaged / Severely Damaged |
| 3 | `contamination` | categorical | One-hot encoded. None / Low / Moderate / High / Hazardous |
| 4 | `unit` | categorical | One-hot encoded. kg / tonnes / units / cubic metres |
| 5 | `quantity` | numerical | Standard-scaled |
| 6 | `broken_percentage` | numerical | 0–100, standard-scaled |
| 7 | `condition_score` | numerical | Ordinal mapping of `condition`, 0.0–4.0 |
| 8 | `contamination_score` | numerical | Ordinal mapping of `contamination`, 0.0–4.0 |
| 9 | `has_cracks` | binary | Derived from `additional_characteristics.cracks` |
| 10 | `structural_compromised` | binary | Derived from `additional_characteristics.structural_integrity` |
| 11 | `has_rust` | binary | Derived from `additional_characteristics.rust_level` |
| 12 | `has_rot` | binary | Derived from `additional_characteristics.rot` |
| 13 | `is_moist` | binary | Derived from `additional_characteristics.moisture`/`wet` |
| 14 | `has_hazardous_coating` | binary | Derived from `additional_characteristics.paint_coating`/`foreign_contaminants` |
| 15 | `is_separable` | binary | Derived from `additional_characteristics.separable_on_site` |

All of this extraction logic lives in `backend/app/ml/preprocessor.py`; the feature/column definitions are centralized in `backend/app/ml/config.py`.

### 5.2 The model

The shipped model (`backend/app/ml/saved_models/waste_recovery_model.joblib`) is a scikit-learn `Pipeline`:

```
ColumnTransformer(
    OneHotEncoder → [material, condition, contamination, unit],
    StandardScaler → [quantity, broken_percentage, condition_score, contamination_score,
                       has_cracks, structural_compromised, has_rust, has_rot,
                       is_moist, has_hazardous_coating, is_separable]
) → RandomForestClassifier(n_estimators=150, max_depth=12, min_samples_split=4,
                             class_weight="balanced", random_state=42)
```

It was trained (`backend/app/ml/train_template.py`) on a stratified 80/20 split of a 3,000-row reference dataset (2,400 train / 600 validation, 600 rows per pathway), reaching **98.67% validation accuracy** (see `model_metadata.json`).

**⚠️ Important caveat, stated honestly:** that reference dataset is **synthetic** — generated (`backend/app/ml/generate_sample_dataset.py`) from the same domain heuristics that power the reference knowledge base in §6, not from real inspected construction sites. The model has therefore learned to reproduce those heuristics accurately; the 98.67% figure means "the model learned the synthetic rules correctly," not "the model is 98.67% accurate against real-world waste." Treat it as a working end-to-end demonstration and a solid architecture to retrain on real labelled data when available (see [§12](#12-training--replacing-the-ml-model)).

### 5.3 Fallback baseline (no trained model present)

If `waste_recovery_model.joblib` is missing or fails to load, `BaselineProbabilisticModel` (also in `model_adapter.py`) computes explainable probability scores from the same feature vector using hand-tuned heuristic weights, so the API, frontend, and test suite keep working with zero downtime. `GET /api/ml/status` reports which engine is actually active (`is_user_trained_model_loaded`).

### 5.4 Safety guardrail (model-independent, always active)

Regardless of what the classifier predicts, if `contamination` is `High`/`Hazardous` or a hazardous-coating flag is set, the adapter force-overrides the recommendation to `DISPOSAL / SPECIALIZED HANDLING`, sets `professional_assessment_required = true`, and boosts the reported confidence to reflect certainty about the override — not the model's own probability. This cannot be "trained away"; it's applied after inference as a hard rule, on purpose, because environmental/civil-engineering safety compliance is not something a probabilistic classifier should be trusted to learn on its own.

### 5.5 Multi-class output

Every assessment returns the full posterior — a probability for all 5 pathways, not just the winner — which the frontend renders as a probability-distribution bar chart (`AssessmentResultPage.tsx`), alongside a calibrated confidence percentage and the model name/version.

## 6. The Pathway Reference Knowledge Base

Before the ML pivot, this project's decisions were made by a deterministic, hand-written rule engine (`backend/app/rules/`, 28 material/condition/contamination → pathway heuristics across the same 11 materials). That engine is **no longer on the decision path** — `POST /api/analyze` has called the ML engine exclusively since the architecture change — but its code and data are still very much alive, doing a different job:

- It's the **domain knowledge that the synthetic training dataset was generated from** (see §5.2's caveat).
- It's still exposed read-only at `GET /api/rules` and `GET /api/rules/{id}`, and rendered in the frontend's **Pathway Reference Guide** page, as a browsable, IF/THEN-style explanation of *why* a given material/condition/contamination combination tends toward a given pathway — useful as a teaching/reference tool independent of whatever the live model currently predicts.
- It is still directly unit-tested (`backend/tests/test_rule_engine.py` tests `evaluate_waste()` in isolation), because it's a legitimate, correct piece of domain logic in its own right — it's just not what generates a user-facing recommendation anymore.

If you're extending this project: don't confuse this with "the rule-based decision system" from before — the decision system is 100% the ML model in §5. This is reference data.

## 7. Project Structure

### Backend (`backend/app/`)

| Path | Role |
|---|---|
| `main.py` | FastAPI app setup, CORS, router registration, DB init + seeding on startup |
| `database/session.py` | SQLite engine/session (path built with `os.path.join`, OS-agnostic) |
| `database/seed_data.py` | Seeds demo materials/reference entries/assessments on first run — assessments are seeded through the **ML** engine so they stay consistent with what `/api/analyze` would return |
| `models/`, `schemas/` | SQLAlchemy ORM models and Pydantic request/response schemas |
| `routes/assessments.py` | `POST /api/analyze` (ML engine), history list/get/delete |
| `routes/ml_status.py` | `GET /api/ml/status` — is a trained model loaded, what version, what features does it expect |
| `routes/rules.py`, `routes/materials.py`, `routes/statistics.py` | Pathway reference browser, material knowledge base, aggregate stats |
| `routes/health.py` | `GET /api/health` — service + ML engine status |
| `rules/engine.py`, `rules/rule_base.py`, `rules/materials_data.py` | The reference knowledge base described in §6 |
| `ml/config.py` | Single source of truth for feature names, categories, target classes, ordinal score mappings |
| `ml/preprocessor.py` | Turns a `WasteInput` into the 15-feature dict the model expects |
| `ml/model_adapter.py` | Loads the `.joblib` model (or the baseline fallback), runs inference, enforces the safety guardrail, builds the full result |
| `ml/train_template.py` | CLI training script: CSV → `ColumnTransformer` + `RandomForestClassifier` → `.joblib` + `model_metadata.json` |
| `ml/generate_sample_dataset.py` | Generates the synthetic 3,000-row reference dataset |
| `ml/cv_comparison.py` | Standalone 5-fold CV comparison of 4 classifier types — run manually, not part of the app or test suite |
| `ml/saved_models/` | The live model artifact (`waste_recovery_model.joblib`) + its metadata (`model_metadata.json`) |

### Frontend (`frontend/src/`)

| Path | Role |
|---|---|
| `services/api.ts` | Thin fetch wrapper for every backend endpoint |
| `types/index.ts` | TypeScript types mirroring the backend Pydantic schemas |
| `pages/NewAssessmentPage.tsx` | Input form → `POST /api/analyze` |
| `pages/AssessmentResultPage.tsx` | Renders the result: pathway, confidence, probability bars, reasoning, applications/alternatives, sustainability |
| `pages/DashboardPage.tsx` | Overview + the ML Model Status card (reads `/api/ml/status`) |
| `pages/HistoryPage.tsx` | Searchable/filterable audit trail of past assessments |
| `pages/PathwayReferencePage.tsx` | Browsable knowledge base described in §6 (formerly "Rule Explorer") |
| `pages/MaterialsPage.tsx` | Material characteristics/circularity reference |
| `pages/MethodologyPage.tsx` | Research framing, architecture, limitations, future scope |
| `components/DecisionFlow.tsx` | The 5-stage decision pipeline visualization |
| `components/PathwayReferenceModal.tsx` | Deep-inspect modal for a single reference entry |
| `components/HierarchyBadge.tsx`, `SustainabilityPanel.tsx`, `Navbar.tsx`, `Footer.tsx` | Shared UI |

### Root

| Path | Role |
|---|---|
| `run_all.sh` / `run_all.bat` | One-command launcher: backend + frontend together |
| `run_backend.sh` / `run_backend.bat` | Backend only — creates/reuses `backend/venv`, installs deps, starts Uvicorn on :8000 |
| `run_frontend.sh` / `run_frontend.bat` | Frontend only — `npm install` if needed, starts Vite on :5173 |
| `startup` | Windows-focused plain-text setup walkthrough (kept as-is; still accurate) |
| `datasets/` | Three cleaned Kaggle CSVs of Indian municipal waste statistics — **not used to train the model** (no per-item material/condition/contamination fields; kept as reference material only) |

## 8. REST API Reference

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/analyze` | Runs the ML decision engine (with safety-guardrail override) on waste inputs, persists the result, returns the full explainable response. |
| `GET` | `/api/assessments` | Lists all recorded assessments; optional `?material=`, `?pathway=`, `?search=` filters. |
| `GET` | `/api/assessments/{id}` | Reconstructs the exact persisted result for one assessment (does **not** re-run inference — see note below). |
| `DELETE` | `/api/assessments/{id}` | Deletes an assessment record. |
| `GET` | `/api/ml/status` | Whether a trained model is loaded, its version, required feature schema, target classes. |
| `GET` | `/api/rules` | Lists the pathway reference knowledge base (§6); optional `?material=`, `?pathway=` filters. |
| `GET` | `/api/rules/{rule_id}` | A single reference entry (e.g. `C2`). |
| `GET` | `/api/materials` | Lists the 11 material knowledge-base entries. |
| `GET` | `/api/statistics` | Aggregate metrics: totals, pathway distribution, material streams, 5 most recent assessments. |
| `GET` | `/api/health` | Service + ML engine health status. |

**Why `/api/assessments/{id}` reconstructs rather than re-predicts:** early in this project, fetching a historical assessment re-ran it through the live model. That's a correctness bug — if the model is ever retrained, a historical assessment's list-view pathway and its detail-view pathway could silently disagree, since one came from what was stored at analysis time and the other from today's model. This has been fixed: the endpoint now rebuilds the full result from what was actually persisted (`decision_path`, `sustainability`, `applications`, `alternatives`, `prediction_probabilities`, etc.), so what you see in history always matches what you see in detail, permanently.

## 9. Database Schema

SQLite file at `backend/app/database/waste_planner.db` (auto-created + seeded on first run; safe to delete, it regenerates).

- **`assessments`** — every evaluation run: `id`, `timestamp`, `material`, `condition`, `contamination`, `quantity`, `unit`, `additional_characteristics`, `recommended_pathway`, `reason`, `matched_rule` (ML inference tag, e.g. `ML-RandomForestClassifier Pipeline`), `rule_match_strength`, `applications`, `alternatives`, `decision_path` (full JSON decision-step trace), `sustainability`, `confidence_score`, `model_version`, `prediction_probabilities`, `decision_source`.
- **`rules`** — the reference knowledge base from §6: `rule_id`, `material`, `pathway`, `priority`, `conditions_description`, `reason`, `applications`, `alternatives`.
- **`materials`** — material knowledge base: `name`, `category`, `description`, `typical_waste_source`, `reuse_potential`, `recycling_potential`, `common_applications`, `important_considerations`.

## 10. Running the Project

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### One-command launch

**Linux/macOS:**
```bash
./run_all.sh
```

**Windows:** double-click `run_all.bat`, or run it from a terminal.

Either way, both scripts auto-create the Python virtual environment and run `npm install` on first launch only; subsequent runs are fast. Backend lands on `http://127.0.0.1:8000` (Swagger docs at `/docs`), frontend on `http://127.0.0.1:5173`.

### Manual setup

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

### Verifying it worked

1. `http://127.0.0.1:8000/api/health` → `"ai_ml_enabled": true`, `"ml_model_loaded": true`.
2. `http://127.0.0.1:8000/api/ml/status` → `"is_user_trained_model_loaded": true`.
3. Open `http://127.0.0.1:5173`, click a demo scenario on the Dashboard or New Assessment page, submit, and confirm you get a pathway recommendation with a confidence percentage and probability bars.

See also: `startup` (plain-text Windows walkthrough with troubleshooting steps for first-time setup).

## 11. Testing

```bash
cd backend
source venv/bin/activate
python -m pytest tests -q
```

13 tests covering: ML feature extraction, ML adapter probability output and safety override, `/api/ml/status`, `/api/analyze` via the ML pipeline, the reference engine's own unit-level predicates (`evaluate_waste()` directly — independent of what `/api/analyze` uses), and a full API flow test (analyze → history → statistics → rules → materials).

Run `pytest` from the `backend/` directory (not the project root) or with `tests` explicitly named — `backend/app/ml/cv_comparison.py` is a standalone script, not a test, and lives outside the `tests/` package specifically so pytest's default discovery doesn't pick it up.

## 12. Training / Replacing the ML Model

To retrain on the bundled synthetic dataset from scratch:

```bash
python backend/app/ml/generate_sample_dataset.py   # rewrites sample_waste_dataset.csv
python backend/app/ml/train_template.py             # retrains + overwrites the .joblib
```

To train on **real, labelled data** (recommended before relying on this for anything beyond a demo):

1. Build a CSV with the 15 feature columns from §5.1 plus a `recommended_pathway` target column.
2. `python backend/app/ml/train_template.py --dataset path/to/your_data.csv`
3. This overwrites `waste_recovery_model.joblib` + `model_metadata.json` in place. Restart the backend — no other code changes needed. `GET /api/ml/status` will confirm the new version/accuracy.
4. Re-run `pytest backend/tests -q` to confirm the API contract and safety guardrail still hold.

Want to compare classifier choices first? `python -m app.ml.cv_comparison` (run from `backend/`) does a 5-fold CV comparison of RandomForest / GradientBoosting / DecisionTree / LogisticRegression on the current dataset.

## 13. Known Limitations & Honest Caveats

- **Training data is synthetic.** The shipped model's 98.67% accuracy is against a held-out slice of the same synthetic heuristics it was trained on — it demonstrates the architecture works end-to-end, not real-world field accuracy. See §5.2.
- **No live logistics modeling** — no transportation cost, tip fees, or regional plant capacity calculations.
- **User-reported inputs** — the system relies on self-reported physical condition rather than certified laboratory testing.
- **Sustainability scores are qualitative**, not a certified ISO 14040 Life-Cycle Assessment.
- **The top-level `datasets/` CSVs are not used for training** — they're city/municipal-level waste statistics with no per-item material/condition/contamination/pathway fields, kept for future feature-engineering reference only.

## 14. Future Scope

- Retrain on real, lab-verified or field-inspected waste assessment data.
- Building Information Modeling (BIM) integration for deconstruction schedules (Revit/IFC import).
- Quantitative Life-Cycle Assessment (LCA) with real embodied-carbon (kg CO₂e) accounting via regional EPD databases.
- GIS-based routing to the nearest verified recycling plant or secondary material marketplace.
