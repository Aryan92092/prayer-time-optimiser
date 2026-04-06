/**
 * moodService.js
 * All mood analysis logic is pure JS — no Supabase dependency.
 * The saveMoodCheckin / getLastCheckin functions now call our REST backend.
 * 
 * NOTE: The mood_checkins table must be added to schema.sql if you want to
 * persist check-ins. For now, the page can work purely client-side or we
 * simply store to localStorage and call the AI engine.
 */
import api from '../lib/api';

export const saveMoodCheckin = async (_userId, scores) => {
    const payload = {
        mood_score: scores.mood,
        sleep_score: scores.sleep,
        spiritual_score: scores.spiritual,
        stress_score: scores.stress,
        hope_score: scores.hope,
    };
    const { data } = await api.post('/mood-checkins', payload);
    return data;
};

export const getLastCheckin = async (_userId) => {
    const { data } = await api.get('/mood-checkins/last');
    return data || null;
};

export const getAllCheckins = async (_userId) => {
    const { data } = await api.get('/mood-checkins');
    return data || [];
};

/**
 * Core Mood Analysis Model
 * Weighted scoring: mood & stress have highest weight (1.5x)
 */
export const analyzeMood = (scores) => {
    const { mood, sleep, spiritual, stress, hope } = scores;
    const avg = (mood * 1.5 + sleep * 1.0 + spiritual * 1.2 + stress * 1.5 + hope * 1.3) / 6.5;
    const happiness = Math.round((avg / 5) * 100);

    let state, emoji, message, doToday, avoidToday, colorClass;

    if (happiness >= 80) {
        state = 'Thriving'; emoji = '🌟'; colorClass = 'emerald';
        message = "You're radiating positive energy today. This is the perfect time to deepen your practice and take on meaningful challenges.";
        doToday = ['Engage in deep Gita reflection or sacred reading', 'Practice extended meditation (20–30 min)', 'Journal your insights and gratitude', 'Help someone or do an act of seva'];
        avoidToday = ['Skipping your practice — momentum is key', 'Overcommitting to too many tasks'];
    } else if (happiness >= 60) {
        state = 'Balanced'; emoji = '😊'; colorClass = 'primary';
        message = "You're in a good space. A little nurturing today will elevate your state even further.";
        doToday = ['Start with gentle breathing (5 min pranayama)', 'Proceed with your full daily practice', 'Take a short mindful walk in nature', 'Write 3 things you are grateful for'];
        avoidToday = ['Excessive screen time or news consumption', 'Skipping meals or sleep'];
    } else if (happiness >= 40) {
        state = 'Needs Care'; emoji = '😐'; colorClass = 'yellow';
        message = "You seem a little off today — and that's perfectly okay. Let's do lighter, nurturing activities.";
        doToday = ['Start with 5 minutes of slow, deep breathing', 'Chant a simple mantra or listen to calming kirtan', 'Spend time in nature — even 10 minutes outside', 'Read an uplifting Gita verse or Surah'];
        avoidToday = ['Heavy or complex spiritual texts today', 'Social media or argumentative content', 'Pushing yourself too hard'];
    } else {
        state = 'Struggling'; emoji = '💙'; colorClass = 'red';
        message = "It sounds like you're going through something difficult. Today, choose compassion over perfection.";
        doToday = ['Take 10 deep breaths — just breathe', 'Listen to peaceful music or nature sounds', 'Drink water and rest if you need to', 'Say one prayer or affirmation aloud'];
        avoidToday = ['Forcing yourself through full practice when exhausted', 'Isolation — reach out to a trusted person', 'Self-criticism or negative self-talk'];
    }

    return { happiness, state, emoji, message, doToday, avoidToday, colorClass };
};

/**
 * AI Prediction Engine — pure JS, no Supabase dependency
 */
