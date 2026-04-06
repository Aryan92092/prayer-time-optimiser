import api from '../lib/api';
import { generateScheduleEntries } from './scheduleService';

/** Create a new program + bulk-insert schedule entries */
export const createProgram = async (userId, programData, profile) => {
    const startDate = new Date(programData.start_date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(programData.end_date);
    endDate.setHours(0, 0, 0, 0);

    const diffTime = endDate - startDate;
    const totalDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Generate entries client-side (same logic as before)
    // We pass a placeholder program_id; it gets replaced by server
    const tempEntries = generateScheduleEntries(profile, 0, userId, startDate, totalDays);

    const { data } = await api.post('/programs', {
        start_date: programData.start_date,
        end_date: programData.end_date,
        duration_type: programData.duration_type,
        entries: tempEntries,
    });
    return data;
};

/** Fetch user's active program (latest) */
export const getActiveProgram = async (_userId) => {
    const { data } = await api.get('/programs/active');
    return data;
};

/** Cancel the currently active program */
export const cancelActiveProgram = async (_userId) => {
    await api.put('/programs/cancel/cancel');
};

/** Fetch program + all its entries */
export const getProgramWithEntries = async (programId) => {
    const { data } = await api.get(`/programs/${programId}`);
    return data;
};

/** Toggle completion of a schedule entry */
export const updateEntry = async (entryId, completed) => {
    const { data } = await api.patch(`/entries/${entryId}`, { completed });
    return data;
};

/** No-op: real-time subscription replaced by refresh-on-action */
export const subscribeEntries = (_programId, _callback) => {
    return () => { };
};
