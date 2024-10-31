import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface LoadingScreenProps {
  color?: string;
  showLogo?: boolean;
}

export default function LoadingScreen({
  color = "#4CAF50",
  showLogo = true,
}: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      {showLogo && (
        <MaterialCommunityIcons
          name="puzzle"
          size={64}
          color={color}
          style={styles.logo}
        />
      )}
      <ActivityIndicator size="large" color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  logo: {
    marginBottom: 20,
  },
});
