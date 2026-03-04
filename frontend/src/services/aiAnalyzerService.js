import { getPrayerLogs, summarizePrayerLogs } from './prayerLogService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const RATE_LIMIT_MS = 5 * 60 * 1000;
let lastCallTime = null;

const buildPromptBody = (summary) => {
    return Object.entries(summary)
        .map(([prayer, { completed, missed }]) => {
            const total = completed + missed;
            if (total === 0) return `${prayer}: no data`;
            return `${prayer}: completed ${completed} time${completed !== 1 ? 's' : ''}, missed ${missed} time${missed !== 1 ? 's' : ''} (out of 7 days)`;
        })
        .join('\n');
};

const parseGeminiResponse = (text) => {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    try {
        const parsed = JSON.parse(cleaned);
        if (parsed.insight && Array.isArray(parsed.suggestions)) return parsed;
    } catch { /* fallback below */ }
    return {
        insight: text.trim().substring(0, 200),
        suggestions: ['Continue logging your prayers daily to receive more detailed guidance.'],
    };
};

export const analyzePrayerBehavior = async (userId) => {
    if (!GEMINI_API_KEY) {
        console.warn('VITE_GEMINI_API_KEY is not set. AI analysis disabled.');
        return null;
    }

    const logs = await getPrayerLogs(userId);
    if (logs.length === 0) return null;

    const now = Date.now();
    if (lastCallTime && now - lastCallTime < RATE_LIMIT_MS) throw new Error('RATE_LIMITED');

    const summary = summarizePrayerLogs(logs);
    const promptBody = buildPromptBody(summary);

    const prompt = `You are a compassionate Islamic spiritual advisor helping a Muslim improve their daily prayer consistency.

Analyze the following prayer activity for the past 7 days and provide personalized guidance.

Prayer Activity:
${promptBody}

Respond ONLY with a valid JSON object (no markdown, no explanation outside JSON) in this exact format:
{
  "insight": "A single warm, encouraging sentence summarizing the user's prayer pattern (max 120 characters).",
  "suggestions": [
    "Specific suggestion 1",
    "Specific suggestion 2",
    "Specific suggestion 3"
  ]
}

Make the tone warm, spiritual, and motivating. Be specific about which prayers need improvement.`;

    lastCallTime = now;

    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
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

export const getRateLimitRemaining = () => {
    if (!lastCallTime) return 0;
    return Math.max(0, RATE_LIMIT_MS - (Date.now() - lastCallTime));
};
