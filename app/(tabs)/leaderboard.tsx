import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useLeaderboard } from "@/hooks/useLeaderboard";

type Difficulty = "2x3" | "3x3" | "3x4" | "4x4";

interface LeaderboardEntry {
  id: string;
  playerName: string;
  moves: number;
  time: string;
  date: string;
  difficulty: Difficulty;
}

const mockLeaderboard: LeaderboardEntry[] = [
  {
    id: "1",
    playerName: "Alex",
    moves: 45,
    time: "1:23",
    date: "2024-03-28",
    difficulty: "3x3",
  },
  {
    id: "2",
    playerName: "Sarah",
    moves: 38,
    time: "1:15",
    date: "2024-03-28",
    difficulty: "3x3",
  },
  {
    id: "3",
    playerName: "Mike",
    moves: 52,
    time: "1:45",
    date: "2024-03-27",
    difficulty: "3x3",
  },
  {
    id: "4",
    playerName: "Emma",
    moves: 42,
    time: "1:30",
    date: "2024-03-27",
    difficulty: "2x3",
  },
  {
    id: "5",
    playerName: "John",
    moves: 65,
    time: "2:10",
    date: "2024-03-26",
    difficulty: "3x4",
  },
  {
    id: "6",
    playerName: "Lisa",
    moves: 85,
    time: "3:05",
    date: "2024-03-26",
    difficulty: "4x4",
  },
  {
    id: "7",
    playerName: "Tom",
    moves: 41,
    time: "1:28",
    date: "2024-03-25",
    difficulty: "3x3",
  },
  {
    id: "8",
    playerName: "Anna",
    moves: 48,
    time: "1:40",
    date: "2024-03-25",
    difficulty: "3x3",
  },
  {
    id: "9",
    playerName: "David",
    moves: 55,
    time: "1:55",
    date: "2024-03-24",
    difficulty: "3x4",
  },
  {
    id: "10",
    playerName: "Julia",
    moves: 43,
    time: "1:32",
    date: "2024-03-24",
    difficulty: "3x3",
  },
];

const difficulties: Difficulty[] = ["2x3", "3x3", "3x4", "4x4"];

export default function LeaderboardScreen() {
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>("3x3");

//   const { user } = useAuth();

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const { fetchLeaderboard, loading } = useLeaderboard();

  useEffect(() => {
    if (selectedDifficulty) {
      fetchLeaderboard(selectedDifficulty).then(setLeaderboardData);
    }
  }, [selectedDifficulty]);

  const filteredLeaderboard = leaderboardData
    .filter((entry) => entry.difficulty === selectedDifficulty)
    .sort((a, b) => a.moves - b.moves);

  const renderItem = ({
    item,
    index,
  }: {
    item: LeaderboardEntry;
    index: number;
  }) => (
    <View style={[styles.leaderboardItem, index < 3 && styles.topThree]}>
      <View style={styles.rankContainer}>
        {index < 3 ? (
          <MaterialCommunityIcons
            name={
              index === 0 ? "trophy" : index === 1 ? "medal" : "medal-outline"
            }
            size={24}
            color={
              index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : "#CD7F32"
            }
          />
        ) : (
          <Text style={styles.rankText}>{index + 1}</Text>
        )}
      </View>

      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.playerName}</Text>
        <Text style={styles.dateText}>{item.date}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="counter" size={16} color="#666" />
          <Text style={styles.statText}>{item.moves}</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
          <Text style={styles.statText}>{item.time}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.difficultySelector}>
        {difficulties.map((difficulty) => (
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

      <FlatList
        data={filteredLeaderboard}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="trophy-broken"
              size={48}
              color="#ccc"
            />
            <Text style={styles.emptyText}>
              No scores yet for this difficulty
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  difficultySelector: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  difficultyButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  selectedDifficulty: {
    backgroundColor: "#4CAF50",
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  selectedDifficultyText: {
    color: "#fff",
  },
  listContainer: {
    padding: 16,
    gap: 8,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  topThree: {
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  rankContainer: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: 18,
    fontWeight: "bold",
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
  dateText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
