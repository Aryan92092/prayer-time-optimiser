"""
generate_dataset.py
===================
Generates a rich, multi-feature mood recommendation dataset (2000 rows).

KEY FIX: Recommendations are now determined by the COMBINATION of
mood + sleep + stress + spiritual — not just mood alone.
This forces the model to actually use all input features.

Mood labels: happy, calm, sad, stressed, tired, anxious, motivated, overwhelmed
Recommendations (12 types):
  - start a challenging task
  - deep work session
  - write in journal
  - breathing exercise
  - take a short nap
  - mindful meditation
  - gratitude practice
  - light exercise
  - social connection
  - creative activity
  - digital detox
  - self compassion break
"""

import pandas as pd
import random
import numpy as np

random.seed(42)
np.random.seed(42)

# ── Mood profiles: realistic feature distributions per mood ─────────────────
MOOD_PROFILES = {
    "happy": {
        "sleep_range": (6, 9),
        "stress_range": (1, 3),     # low stress
        "tasks_range": (5, 10),
        "spiritual_range": (3, 5),  # connected
    },
    "motivated": {
        "sleep_range": (6, 9),
        "stress_range": (1, 3),
        "tasks_range": (6, 10),
        "spiritual_range": (3, 5),
    },
    "calm": {
        "sleep_range": (6, 9),
        "stress_range": (1, 3),
        "tasks_range": (3, 8),
        "spiritual_range": (2, 5),
    },
    "sad": {
        "sleep_range": (3, 7),
        "stress_range": (2, 5),
        "tasks_range": (0, 4),
        "spiritual_range": (1, 3),
    },
    "tired": {
        "sleep_range": (3, 6),
        "stress_range": (2, 4),
        "tasks_range": (0, 5),
        "spiritual_range": (1, 4),
    },
    "stressed": {
        "sleep_range": (4, 7),
        "stress_range": (3, 5),
        "tasks_range": (2, 7),
        "spiritual_range": (1, 3),
    },
    "anxious": {
        "sleep_range": (3, 6),
        "stress_range": (4, 5),
        "tasks_range": (0, 5),
        "spiritual_range": (1, 3),
    },
    "overwhelmed": {
        "sleep_range": (3, 6),
        "stress_range": (4, 5),
        "tasks_range": (3, 9),     # doing lots but overwhelmed
        "spiritual_range": (1, 2),
    },
}

def get_recommendation(mood, sleep_hours, stress_level, tasks_completed, spiritual_level):
    """
    Domain-knowledge rule engine: returns recommendation based on
    COMBINATION of all features. This is the key fix.
    """

    # Helper booleans
    low_sleep = sleep_hours <= 5
    high_sleep = sleep_hours >= 7
    low_stress = stress_level <= 2
    high_stress = stress_level >= 4
    high_tasks = tasks_completed >= 7
    low_tasks = tasks_completed <= 2
    disconnected = spiritual_level <= 2
    connected = spiritual_level >= 4

    # ── OVERWHELMED: needs immediate relief ─────────────────────────────────
    if mood == "overwhelmed":
        if high_stress and low_sleep:
            return "take a short nap"
        if high_stress and high_tasks:
            return "digital detox"
        return "breathing exercise"

    # ── ANXIOUS: needs grounding ────────────────────────────────────────────
    if mood == "anxious":
        if high_stress and low_sleep:
            return "take a short nap"
        if high_stress and connected:
            return "mindful meditation"
        if low_tasks and disconnected:
            return "gratitude practice"
        return "breathing exercise"

    # ── STRESSED: needs relief ───────────────────────────────────────────────
    if mood == "stressed":
        if low_sleep:
            return "take a short nap"
        if high_tasks:
            return "digital detox"
        if disconnected:
            return "mindful meditation"
        return "breathing exercise"

    # ── TIRED: needs rest/recovery ───────────────────────────────────────────
    if mood == "tired":
        if low_sleep:
            return "take a short nap"
        if low_stress and high_sleep:
            return "light exercise"        # rested but sluggish
        return "take a short nap"

    # ── SAD: needs emotional support ─────────────────────────────────────────
    if mood == "sad":
        if high_stress:
            return "self compassion break"
        if disconnected:
            return "gratitude practice"
        if low_tasks:
            return "social connection"
        return "write in journal"

    # ── CALM: productive state, needs direction ──────────────────────────────
    if mood == "calm":
        if high_sleep and low_stress and high_tasks:
            return "deep work session"
        if high_sleep and low_stress and connected:
            return "creative activity"
        if low_tasks:
            return "deep work session"
        return "mindful meditation"

    # ── HAPPY / MOTIVATED: peak performance state ────────────────────────────
    if mood in ("happy", "motivated"):
        if high_stress and low_sleep:
            # peak mood but body needs rest — balance
            return "take a short nap"
        if low_tasks and low_stress:
            return "start a challenging task"
        if high_tasks and high_sleep:
            return "start a challenging task"
        if connected and high_sleep:
            return "deep work session"
        if disconnected:
            return "gratitude practice"
        return "start a challenging task"

    # Fallback
    return "mindful meditation"


# ── Generate 2000 samples ────────────────────────────────────────────────────
MOODS = list(MOOD_PROFILES.keys())
data = []

rows_per_mood = 2000 // len(MOODS)  # ~250 per mood

for mood in MOODS:
    profile = MOOD_PROFILES[mood]
    for _ in range(rows_per_mood):
        sleep_hours     = random.randint(*profile["sleep_range"])
        stress_level    = random.randint(*profile["stress_range"])
        tasks_completed = random.randint(*profile["tasks_range"])
        spiritual_level = random.randint(*profile["spiritual_range"])

        # Add small random perturbations to make it a real ML problem
        # (not perfectly deterministic, forces model to generalize)
        if random.random() < 0.08:   # 8% noise
            stress_level    = random.randint(1, 5)
            sleep_hours     = random.randint(3, 9)

        recommendation = get_recommendation(
            mood, sleep_hours, stress_level, tasks_completed, spiritual_level
        )

        data.append({
            "mood":             mood,
            "sleep_hours":      sleep_hours,
            "stress_level":     stress_level,
            "tasks_completed":  tasks_completed,
            "spiritual_level":  spiritual_level,
            "recommendation":   recommendation,
        })

# Add extra rows to hit exactly 2000
while len(data) < 2000:
    mood = random.choice(MOODS)
    profile = MOOD_PROFILES[mood]
    sleep_hours     = random.randint(*profile["sleep_range"])
    stress_level    = random.randint(*profile["stress_range"])
    tasks_completed = random.randint(*profile["tasks_range"])
    spiritual_level = random.randint(*profile["spiritual_range"])
    recommendation  = get_recommendation(mood, sleep_hours, stress_level, tasks_completed, spiritual_level)
    data.append({
        "mood": mood, "sleep_hours": sleep_hours, "stress_level": stress_level,
        "tasks_completed": tasks_completed, "spiritual_level": spiritual_level,
        "recommendation": recommendation,
    })

df = pd.DataFrame(data)
df = df.sample(frac=1, random_state=42).reset_index(drop=True)  # shuffle

# Print distribution
print("Dataset generated:", len(df), "rows")
print("\nMood distribution:")
print(df["mood"].value_counts())
print("\nRecommendation distribution:")
print(df["recommendation"].value_counts())

df.to_csv("data/mood_dataset.csv", index=False)
print("\n✅ Dataset saved to data/mood_dataset.csv")