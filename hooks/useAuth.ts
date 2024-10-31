import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/utils/supabase';

export interface AuthState {
    user: {
        id: string;
        email: string;
        username: string;
    } | null;
    loading: boolean;
}

export function useAuth() {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        loading: true,
    });

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                fetchUser(session.user.id);
            } else {
                setAuthState({ user: null, loading: false });
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    fetchUser(session.user.id);
                } else {
                    setAuthState({ user: null, loading: false });
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchUser = async (userId: string) => {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, username, email')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching user:', error);
            setAuthState({ user: null, loading: false });
            return;
        }

        setAuthState({ user, loading: false });
    };

    const signUp = async (email: string, password: string, username: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                },
            },
        });

        if (error) throw error;
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        router.replace('/');
    };

    return {
        user: authState.user,
        loading: authState.loading,
        signUp,
        signIn,
        signOut,
    };
}