# Session Summary — What This Project Is, What Existed, What Changed

This file exists to answer three questions in one place: what is this
system, what state was it already in, and what did this session actually
do to it. Read it top to bottom once; after that, use it as an index back
into the other docs.

---

## 1. What this project is

**Construction Waste Recovery Planner** — a full-stack decision-support
tool. You feed it a batch of construction/demolition waste (material,
condition, contamination, quantity, and some optional characteristics like
cracks/rust/rot), and it recommends where that batch should go on the
circular-economy hierarchy: `REUSE → REPAIR → RECYCLE → RECOVER →
DISPOSAL / SPECIALIZED HANDLING`, with a full explanation, confidence score,
and safety flags.

- **Backend:** FastAPI + SQLAlchemy/SQLite (`backend/`)
- **Frontend:** React + TypeScript + Vite + Tailwind (`frontend/`)
- **Decision logic:** a trained scikit-learn ML model (RandomForest), with a
  deterministic rule engine kept alongside it as the original baseline and
  as a fallback

---

## 2. What already existed before this session

The project had already been through two build phases before I opened it:

**Phase 1 — Rule engine.** A deterministic, hand-written rule base
(`backend/app/rules/`) mapping material + condition + contamination
combinations to a recommended pathway, with full test coverage
(`backend/tests/test_rule_engine.py`). Documented in
`Construction_Waste_Recovery_Planner_Implementation.md`.

**Phase 2 — ML architecture.** The backend was restructured around a
modular ML decision engine (`backend/app/ml/`) that:
- extracts a fixed 15-feature vector from every request,
- runs it through a model,
- applies a hard safety override for hazardous/contaminated waste no
  matter what the model says,
- returns the same rich response shape the frontend already expected
  (pathway, reasoning, applications, alternatives, sustainability, plus
  new ML fields: confidence score, per-class probabilities, model version).

This phase also generated a synthetic training dataset
(`backend/app/ml/data/sample_waste_dataset.csv`, 3,000 rows) and **had
already trained and committed a working model**
(`backend/app/ml/saved_models/waste_recovery_model.joblib`, ~98.7%
validation accuracy per `model_metadata.json`) — this was not a stub or an
empty slot when I started. The frontend had also already been updated with
an ML confidence gauge, a per-pathway probability bar chart, and a model
status card.

Two documentation loose ends were left behind: `ML_Model_Guide.md` was an
empty placeholder, and none of the run scripts or docs accounted for
Linux/macOS — everything assumed Windows (`.bat` files, `venv\Scripts\...`
paths, a personal `startup` notes file with a hardcoded Windows path).

There's also a top-level `datasets/` folder with three cleaned Kaggle CSVs
of **Indian municipal waste statistics** (city-level tons/day, recycling
rate, landfill capacity, etc.). These were generated/cleaned earlier but
were **never wired into training** — and correctly so: they have no
per-item `material`/`condition`/`contamination`/`recommended_pathway`
fields, so they don't fit this model's schema. `datasets/README.md` says as
much. They're reference material, not training data for this model.

---

## 3. What I did this session

I read the docs in the order requested (Implementation →
Current Status → ML Integration Spec), then read the actual code (not just
docs) to verify what was true right now versus what the docs claimed —
several of the docs described the ML model slot as "empty," which was
stale; it wasn't.

### Verified (no code change needed)
- Installed backend deps into a fresh venv and **ran the full pytest suite
  on Linux** — passed after one fix (below).
- Started the actual FastAPI server on Linux and hit `/api/analyze` and
  `/api/ml/status` live — confirmed the trained model loads and drives real
  predictions (not the fallback).
- Ran `npm install` + `npm run build` for the frontend on Linux — clean
  build, no TypeScript errors.
- Grepped the whole codebase for Windows-only hardcoded paths in source —
  found none; `Path(__file__)`/`os.path.join` are used consistently, so the
  Python and TypeScript code itself was already OS-agnostic. The only
  actual Windows-only surface was the launcher scripts and docs.

