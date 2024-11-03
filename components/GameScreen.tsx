import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Vibration,
} from "react-native";
import AwesomeAlert from "react-native-awesome-alerts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "@/styles/game.styles";
import {
  isSolvable,
  shuffleArray,
  canMove,
  getTargetPosition,
  calculateMinimumMoves,
} from "@/helpers/game";
import { GameScreenProps, Position } from "@/types/game";
import { calculateStars } from "@/helpers/game/calculate-stars";
import { addScore } from "@/utils/leaderboard";

const GameScreen: React.FC<GameScreenProps> = ({ rows, cols }) => {
  // State
  const [grid, setGrid] = useState<(number | null)[][]>([]);
  const [moves, setMoves] = useState(0);
  const [emptyPosition, setEmptyPosition] = useState<Position>({
    row: 0,
    col: 0,
  });
  const [showExitAlert, setShowExitAlert] = useState(false);
  const [showWinAlert, setShowWinAlert] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
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
  // Refs for animations
  const animatedTiles = useRef<{
    [key: number]: {
      position: Animated.ValueXY;
      scale: Animated.Value;
      rotate: Animated.Value;
    };
  }>({});

  // Celebration animation values
  const celebrationScale = useRef(new Animated.Value(1)).current;
  const celebrationRotate = useRef(new Animated.Value(0)).current;
  const celebrationOpacity = useRef(new Animated.Value(0)).current;

  // Initialize game and animations
  useEffect(() => {
    initializeAnimations();
    initializeGame();
  }, [rows, cols]);

  const initializeAnimations = () => {
    const tiles: typeof animatedTiles.current = {};
    for (let i = 1; i < rows * cols; i++) {
      tiles[i] = {
        position: new Animated.ValueXY({ x: 0, y: 0 }),
        scale: new Animated.Value(1),
        rotate: new Animated.Value(0),
      };
    }
    animatedTiles.current = tiles;
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

    // Reset all animations
    Object.values(animatedTiles.current).forEach((tile) => {
      tile.position.setValue({ x: 0, y: 0 });
      tile.scale.setValue(1);
      tile.rotate.setValue(0);
    });

    setTimeSeconds(0);
    stopTimer();
    startTimer();

    setGrid(newGrid);
    setEmptyPosition(currentEmptyPos);
    setMoves(0);
    setStars(0);
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

  const handleGameWon = async () => {
    try {
      stopTimer();

      Vibration.vibrate([0, 50, 50, 50]);

      await addScore({
        moves,
        time_seconds: timeSeconds,
        difficulty: `${rows}x${cols}` as "3x3" | "4x4" | "5x5",
      });

      Animated.parallel([
        Animated.sequence([
          Animated.timing(celebrationScale, {
            toValue: 1.1,
            duration: 200,
            useNativeDriver: true,
            easing: Easing.bounce,
          }),
          Animated.spring(celebrationScale, {
            toValue: 1,
            damping: 4,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(celebrationRotate, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.elastic(1),
          }),
          Animated.timing(celebrationRotate, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(celebrationOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const minPossibleMoves = calculateMinimumMoves(grid, rows, cols);
      const newStars = calculateStars(moves, minPossibleMoves);
      setStars(newStars);
      setShowWinAlert(true);
    } catch (error) {
      console.error("Error handling game won:", error);
    } finally {
      setTimeout(() => {
        celebrationScale.setValue(1);
        celebrationRotate.setValue(0);
        celebrationOpacity.setValue(0);
      }, 2000);
    }
  };

  const getPositionFromIndex = (row: number, col: number) => {
    const { width } = Dimensions.get("window");
    const TILE_SIZE = (width - 40) / cols;
    return {
      x: col * (TILE_SIZE + 4),
      y: row * (TILE_SIZE + 4),
    };
  };

  const animateTileMovement = (
    value: number,
    fromPos: Position,
    toPos: Position,
    onComplete: () => void,
  ) => {
    const from = getPositionFromIndex(fromPos.row, fromPos.col);
    const to = getPositionFromIndex(toPos.row, toPos.col);

    const deltaX = to.x - from.x;
    const deltaY = to.y - from.y;

    const tile = animatedTiles.current[value];
    tile.position.setValue({ x: 0, y: 0 });

    // Single timing animation for maximum speed
    Animated.timing(tile.position, {
      toValue: { x: deltaX, y: deltaY },
      duration: 100, // Very fast duration
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic), // Smooth but quick easing
    }).start(() => {
      tile.position.setValue({ x: 0, y: 0 });
      onComplete();
    });
  };

  const moveTile = (row: number, col: number) => {
    if (!canMove(row, col, emptyPosition) || isAnimating) return;

    const value = grid[row][col];
    if (value === null) return;

    setIsAnimating(true);

    const fromPos = { row, col };
    const toPos = { ...emptyPosition };

    animateTileMovement(value, fromPos, toPos, () => {
      const newGrid = grid.map((row) => [...row]);
      newGrid[emptyPosition.row][emptyPosition.col] = grid[row][col];
      newGrid[row][col] = null;

      setGrid(newGrid);
      setEmptyPosition({ row, col });
      setMoves(moves + 1);
      setIsAnimating(false);

      if (isGameWon(newGrid)) {
        handleGameWon();
      }
    });
  };

  const renderTile = (
    number: number | null,
    rowIndex: number,
    colIndex: number,
  ) => {
    if (number === null) return null;

    const tile = animatedTiles.current[number];
    if (!tile) return null;

    const animStyle = {
      transform: [
        ...tile.position.getTranslateTransform(),
        { scale: tile.scale },
        {
          rotate: tile.rotate.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: ["-20deg", "0deg", "20deg"],
          }),
        },
      ],
    };

    const { width } = Dimensions.get("window");
    const TILE_SIZE = (width - 40) / cols;

    return (
      <Animated.View
        style={[
          styles.tile,
          {
            width: TILE_SIZE,
            height: TILE_SIZE,
            backgroundColor: `hsl(${(number * 10) % 360}, 60%, 45%)`,
            position: "absolute",
            zIndex: 1,
          },
          canMove(rowIndex, colIndex, emptyPosition) && styles.movableTile,
          animStyle,
        ]}
      >
        <Text style={[styles.tileText, { fontSize: TILE_SIZE * 0.4 }]}>
          {number}
        </Text>
      </Animated.View>
    );
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const { width } = Dimensions.get("window");
  const TILE_SIZE = (width - 40) / cols;

  return (
    <View style={styles.container}>
      {/* Header */}
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
        <TouchableOpacity
          style={styles.resetButton}
          onPress={initializeGame}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="restart" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Game Grid */}
      <View style={styles.grid}>
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((number, colIndex) => (
              <TouchableOpacity
                key={colIndex}
                style={[
                  styles.tileContainer,
                  {
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                  },
                ]}
                onPress={() => moveTile(rowIndex, colIndex)}
                disabled={!number || isAnimating}
                activeOpacity={
                  canMove(rowIndex, colIndex, emptyPosition) ? 0.8 : 1
                }
              >
                {renderTile(number, rowIndex, colIndex)}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* Exit Button */}
      <TouchableOpacity
        style={styles.exitButton}
        onPress={() => setShowExitAlert(true)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="exit-to-app" size={24} color="#f44336" />
        <Text style={styles.exitButtonText}>Exit Game</Text>
      </TouchableOpacity>

      {/* Celebration Overlay */}
      {showWinAlert && (
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(255,215,0,0.3)",
              zIndex: 1000,
              pointerEvents: "none",
            },
            {
              transform: [
                { scale: celebrationScale },
                {
                  rotate: celebrationRotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
              opacity: celebrationOpacity,
            },
          ]}
        >
          <Text style={styles.celebrationText}>🎉 Congratulations! 🎉</Text>
        </Animated.View>
      )}

      {/* Exit Alert */}
      <AwesomeAlert
        show={showExitAlert}
        showProgress={false}
        title="Exit Game"
        message="Are you sure you want to exit? Your progress will be lost."
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showCancelButton={true}
        showConfirmButton={true}
        cancelText="Cancel"
        confirmText="Exit"
        confirmButtonColor="#f44336"
        cancelButtonColor="#3085d6"
        titleStyle={styles.alertTitle}
        messageStyle={styles.alertMessage}
        contentContainerStyle={{
          borderRadius: 15,
          padding: 10,
        }}
        actionContainerStyle={{
          gap: 10,
        }}
        confirmButtonStyle={{
          borderRadius: 8,
          paddingHorizontal: 20,
          paddingVertical: 10,
        }}
        cancelButtonStyle={{
          borderRadius: 8,
          paddingHorizontal: 20,
          paddingVertical: 10,
        }}
        onCancelPressed={() => setShowExitAlert(false)}
        onConfirmPressed={() => {
          setShowExitAlert(false);
          router.back();
        }}
        onDismiss={() => setShowExitAlert(false)}
      />

      {/* Win Alert */}
      <AwesomeAlert
        show={showWinAlert}
        showProgress={false}
        title="Congratulations! 🎉"
        message={`You solved the puzzle in ${moves} moves!
       Time: ${Math.floor(timeSeconds / 60)}:${(timeSeconds % 60).toString().padStart(2, "0")}
       ${
         stars === 3
           ? "Perfect! You're a puzzle master! ⭐⭐⭐"
           : stars === 2
             ? "Great job! Keep practicing! ⭐⭐"
             : "Well done! Try to use fewer moves next time! ⭐"
       }`}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={true}
        showConfirmButton={true}
        cancelText="Back to Home"
        confirmText="Play Again"
        confirmButtonColor="#4CAF50"
        cancelButtonColor="#3085d6"
        titleStyle={styles.alertTitle}
        messageStyle={styles.alertMessage}
        contentContainerStyle={{
          borderRadius: 15,
          padding: 10,
        }}
        actionContainerStyle={{
          gap: 10,
        }}
        confirmButtonStyle={{
          borderRadius: 8,
          paddingHorizontal: 20,
          paddingVertical: 10,
        }}
        cancelButtonStyle={{
          borderRadius: 8,
          paddingHorizontal: 20,
          paddingVertical: 10,
        }}
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
