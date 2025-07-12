import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { useAppContext } from "../Logic/globalState";
import { responsiveFontSize, spacing } from "../Utils/responsiveUtils";

const LoadingScreen = ({ message = "Loading..." }) => {
  const { theme } = useAppContext();
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start entrance animation
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.primary,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Enhanced loading indicator */}
      <ActivityIndicator
        size="large"
        color={theme.colors.text}
        style={styles.loader}
      />

      {/* Loading Text */}
      <Text style={[styles.loadingText, { color: theme.colors.text }]}>
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  loader: {
    marginBottom: spacing.lg,
  },
  loadingText: {
    fontSize: responsiveFontSize(16),
    fontFamily: "serif",
    fontWeight: "300",
    letterSpacing: 1.2,
    textAlign: "center",
    opacity: 0.8,
  },
});

export default LoadingScreen;
