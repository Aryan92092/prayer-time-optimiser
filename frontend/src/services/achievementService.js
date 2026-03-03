import { supabase } from '../lib/supabase';
import { computeStreak } from './scheduleService';

/** Award a badge (silently ignore if already exists) */
const awardBadge = async (userId, badgeType) => {
    await supabase
        .from('achievements')
        .upsert({ user_id: userId, badge_type: badgeType, unlocked_at: new Date().toISOString() }, { onConflict: 'user_id,badge_type', ignoreDuplicates: true });
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
export const getAchievements = async (userId) => {
    const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

/** Real-time subscription to achievements */
export const subscribeAchievements = (userId, callback) => {
    const channel = supabase
        .channel(`achievements:${userId}`)
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'achievements', filter: `user_id=eq.${userId}` },
            () => getAchievements(userId).then(callback)
        )
        .subscribe();
    return () => supabase.removeChannel(channel);
};
