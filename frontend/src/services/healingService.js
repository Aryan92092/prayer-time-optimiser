/**
 * healingService.js
 * Calls the Python AI engine for healing plan generation.
 * Saving plans to DB is now done via localStorage (no external DB needed).
 */

const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:8000';

/**
 * Calls the AI engine to generate a healing plan from the user's text.
 */
export const generateHealingPlan = async (text) => {
    try {
        const response = await fetch(`${AI_API_URL}/api/healing/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
            signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) throw new Error('Failed to generate plan');
        return await response.json();
    } catch (err) {
        console.error('Error in generateHealingPlan:', err);
        throw err;
    }
};

/** Save healing plan locally (localStorage) */
export const saveHealingData = async (_userId, planData) => {
    const existing = JSON.parse(localStorage.getItem('hp_healing_plans') || '[]');
    const entry = { ...planData, id: Date.now(), created_at: new Date().toISOString() };
    existing.unshift(entry);
    localStorage.setItem('hp_healing_plans', JSON.stringify(existing));
    return entry;
};

/** Fetch all saved healing plans */
export const getHealingPlans = async (_userId) => {
    return JSON.parse(localStorage.getItem('hp_healing_plans') || '[]');
};

/** Toggle step completion */
export const toggleStepCompletion = async (planId, stepIndex, completed) => {
    const plans = JSON.parse(localStorage.getItem('hp_healing_plans') || '[]');
    const plan = plans.find(p => p.id === planId);
    if (plan && plan.steps[stepIndex]) {
        plan.steps[stepIndex].completed = completed;
        localStorage.setItem('hp_healing_plans', JSON.stringify(plans));
    }
};
