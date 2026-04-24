from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
import pandas as pd
import os
import json
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

# Load .env from the ai-mood-engine root (one level above /api/)
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

# Initialize the OpenAI client using the key from .env
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

app = FastAPI(title="AI Mood Recommendation Engine", version="2.0.0")

# Allow React frontend to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained model & encoders — resolve path relative to project root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
model        = joblib.load(os.path.join(BASE_DIR, "models", "mood_model.pkl"))
mood_encoder = joblib.load(os.path.join(BASE_DIR, "models", "mood_encoder.pkl"))
rec_encoder  = joblib.load(os.path.join(BASE_DIR, "models", "recommendation_encoder.pkl"))

# ── Mood label map: frontend 1-5 score → model mood string ──────────────────
# 8 mood types matching the new dataset
MOOD_LABEL_MAP = {
    1: "overwhelmed",   # Very Low  → severely overwhelmed
    2: "sad",           # Low       → sad / low energy
    3: "anxious",       # Okay      → some tension/anxiety
    4: "calm",          # Good      → calm and steady
    5: "motivated",     # Excellent → motivated and thriving
}

# ── Sleep hours map: frontend 1-5 (quality) → approximate hours ─────────────
SLEEP_HOURS_MAP = {1: 3, 2: 5, 3: 6, 4: 7, 5: 9}

# ── Tasks completed proxy: hope score (1-5) → tasks done today ──────────────
TASKS_MAP = {1: 0, 2: 2, 3: 4, 4: 7, 5: 10}

# ── Stress level: frontend calm score (5=At Peace) → model stress (1=low,5=high)
def invert_stress(calm_score: int) -> int:
    """calm=5 → stress=1, calm=1 → stress=5"""
    return 6 - max(1, min(5, calm_score))

# ── Spiritual level: frontend spiritual score → model spiritual_level ────────
# Frontend: 1=Disconnected → 5=Deeply Connected (same scale, direct map)
def map_spiritual(spiritual_score: int) -> int:
    return max(1, min(5, int(spiritual_score)))

