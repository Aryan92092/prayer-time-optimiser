const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:8000';

/**
 * Fallback recommendation when the AI engine is offline.
 * Reads as a warm, helpful message — not an error.
 */
const FALLBACK = {
    recommendation: 'Mindful Meditation',
    emoji: '🙏',
    message:
        'Take this moment to sit in stillness and breathe — even just five minutes of mindful meditation can center your spirit and bring clarity to your day. You are exactly where you need to be right now.',
    action:
        'Find a quiet corner, close your eyes, and follow your breath for 5 minutes with full presence.',
    category: 'Mindfulness',
    powered_by: 'AI',
    fallback: true,
};

/**
 * Calls the AI Mood Recommendation engine with the user's check-in answers.
 *
 * @param {Object} answers - { mood: 1-5, sleep: 1-5, spiritual: 1-5, stress: 1-5, hope: 1-5 }
 * @returns {Promise<Object>} - { recommendation, emoji, message, action, category, powered_by, fallback? }
 */
export const getAIRecommendation = async (answers) => {
    try {
        const response = await fetch(`${AI_API_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mood: answers.mood,
                sleep: answers.sleep,
                spiritual: answers.spiritual,
                stress: answers.stress,
                hope: answers.hope,
            }),
            signal: AbortSignal.timeout(6000), // 6s timeout — fail fast
        });

        if (!response.ok) return FALLBACK;

        const data = await response.json();

        // If the API returned an error field, use fallback
        if (data.error) return { ...FALLBACK, fallback: true };

        return {
            recommendation: data.recommendation || FALLBACK.recommendation,
            emoji: data.emoji || FALLBACK.emoji,
            message: data.message || FALLBACK.message,
            action: data.action || FALLBACK.action,
            category: data.category || FALLBACK.category,
            powered_by: 'AI',
            fallback: false,
        };
    } catch {
        // Network error, timeout, CORS, etc. — silently fall back
        return FALLBACK;
    }
};