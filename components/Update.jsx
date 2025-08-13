import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Animated,
  Image,
} from "react-native";
import * as Updates from "expo-updates";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function UpdateScreen() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [progress] = useState(new Animated.Value(0));

  useEffect(() => {
    checkForOTAUpdate();
    // Animate progress bar for visual effect
    Animated.timing(progress, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();

    // 🧪 FOR TESTING UPDATE UI IN DEVELOPMENT:
    // Uncomment the line below to test the update screen in Expo Go
    // setTimeout(() => showUpdateModalForTesting(), 1000);
  }, []);

  const checkForOTAUpdate = async () => {
    try {
      // Check if we're running in Expo Go (development)
      if (__DEV__ || !Updates.isEnabled) {
        console.log(
          "Running in development mode or Expo Go - Updates not supported"
        );
        console.log("For testing, you can uncomment the line below:");
        // setModalVisible(true); // Uncomment this line to test the update UI
        return;
      }

      console.log("Checking for updates...");
      const update = await Updates.checkForUpdateAsync();
      console.log("Update check result:", update);

      if (update.isAvailable) {
        console.log("Update available, downloading...");
        const downloaded = await Updates.fetchUpdateAsync();
        console.log("Update downloaded:", downloaded);

        setUpdateAvailable(true);
        setIsDownloaded(true);
        setModalVisible(true); // show the modal when update is ready
      } else {
        console.log("No update available");
      }
    } catch (error) {
      console.error("Update check failed:", error);

    }
  };

  const handleUpdate = async () => {
    try {
      console.log("Applying update and restarting...");
      setModalVisible(false);

      // Check if we're in development mode
      if (__DEV__ || !Updates.isEnabled) {
        console.log("In development mode - would restart app in production");
        return;
      }

      // Small delay to ensure modal closes before restart
      setTimeout(async () => {
        await Updates.reloadAsync();
      }, 100);
    } catch (error) {
      console.error("Error applying update:", error);
      setModalVisible(false);
    }
  };

  // For testing purposes - you can call this manually to see the update UI
  const showUpdateModalForTesting = () => {
    console.log("🧪 Showing update modal for testing purposes");
    setModalVisible(true);
    setUpdateAvailable(true);
    setIsDownloaded(true);
  };


  return (
    <Modal
      visible={modalVisible}
      transparent={false}
      animationType="fade"
      onRequestClose={() => setModalVisible(false)}
      statusBarTranslucent={true}
    >
      <StatusBar
        backgroundColor="#000000"
        barStyle="light-content"
        translucent={true}
      />
      <View style={styles.fullScreenContainer}>
        {/* Simple Update Message */}
        <View>
          <Text style={styles.message}>
            Update Available.{"\n"}RESTART TO APPLY UPDATE?
          </Text>
        </View>

        {/* App icon image */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <MaterialIcons name="cloud" size={200} color="#7e5619" />
        </View>
        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleUpdate}>
            <MaterialIcons name="refresh" size={24} color="#000000" />
            <Text style={styles.primaryButtonText}>[ RESTART NOW ]</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.secondaryButtonText}>[ LATER ]</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>His Voice APK • Version 1.0.0</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#000000",
    paddingTop: 0,
    justifyContent: "center",
  },
  centerSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 2,
    // marginBottom: 16,
    textAlign: "center",
    fontFamily: "ZillaSlab-SemiBold",
  },
  subtitle: {
    fontSize: 16,
    color: "#D4AF37",
    letterSpacing: 1,
    textAlign: "center",
    // marginBottom: 40,
    fontFamily: "ZillaSlab-Regular",
  },
  message: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 24,
    fontFamily: "ZillaSlab-Regular",
    letterSpacing: 1,
    paddingVertical: 12,
  },
  actionSection: {
    paddingHorizontal: 30,
    paddingBottom: 60,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: "#271c0f",
    paddingVertical: 18,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: "#f9f8f8",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
    letterSpacing: 1,
    fontFamily: "ZillaSlab-SemiBold",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1,
    fontFamily: "ZillaSlab-SemiBold",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 30,
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    letterSpacing: 1,
    fontFamily: "ZillaSlab-Regular",
  },
});
