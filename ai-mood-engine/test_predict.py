import requests

payload = {
    "message_text": "I feel anxious and overwhelmed today",
    "stress_level": 8,
    "sleep_hours": 5,
    "work_pressure": 7,
    "social_support": 4,
    "energy_level": 5,
    "sentiment_score": -0.6
}

response = requests.post("http://localhost:8000/predict-tasks", json=payload)
print("Response:", response.json())
