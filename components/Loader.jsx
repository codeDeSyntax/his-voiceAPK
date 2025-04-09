// LoadingScreen.js
import React from "react";
import { useContext } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { SermonContext } from "../Logic/globalState";

const LoadingScreen = () => {
    const {theme} = useContext(SermonContext)
  return (
    <View style={[styles.container,{backgroundColor:theme.colors.background}]}>
      {/* React Native's built-in loader */}
      <ActivityIndicator size="large" color="#00bcd4" style={styles.loader} />

      {/* Loading Text */}
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181818", // Dark background
    justifyContent: "center",
    alignItems: "center",
  },
  loader: {
    marginBottom: 20,
  },
  loadingText: {
    color: "#A0A0A0", // Light gray text
    fontSize: 16,
    fontWeight: "300", // Light and modern font weight
    letterSpacing: 1.2, // Small spacing for sleekness
  },
});

export default LoadingScreen;