### Fixed
- **`backend/tests/test_rule_engine.py`** — `test_api_analyze_and_flow`
  hard-asserted that `/api/analyze` returns rule-engine output
  (`recommended_pathway == "RECYCLE"`, `matched_rule == "C2"`). That
  endpoint has called the ML engine (`evaluate_waste_ml`) since Phase 2, so
  the trained model's own answer (`REPAIR`, 82.1% confidence) legitimately
  differs from the old rule's answer, and the test was failing. Rewrote it
  to check the API flow (200 status, valid pathway, persistence, history,
  stats, rules, materials endpoints) without hardcoding a rule-engine
  label the ML endpoint was never meant to reproduce. The individual
  rule-engine unit tests (which call `evaluate_waste` directly, not the API)
  were left untouched — they still correctly test the rule engine itself.

### Added — Linux/macOS parity
- **`run_backend.sh`**, **`run_frontend.sh`**, **`run_all.sh`** — direct
  equivalents of the three `.bat` files. Each auto-creates the Python venv /
  installs `node_modules` on first run only, then just starts the service.
  `run_all.sh` backgrounds the backend and runs the frontend in the
  foreground, with a trap that stops the backend when you Ctrl+C.
- Smoke-tested all three from a clean state (no venv, no node_modules) and
  confirmed clean shutdown with no orphaned processes. (Caught and fixed a
  real bug in the process: the backend script needs `exec` before the final
  `uvicorn`/`npm` command, otherwise killing the wrapper script leaves the
  actual server process running as an orphan.)

### Updated — Windows scripts, for parity with the above
- **`run_backend.bat`** — now auto-creates/activates `backend\venv` and
  installs requirements if missing (previously assumed a global Python with
  deps pre-installed, and set a no-op `PYTHONPATH=backend` left over from
  refactoring).
- **`run_frontend.bat`** — now skips `npm install` if `node_modules`
  already exists, instead of reinstalling every launch.

### Rewritten — documentation
- **`ML_Model_Guide.md`** — was a one-line placeholder; now explains what
  the shipped model actually is, explicitly flags that its training data is
  synthetic/heuristic-derived (so you know its limits), explains why the
  top-level `datasets/` CSVs aren't used, and gives copy-pasteable retrain
  steps for both OSes.
- **`CURRENT_STATUS_AND_NEXT_STEPS.md`** — corrected "Model Slot Empty" to
  "Trained & Loaded," corrected the dataset size (1,200 → 3,000, the real
  current count), and added Linux instructions alongside the Windows ones.
- **`README.md`** — quickstart, API reference, and DB schema sections
  updated: added the Linux one-click launch path, added the previously
  undocumented `GET /api/ml/status` endpoint, corrected `/api/analyze`'s
  description (it runs the ML engine, not the rule engine), removed a
  Windows-only `set PYTHONPATH=backend` line from the "manual setup"
  instructions that would break on Linux/macOS if copy-pasted, and listed
  the ML columns (`confidence_score`, `prediction_probabilities`,
  `model_version`, `decision_source`) now present on the `assessments`
  table.

### Not changed
- **Frontend UI/UX** — already fully wired for the ML system (confidence
  gauge, probability bars, model status card, 5-stage ML pipeline view);
  I found no stale rule-only UI to remove and no missing ML field the
  backend exposes but the frontend ignores. I did not restyle or restructure
  it since there was no functional or cross-platform reason to.
- **Backend decision logic** (`model_adapter.py`, `preprocessor.py`,
  rule engine) — untouched, per your instruction to keep the backend as-is.
  The one edit under `backend/` is the stale test fix above.
- **The trained model itself** — not retrained. It was already trained and
  loads correctly; retraining would only be warranted if you have real data
  to replace the synthetic set with (see `ML_Model_Guide.md` §2), or want to
  try a different algorithm (`cv_test.py` already compares four).

---

## 4. What each part of the system does (reference)

