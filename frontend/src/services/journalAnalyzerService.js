import { getJournals } from './journalService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const RATE_LIMIT_MS = 5 * 60 * 1000;
let lastCallTime = null;

const parseGeminiResponse = (text) => {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    try {
        const parsed = JSON.parse(cleaned);
        if (parsed.mood && parsed.insight && Array.isArray(parsed.suggestions)) {
            return parsed;
        }
    } catch { /* fallback below */ }
    return {
        mood: 'Unknown',
        insight: text.trim().substring(0, 200),
        suggestions: ['Continue writing your journal daily to receive deeper emotional insights.'],
    };
};

export const analyzeJournalSentiment = async (userId) => {
    if (!GEMINI_API_KEY) {
        console.warn('VITE_GEMINI_API_KEY is not set. AI emotional analysis disabled.');
        return null;
    }

    const journals = await getJournals(userId);
    if (!journals || journals.length === 0) return null;

    // Get the most recent journal entry (assuming getJournals returns sorted descending by date)
    const latestJournal = journals[0];
    if (!latestJournal || !latestJournal.entry_text) return null;

    const now = Date.now();
    if (lastCallTime && now - lastCallTime < RATE_LIMIT_MS) throw new Error('RATE_LIMITED');

    const prompt = `You are an incredibly empathetic and spiritually grounded mental-wellness advisor.

Analyze the emotional tone of the following spiritual journal entry.

Journal Entry:
"${latestJournal.entry_text}"

Identify:
1. The user's primary emotional state (e.g., stress, anxiety, sadness, gratitude, peace, hope, joy, overwhelm).
2. A short, highly empathetic insight about what they seem to be feeling (max 120 characters).
3. Three highly specific, actionable, and gentle spiritual/mindfulness recommendations based on their mood.

Respond ONLY with a valid JSON object (no markdown, no quotes outside JSON) in this exact format:
{
  "mood": "Single word representing primary emotion",
  "insight": "A single warm, profoundly empathetic sentence.",
  "suggestions": [
    "Specific, gentle recommendation 1",
    "Specific, gentle recommendation 2",
    "Activating, hopeful recommendation 3"
  ]
}`;

    lastCallTime = now;

    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.6, maxOutputTokens: 512 },
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return parseGeminiResponse(rawText);
};

export const getJournalRateLimitRemaining = () => {
    if (!lastCallTime) return 0;
    return Math.max(0, RATE_LIMIT_MS - (Date.now() - lastCallTime));
};
