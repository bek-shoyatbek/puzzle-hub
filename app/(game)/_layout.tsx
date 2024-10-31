import { Stack } from "expo-router";

export default function GameLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#4CAF50",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    />
  );
}
