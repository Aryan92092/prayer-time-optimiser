import api from '../lib/api';

/** Sign up a new user */
export const signUp = async (email, password, name) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    if (data.token) localStorage.setItem('hp_token', data.token);
    return data;
};

/** Sign in an existing user */
export const signIn = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.token) localStorage.setItem('hp_token', data.token);
    return data;
};

/** Send a password reset request */
export const sendPasswordReset = async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
};

/** Reset password using the token from the reset link */
export const resetPassword = async (token, password) => {
    const { data } = await api.post('/auth/reset-password', { token, password });
    return data;
};

/** Sign out — just clear the local token */
export const signOut = () => {
    localStorage.removeItem('hp_token');
};
