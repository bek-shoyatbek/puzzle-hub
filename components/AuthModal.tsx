import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { supabase } from "@/utils/supabase";
import { createOrUpdateProfile } from "@/utils/auth";
import { googleWebClientId } from "@/config";

// Initialize Google Sign-In
GoogleSignin.configure({
  webClientId: googleWebClientId,
  offlineAccess: true,
});

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose }) => {
  const [loading, setLoading] = React.useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      // Check Google Play Services
      await GoogleSignin.hasPlayServices();

      // Sign in with Google
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;

      if (!idToken) {
        throw new Error("No ID token present");
      }

      // Sign in with Supabase
      const { data: authData, error: authError } =
        await supabase.auth.signInWithIdToken({
          provider: "google",
          token: idToken,
        });

      if (authError) {
        console.error("Supabase auth error:", authError);
        throw authError;
      }

      if (authData?.user) {
        // Create or update user profile
        await createOrUpdateProfile(
          authData.user.id,
          authData.user.email!,
          response.data?.user.name ?? "",
          response.data?.user.photo ?? "",
        );

        onClose();
      }
    } catch (error: any) {
      console.error("Full error:", error);

      if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("Process cancelled");
      } else if (error?.code === statusCodes.IN_PROGRESS) {
        console.log("Sign in is in progress");
      } else if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Error", "Play services not available");
      } else {
        Alert.alert("Error", error.message || "Failed to sign in with Google");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sign In</Text>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#4285F4" />
            ) : (
              <GoogleSigninButton
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={handleGoogleSignIn}
                style={styles.googleButton}
                disabled={loading}
              />
            )}
          </View>
          <Text style={styles.disclaimer}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  buttonContainer: {
    alignItems: "center",
    gap: 20,
    marginBottom: 20,
  },
  supabaseButton: {
    backgroundColor: "#4285F4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    gap: 10,
  },
  supabaseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  googleButton: {
    width: 240,
    height: 48,
  },
  orText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  disclaimer: {
    textAlign: "center",
    color: "#666",
    fontSize: 12,
    marginTop: 20,
  },
});

export default AuthModal;