# ── Rich recommendation details — 12 recommendation types ───────────────────
RECOMMENDATION_DETAILS = {
    "start a challenging task": {
        "label": "Start a Challenging Task",
        "emoji": "🚀",
        "message": (
            "Your energy today is exceptional — you are in a rare state of clarity and drive. "
            "This is the perfect moment to tackle that ambitious goal you have been postponing. "
            "Lean into the challenge; your peak state is your greatest asset right now. "
            "Channel this momentum intentionally and watch what you are truly capable of."
        ),
        "action": "Block 60 uninterrupted minutes, silence all notifications, and dive into your most important goal. "
                  "Start with the hardest part first — strike while the iron is hot.",
        "category": "Productivity",
    },
    "deep work session": {
        "label": "Deep Work Session",
        "emoji": "🧘",
        "message": (
            "Your mind is in a calm, receptive state — perfectly primed for meaningful, focused work. "
            "This is your window to achieve something significant without the weight of distraction. "
            "Deep work is where your most important contributions are born. "
            "Enter a state of flow and trust the steady clarity you feel right now."
        ),
        "action": "Put your phone on silent, close unnecessary tabs, and commit fully to one meaningful project "
                  "for 45–90 minutes. No interruptions — this time is sacred.",
        "category": "Focus",
    },
    "write in journal": {
        "label": "Journal Your Feelings",
        "emoji": "📔",
        "message": (
            "Writing is one of the most powerful tools available to a hurting heart. "
            "It gives your swirling thoughts a place to land, and in naming them you begin to heal them. "
            "You do not need to have the right words — honesty is the only rule. "
            "Even five minutes with a pen can bring surprising clarity and release."
        ),
        "action": "Open your journal and write freely for 10 minutes without judgment. "
                  "Start with: 'Right now I feel…' and let your hand do the rest.",
        "category": "Emotional Healing",
    },
    "breathing exercise": {
        "label": "Breathing Exercise",
        "emoji": "🌬️",
        "message": (
            "Your nervous system is carrying tension your body is ready to release. "
            "The breath is the fastest, most accessible tool you have to shift your state right now. "
            "A few minutes of conscious breathing can dissolve hours of built-up stress. "
            "You do not need to fix everything — just breathe, and let the wave pass through you."
        ),
        "action": "Sit upright, close your eyes, and practice the 4-7-8 technique: "
                  "inhale for 4 counts, hold for 7, exhale slowly for 8. Repeat 6 rounds.",
        "category": "Stress Relief",
    },
    "take a short nap": {
        "label": "Rest & Recharge",
        "emoji": "😴",
        "message": (
            "Your body is speaking clearly — and it is asking for rest. "
            "This is not weakness; it is wisdom. A 20-minute nap is scientifically proven to restore "
            "focus, mood, and energy more effectively than caffeine. "
            "Honour your body's signal. You will return sharper, calmer, and more capable."
        ),
        "action": "Set a 20-minute timer, find a comfortable, quiet space, and permit yourself to "
                  "rest fully without guilt. Your productivity will thank you afterward.",
        "category": "Recovery",
    },
    "mindful meditation": {
        "label": "Mindful Meditation",
        "emoji": "🙏",
        "message": (
            "In the noise of daily life, stillness is the most radical act of self-care. "
            "Meditation does not require clearing your mind — it simply asks you to observe it, "
            "gently, without judgment. Even five minutes of intentional stillness can reshape your "
            "entire inner landscape and reconnect you to what truly matters."
        ),
        "action": "Find a quiet space, close your eyes, and focus only on your breath for 8–10 minutes. "
                  "When thoughts arise, simply notice them and return — gently, always gently.",
        "category": "Mindfulness",
    },
    "gratitude practice": {
        "label": "Gratitude Practice",
        "emoji": "✨",
        "message": (
            "When the mind defaults to what is missing, gratitude is the antidote. "
            "Research consistently shows that consciously naming what you are grateful for rewires "
            "the brain toward positivity and resilience. You do not need a perfect life to be grateful — "
            "even in difficulty, there are always small lights worth naming."
        ),
        "action": "Write down 5 things you are genuinely grateful for today — big or small. "
                  "For each one, close your eyes and actually feel the gratitude for 10 seconds before moving on.",
        "category": "Emotional Growth",
    },
    "light exercise": {
        "label": "Light Exercise",
        "emoji": "🚶",
        "message": (
            "Your body has energy that needs to move — even a short walk can shift your entire mood. "
            "Physical movement releases endorphins, reduces cortisol, and clears the mental fog "
            "more powerfully than almost anything else. You do not need an intense workout; "
            "a gentle, intentional 15-minute walk in fresh air can reset your entire day."
        ),
        "action": "Step outside for a 15-minute walk — no headphones, no phone. "
                  "Notice the air, the sounds, the ground beneath your feet. Let your body lead.",
        "category": "Physical Wellness",
    },
    "social connection": {
        "label": "Connect with Someone",
        "emoji": "💙",
        "message": (
            "Loneliness and disconnection can make every difficulty feel heavier than it truly is. "
            "Human connection is one of the deepest healing forces available to us. "
            "You do not need a long conversation — even a brief, genuine check-in with someone "
            "you trust can dissolve the wall of isolation and remind you that you are not alone."
        ),
        "action": "Reach out to one person you care about right now — text, call, or meet. "
                  "Keep it simple: 'Thinking of you. How are you doing?' Let the connection flow naturally.",
        "category": "Connection",
    },
    "creative activity": {
        "label": "Creative Expression",
        "emoji": "🎨",
        "message": (
            "Creativity is one of the soul's most natural forms of healing and joy. "
            "When you create — whether you draw, cook, write, sing, or build — "
            "you enter a flow state that bypasses the analytical mind and speaks directly to the heart. "
            "You do not need to be 'good' at it. The act of creating is the medicine."
        ),
        "action": "Spend 20–30 minutes on something purely creative: sketch, cook a new recipe, "
                  "write a poem, play music, or rearrange your space. No rules — just play.",
        "category": "Creative Healing",
    },
    "digital detox": {
        "label": "Digital Detox Break",
        "emoji": "📵",
        "message": (
            "The constant flow of information, notifications, and screens is quietly draining your "
            "mental battery more than you realise. Your nervous system needs a break from the digital world. "
            "Stepping away — even for an hour — allows your mind to recover its natural pace, "
            "reduces anxiety, and restores the ability to be present in your own life."
        ),
        "action": "Put all screens away for the next 60–90 minutes. "
                  "Do something entirely offline: walk, stretch, read a physical book, or simply sit in silence. "
                  "Let your mind breathe.",
        "category": "Mental Rest",
    },
    "self compassion break": {
        "label": "Self-Compassion Practice",
        "emoji": "🌸",
        "message": (
            "You are going through something genuinely difficult right now, and you deserve the same "
            "kindness you would offer a close friend in pain. Self-compassion is not self-pity — "
            "it is honest acknowledgment of your struggle paired with warmth toward yourself. "
            "Place your hand on your heart. You are doing the best you can. That is enough."
        ),
        "action": "Sit quietly and repeat slowly: 'This is a moment of suffering. Suffering is part of life. "
                  "May I be kind to myself in this moment.' Do this 5 times, breathing deeply between each one.",
        "category": "Self Care",
    },
}

