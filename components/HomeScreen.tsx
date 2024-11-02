import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type GridSize = {
  rows: number;
  cols: number;
  label: string;
  difficulty: string;
};

const GRID_SIZES: GridSize[] = [
  { rows: 2, cols: 3, label: "2 x 3", difficulty: "Easy" },
  { rows: 3, cols: 3, label: "3 x 3", difficulty: "Medium" },
  { rows: 3, cols: 4, label: "3 x 4", difficulty: "Hard" },
  { rows: 4, cols: 4, label: "4 x 4", difficulty: "Expert" },
] as const;

interface HomeScreenProps {
  onSelectGrid: (rows: number, cols: number) => void;
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2;

const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectGrid }) => {
  const [selectedGrid, setSelectedGrid] = useState<GridSize | null>(null);

  const handleStartGame = () => {
    if (selectedGrid) {
      onSelectGrid(selectedGrid.rows, selectedGrid.cols);
    }
  };

  const getGridIcon = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "numeric-1-circle";
      case "Medium":
        return "numeric-2-circle";
      case "Hard":
        return "numeric-3-circle";
      case "Expert":
        return "numeric-4-circle";
      default:
        return "puzzle";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="puzzle" size={40} color="#4CAF50" />
          <Text style={styles.title}>Slide Puzzle</Text>
        </View>

        <Text style={styles.subtitle}>Select Difficulty</Text>

        <View style={styles.gridSelection}>
          {GRID_SIZES.map((grid) => (
            <TouchableOpacity
              key={grid.label}
              style={[
                styles.gridOption,
                selectedGrid?.label === grid.label && styles.selectedGrid,
              ]}
              onPress={() => setSelectedGrid(grid)}
            >
              <MaterialCommunityIcons
                name={getGridIcon(grid.difficulty)}
                size={32}
                color={selectedGrid?.label === grid.label ? "#4CAF50" : "#666"}
              />
              <Text
                style={[
                  styles.difficultyText,
                  selectedGrid?.label === grid.label && styles.selectedText,
                ]}
              >
                {grid.difficulty}
              </Text>
              <Text
                style={[
                  styles.gridOptionText,
                  selectedGrid?.label === grid.label && styles.selectedText,
                ]}
              >
                {grid.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomContent}>
          <Text style={styles.instructionText}>
            Slide the tiles to arrange numbers in order
          </Text>

          <TouchableOpacity
            style={[
              styles.startButton,
              !selectedGrid && styles.startButtonDisabled,
            ]}
            onPress={handleStartGame}
            disabled={!selectedGrid}
          >
            <Text style={styles.startButtonText}>Start Game</Text>
            <MaterialCommunityIcons name="arrow-right" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    gap: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    color: "#444",
    textAlign: "center",
  },
  gridSelection: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
  gridOption: {
    width: CARD_WIDTH,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedGrid: {
    borderWidth: 2,
    borderColor: "#4CAF50",
    backgroundColor: "#E8F5E9",
  },
  difficultyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 8,
  },
  gridOptionText: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  selectedText: {
    color: "#4CAF50",
  },
  bottomContent: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 40,
  },
  instructionText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  startButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  startButtonDisabled: {
    backgroundColor: "#ccc",
    elevation: 0,
    shadowOpacity: 0,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
});

export default HomeScreen;
