import { Database } from '@/utils/database-types';
import { supabase } from '@/utils/supabase';
import { useState, useCallback } from 'react';


type LeaderboardEntry = Database['public']['Views']['leaderboard_view']['Row'];

export function useLeaderboard() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLeaderboard = useCallback(async (gridSize: string) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from('leaderboard_view')
                .select('*')
                .eq('grid_size', gridSize)
                .order('moves', { ascending: true })
                .order('time_seconds', { ascending: true })
                .limit(100);

            if (error) throw error;

            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const submitScore = useCallback(async (
        userId: string,
        gridSize: string,
        moves: number,
        timeSeconds: number
    ) => {
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase
                .from('leaderboard')
                .insert({
                    user_id: userId,
                    grid_size: gridSize,
                    moves,
                    time_seconds: timeSeconds,
                });

            if (error) throw error;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        fetchLeaderboard,
        submitScore,
        loading,
        error,
    };
}