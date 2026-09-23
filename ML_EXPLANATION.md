# ML Explanation — What Changed and Why

*A short, plain-language summary of the Machine Learning work in this project, written for a course instructor / reviewer rather than a developer. For full technical detail, see [`README.md`](./README.md).*

## 1. What the system used to do

The original version of this project (**Construction Waste Recovery Planner**) made its recommendations with a **deterministic rule engine**: a hand-written set of 28 IF/THEN rules — e.g. *"IF material = Concrete AND condition ∈ {Moderate, Damaged} AND contamination ∈ {None, Low} THEN recommend RECYCLE."* Every input either matched a rule or fell through to a default, and the output was always exactly reproducible from the rule table.

## 2. What changed

The decision-making core was replaced with a **trained Machine Learning classifier**. Concretely:

1. **Feature engineering.** Every waste-batch description (material, condition, contamination, quantity, and free-form characteristics like cracks/rust/rot/moisture) is converted into a fixed **15-dimensional feature vector** — 4 categorical fields (one-hot encoded) and 11 numerical/engineered fields (ordinal scores and binary flags derived from the free-form input).
2. **Model.** A **Random Forest classifier** (`scikit-learn`, 150 trees, max depth 12, class-balanced) is trained inside a full preprocessing pipeline (`ColumnTransformer` → `OneHotEncoder` + `StandardScaler` → `RandomForestClassifier`), so raw input goes in and a prediction comes out in one call.
3. **Multi-class, probabilistic output.** Instead of a single matched rule, the model is a genuine multi-class classifier over the 5 circular-economy pathways (**REUSE → REPAIR → RECYCLE → RECOVER → DISPOSAL/SPECIALIZED HANDLING**) and returns a full probability distribution across all five, plus a calibrated confidence score — not just a yes/no rule match.
4. **Training data.** A stratified reference dataset of 3,000 labelled examples (600 per pathway) was generated and used for an 80/20 train/validation split (2,400 train / 600 validation). The trained model reaches **98.67% validation accuracy**.
5. **Safety guardrail kept, but decoupled from the model.** Hazardous-material handling is a regulatory/safety requirement, not something that should be left to a statistical model's discretion. So a hard, non-learned override still exists: if contamination is High/Hazardous (or a hazardous-coating flag is set), the system forces `DISPOSAL / SPECIALIZED HANDLING` regardless of what the classifier predicts. This runs **after** inference, as a fixed rule — it cannot be "trained away."
6. **Old rule engine repurposed, not deleted.** The original 28 rules weren't thrown out — they became the **domain knowledge base that the synthetic training dataset was generated from**, and they're still browsable in the app (now labelled as a reference guide, not a decision-maker) and still unit-tested on their own. The live decision path (`POST /api/analyze`) calls the ML model exclusively; the rule engine no longer drives any user-facing recommendation.
7. **Frontend rebuilt to match.** The UI was updated end-to-end to present this as what it now is — an ML system, not a rule system: a confidence gauge, a per-pathway probability bar chart, a 5-stage ML inference pipeline visualization, and an "ML Model Status" dashboard card replacing what used to be static rule-match badges. Every remaining "rule-based" label in the interface (navigation, footer, dashboard copy, demo badges, page copy) was audited and rewritten to accurately describe the ML system.

## 3. Why this is a meaningful upgrade, not just a relabeling

| | Rule Engine (before) | ML Model (now) |
|---|---|---|
| Decision mechanism | Fixed IF/THEN predicate matching | Learned statistical pattern from labelled training data |
| Output | One matched rule, binary | Full probability distribution across all 5 pathways + confidence score |
| Generalization | Only behaves correctly on inputs its author anticipated | Can interpolate between cases in the training distribution, including combinations never explicitly hand-coded |
| Extensibility | Adding a new scenario means writing a new rule by hand | Adding a new scenario means adding labelled examples and retraining |
| Safety-critical behavior | Encoded directly in the rules | Deliberately kept as a separate, non-learned override layer — the model is never trusted with a decision the field's safety standards demand be deterministic |

## 4. Honest limitation worth flagging

The training dataset is **synthetic** — it was generated from the same domain heuristics the old rule engine encoded, not from lab-inspected or field-verified real construction waste. This means the reported 98.67% accuracy demonstrates that *the model learned the underlying heuristic logic correctly*, not that it is 98.67% accurate against real-world waste streams. The architecture (feature schema, training script, evaluation pipeline) is built to be retrained on real data the moment it's available — `python backend/app/ml/train_template.py --dataset your_real_data.csv` — with zero other code changes required. Until then, this should be presented as a working, correctly-architected ML system demonstrated on a synthetic-but-domain-faithful dataset, not as a system validated on real-world data.

## 5. Where to look in the code

- `backend/app/ml/config.py` — feature/class definitions (single source of truth)
- `backend/app/ml/preprocessor.py` — raw input → 15-feature vector
- `backend/app/ml/model_adapter.py` — model loading, inference, the safety guardrail
- `backend/app/ml/train_template.py` — the training script itself
- `backend/app/ml/generate_sample_dataset.py` — how the training data was synthesized
- `backend/app/ml/saved_models/model_metadata.json` — the actual trained model's reported metrics
