import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import { GameStats, getAllGameStats } from "@/utils/game-stats";
import { styles } from "@/styles/settings.styles";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadGameStats();
    }
  }, [user]);

  const loadGameStats = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const stats = await getAllGameStats(user.id);
      setGameStats(stats);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileSection}>
        <Image
          source={
            user?.avatar_url
              ? { uri: user?.avatar_url }
              : require("@/assets/default-avatar.png")
          }
          style={styles.avatar}
        />
        {user ? (
          <View style={styles.userInfo}>
            <Text style={styles.username}>{user?.username || "User"}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => setIsAuthModalVisible(true)}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        )}
      </View>

      {user && (
        <View style={styles.statsSection}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#4CAF50" />
          ) : (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {gameStats?.gamesPlayed || 0}
                </Text>
                <Text style={styles.statLabel}>Games Played</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {gameStats?.bestScore || "-"}
                </Text>
                <Text style={styles.statLabel}>Best Score</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {gameStats?.totalStars || 0}
                </Text>
                <Text style={styles.statLabel}>Stars Earned</Text>
              </View>
            </View>
          )}
        </View>
      )}

      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => Alert.alert("Coming Soon", "Tutorial coming soon")}
        >
          <MaterialCommunityIcons
            name="help-circle"
            size={24}
            color="#4CAF50"
          />
          <Text style={styles.menuText}>How to Play</Text>
        </TouchableOpacity>

        {user && (
          <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
            <MaterialCommunityIcons name="logout" size={24} color="#f44336" />
            <Text style={[styles.menuText, { color: "#f44336" }]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <AuthModal
        visible={isAuthModalVisible}
        onClose={() => setIsAuthModalVisible(false)}
      />
    </ScrollView>
  );
}