FALLBACK_RECOMMENDATION = {
    "label": "Mindful Meditation",
    "emoji": "🙏",
    "message": (
        "Take this moment to sit in stillness and breathe — even just five minutes of mindful meditation "
        "can center your spirit and bring clarity to your day. You are exactly where you need to be right now."
    ),
    "action": "Find a quiet corner, close your eyes, and follow your breath for 5 minutes with full presence.",
    "category": "Mindfulness",
    "powered_by": "AI",
    "fallback": False,
}


@app.get("/")
def home():
    return {"message": "AI Mood Recommendation Engine v2.0", "status": "healthy"}


@app.post("/predict")
def predict(data: dict):
    try:
        # ── 1. Read the 5 scores from the frontend (1–5 scale each) ──────────
        mood_score      = int(data.get("mood",     3))
        sleep_score     = int(data.get("sleep",    3))
        stress_score    = int(data.get("stress",   3))   # calm score on UI
        hope_score      = int(data.get("hope",     3))
        spiritual_score = int(data.get("spiritual", 3))  # spiritual connection

        # ── 2. Map to model feature space ─────────────────────────────────────
        mood_label      = MOOD_LABEL_MAP.get(mood_score, "calm")
        sleep_hours     = SLEEP_HOURS_MAP.get(sleep_score, 6)
        tasks_completed = TASKS_MAP.get(hope_score, 4)
        stress_level    = invert_stress(stress_score)     # calm → stress
        spiritual_level = map_spiritual(spiritual_score)

        # ── 3. Encode mood label (string → integer via LabelEncoder) ──────────
        mood_encoded = int(mood_encoder.transform([mood_label])[0])

        # ── 4. Build named DataFrame — MUST match training feature names ───────
        # Training used: ["mood_encoded", "sleep_hours", "stress_level",
        #                  "tasks_completed", "spiritual_level"]
        features = pd.DataFrame(
            [[mood_encoded, sleep_hours, stress_level, tasks_completed, spiritual_level]],
            columns=["mood_encoded", "sleep_hours", "stress_level", "tasks_completed", "spiritual_level"]
        )

        # ── 5. Predict ────────────────────────────────────────────────────────
        prediction         = model.predict(features)
        recommendation_key = rec_encoder.inverse_transform(prediction)[0]

        # ── 6. Look up rich details ───────────────────────────────────────────
        details = RECOMMENDATION_DETAILS.get(recommendation_key, {
            "label":    recommendation_key.replace("_", " ").title(),
            "emoji":    "✨",
            "message":  f"Based on your complete mood profile, our AI recommends: {recommendation_key}. "
                        "Trust this guidance and take one small, intentional step right now.",
            "action":   recommendation_key.capitalize() + " — start with just 5 focused minutes.",
            "category": "Wellness",
        })

        return {
            "recommendation": details["label"],
            "emoji":          details["emoji"],
            "message":        details["message"],
            "action":         details["action"],
            "category":       details["category"],
            "powered_by":     "AI",
            "fallback":       False,
            # Debug info (helpful in development)
            "debug": {
                "mood_label":       mood_label,
                "mood_encoded":     mood_encoded,
                "sleep_hours":      sleep_hours,
                "tasks_completed":  tasks_completed,
                "stress_level":     stress_level,
                "spiritual_level":  spiritual_level,
                "raw_prediction":   recommendation_key,
            }
        }

    except Exception as e:
        # Return fallback — never crash the frontend
        return {**FALLBACK_RECOMMENDATION, "error": str(e)}


