import { supabase } from '../lib/supabase';

const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

/**
 * Fetch prayer logs for a user from the last 7 days.
 */
export const getPrayerLogs = async (userId) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fromDate = sevenDaysAgo.toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('prayer_logs')
        .select('prayer_name, status, date')
        .eq('user_id', userId)
        .gte('date', fromDate)
        .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
};

/**
 * Upsert a single prayer log entry.
 */
export const upsertPrayerLog = async (userId, prayerName, status, date) => {
    const { error } = await supabase
        .from('prayer_logs')
        .upsert(
            { user_id: userId, prayer_name: prayerName, status, date },
            { onConflict: 'user_id,prayer_name,date' }
        );
    if (error) throw error;
};

/**
 * Summarize prayer logs into { Fajr: { completed: 3, missed: 4 }, ... }
 */
export const summarizePrayerLogs = (logs) => {
    const summary = {};
    PRAYERS.forEach((p) => { summary[p] = { completed: 0, missed: 0 }; });
    logs.forEach(({ prayer_name, status }) => {
        if (summary[prayer_name]) {
            summary[prayer_name][status] = (summary[prayer_name][status] || 0) + 1;
        }
    });
    return summary;
};

export { PRAYERS };
