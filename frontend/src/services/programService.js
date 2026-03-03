import { supabase } from '../lib/supabase';
import { generateScheduleEntries } from './scheduleService';

/** Create a new program + bulk-insert schedule entries */
export const createProgram = async (userId, programData, profile) => {
    // 1. Insert program
    const { data: program, error: progErr } = await supabase
        .from('programs')
        .insert({
            user_id: userId,
            start_date: programData.start_date,
            end_date: programData.end_date,
            duration_type: programData.duration_type,
            status: 'active',
        })
        .select()
        .single();
    if (progErr) throw progErr;

    // 2. Generate entries client-side
    const startDate = new Date(programData.start_date);
    const endDate = new Date(programData.end_date);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const entries = generateScheduleEntries(profile, program.id, userId, startDate, totalDays);

    // 3. Bulk insert entries
    const { error: entryErr } = await supabase.from('schedule_entries').insert(entries);
    if (entryErr) throw entryErr;

    return program;
};

/** Fetch user's active program (latest) */
export const getActiveProgram = async (userId) => {
    const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
};

/** Fetch program + all its entries */
export const getProgramWithEntries = async (programId) => {
    const [programRes, entriesRes] = await Promise.all([
        supabase.from('programs').select('*').eq('id', programId).single(),
        supabase
            .from('schedule_entries')
            .select('*')
            .eq('program_id', programId)
            .order('day_number', { ascending: true })
            .order('time_of_day', { ascending: true }),
    ]);
    if (programRes.error) throw programRes.error;
    return { ...programRes.data, entries: entriesRes.data || [] };
};

/** Toggle completion of a schedule entry */
export const updateEntry = async (entryId, completed) => {
    const { data, error } = await supabase
        .from('schedule_entries')
        .update({ completed })
        .eq('id', entryId)
        .select()
        .single();
    if (error) throw error;
    return data;
};

/** Subscribe to all entries of a program — triggers callback with fresh entries array */
export const subscribeEntries = (programId, callback) => {
    const channel = supabase
        .channel(`entries:${programId}`)
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'schedule_entries', filter: `program_id=eq.${programId}` },
            () => {
                supabase
                    .from('schedule_entries')
                    .select('*')
                    .eq('program_id', programId)
                    .order('day_number', { ascending: true })
                    .then(({ data }) => callback(data || []));
            }
        )
        .subscribe();
    return () => supabase.removeChannel(channel);
};
