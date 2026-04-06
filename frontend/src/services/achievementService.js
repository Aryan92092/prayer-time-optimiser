import api from '../lib/api';
import { computeStreak } from './scheduleService';

/** Award a badge (silently ignore if already exists) */
const awardBadge = async (_userId, badgeType) => {
    await api.post('/achievements', { badge_type: badgeType });
};

/** Check streak/completion milestones and award badges */
export const checkAndAwardAchievements = async (userId, entries) => {
    const streak = computeStreak(entries);
    const total = entries.length;
    const completed = entries.filter((e) => e.completed).length;

    if (streak >= 3) await awardBadge(userId, 'Starter');
    if (streak >= 7) await awardBadge(userId, 'Disciplined');
    if (streak >= 14) await awardBadge(userId, 'Unstoppable');
    if (total > 0 && total === completed) await awardBadge(userId, 'Master');
};

/** Fetch achievements once */
export const getAchievements = async (_userId) => {
    const { data } = await api.get('/achievements');
    return data || [];
};

/** No-op: real-time replaced by manual refresh */
export const subscribeAchievements = (_userId, _callback) => {
    return () => { };
};