### Backend (`backend/app/`)
| Path | Role |
|---|---|
| `main.py` | FastAPI app setup, CORS, router registration, DB init + seeding on startup |
| `database/session.py` | SQLite engine/session (path is `os.path.join`-built — already OS-agnostic) |
| `database/seed_data.py` | Populates demo materials/rules/assessments on first run |
| `models/`, `schemas/` | SQLAlchemy ORM models and Pydantic request/response schemas |
| `routes/assessments.py` | `POST /api/analyze` (calls the ML engine), history/get/delete |
| `routes/ml_status.py` | `GET /api/ml/status` — is a trained model loaded, what version, what features does it expect |
| `routes/rules.py`, `routes/materials.py`, `routes/statistics.py` | Rule explorer, material knowledge base, aggregate stats — all still rule-engine metadata, kept for the frontend's Rule Explorer/Materials pages |
| `rules/engine.py`, `rules/rule_base.py` | The original deterministic engine — no longer on the `/api/analyze` path, but still directly unit-tested and still used to power `/api/rules` |
| `ml/config.py` | Single source of truth for feature names, categories, target classes, ordinal score mappings |
| `ml/preprocessor.py` | Turns a `WasteInput` into the 15-feature dict the model expects, including deriving binary flags from free-form `additional_characteristics` |
| `ml/model_adapter.py` | Loads the `.joblib` model (or falls back to `BaselineProbabilisticModel` if absent/broken), runs inference, enforces the hazard safety override, builds the full `AssessmentResult` |
| `ml/train_template.py` | CLI training script: load CSV → fit `ColumnTransformer` + `RandomForestClassifier` → save `.joblib` + `model_metadata.json` |
| `ml/generate_sample_dataset.py` | Generates the synthetic 3,000-row reference dataset |
| `ml/cv_test.py` | 5-fold CV comparison of 4 classifier types on the same dataset |
| `ml/saved_models/` | The live model artifact + its metadata |

### Frontend (`frontend/src/`)
| Path | Role |
|---|---|
| `services/api.ts` | Thin fetch wrapper for every backend endpoint, including `getMLStatus()` |
| `types/index.ts` | TypeScript types mirroring the backend Pydantic schemas, including the ML fields |
| `pages/NewAssessmentPage.tsx` | Input form → `POST /api/analyze` |
| `pages/AssessmentResultPage.tsx` | Renders the result: pathway, confidence gauge, per-class probability bars, reasoning, applications/alternatives, sustainability |
| `pages/DashboardPage.tsx` | Overview + the ML Model Integration Status card (reads `/api/ml/status`) |
| `pages/HistoryPage.tsx`, `MaterialsPage.tsx`, `RuleExplorerPage.tsx`, `MethodologyPage.tsx` | History browsing, material/rule reference pages, methodology write-up |
| `components/DecisionFlow.tsx` | The 5-stage pipeline visualization (Preprocessing → Safety → ML Inference → Hierarchy → Recommendation) |

### Launchers (project root)
| Windows | Linux/macOS | Does |
|---|---|---|
| `run_backend.bat` | `run_backend.sh` | Create/reuse `backend/venv`, install deps, start Uvicorn on :8000 |
| `run_frontend.bat` | `run_frontend.sh` | `npm install` if needed, start Vite dev server on :5173 |
| `run_all.bat` | `run_all.sh` | Launch both (Windows: separate console windows; Linux: backend backgrounded, frontend foreground, Ctrl+C stops both) |

---

## 5. How to run it

**Windows:** double-click `run_all.bat`, or run it from a terminal.
**Linux/macOS:** `./run_all.sh` from the project root.

Either way: backend at `http://127.0.0.1:8000` (docs at `/docs`), frontend
at `http://127.0.0.1:5173`. First run on either OS will take longer (venv +
pip install, or npm install); subsequent runs are fast.

## 6. If you want to retrain on real data

See `ML_Model_Guide.md` §2 — short version: build a CSV with the 15 feature
columns + `recommended_pathway`, run
`python backend/app/ml/train_template.py --dataset yourfile.csv`, restart
the backend. No other code changes needed; the adapter picks up the new
`.joblib` automatically.

## 7. Honest caveats worth knowing

- The shipped model's training data is synthetic and heuristic-derived
  (see §2 above and `ML_Model_Guide.md`). Its 98.7% accuracy is against a
  held-out slice of that same synthetic logic, not against real inspected
  waste — treat the number as "the model learned the synthetic rules
  correctly," not "the model is 98.7% accurate in the field."
- The rule engine (`backend/app/rules/`) is no longer what `/api/analyze`
  uses, but it's still exposed at `/api/rules` and still fully tested — it's
  not dead code, it just isn't the decision-maker anymore.
- `backend/app/database/waste_planner.db` now on disk includes a handful of
  test assessments I created while verifying the live endpoint during this
  session, on top of the normal seed data. It's gitignored either way and
  regenerates automatically (seed data included) if you delete it.