# ── AI Healing Plan Generation & Task Recommendation ─────────────────────────
from task_model.predict_task import predict_recommended_tasks

class HealingRequest(BaseModel):
    text: str
    stress_level: float = 5.0
    sleep_hours: float = 7.0
    work_pressure: float = 5.0
    social_support: float = 5.0
    energy_level: float = 5.0
    sentiment_score: float = 0.0

@app.post("/api/healing/generate")
def generate_healing_plan(req: HealingRequest):
    try:
        # 1. Always use the local trained Healing Machine Learning Model
        prediction_result = predict_recommended_tasks(
            message_text=req.text,
            stress_level=req.stress_level,
            sleep_hours=req.sleep_hours,
            work_pressure=req.work_pressure,
            social_support=req.social_support,
            energy_level=req.energy_level,
            sentiment_score=req.sentiment_score
        )

        tasks    = prediction_result["tasks"]
        ai_reply = prediction_result["reply"]

        TASK_DETAILS = {
            "deep_breathing":      {"title": "Deep Breathing",        "description": "Take slow, deep breaths to calm your nervous system."},
            "5_min_meditation":    {"title": "5-Minute Meditation",   "description": "Sit quietly and focus on your breath for 5 minutes."},
            "short_walk":          {"title": "Short Walk",            "description": "Take a brief walk to clear your mind and move your body."},
            "drink_water":         {"title": "Drink Water",           "description": "Hydrate yourself with a glass of water."},
            "listen_music":        {"title": "Listen to Music",       "description": "Play a calming or uplifting song."},
            "write_journal":       {"title": "Write in Journal",      "description": "Jot down your thoughts and feelings to process them."},
            "call_friend":         {"title": "Call a Friend",         "description": "Reach out to someone you trust for a quick chat."},
            "stretch_body":        {"title": "Stretch Body",          "description": "Do some light stretching to release physical tension."},
            "gratitude_list":      {"title": "Gratitude List",        "description": "List 3 things you are grateful for today."},
            "watch_funny_video":   {"title": "Watch a Funny Video",   "description": "Watch something humorous to lift your spirits."},
            "positive_affirmation":{"title": "Positive Affirmation",  "description": "Repeat a positive, grounding statement to yourself."},
            "mindfulness_exercise":{"title": "Mindfulness Exercise",  "description": "Focus fully on the present moment and your surroundings."},
            "nature_break":        {"title": "Nature Break",          "description": "Step outside for a moment and connect with nature."},
            "digital_detox":       {"title": "Digital Detox",         "description": "Put away your screen for a sustained mindful break."},
            "drink_tea":           {"title": "Drink Tea",             "description": "Brew and slowly enjoy a warm cup of calming tea."}
        }

        # 2. Rule Engine to adapt the ML output to the requested Relief Type
        text_lower = req.text.lower()
        
        is_humor     = "light humor" in text_lower
        is_quotes    = "quotes" in text_lower
        is_guided    = "guided steps" in text_lower
        is_exercises = "quick exercises" in text_lower

        plan_title = "Dr. Aisha's Plan"
        
        if is_humor:
            plan_title = "A Tiny Light Relief Plan 🎈"
            ai_reply = ai_reply + " Also, remember: if stress burned calories, you'd be a supermodel right now. Let's take it easy and smile today!"
            
            # Make the steps sound slightly more humorous
            humor_steps = []
            for t in tasks:
                base = TASK_DETAILS.get(t, {"title": t.replace("_", " ").title(), "description": "Take a moment for this mental health task."})
                humor_steps.append({
                    "title": base["title"] + " (Yes, seriously)",
                    "description": base["description"] + " It's scientifically proven, or at least highly recommended by me."
                })
            steps = humor_steps

        elif is_quotes:
            plan_title = "Words of Comfort 📖"
            ai_reply = ai_reply + " \"You don't have to control your thoughts. You just have to stop letting them control you.\" – Dan Millman."
            
            # Simple steps
            steps = []
            for t in tasks:
                base = TASK_DETAILS.get(t, {"title": t.replace("_", " ").title(), "description": "Take a moment for this mental health task."})
                steps.append(base)

        elif is_exercises:
            plan_title = "Quick Relief Circuit ⚡"
            ai_reply = "I hear you. Let's bypass the deep thinking right now and just move that energy quickly. Do these tiny actions right away."
            
            # Make the steps super quick and direct
            quick_steps = []
            for t in tasks:
                base = TASK_DETAILS.get(t, {"title": t.replace("_", " ").title(), "description": "Take a moment for this mental health task."})
                quick_steps.append({
                    "title": "⚡ " + base["title"],
                    "description": base["description"] + " (Just 60 seconds. Go!)"
                })
            steps = quick_steps

        elif is_guided:
            plan_title = "Your Gentle Guided Map 🗺️"
            ai_reply = ai_reply + " I have broken this down into very small, manageable steps for you so you don't have to think. Just follow the path below."
            
            steps = []
            for t in tasks:
                base = TASK_DETAILS.get(t, {"title": t.replace("_", " ").title(), "description": "Take a moment for this mental health task."})
                steps.append(base)
                
        else:
            # Default fallback for "Suggestions" or no specific relief
            steps = []
            for t in tasks:
                base = TASK_DETAILS.get(t, {"title": t.replace("_", " ").title(), "description": "Take a moment for this mental health task."})
                steps.append(base)

        # Ensure steps are unique in case the ML model predicted the same task twice
        unique_steps = []
        seen_titles = set()
        for s in steps:
            if s["title"] not in seen_titles:
                unique_steps.append(s)
                seen_titles.add(s["title"])

        return {
            "emotion":     "customized",
            "category":    "guided steps" if is_guided else ("light humor" if is_humor else "relief plan"),
            "severity":    "medium",
            "summary":     ai_reply,
            "plan_title":  plan_title,
            "steps":       unique_steps
        }

    except Exception as e:
        print(f"Error generating healing plan from ML model: {e}")
        return {
            "emotion":    "overwhelmed",
            "category":   "general distress",
            "severity":   "medium",
            "summary":    "You are feeling overwhelmed and need a moment of peace.",
            "plan_title": "Gentle Reset Plan",
            "steps": [{"title": "Pause and Breathe",
                        "description": "Take 5 deep breaths, counting to 4 on the inhale and 6 on the exhale."}]
        }


