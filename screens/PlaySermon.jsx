import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  StyleSheet,
  ImageBackground,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAppContext } from "../../Logic/globalState";

const DownloadSermon = () => {
  const { selectedSermon } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const audioUrl = selectedSermon?.audioUrl || "";

  // Function to copy URL to clipboard
  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(audioUrl);
      setIsCopied(true);
      Alert.alert("Success", "URL copied to clipboard");
      // Reset copy state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      Alert.alert("Error", "Failed to copy to clipboard");
    }
  };

  // Function to open URL in external browser
  const openInBrowser = async () => {
    if (!audioUrl) {
      Alert.alert("Error", "No URL available");
      return;
    }

    setIsLoading(true);
    try {
      const supported = await Linking.canOpenURL(audioUrl);
      if (supported) {
        await Linking.openURL(audioUrl);
      } else {
        Alert.alert("Error", "Cannot open this URL");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open URL");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.safeArea]}>
      {/* <StatusBar barStyle="light-content" /> */}
      <ImageBackground
        source={require("../../assets/icon.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            "rgba(0, 0, 0, 0.8)",
            "rgba(20, 20, 20, 0.9)",
            "rgba(0, 0, 0, 0.95)",
          ]}
          style={styles.gradient}
        >
          <View style={styles.container}>
            <View style={styles.headerSection}>
              <View style={styles.titleContainer}>
                <Text
                  style={styles.title}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {selectedSermon?.title || "Sermon Title"}
                </Text>
              </View>
            </View>

            <View style={styles.urlSection}>
              <View style={styles.urlCard}>
                <Text style={styles.urlLabel}>AUDIO URL</Text>
                <Text
                  style={styles.urlText}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {audioUrl || "No URL available"}
                </Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={copyToClipboard}
                  activeOpacity={0.7}
                  disabled={!audioUrl}
                >
                  <FontAwesome5
                    name={isCopied ? "check" : "copy"}
                    size={16}
                    color="white"
                  />
                  <Text style={styles.copyButtonText}>
                    {isCopied ? "Copied!" : "Copy URL"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.actionsSection}>
              <TouchableOpacity
                onPress={openInBrowser}
                style={[styles.actionButton, styles.playButton]}
                disabled={isLoading || !audioUrl}
              >
                {isLoading ? (
                  <ActivityIndicator size="large" color="white" />
                ) : (
                  <>
                    <Ionicons name="play-circle" size={32} color="white" />
                    <Text style={styles.buttonText}>Play in Browser</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openInBrowser}
                style={[styles.actionButton, styles.downloadButton]}
                disabled={isLoading || !audioUrl}
              >
                <MaterialIcons name="cloud-download" size={32} color="white" />
                <Text style={styles.buttonText}>Download</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Tap any button to open in your browser
              </Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
  },
  gradient: {
    flex: 1,
  },
  headerSection: {
    marginTop: 30,
    alignItems: "center",
  },
  titleContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  urlSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  urlCard: {
    backgroundColor: "rgba(32, 36, 37, 0.8)",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  urlLabel: {
    color: "#B0B0B0",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    letterSpacing: 1,
  },
  urlText: {
    color: "#ffffff",
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    width: "100%",
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: "rgba(0, 122, 255, 0.7)",
    width: "80%",
  },
  copyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  actionsSection: {
    alignItems: "center",
    marginTop: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 16,
    width: "80%",
    maxWidth: 350,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  playButton: {
    backgroundColor: "rgba(32, 36, 37, 0.9)",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  downloadButton: {
    backgroundColor: "rgba(32, 36, 37, 0.9)",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
  footer: {
    alignItems: "center",
    marginBottom: 20,
  },
  footerText: {
    color: "#B0B0B0",
    fontSize: 14,
    fontStyle: "italic",
  },
});

export default DownloadSermon;
