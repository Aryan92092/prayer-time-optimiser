"""
train_model.py
==============
Trains the mood recommendation model on the new multi-feature dataset.

KEY CHANGES:
- Mood stored as STRING labels in CSV (not integers) — LabelEncoder works correctly
- Added 'spiritual_level' as a new feature (maps to frontend 'spiritual' score)
- Uses GradientBoostingClassifier for better accuracy vs RandomForestClassifier
- Cross-validation + per-class accuracy report printed for quality assurance
- Feature importance shown to confirm ALL features are being used
"""

import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report
import joblib
import numpy as np

# ── Load dataset ─────────────────────────────────────────────────────────────
df = pd.read_csv("data/mood_dataset.csv")
print(f"Loaded {len(df)} rows")
print("Columns:", df.columns.tolist())
print("\nMood distribution:\n", df["mood"].value_counts())
print("\nRecommendation distribution:\n", df["recommendation"].value_counts())

# ── Encode mood labels (strings → integers) ───────────────────────────────────
mood_encoder = LabelEncoder()
df["mood_encoded"] = mood_encoder.fit_transform(df["mood"])
print("\nMood classes:", list(mood_encoder.classes_))

# ── Encode recommendation labels ──────────────────────────────────────────────
rec_encoder = LabelEncoder()
df["recommendation_encoded"] = rec_encoder.fit_transform(df["recommendation"])
print("Recommendation classes:", list(rec_encoder.classes_))

# ── Features — now includes spiritual_level ───────────────────────────────────
FEATURE_COLS = ["mood_encoded", "sleep_hours", "stress_level", "tasks_completed", "spiritual_level"]
X = df[FEATURE_COLS]
y = df["recommendation_encoded"]

# ── Train / test split ────────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ── Model: GradientBoostingClassifier (better than RandomForest for this task) ─
model = GradientBoostingClassifier(
    n_estimators=300,
    max_depth=5,
    learning_rate=0.1,
    subsample=0.8,
    random_state=42,
)

print("\nTraining model...")
model.fit(X_train, y_train)

# ── Evaluation ────────────────────────────────────────────────────────────────
accuracy = model.score(X_test, y_test)
print(f"\n✅ Test Accuracy: {accuracy:.4f} ({accuracy*100:.1f}%)")

# Cross-validation (5-fold)
cv_scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
print(f"📊 Cross-validation: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

# Per-class report
y_pred = model.predict(X_test)
print("\n📋 Per-class Classification Report:")
print(classification_report(
    y_test, y_pred,
    target_names=rec_encoder.inverse_transform(sorted(y_test.unique()))
))

# Feature importance — confirms model uses all features, not just mood
print("🔍 Feature Importances:")
for feat, imp in sorted(zip(FEATURE_COLS, model.feature_importances_), key=lambda x: -x[1]):
    bar = "█" * int(imp * 40)
    print(f"  {feat:<25} {imp:.4f}  {bar}")

# ── Save model and encoders ───────────────────────────────────────────────────
joblib.dump(model,        "models/mood_model.pkl")
joblib.dump(mood_encoder, "models/mood_encoder.pkl")
joblib.dump(rec_encoder,  "models/recommendation_encoder.pkl")

print("\n✅ Model saved to models/mood_model.pkl")
print("✅ Encoders saved.")

# ── Quick sanity check: 3 very different inputs should produce different outputs ─
print("\n🧪 Sanity Check — different inputs should give different outputs:")
test_cases = [
    {"label": "Happy, great sleep, low stress, spiritual",
     "features": [mood_encoder.transform(["happy"])[0], 8, 1, 8, 4]},
    {"label": "Sad, poor sleep, high stress, disconnected",
     "features": [mood_encoder.transform(["sad"])[0],   4, 5, 1, 1]},
    {"label": "Tired, very poor sleep, moderate stress",
     "features": [mood_encoder.transform(["tired"])[0], 4, 3, 3, 2]},
    {"label": "Overwhelmed, low sleep, max stress, high tasks",
     "features": [mood_encoder.transform(["overwhelmed"])[0], 4, 5, 9, 1]},
    {"label": "Motivated, excellent sleep, low stress",
     "features": [mood_encoder.transform(["motivated"])[0], 8, 1, 7, 4]},
]

import pandas as pd
for tc in test_cases:
    feat_df = pd.DataFrame([tc["features"]], columns=FEATURE_COLS)
    pred = model.predict(feat_df)[0]
    rec  = rec_encoder.inverse_transform([pred])[0]
    print(f"  [{tc['label']}] → {rec}")