import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";

interface GameScreenProps {
  rows: number;
  cols: number;
}

type Position = {
  row: number;
  col: number;
};

const GameScreen: React.FC<GameScreenProps> = ({ rows, cols }) => {
  const [grid, setGrid] = useState<(number | null)[][]>([]);
  const [moves, setMoves] = useState(0);
  const [emptyPosition, setEmptyPosition] = useState<Position>({
    row: 0,
    col: 0,
  });

  // Initialize the game board
  useEffect(() => {
    initializeGame();
  }, [rows, cols]);

  const initializeGame = () => {
    // Create solved grid first
    const numbers = Array.from({ length: rows * cols - 1 }, (_, i) => i + 1);
    const shuffledNumbers = shuffleArray([...numbers, null]);

    // Ensure the puzzle is solvable
    if (!isSolvable(shuffledNumbers)) {
      // If not solvable, swap last two non-empty tiles
      const lastIndex = shuffledNumbers.findIndex((n) => n === null) - 1;
      const temp = shuffledNumbers[lastIndex];
      shuffledNumbers[lastIndex] = shuffledNumbers[lastIndex - 1];
      shuffledNumbers[lastIndex - 1] = temp;
    }

    // Convert to 2D array
    const newGrid: (number | null)[][] = [];
    let currentEmptyPos: Position = { row: 0, col: 0 };

    for (let i = 0; i < rows; i++) {
      const row: (number | null)[] = [];
      for (let j = 0; j < cols; j++) {
        const value = shuffledNumbers[i * cols + j];
        row.push(value);
        if (value === null) {
          currentEmptyPos = { row: i, col: j };
        }
      }
      newGrid.push(row);
    }

    setGrid(newGrid);
    setEmptyPosition(currentEmptyPos);
    setMoves(0);
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const isSolvable = (puzzle: (number | null)[]): boolean => {
    // Remove null and count inversions
    const numbers = puzzle.filter((n) => n !== null) as number[];
    let inversions = 0;

    for (let i = 0; i < numbers.length - 1; i++) {
      for (let j = i + 1; j < numbers.length; j++) {
        if (numbers[i] > numbers[j]) {
          inversions++;
        }
      }
    }

    // For odd-width puzzles, solvable if inversions even
    if (cols % 2 === 1) {
      return inversions % 2 === 0;
    }

    // For even-width puzzles, solvable if:
    // (blank on even row from bottom + odd inversions) or
    // (blank on odd row from bottom + even inversions)
    const emptyRowFromBottom = rows - Math.floor(puzzle.indexOf(null) / cols);
    return (emptyRowFromBottom % 2 === 0) === (inversions % 2 === 0);
  };

  const canMove = (row: number, col: number): boolean => {
    return (
      (Math.abs(row - emptyPosition.row) === 1 && col === emptyPosition.col) ||
      (Math.abs(col - emptyPosition.col) === 1 && row === emptyPosition.row)
    );
  };

  const isGameWon = (currentGrid: (number | null)[][]): boolean => {
    let expectedNum = 1;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (i === rows - 1 && j === cols - 1) {
          return currentGrid[i][j] === null;
        }
        if (currentGrid[i][j] !== expectedNum) {
          return false;
        }
        expectedNum++;
      }
    }
    return true;
  };

  const handleBackToHome = () => {
    Alert.alert(
      "Exit Game",
      "Are you sure you want to exit? Your progress will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Exit",
          style: "destructive",
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleGameWon = () => {
    Alert.alert(
      "Congratulations!",
      `You solved the puzzle in ${moves} moves!`,
      [
        {
          text: "Play Again",
          onPress: initializeGame,
        },
        {
          text: "Back to Home",
          style: "cancel",
          onPress: () => router.back(),
        },
      ]
    );
  };

  const moveTile = (row: number, col: number) => {
    if (!canMove(row, col)) return;

    const newGrid = grid.map((row) => [...row]);
    newGrid[emptyPosition.row][emptyPosition.col] = grid[row][col];
    newGrid[row][col] = null;

    setGrid(newGrid);
    setEmptyPosition({ row, col });
    setMoves(moves + 1);

    if (isGameWon(newGrid)) {
      handleGameWon();
    }
  };

  const { width } = Dimensions.get("window");
  const TILE_SIZE = (width - 40) / cols;
  const FONT_SIZE = TILE_SIZE * 0.4;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="counter" size={24} color="#666" />
            <Text style={styles.statText}>Moves: {moves}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.resetButton} onPress={initializeGame}>
          <MaterialCommunityIcons name="restart" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.grid, { padding: 5 }]}>
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((number, colIndex) => (
              <TouchableOpacity
                key={colIndex}
                style={[
                  styles.tile,
                  {
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                    backgroundColor: number ? "#4CAF50" : "transparent",
                  },
                  canMove(rowIndex, colIndex) && styles.movableTile,
                ]}
                onPress={() => moveTile(rowIndex, colIndex)}
                disabled={!number}
              >
                {number && (
                  <Text style={[styles.tileText, { fontSize: FONT_SIZE }]}>
                    {number}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.exitButton} onPress={handleBackToHome}>
        <MaterialCommunityIcons name="exit-to-app" size={24} color="#f44336" />
        <Text style={styles.exitButtonText}>Exit Game</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  statsContainer: {
    flex: 1,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
  },
  resetButton: {
    backgroundColor: "#FF9800",
    padding: 12,
    borderRadius: 8,
  },
  grid: {
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
  },
  row: {
    flexDirection: "row",
  },
  tile: {
    margin: 2,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  movableTile: {
    backgroundColor: "#66BB6A",
  },
  tileText: {
    color: "#fff",
    fontWeight: "bold",
  },
  exitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#f44336",
  },
  exitButtonText: {
    color: "#f44336",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default GameScreen;
