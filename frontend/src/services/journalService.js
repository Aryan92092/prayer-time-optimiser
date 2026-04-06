import api from '../lib/api';

/** Create a journal entry */
export const createJournal = async (_userId, programId, entryText) => {
    const { data } = await api.post('/journals', {
        entry_text: entryText,
        program_id: programId || null,
    });
    return data;
};

/** Fetch all journals for the logged-in user */
export const getJournals = async (_userId) => {
    const { data } = await api.get('/journals');
    return data || [];
};

/** Delete a journal entry */
export const deleteJournal = async (id) => {
    const { data } = await api.delete(`/journals/${id}`);
    return data;
};

/** No-op: real-time subscriptions replaced with polling or manual refresh */
export const subscribeJournals = (_userId, _callback) => {
    return () => { }; // returns unsubscribe noop
};