# ── Dr. Aisha Conversational Chat ─────────────────────────────────────────────
class ChatRequest(BaseModel):
    emotion: str
    message: str
    relief_types: list[str] = []

@app.post("/api/healing/chat")
def dr_aisha_chat(req: ChatRequest):
    """
    Generates a warm, empathetic conversational reply from Dr. Aisha using OpenAI.
    This is independent of the healing ML model — it is purely an LLM chat call.
    """
    try:
        relief_context = ", ".join(req.relief_types) if req.relief_types else "general support"
        system_prompt = (
            "You are Dr. Aisha, a warm, compassionate, and professional AI wellness counselor. "
            "You listen deeply, validate feelings, and offer gentle, spiritually grounded guidance. "
            "Your tone is calm, empathetic, nurturing, and never clinical or robotic. "
            "Respond in 3-4 sentences maximum. Be personal, use 'you' and 'your'. "
            "Do not give a diagnosis. Do not be generic. Respond directly to what the user shared. "
            "End with one gentle encouraging statement or a soft question to invite further sharing."
        )
        user_prompt = (
            f"The user is feeling: {req.emotion}.\n"
            f"They prefer relief in the form of: {relief_context}.\n"
            f"Here is what they shared: \"{req.message}\"\n\n"
            "Please respond as Dr. Aisha with warmth and genuine empathy."
        )

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_prompt},
            ],
            max_tokens=200,
            temperature=0.75,
        )
        reply = response.choices[0].message.content.strip()
        return {"reply": reply}

    except Exception as e:
        print(f"Dr. Aisha chat error: {e}")
        # Warm fallback so the UI never breaks
        return {
            "reply": (
                f"I hear you, and I'm so glad you reached out. Feeling {req.emotion.lower()} is deeply valid, "
                "and it takes courage to name what you're going through. "
                "You don't have to carry this alone — let's work through it together, one gentle step at a time."
            )
        }


