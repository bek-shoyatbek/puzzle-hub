import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthModal from "@/components/AuthModal";

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

interface SettingItemProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description?: string;
  onPress?: () => void;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  showArrow?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  description,
  onPress,
  value,
  onValueChange,
  showArrow = false,
}) => (
  <TouchableOpacity
    style={styles.settingItem}
    onPress={onPress}
    disabled={!onPress && !onValueChange}
  >
    <MaterialCommunityIcons name={icon} size={24} color="#4CAF50" />
    <View style={styles.settingText}>
      <Text style={styles.settingTitle}>{title}</Text>
      {description && (
        <Text style={styles.settingDescription}>{description}</Text>
      )}
    </View>
    {onValueChange && <Switch value={value} onValueChange={onValueChange} />}
    {showArrow && (
      <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
    )}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [isAuthModalVisible, setIsAuthModalVisible] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [vibrationEnabled, setVibrationEnabled] = React.useState(true);
  const [showMoves, setShowMoves] = React.useState(true);
  const [showTimer, setShowTimer] = React.useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = React.useState(true);

  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem("gameSettings");
      if (settings) {
        const { sound, vibration, moves, timer, autoSave } =
          JSON.parse(settings);

        setSoundEnabled(sound);
        setVibrationEnabled(vibration);
        setShowMoves(moves);
        setShowTimer(timer);
        setAutoSaveEnabled(autoSave);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSettings = async (key: string, value: boolean) => {
    try {
      const settings = await AsyncStorage.getItem("gameSettings");
      const currentSettings = settings ? JSON.parse(settings) : {};
      const newSettings = {
        ...currentSettings,
        [key]: value,
      };
      await AsyncStorage.setItem("gameSettings", JSON.stringify(newSettings));
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const handleAccountPress = () => {
    if (!user) {
      setIsAuthModalVisible(true);
    } else {
      Alert.alert("Coming Soon", "Profile editing coming soon");
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: signOut,
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Implement account deletion logic
            Alert.alert("Not Implemented", "Account deletion coming soon");
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <SettingsSection title="Account">
        <SettingItem
          icon="account"
          title={user?.username || "Sign In"}
          description={user?.email || "Tap to sign in or create account"}
          showArrow
          onPress={handleAccountPress}
        />
      </SettingsSection>

      <SettingsSection title="Game Settings">
        <SettingItem
          icon="volume-high"
          title="Sound Effects"
          onValueChange={(value) => {
            setSoundEnabled(value);
            saveSettings("sound", value);
          }}
          value={soundEnabled}
        />
        <SettingItem
          icon="vibrate"
          title="Vibration"
          onValueChange={(value) => {
            setVibrationEnabled(value);
            saveSettings("vibration", value);
          }}
          value={vibrationEnabled}
        />
        <SettingItem
          icon="counter"
          title="Show Moves Counter"
          onValueChange={(value) => {
            setShowMoves(value);
            saveSettings("moves", value);
          }}
          value={showMoves}
        />
        <SettingItem
          icon="timer"
          title="Show Timer"
          onValueChange={(value) => {
            setShowTimer(value);
            saveSettings("timer", value);
          }}
          value={showTimer}
        />
        <SettingItem
          icon="content-save"
          title="Auto-Save Game"
          description="Automatically save game progress"
          onValueChange={(value) => {
            setAutoSaveEnabled(value);
            saveSettings("autoSave", value);
          }}
          value={autoSaveEnabled}
        />
      </SettingsSection>

      <SettingsSection title="Support">
        <SettingItem
          icon="help-circle"
          title="How to Play"
          showArrow
          onPress={() => Alert.alert("Coming Soon", "Tutorial coming soon")}
        />
        <SettingItem
          icon="star"
          title="Rate App"
          showArrow
          onPress={() => Alert.alert("Coming Soon", "App rating coming soon")}
        />
        <SettingItem
          icon="message"
          title="Feedback"
          showArrow
          onPress={() =>
            Alert.alert("Coming Soon", "Feedback form coming soon")
          }
        />
      </SettingsSection>

      {user && (
        <SettingsSection title="Account Actions">
          <SettingItem icon="logout" title="Sign Out" onPress={handleSignOut} />
          <SettingItem
            icon="delete"
            title="Delete Account"
            description="Permanently delete your account and all data"
            onPress={handleDeleteAccount}
          />
        </SettingsSection>
      )}

      <Text style={styles.version}>Version 1.0.0</Text>

      <AuthModal
        visible={isAuthModalVisible}
        onClose={() => setIsAuthModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  section: {
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginHorizontal: 16,
    marginVertical: 8,
    textTransform: "uppercase",
  },
  sectionContent: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingText: {
    flex: 1,
    marginLeft: 16,
  },
  settingTitle: {
    fontSize: 16,
    color: "#333",
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  version: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    marginVertical: 20,
  },
});
