import { supabase } from '../lib/supabase';

/** Sign up a new user — also stores name in profile via DB trigger */
export const signUp = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
    });
    if (error) throw error;
    return data;
};

/** Sign in an existing user */
export const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data;
};

/** Sign out */
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};
