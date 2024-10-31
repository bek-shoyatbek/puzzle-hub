import { Stack, router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import GameScreen from "../../components/GameScreen";
import LoadingScreen from "../../components/LoadingScreen";

export default function Game() {
  // Get params directly from router.current
  const params = useLocalSearchParams();
  const rows = params?.rows;
  const cols = params?.cols;

  // Simple, direct validation
  if (!rows || !cols) {
    router.replace("/(tabs)/");
    return <LoadingScreen />;
  }

  const numRows = Number(rows);
  const numCols = Number(cols);

  // Validate numbers
  if (
    isNaN(numRows) ||
    isNaN(numCols) ||
    numRows < 2 ||
    numRows > 4 ||
    numCols < 2 ||
    numCols > 4
  ) {
    router.replace("/(tabs)/");
    return <LoadingScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: `${numRows}x${numCols} Puzzle`,
          headerBackTitle: "Back",
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <GameScreen rows={numRows} cols={numCols} />
    </View>
  );
}
