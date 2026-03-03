import { supabase } from '../lib/supabase';

/** Create a journal entry */
export const createJournal = async (userId, programId, entryText) => {
    const { data, error } = await supabase
        .from('journals')
        .insert({ user_id: userId, program_id: programId || null, entry_text: entryText })
        .select()
        .single();
    if (error) throw error;
    return data;
};

/** Fetch journals once */
export const getJournals = async (userId) => {
    const { data, error } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

/** Real-time subscription to journals */
export const subscribeJournals = (userId, callback) => {
    const channel = supabase
        .channel(`journals:${userId}`)
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'journals', filter: `user_id=eq.${userId}` },
            () => getJournals(userId).then(callback)
        )
        .subscribe();
    return () => supabase.removeChannel(channel);
};
