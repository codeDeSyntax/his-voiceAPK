import React, { useEffect, useRef, useState } from "react";
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

const SPINNER_SIZE = 48;
const DASH_COUNT = 12;

const SERMON_LOADER_MESSAGES = [
  "Getting the message ready for you…",
  "Opening God's word…",
  "Preparing your reading…",
  "Just a moment — good things take a little time…",
  "Almost there…",
];

// Shared spinner — matches the LoadingScreen design exactly
const Spinner = ({ backgroundColor, compact = false }) => {
  const { theme } = useAppContext();
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const bg = backgroundColor ?? theme.colors.background;

  return (
    <View
      style={[
        spinnerStyles.container,
        !compact && spinnerStyles.containerFull,
        { backgroundColor: bg },
      ]}
    >
      <Animated.View
        style={[spinnerStyles.spinner, { transform: [{ rotate }] }]}
      >
        {Array.from({ length: DASH_COUNT }).map((_, i) => {
          const angle = (i / DASH_COUNT) * 360;
          const opacity = 0.15 + (i / DASH_COUNT) * 0.85;
          return (
            <View
              key={i}
              style={[
                spinnerStyles.dash,
                {
                  opacity,
                  transform: [
                    { rotate: `${angle}deg` },
                    { translateY: -(SPINNER_SIZE / 2) },
                  ],
                },
              ]}
            />
          );
        })}
      </Animated.View>
    </View>
  );
};

const spinnerStyles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  containerFull: {
    flex: 1,
  },
  spinner: {
    width: SPINNER_SIZE,
    height: SPINNER_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  dash: {
    position: "absolute",
    width: 2.5,
    height: 10,
    borderRadius: 2,
    backgroundColor: "#d57a3e",
  },
});

const SermonSkeletonLoader = () => {
  const { theme } = useAppContext();
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % SERMON_LOADER_MESSAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={sermonLoaderStyles.screen}>
      <View style={sermonLoaderStyles.content}>
        <Spinner compact backgroundColor="transparent" />
        <Text
          style={[
            styles.loadingText,
            sermonLoaderStyles.message,
            { color: theme.colors.text },
          ]}
        >
          {SERMON_LOADER_MESSAGES[messageIndex]}
        </Text>
      </View>
    </View>
  );
};

const sermonLoaderStyles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  content: {
    alignItems: "center",
  },
  message: {
    marginTop: spacing.lg,
    maxWidth: 300,
  },
});

const AudioSkeletonLoader = ({ backgroundColor }) => (
  <Spinner backgroundColor={backgroundColor} />
);

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
export { SermonSkeletonLoader, AudioSkeletonLoader };
