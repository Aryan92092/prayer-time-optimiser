import os
import numpy as np
from scipy.sparse import hstack
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")

MODEL_PATH = os.path.join(MODEL_DIR, "task_model.pkl")
TFIDF_PATH = os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl")
ENCODERS_PATH = os.path.join(MODEL_DIR, "task_label_encoders.pkl")

# Lazy loading of models
_model = None
_tfidf = None
_encoders = None

def load_models():
    """Loads the Random Forest model and encoders if not already loaded in memory."""
    global _model, _tfidf, _encoders
    if _model is None:
        _model = joblib.load(MODEL_PATH)
        _tfidf = joblib.load(TFIDF_PATH)
        _encoders = joblib.load(ENCODERS_PATH)

def predict_recommended_tasks(
    message_text: str,
    stress_level: float,
    sleep_hours: float,
    work_pressure: float,
    social_support: float,
    energy_level: float,
    sentiment_score: float
) -> list:
    """Predicts exactly 4 recommended mental-health tasks."""
    load_models()
    
    # Process text using loaded tf-idf
    X_text = _tfidf.transform([str(message_text)])
    
    # Process numerical features matching order in training pipeline
    X_num = np.array([[
        float(stress_level),
        float(sleep_hours),
        float(work_pressure),
        float(social_support),
        float(energy_level),
        float(sentiment_score)
    ]])
    
    # Combine sparse matrix and dense features
    X_combined = hstack([X_text, X_num])
    
    # Predict MultiOutput targets
    preds = _model.predict(X_combined)
    
    # preds[0] will have 5 items because we have 5 target cols: 
    # [task1, task2, task3, task4, ai_reply]
    
    tasks = []
    target_cols = ["task1", "task2", "task3", "task4", "ai_reply"]
    for i, col in enumerate(target_cols):
        decoded = _encoders[col].inverse_transform([preds[0][i]])[0]
        if col != "ai_reply":
            tasks.append(decoded)
        else:
            ai_reply = decoded
            
    return {"tasks": tasks, "reply": ai_reply}
