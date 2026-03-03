import { supabase } from '../lib/supabase';

/** Save or replace user's spiritual profile */
export const setupProfile = async (userId, data) => {
    // Upsert (insert or update) based on user_id
    const { error } = await supabase
        .from('user_profiles')
        .upsert({ user_id: userId, ...data }, { onConflict: 'user_id' });
    if (error) throw error;
};

/** Get profile once */
export const getProfile = async (userId) => {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
};

/** Subscribe to profile changes in real-time */
export const subscribeProfile = (userId, callback) => {
    const channel = supabase
        .channel(`profile:${userId}`)
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'user_profiles', filter: `user_id=eq.${userId}` },
            () => getProfile(userId).then(callback)
        )
        .subscribe();
    return () => supabase.removeChannel(channel);
};
