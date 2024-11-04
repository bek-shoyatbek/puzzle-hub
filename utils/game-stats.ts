import { supabase } from "./supabase";

export interface GameStats {
    gamesPlayed: number;
    bestScore: number | null;
    totalStars: number;
    bestScores: {
        "3x3": number | null;
        "4x4": number | null;
        "5x5": number | null;
    };
}

interface DifficultyMinMoves {
    "3x3": number;
    "4x4": number;
    "5x5": number;
}

const MINIMUM_MOVES: DifficultyMinMoves = {
    "3x3": 9,
    "4x4": 16,
    "5x5": 25,
};

// Calculate stars based on moves and difficulty
export const calculateStarsForGame = (moves: number, difficulty: keyof DifficultyMinMoves): number => {
    const minMoves = MINIMUM_MOVES[difficulty];

    if (moves <= minMoves * 1.2) return 3;
    if (moves <= minMoves * 1.5) return 2;
    return 1;
};

// Get total games played
export const getGamesPlayed = async (userId: string): Promise<number> => {
    const { count, error } = await supabase
        .from('leaderboard')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    if (error) throw error;
    return count || 0;
};

// Get best scores for each difficulty
export const getBestScores = async (userId: string): Promise<GameStats['bestScores']> => {
    const { data, error } = await supabase
        .from('leaderboard')
        .select('difficulty, moves')
        .eq('user_id', userId)
        .order('moves', { ascending: true });

    if (error) throw error;

    const bestScores: GameStats['bestScores'] = {
        "3x3": null,
        "4x4": null,
        "5x5": null,
    };

    data.forEach(score => {
        const difficulty = score.difficulty as keyof DifficultyMinMoves;
        if (!bestScores[difficulty] || score.moves < bestScores[difficulty]!) {
            bestScores[difficulty] = score.moves;
        }
    });

    return bestScores;
};

// Calculate total stars earned
export const getTotalStars = async (userId: string): Promise<number> => {
    const { data, error } = await supabase
        .from('leaderboard')
        .select('moves, difficulty')
        .eq('user_id', userId);

    if (error) throw error;

    return data.reduce((stars, game) => {
        return stars + calculateStarsForGame(game.moves, game.difficulty as keyof DifficultyMinMoves);
    }, 0);
};

// Get all game statistics in one call
export const getAllGameStats = async (userId: string): Promise<GameStats> => {
    try {
        const [gamesPlayed, bestScores, totalStars] = await Promise.all([
            getGamesPlayed(userId),
            getBestScores(userId),
            getTotalStars(userId)
        ]);

        // Find the overall best score across all difficulties
        const bestScore = Object.values(bestScores)
            .filter(score => score !== null)
            .sort((a, b) => (a || Infinity) - (b || Infinity))[0] || null;

        return {
            gamesPlayed,
            bestScore,
            totalStars,
            bestScores,
        };
    } catch (error) {
        console.error('Error fetching game stats:', error);
        throw error;
    }
};

// Get user's progress for a specific difficulty
export const getDifficultyProgress = async (
    userId: string,
    difficulty: keyof DifficultyMinMoves
): Promise<{
    gamesPlayed: number;
    bestScore: number | null;
    averageMoves: number | null;
    totalStars: number;
}> => {
    const { data, error } = await supabase
        .from('leaderboard')
        .select('moves')
        .eq('user_id', userId)
        .eq('difficulty', difficulty);

    if (error) throw error;

    if (!data.length) {
        return {
            gamesPlayed: 0,
            bestScore: null,
            averageMoves: null,
            totalStars: 0,
        };
    }

    const moves = data.map(game => game.moves);
    const bestScore = Math.min(...moves);
    const averageMoves = moves.reduce((a, b) => a + b, 0) / moves.length;
    const totalStars = data.reduce(
        (stars, game) => stars + calculateStarsForGame(game.moves, difficulty),
        0
    );

    return {
        gamesPlayed: data.length,
        bestScore,
        averageMoves,
        totalStars,
    };
};

// Get recent games
export const getRecentGames = async (
    userId: string,
    limit: number = 5
): Promise<Array<{
    difficulty: keyof DifficultyMinMoves;
    moves: number;
    time_seconds: number;
    created_at: string;
    stars: number;
}>> => {
    const { data, error } = await supabase
        .from('leaderboard')
        .select('difficulty, moves, time_seconds, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;

    return data.map(game => ({
        ...game,
        stars: calculateStarsForGame(game.moves, game.difficulty as keyof DifficultyMinMoves),
    }));
};