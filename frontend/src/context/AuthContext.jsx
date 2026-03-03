import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { signIn, signUp, signOut } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                enrichUser(session.user);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                enrichUser(session.user);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Fetch name from profiles table and merge into user object
    const enrichUser = async (authUser) => {
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('name, role')
                .eq('id', authUser.id)
                .single();

            setUser({
                id: authUser.id,
                email: authUser.email,
                name: profile?.name || authUser.user_metadata?.name || authUser.email,
                role: profile?.role || 'user',
            });
        } catch {
            setUser({ id: authUser.id, email: authUser.email, name: authUser.email });
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const data = await signIn(email, password);
        return data;
    };

    const register = async ({ name, email, password }) => {
        const data = await signUp(email, password, name);
        return data;
    };

    const logout = async () => {
        await signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
