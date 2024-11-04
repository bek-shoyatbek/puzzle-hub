import { supabase } from "./supabase";

export interface LeaderboardEntry {
  id: string;
  player_name: string;
  moves: number;
  time: string;
  difficulty: "3x3" | "4x4" | "5x5";
  date: string;
  user_id: string; // Added to help with uniqueness check
}

export interface UserScore {
  moves: number;
  time_seconds: number;
  difficulty: "3x3" | "4x4" | "5x5";
}

// Add new score to leaderboard
export const addScore = async (score: UserScore) => {
  const user = supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to add score");
  }

  const { data, error } = await supabase
    .from("leaderboard")
    .insert({
      user_id: (await user).data.user?.id,
      moves: score.moves,
      time_seconds: score.time_seconds,
      difficulty: score.difficulty,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding score:", error);
    throw error;
  }

  return data;
};

// Get leaderboard entries with optional filtering
export const getLeaderboard = async (
  difficulty?: "2x3" | "3x3" | "4x4" | "5x5",
  limit: number = 10,
) => {
  let query = supabase
    .from("formatted_leaderboard")
    .select("*");

  if (difficulty) {
    query = query.eq("difficulty", difficulty);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }

  // Process data to get best score for each unique user
  const uniqueUserScores = data.reduce((acc: { [key: string]: LeaderboardEntry }, entry) => {
    if (!acc[entry.user_id] ||
      entry.moves < acc[entry.user_id].moves ||
      (entry.moves === acc[entry.user_id].moves &&
        entry.time < acc[entry.user_id].time)) {
      acc[entry.user_id] = entry;
    }
    return acc;
  }, {});

  // Convert back to array and sort
  const sortedEntries = Object.values(uniqueUserScores)
    .sort((a, b) => {
      if (a.moves !== b.moves) {
        return a.moves - b.moves;
      }
      // If moves are equal, sort by time
      return a.time.localeCompare(b.time);
    })
    .slice(0, limit);

  return sortedEntries as LeaderboardEntry[];
};

// Get user's best scores
export const getUserBestScores = async (userId: string) => {
  const { data, error } = await supabase
    .from("formatted_leaderboard")
    .select("*")
    .eq("user_id", userId)
    .order("moves", { ascending: true })
    .order("time", { ascending: true });

  if (error) {
    console.error("Error fetching user scores:", error);
    throw error;
  }

  return data as LeaderboardEntry[];
};

// Get user's rank for a specific difficulty
export const getUserRank = async (
  userId: string,
  difficulty: "3x3" | "4x4" | "5x5",
) => {
  // First, get the user's best score
  const { data: userScore, error: scoreError } = await supabase
    .from("leaderboard")
    .select("moves, time_seconds")
    .eq("user_id", userId)
    .eq("difficulty", difficulty)
    .order("moves", { ascending: true })
    .order("time_seconds", { ascending: true })
    .limit(1)
    .single();

  if (scoreError || !userScore) {
    return null; // User hasn't played this difficulty yet
  }

  // Then, count how many players have better scores
  const { count, error: rankError } = await supabase
    .from("leaderboard")
    .select("*", { count: "exact", head: true })
    .eq("difficulty", difficulty)
    .or(
      `moves.lt.${userScore.moves},and(moves.eq.${userScore.moves},time_seconds.lt.${userScore.time_seconds})`,
    );

  if (rankError) {
    console.error("Error calculating rank:", rankError);
    throw rankError;
  }

  return (count || 0) + 1; // Add 1 because count returns number of players ahead
};