# ── Sacred Chat (Personalized Spiritual Guide) ────────────────────────────────
class SacredChatRequest(BaseModel):
    message: str
    spiritual_preference: str = "non-religious"
    religion_type: str = ""
    history: list[dict] = []

@app.post("/api/sacred/chat")
def sacred_chat(req: SacredChatRequest):
    """
    Generates a personalized response from a spiritual guide based on the user's path.
    """
    try:
        if req.spiritual_preference == "religious" and req.religion_type:
            path = req.religion_type.replace("_", " ").title()
            system_prompt = (
                f"You are a wise, compassionate, and deeply knowledgeable spiritual guide for the {path} path. "
                f"You offer comfort, spiritual insights, and gentle encouragement grounded in the traditions, "
                f"scriptures, and philosophies of {path}. "
                "Speak with deep empathy, reverence, and warmth. Use 'we' or 'you' warmly. "
                "Keep responses to 3-4 sentences maximum. Do not be overly preachy; be a comforting presence."
            )
        else:
            system_prompt = (
                "You are a wise, grounded, and compassionate mindfulness and life guide. "
                "You offer comfort, stoic wisdom, and gentle encouragement grounded in secular mindfulness, "
                "psychology, and inner peace. "
                "Speak with deep empathy and warmth. Use 'we' or 'you' warmly. "
                "Keep responses to 3-4 sentences maximum. Be a comforting, stabilizing presence."
            )

        messages = [{"role": "system", "content": system_prompt}]
        
        # Add limited history (last 4 messages to keep context window small)
        for msg in req.history[-4:]:
            messages.append({"role": msg["role"], "content": msg["content"]})
            
        messages.append({"role": "user", "content": req.message})

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=250,
            temperature=0.75,
        )
        reply = response.choices[0].message.content.strip()
        return {"reply": reply}

    except Exception as e:
        print(f"Sacred chat error: {e}")
        return {
            "reply": "I am here with you, even in the silence. Take a deep breath, and know that you are safe and supported."
        }


# ── Predict Tasks Endpoint ────────────────────────────────────────────────────
class TaskPredictionRequest(BaseModel):
    message_text: str
    stress_level: float
    sleep_hours: float
    work_pressure: float
    social_support: float
    energy_level: float
    sentiment_score: float

@app.post("/predict-tasks")
def predict_tasks_endpoint(req: TaskPredictionRequest):
    try:
        prediction_result = predict_recommended_tasks(
            message_text=req.message_text,
            stress_level=req.stress_level,
            sleep_hours=req.sleep_hours,
            work_pressure=req.work_pressure,
            social_support=req.social_support,
            energy_level=req.energy_level,
            sentiment_score=req.sentiment_score
        )
        return {
            "tasks": prediction_result["tasks"],
            "reply": prediction_result["reply"]
        }
    except Exception as e:
        return {"error": str(e)}