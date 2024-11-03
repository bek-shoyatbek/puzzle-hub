// components/Leaderboard.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getLeaderboard, LeaderboardEntry } from "@/utils/leaderboard";

type Difficulty = "2x3" | "3x3" | "4x4" | "5x5";

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>("3x3");

  const loadLeaderboard = async (difficulty: Difficulty) => {
    try {
      const data = await getLeaderboard(difficulty);
      setEntries(data);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeaderboard(selectedDifficulty);
  }, [selectedDifficulty]);

  const onRefresh = () => {
    setRefreshing(true);
    loadLeaderboard(selectedDifficulty);
  };

  const renderDifficultySelector = () => (
    <View style={styles.difficultyContainer}>
      {(["2x3", "3x3", "4x4", "5x5"] as Difficulty[]).map((difficulty) => (
        <TouchableOpacity
          key={difficulty}
          style={[
            styles.difficultyButton,
            selectedDifficulty === difficulty && styles.selectedDifficulty,
          ]}
          onPress={() => setSelectedDifficulty(difficulty)}
        >
          <Text
            style={[
              styles.difficultyText,
              selectedDifficulty === difficulty &&
                styles.selectedDifficultyText,
            ]}
          >
            {difficulty}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderItem = ({
    item,
    index,
  }: {
    item: LeaderboardEntry;
    index: number;
  }) => (
    <View style={styles.entryContainer}>
      <View style={styles.rankContainer}>
        {index < 3 ? (
          <MaterialCommunityIcons
            name="medal"
            size={24}
            color={["#FFD700", "#C0C0C0", "#CD7F32"][index]}
          />
        ) : (
          <Text style={styles.rankText}>{index + 1}</Text>
        )}
      </View>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.player_name}</Text>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>Moves: {item.moves}</Text>
          <Text style={styles.statsText}>Time: {item.time}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderDifficultySelector()}
      <FlatList
        data={entries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No scores yet</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  difficultyContainer: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "center",
    gap: 8,
  },
  difficultyButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
  },
  selectedDifficulty: {
    backgroundColor: "#4CAF50",
  },
  difficultyText: {
    color: "#666",
    fontWeight: "600",
  },
  selectedDifficultyText: {
    color: "#fff",
  },
  entryContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  rankContainer: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  playerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: 4,
    gap: 12,
  },
  statsText: {
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});

export default Leaderboard;
