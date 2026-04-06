
# 🧠 HopePath: AI Mood Engine

The **AI Mood Engine** is a Python-based FastAPI microservice that powers the intelligence behind the HopePath platform. It analyzes 5-dimensional user wellness scores (mood, sleep, spiritual, stress, hope) and leverages Machine Learning and OpenAI to return highly personalized healing recommendations.

## 🏗️ Architecture

This microservice consists of two main AI components:
1. **Scikit-Learn Classifier Model**: Predicts the recommended "healing category" based on numerical wellness inputs and historical data.
2. **LLM Generator (OpenAI / OpenRouter)**: Takes the predicted ML category and the user's specific context (stress levels, religion) to generate actionable routines, quotes, or humor.

### Directory Structure
- `/api` — FastAPI application and route endpoints.
- `/data` — Datasets used for training the machine learning models.
- `/models` — Serialized (saved) ML models using `joblib`.
- `/scripts` — Python scripts to train and evaluate the ML models (`train_model.py`).
- `/task_model` — Additional model artifacts.
- `test_predict.py` — Utility script for local testing of model outputs.

## 🛠️ Tech Stack
- **FastAPI**: High-performance asynchronous web framework for the API.
- **Uvicorn**: ASGI server to run FastAPI.
- **scikit-learn**: For creating and running the ML classification models.
- **Pandas & NumPy**: For data manipulation and processing.
- **OpenAI**: For LLM prompt generation and dynamic chat responses.

## 🚀 Setup & Installation

### 1. Requirements
Ensure you have **Python 3.10+** installed.

### 2. Create a Virtual Environment
It is recommended to run this service in a virtual environment to avoid dependency conflicts.
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

