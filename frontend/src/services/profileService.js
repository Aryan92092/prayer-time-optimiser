import api from '../lib/api';

/** Save or replace user's spiritual profile */
export const setupProfile = async (_userId, data) => {
    const res = await api.put('/profile/spiritual', data);
    return res.data;
};

/** Get full profile (includes spiritual preferences) */
export const getProfile = async (_userId) => {
    const { data } = await api.get('/profile');
    return data;
};

/** No-op: was real-time Supabase subscription — now replaced by manual refresh */
export const subscribeProfile = (_userId, _callback) => {
    return () => { };
};

/** Update display name / role */
export const updateProfile = async (updates) => {
    const { data } = await api.put('/profile', updates);
    return data;
};

/** Get recent activity */
export const getActivity = async () => {
    const { data } = await api.get('/profile/activity');
    return data;
};
