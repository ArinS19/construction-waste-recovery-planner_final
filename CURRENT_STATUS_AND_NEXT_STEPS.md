# Current Status & Next Steps
**Construction Waste Recovery Planner (ML Decision Architecture)**

---

## 🟢 1. Current State of the System

The project is **fully ML-driven and runnable right now on both Windows and Linux/macOS**:

| Layer | Current Status | Description |
|:---|:---:|:---|
| **Backend API** | ✅ **Active** | FastAPI backend with endpoints `/api/analyze`, `/api/ml/status`, `/api/assessments`, `/api/materials`, `/api/rules`. |
| **ML Model** | ✅ **Trained & Loaded** | `backend/app/ml/saved_models/waste_recovery_model.joblib` is a trained RandomForest pipeline (see `model_metadata.json` for accuracy/version). `/api/analyze` calls it on every request. |
| **ML Fallback Engine** | ✅ **Active (standby)** | If the model file is ever removed or fails to load, `BaselineProbabilisticModel` computes explainable multi-class probabilities so the stack never crashes. |
| **Safety Guardrails** | ✅ **Active** | Automatic safety override routes hazardous / contaminated loads to specialized handling regardless of model output, ensuring regulatory civil engineering compliance. |
| **Frontend UI** | ✅ **Updated** | React UI with ML Confidence Gauge, Multi-Class Probability Distribution progress bars across all 5 pathways, ML Status Widget, and 5-stage ML pipeline. |
| **Reference Dataset** | ✅ **Generated** | 3,000-row stratified dataset (600/class) at `backend/app/ml/data/sample_waste_dataset.csv`. See [ML_Model_Guide.md](./ML_Model_Guide.md) for what it is and isn't. |
| **Turnkey Training Script** | ✅ **Ready** | Automated Scikit-Learn training script at `backend/app/ml/train_template.py`. |
| **Cross-Platform Launchers** | ✅ **Ready** | `run_all.bat` / `run_backend.bat` / `run_frontend.bat` for Windows, and `run_all.sh` / `run_backend.sh` / `run_frontend.sh` for Linux/macOS. Both auto-create the Python venv and install dependencies on first run. |

---

## 🧪 2. How to Test It RIGHT NOW

You can test the entire application in **3 quick steps**:

### Step 1: Start the Backend and Frontend

**Windows** — double-click, or run from a terminal:
```cmd
run_all.bat
```
*(Or open two separate terminal windows:)*
- **Terminal 1 (Backend):** `run_backend.bat` *(Starts FastAPI on `http://127.0.0.1:8000`)*
- **Terminal 2 (Frontend):** `run_frontend.bat` *(Starts Vite React on `http://localhost:5173`)*

**Linux / macOS** — from a terminal in the project root:
```bash
./run_all.sh
```
*(Or open two separate terminals:)*
- **Terminal 1 (Backend):** `./run_backend.sh` *(Starts FastAPI on `http://127.0.0.1:8000`)*
- **Terminal 2 (Frontend):** `./run_frontend.sh` *(Starts Vite React on `http://127.0.0.1:5173`)*

All four scripts are idempotent: they create the Python virtual environment
(`backend/venv`) and install `node_modules` on first run only, then reuse
them on subsequent runs.

---

### Step 2: Verify in Your Web Browser
Open your browser to:
👉 **[http://localhost:5173](http://localhost:5173)**

What you will see right now:
1. **Navbar**: Subtitle is `"Machine Learning Decision Support for Sustainable Material Recovery"` with the green `"ML Decision Engine"` pill.
2. **Dashboard**: Look at the dark card titled **"Machine Learning Decision Engine Status"**:
   - Engine: `Probabilistic Classifier`
   - Badge: `Model Slot Ready (Awaiting User Model)`
   - Feature Columns: `15 Standard Features`
   - Target Classes: `5 Hierarchy Pathways`
3. **Run an Assessment**:
   - Click **"Demo 1 – Damaged Concrete (500 kg)"** (or click **"New Assessment"** and submit).
   - On the Result Page, you will see:
     - **ML Model Confidence**: `94.5% Confidence` badge in the hero card.
     - **ML Multi-Class Probability Distribution**: Interactive progress bars showing the probability breakdown across **REUSE**, **REPAIR**, **RECYCLE**, **RECOVER**, and **DISPOSAL**.
     - **Traceable ML Decision Pipeline**: 5-stage flow showing Preprocessing $\rightarrow$ Safety Screening $\rightarrow$ ML Inference $\rightarrow$ Hierarchy Alignment $\rightarrow$ Recommendation.

---

### Step 3: Test API Endpoints via Browser or Terminal

1. **Check Model Diagnostic Status**:
   Open in your browser:
   👉 `http://127.0.0.1:8000/api/ml/status`
   *(Returns model file path, active status, required feature columns, and target classes)*

2. **Test ML Inference Endpoint**:
   In PowerShell or terminal:
   ```bash
   curl -X POST "http://127.0.0.1:8000/api/analyze" -H "Content-Type: application/json" -d "{\"material\":\"Concrete\",\"condition\":\"Damaged\",\"contamination\":\"None\",\"quantity\":500,\"unit\":\"kg\",\"additional_characteristics\":{\"cracks\":\"Moderate\"}}"
   ```
   *(Returns JSON with `recommended_pathway`, `confidence_score`, and full `prediction_probabilities`)*

---

### Step 4: (Bonus) Retrain the ML Model in One Command
A trained model already ships in this repo, but you can regenerate it at any
time (e.g. after editing the dataset or `train_template.py`):

```bash
# Linux/macOS
source backend/venv/bin/activate
python backend/app/ml/train_template.py
```
```cmd
:: Windows
backend\venv\Scripts\activate.bat
python backend\app\ml\train_template.py
```
*(Uses the sample dataset to train a Scikit-Learn Pipeline and overwrites `waste_recovery_model.joblib` in `backend/app/ml/saved_models/`)*

Once complete:
- Restart the backend and refresh `http://localhost:5173`.
- The Dashboard card will display the updated version/accuracy from the new
  `model_metadata.json`.

---

## 📋 3. What Needs to Be Done Next (Your Checklist)

When you are ready to train your custom ML model:

1. **Prepare Your Dataset**:
   - Ensure your CSV contains the 15 input features defined in [ML_MODEL_INTEGRATION_SPECIFICATION.md](./ML_MODEL_INTEGRATION_SPECIFICATION.md) plus the target column `recommended_pathway`.
2. **Train Your Model**:
   - Use `backend/app/ml/train_template.py` with `--dataset path/to/your/data.csv`, or write your custom model code in Jupyter.
3. **Save Model Artifact**:
   - Save your pipeline to:
     `backend/app/ml/saved_models/waste_recovery_model.joblib`
4. **Deploy & Validate**:
   - Restart the backend (`run_backend.bat` on Windows, `./run_backend.sh` on Linux/macOS).
   - The app will automatically load your model artifact. No backend or frontend code changes needed!
