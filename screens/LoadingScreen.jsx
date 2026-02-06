import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Dimensions,
  Platform,
  Image,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useAppContext } from "../Logic/globalState";

const { width, height } = Dimensions.get("window");

const LoaderScreen = () => {
  const renderContent = () => (
    <View style={[styles.contentContainer, { backgroundColor: "#2c221a" }]}>
      {/* Update Image */}
      <Animated.View style={[styles.imageContainer]}>
        <Image
          source={require("../assets/adaptive-icon.png")}
          style={styles.image}
          resizeMode="contain"
          onError={(error) =>
            console.warn("Image loading error:", error.nativeEvent.error)
          }
        />
      </Animated.View>

      {/* Loading Indicator and Text */}
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#7a5c2e" // Lighter brown for better contrast
        />
        <Text style={styles.updateText}>His voice</Text>
        <Text style={styles.subText}>Robert Lambert Lee</Text>
      </View>

      {/* Version Text */}
      {/* <Text style={styles.versionText}>Version 2.0.4</Text> */}
    </View>
  );

  return (
    <LinearGradient
      colors={["#1c1917", "#1c1917"]} // Darker colors
      style={styles.container}
      onError={(error) => console.warn("Gradient error:", error)}
    >
      {Platform.OS === "ios" ? (
        <BlurView
          intensity={20}
          tint="dark"
          style={styles.blurContainer}
          onError={(error) => console.warn("BlurView error:", error)}
        >
          {renderContent()}
        </BlurView>
      ) : (
        <View style={styles.androidContainer}>{renderContent()}</View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  blurContainer: {
    padding: 32,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1c1917", // More subtle border
    backgroundColor: "#202425", // Darker background
    width: width * 0.85,
    alignItems: "center",
  },
  androidContainer: {
    padding: 32,
    borderRadius: 24,
    backgroundColor: "#1c1917", // Darker background
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)", // More subtle border
    width: width * 0.85,
    alignItems: "center",
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  imageContainer: {
    width: 160,
    height: 160,
    marginBottom: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  updateText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#f8fafc", // Lighter text for better contrast
    marginTop: 16,
    fontFamily: Platform.OS === "ios" ? "System" : "serif",
  },
  subText: {
    fontSize: 14,
    color: "#94a3b8", // Lighter gray for better contrast
    marginTop: 8,
    fontFamily: Platform.OS === "ios" ? "System" : "serif",
  },
  migrationText: {
    fontSize: 12,
    color: "#d57a3e",
    marginTop: 12,
    textAlign: "center",
    paddingHorizontal: 20,
    fontFamily: Platform.OS === "ios" ? "System" : "serif",
  },
  versionText: {
    fontSize: 12,
    color: "#475569", // Darker gray for less emphasis
    marginTop: 8,
    fontFamily: Platform.OS === "ios" ? "System" : "serif",
  },
});

export default LoaderScreen;
