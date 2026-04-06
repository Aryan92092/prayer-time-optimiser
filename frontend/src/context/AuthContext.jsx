import React, { createContext, useContext, useState, useEffect } from 'react';
import { signIn, signUp, signOut } from '../services/authService';
import api from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On app load: check if a stored JWT is still valid
    useEffect(() => {
        const token = localStorage.getItem('hp_token');
        if (!token) {
            setLoading(false);
            return;
        }
        // Validate token and hydrate user
        api.get('/auth/me')
            .then(({ data }) => setUser(data))
            .catch(() => {
                localStorage.removeItem('hp_token');
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const login = async (email, password) => {
        const data = await signIn(email, password);
        setUser(data.user);
        return data;
    };

    const register = async ({ name, email, password }) => {
        const data = await signUp(email, password, name);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        signOut();
        // Clear any legacy localStorage mood data from before DB migration
        localStorage.removeItem('hp_mood_checkins');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