export const predictMoodAI = (checkins) => {
    if (!checkins || checkins.length === 0) {
        return {
            trend: 'No Data', trendEmoji: '📊', predictedScore: null,
            predictedState: null, weakestDimension: null, strongestDimension: null,
            insights: [], nextStep: "Complete your first mood check-in to unlock AI predictions.",
        };
    }

    const n = checkins.length;
    let totalWeight = 0, weightedSum = 0;
    checkins.forEach((c, i) => {
        const mst = c.mood_score ?? c.mood ?? 0;
        const slp = c.sleep_score ?? c.sleep ?? 0;
        const spr = c.spiritual_score ?? c.spiritual ?? 0;
        const str = c.stress_score ?? c.stress ?? 0;
        const hp = c.hope_score ?? c.hope ?? 0;

        const rawAvg = (mst + slp + spr + str + hp) / 5;
        const weight = i + 1;
        weightedSum += rawAvg * weight;
        totalWeight += weight;
    });
    const wma = weightedSum / totalWeight;
    const predictedScore = Math.round((wma / 5) * 100);

    let trend = 'Stable', trendEmoji = '→', trendColor = 'yellow';
    if (n >= 2) {
        const half = Math.ceil(n / 2);
        const avg = (arr) => arr.reduce((s, c) => s + ((c.mood_score ?? c.mood ?? 0) + (c.sleep_score ?? c.sleep ?? 0) + (c.spiritual_score ?? c.spiritual ?? 0) + (c.stress_score ?? c.stress ?? 0) + (c.hope_score ?? c.hope ?? 0)) / 5, 0) / arr.length;
        const diff = avg(checkins.slice(half)) - avg(checkins.slice(0, half));
        if (diff > 0.4) { trend = 'Improving'; trendEmoji = '↗'; trendColor = 'emerald'; }
        else if (diff < -0.4) { trend = 'Declining'; trendEmoji = '↘'; trendColor = 'red'; }
        else { trend = 'Stable'; trendEmoji = '→'; trendColor = 'primary'; }
    }

    const recent = checkins.slice(-3);
    const dims = ['mood_score', 'sleep_score', 'spiritual_score', 'stress_score', 'hope_score'];
    const dimLabels = { mood_score: 'Mood', sleep_score: 'Sleep', spiritual_score: 'Spiritual', stress_score: 'Calm', hope_score: 'Hope' };
    const dimAvgs = {};
    dims.forEach(d => {
        dimAvgs[d] = recent.reduce((s, c) => {
            const val = c[d] ?? c[d.replace('_score', '')] ?? 0;
            return s + val;
        }, 0) / recent.length;
    });

    const weakest = Object.entries(dimAvgs).sort((a, b) => a[1] - b[1])[0];
    const strongest = Object.entries(dimAvgs).sort((a, b) => b[1] - a[1])[0];
    const weakestDimension = dimLabels[weakest[0]];
    const strongestDimension = dimLabels[strongest[0]];

    const dimensionAdvice = {
        Mood: ['Practice 10 minutes of gratitude journaling', 'Listen to uplifting music or chanting', 'Connect with a positive friend or family member'],
        Sleep: ['Set a consistent sleep schedule and stick to it', 'Avoid screens 30 min before bed', 'Try a 4-7-8 breathing routine before sleeping'],
        Spiritual: ['Recommit to your morning practice, even for 5 minutes', 'Read one verse from your sacred text daily', 'Light a candle or incense and sit in silence for 2 minutes'],
        Calm: ['Try progressive muscle relaxation before bed', 'Limit news and social media consumption', 'Write down your top 3 worries and then place them in God\'s hands'],
        Hope: ['Write down 3 things to look forward to this week', 'Read an inspiring story or biography', 'Spend time in nature — sunlight is a natural mood booster'],
    };

    const insights = [
        `Your ${weakestDimension.toLowerCase()} scores are the lowest recently — this is where to focus.`,
        `Your ${strongestDimension.toLowerCase()} is your current strength — keep nurturing it.`,
        trend === 'Improving' ? 'Your overall wellness is trending upward. You\'re building momentum!' :
            trend === 'Declining' ? 'Your wellness has dipped slightly. Small, consistent actions will reverse this.' :
                'Your wellness has been consistent. Try to gently push toward the next level.',
    ];

    const predictedState = predictedScore >= 80 ? 'Thriving' : predictedScore >= 60 ? 'Balanced' : predictedScore >= 40 ? 'Needs Care' : 'Struggling';

    return {
        trend, trendEmoji, trendColor, predictedScore, predictedState,
        weakestDimension, strongestDimension, insights,
        nextStep: dimensionAdvice[weakestDimension]?.[0] || 'Continue your daily practice with intention.',
        dimensionAdvice: dimensionAdvice[weakestDimension] || [],
        dimAvgs, dimLabels,
    };
};

export const isMoodCheckDue = (lastCheckin) => {
    if (!lastCheckin) return true;
    const last = new Date(lastCheckin.created_at);
    const now = new Date();
    const diffDays = (now - last) / (1000 * 60 * 60 * 24);
    return diffDays >= 3;
};
