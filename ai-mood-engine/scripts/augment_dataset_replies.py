import pandas as pd
import random
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "data", "mental_health_tasks_dataset_7000.csv")

df = pd.read_csv(DATA_PATH)

# Curated replies from Dr. Aisha by mood
REPLIES = {
    "stressed": [
        "I hear you. The pressure you're feeling is valid, but you don't have to carry it all at once. Let's take a breath and look at these gentle steps together.",
        "It's completely normal to feel overwhelmed when there's so much on your plate. I've put together a few things to help you find your footing right now.",
        "Your mind is racing, and that's exhausting. You deserve a moment of pure calm. Try these simple tasks to loosen the tension you're holding."
    ],
    "anxious": [
        "Anxiety can make everything feel urgent and loud. I'm right here with you. These steps are designed to gently ground you back into the present moment.",
        "Your nervous system is working overtime right now. It's safe to slow down. I recommend these small, grounding exercises to help you feel secure.",
        "I know the uncertainty feels heavy, but you are safe in this moment. Deep breaths. Here is a calming plan to ease the fluttering in your chest."
    ],
    "sad": [
        "I'm so sorry you're feeling this weight today. It's okay to feel sad—you don't have to rush through it. Here are some gentle ways to care for yourself right now.",
        "Some days just require extra gentleness and self-compassion. I hold space for your sadness. Whenever you're ready, here are a few tiny steps that might bring a sliver of light.",
        "You are seen, and your feelings matter. Let's not try to fix everything at once. Let's just focus on these tender, restorative actions instead."
    ],
    "lonely": [
        "Even when it feels like you're isolated, please know you are not alone in this space. I am here for you. Let's gently reconnect with yourself and the world through these steps.",
        "Loneliness can ache so deeply. I hear your longing for connection. Let's gently bridge that gap with some loving, intentional activities today.",
        "Your presence matters in this world. When the silence feels too loud, I hope these recommendations bring you a sense of warmth and companionship."
    ],
    "overthinking": [
        "Your brain is running in circles trying to protect you, but you can put the thoughts down now. Let's redirect that energy into these simple, mindful actions.",
        "When the 'what-ifs' take over, the best antidote is right here in the present moment. I've designed this plan to bring your focus back to the now.",
        "You've been carrying a heavy mental load. It's time to let your mind rest. Focus only on the step in front of you—I've laid them out for you here."
    ],
    "burned_out": [
        "You've been giving so much, and your well is running dry. Rest is not a reward; it is a necessity. Please take permission to recharge with these restorative steps.",
        "Your exhaustion is a signal, not a failure. It's time to pause and replenish your energy. Let's focus purely on gentle recovery today.",
        "You are allowed to step back. You are allowed to rest. Try to set boundaries around your peace today by engaging in these replenishing activities."
    ],
    "angry": [
        "Your anger is a protective force, and it's okay to feel it. But holding onto it can burn you. Let's channel that fire safely through these grounding exercises.",
        "It's completely valid that you feel frustrated about this. Rather than bottling it up, let's allow it to move through you carefully with these focused actions.",
        "I hear the tension and frustration in your words. It is safe to release it now. Follow these guided steps to process the heat and return to a cooler state."
    ]
}

def get_reply(mood):
    mood_key = mood.lower().strip()
    if mood_key in REPLIES:
        return random.choice(REPLIES[mood_key])
    else:
        # Fallback message
        return "I am here for you. Whatever you are facing, taking a small, intentional step can bring you closer to peace. Here is a plan designed just for you."

print("Augmenting dataset with 'ai_reply' column...")
df["ai_reply"] = df["mood_selected"].apply(get_reply)

# Define output path
OUT_PATH = os.path.join(BASE_DIR, "..", "data", "mental_health_tasks_dataset_7000_augmented.csv")
df.to_csv(OUT_PATH, index=False)
print(f"Augmented dataset saved to: {OUT_PATH}")
