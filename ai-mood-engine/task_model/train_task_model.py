import os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from scipy.sparse import hstack
import joblib

def main():
    # Paths
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    # Given the directory view, the file is named mental_health_tasks_dataset_7000.csv
    DATA_PATH = os.path.join(BASE_DIR, "data", "mental_health_tasks_dataset_7000_augmented.csv")
    MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model")
    
    os.makedirs(MODEL_DIR, exist_ok=True)

    print("Loading dataset...")
    try:
        df = pd.read_csv(DATA_PATH)
    except FileNotFoundError:
        print(f"Dataset not found at {DATA_PATH}. Falling back to tasks_dataset.csv if exists.")
        DATA_PATH = os.path.join(BASE_DIR, "data", "tasks_dataset.csv")
        df = pd.read_csv(DATA_PATH)

    # Features
    text_col = "message_text"
    num_cols = ["stress_level", "sleep_hours", "work_pressure", "social_support", "energy_level", "sentiment_score"]
    target_cols = ["task1", "task2", "task3", "task4", "ai_reply"]

    # Handle missing values if any
    df[text_col] = df[text_col].fillna("")
    for col in num_cols:
        df[col] = df[col].fillna(df[col].median())

    print("Vectorizing text...")
    tfidf = TfidfVectorizer(max_features=5000, lowercase=True, stop_words="english")
    X_text = tfidf.fit_transform(df[text_col])

    print("Combining features...")
    X_num = df[num_cols].values
    X_combined = hstack([X_text, X_num])

    print("Encoding target labels...")
    encoders = {}
    Y = pd.DataFrame()
    for col in target_cols:
        le = LabelEncoder()
        Y[col] = le.fit_transform(df[col].astype(str))
        encoders[col] = le

    print("Training MultiOutput RandomForestClassifier... (this might take a moment)")
    rf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    model = MultiOutputClassifier(rf)
    model.fit(X_combined, Y)

    print("Saving models...")
    joblib.dump(model, os.path.join(MODEL_DIR, "task_model.pkl"))
    joblib.dump(tfidf, os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl"))
    joblib.dump(encoders, os.path.join(MODEL_DIR, "task_label_encoders.pkl"))

    print("Training complete! Models saved to task_model/model/")

if __name__ == "__main__":
    main()
