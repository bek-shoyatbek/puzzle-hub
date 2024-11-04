import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import AwesomeAlert from "react-native-awesome-alerts";
import { GameScreenProps, Position } from "@/types/game";
import { addScore } from "@/utils/leaderboard";
import {
  isSolvable,
  shuffleArray,
  canMove,
  calculateMinimumMoves,
} from "@/helpers/game";
import { calculateStars } from "@/helpers/game/calculate-stars";
import { styles } from "@/styles/game.styles";

const GameScreen: React.FC<GameScreenProps> = ({ rows, cols }) => {
  const [grid, setGrid] = useState<(number | null)[][]>([]);
  const [moves, setMoves] = useState(0);
  const [emptyPosition, setEmptyPosition] = useState<Position>({
    row: 0,
    col: 0,
  });
  const [showExitAlert, setShowExitAlert] = useState(false);
  const [showWinAlert, setShowWinAlert] = useState(false);
  const [stars, setStars] = useState(0);
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    setIsGameActive(true);
    timerRef.current = setInterval(() => {
      setTimeSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsGameActive(false);
  };

  const initializeGame = () => {
    const numbers = Array.from({ length: rows * cols - 1 }, (_, i) => i + 1);
    const shuffledNumbers = shuffleArray([...numbers, null]);

    if (!isSolvable(shuffledNumbers, rows, cols)) {
      const lastIndex = shuffledNumbers.findIndex((n) => n === null) - 1;
      const temp = shuffledNumbers[lastIndex];
      shuffledNumbers[lastIndex] = shuffledNumbers[lastIndex - 1];
      shuffledNumbers[lastIndex - 1] = temp;
    }

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

    setTimeSeconds(0);
    stopTimer();
    startTimer();
    setGrid(newGrid);
    setEmptyPosition(currentEmptyPos);
    setMoves(0);
    setStars(0);
  };

  useEffect(() => {
    initializeGame();
    return () => stopTimer();
  }, [rows, cols]);

  const isGameWon = (currentGrid: (number | null)[][]): boolean => {
    let expectedNum = 1;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (i === rows - 1 && j === cols - 1) return currentGrid[i][j] === null;
        if (currentGrid[i][j] !== expectedNum) return false;
        expectedNum++;
      }
    }
    return true;
  };

  const handleGameWon = async () => {
    try {
      stopTimer();
      await addScore({
        moves,
        time_seconds: timeSeconds,
        difficulty: `${rows}x${cols}` as "3x3" | "4x4" | "5x5",
      });
      const minPossibleMoves = calculateMinimumMoves(grid, rows, cols);
      const newStars = calculateStars(moves, minPossibleMoves);
      setStars(newStars);
      setShowWinAlert(true);
    } catch (error) {
      console.error("Error handling game won:", error);
    }
  };

  const moveTile = (row: number, col: number) => {
    if (!canMove(row, col, emptyPosition)) return;

    const value = grid[row][col];
    if (value === null) return;

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="counter" size={24} color="#666" />
            <Text style={styles.statText}>Moves: {moves}</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="timer" size={24} color="#666" />
            <Text style={styles.statText}>
              Time: {Math.floor(timeSeconds / 60)}:
              {(timeSeconds % 60).toString().padStart(2, "0")}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.resetButton} onPress={initializeGame}>
          <MaterialCommunityIcons name="restart" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((number, colIndex) => (
              <TouchableOpacity
                key={colIndex}
                style={[
                  styles.tileContainer,
                  { width: TILE_SIZE, height: TILE_SIZE },
                ]}
                onPress={() => moveTile(rowIndex, colIndex)}
                disabled={!number}
              >
                {number && (
                  <View
                    style={[
                      styles.tile,
                      {
                        width: TILE_SIZE,
                        height: TILE_SIZE,
                        backgroundColor: `hsl(${
                          (number * 10) % 360
                        }, 60%, 45%)`,
                      },
                      canMove(rowIndex, colIndex, emptyPosition) &&
                        styles.movableTile,
                    ]}
                  >
                    <Text
                      style={[styles.tileText, { fontSize: TILE_SIZE * 0.4 }]}
                    >
                      {number}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.exitButton}
        onPress={() => setShowExitAlert(true)}
      >
        <MaterialCommunityIcons name="exit-to-app" size={24} color="#f44336" />
        <Text style={styles.exitButtonText}>Exit Game</Text>
      </TouchableOpacity>

      <AwesomeAlert
        show={showExitAlert}
        title="Exit Game"
        message="Are you sure you want to exit? Your progress will be lost."
        showCancelButton={true}
        showConfirmButton={true}
        cancelText="Cancel"
        confirmText="Exit"
        confirmButtonColor="#f44336"
        cancelButtonColor="#3085d6"
        onCancelPressed={() => setShowExitAlert(false)}
        onConfirmPressed={() => {
          setShowExitAlert(false);
          router.back();
        }}
        onDismiss={() => setShowExitAlert(false)}
      />

      <AwesomeAlert
        show={showWinAlert}
        title="Congratulations! 🎉"
        message={`You solved the puzzle in ${moves} moves!\nTime: ${Math.floor(
          timeSeconds / 60
        )}:${(timeSeconds % 60).toString().padStart(2, "0")}\n${
          stars === 3
            ? "Perfect! You're a puzzle master! ⭐⭐⭐"
            : stars === 2
            ? "Great job! Keep practicing! ⭐⭐"
            : "Well done! Try to use fewer moves next time! ⭐"
        }`}
        showCancelButton={true}
        showConfirmButton={true}
        cancelText="Back to Home"
        confirmText="Play Again"
        confirmButtonColor="#4CAF50"
        cancelButtonColor="#3085d6"
        onCancelPressed={() => {
          setShowWinAlert(false);
          router.back();
        }}
        onConfirmPressed={() => {
          setShowWinAlert(false);
          initializeGame();
        }}
      />
    </View>
  );
};

export default GameScreen;
