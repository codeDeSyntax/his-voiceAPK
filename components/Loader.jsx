import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { useAppContext } from "../Logic/globalState";
import { responsiveFontSize, spacing } from "../Utils/responsiveUtils";

// ─── Custom Tapered Radial Capsule Spinner (Matching Image Design) ───────────
const DASH_COUNT = 12;

export const Spinner = ({ backgroundColor, compact = false, size = 84 }) => {
  const { theme } = useAppContext();
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const bg = backgroundColor ?? "transparent";
  const dark = theme?.dark ?? true;

  // Colors: outline pill shells & solid inner fills using theme colors
  const strokeColor = dark ? "rgba(242, 205, 180, 0.40)" : "rgba(93, 50, 17, 0.35)";
  const fillColor = dark ? "#f2cdb4" : "#5d3211";
  const radius = size / 2;

  return (
    <View
      style={[
        spinnerStyles.container,
        !compact && spinnerStyles.containerFull,
        { backgroundColor: bg },
      ]}
    >
      <Animated.View
        style={[
          spinnerStyles.spinner,
          {
            width: size,
            height: size,
            transform: [{ rotate }],
          },
        ]}
      >
        {Array.from({ length: DASH_COUNT }).map((_, i) => {
          const angle = (i / DASH_COUNT) * 360;
          // Progress clockwise: 1.0 at dash 0 (12 o'clock) down to ~0.08 at dash 11
          const progress = (DASH_COUNT - i) / DASH_COUNT;

          // Capsule shell height and width tapering around the circle
          const capsuleHeight = Math.max(7, Math.round(7 + progress * 17)); // 24px down to 7px
          const capsuleWidth = Math.max(5.5, Math.round(5.5 + progress * 2.5)); // 8px down to 5.5px
          const borderRadius = capsuleWidth / 2;

          // Inner fill height inside the capsule shell (half filled, full filled, etc.)
          const fillRatio = Math.max(0, (progress - 0.12) / 0.88);
          const fillHeight = Math.round(capsuleHeight * fillRatio);

          return (
            <View
              key={i}
              style={{
                position: "absolute",
                width: capsuleWidth,
                height: capsuleHeight,
                borderRadius: borderRadius,
                borderWidth: 1.4,
                borderColor: strokeColor,
                overflow: "hidden",
                justifyContent: "flex-start",
                alignItems: "center",
                transform: [
                  { rotate: `${angle}deg` },
                  { translateY: -radius + capsuleHeight / 2 + 2 },
                ],
              }}
            >
              {fillHeight > 0 && (
                <View
                  style={{
                    width: "100%",
                    height: fillHeight,
                    backgroundColor: fillColor,
                    borderRadius: Math.min(borderRadius, fillHeight / 2),
                  }}
                />
              )}
            </View>
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
    justifyContent: "center",
    alignItems: "center",
  },
});

// ─── Loading Screen ────────────────────────────────────────────────────────
const LoadingScreen = ({ message = "Loading..." }) => {
  const { theme } = useAppContext();
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
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
  }, [opacityAnim, scaleAnim]);

  const bg = theme?.colors?.background || "#1a130e";
  const textColor = theme?.colors?.text || "#fae7da";

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: bg,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Spinner compact size={88} />
      <Text style={[styles.loadingText, { color: textColor, marginTop: spacing.xxl }]}>
        {message}
      </Text>
    </Animated.View>
  );
};

const SERMON_LOADER_MESSAGES = [
  "Getting the message ready for you…",
  "Opening God's word…",
  "Preparing your reading…",
  "Just a moment — good things take a little time…",
  "Almost there…",
];

const SermonSkeletonLoader = () => {
  const { theme } = useAppContext();
  const [messageIndex, setMessageIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % SERMON_LOADER_MESSAGES.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const bg = theme?.colors?.background || "#1a130e";
  const textColor = theme?.colors?.text || "#fae7da";

  return (
    <Animated.View
      style={[
        sermonLoaderStyles.screen,
        {
          backgroundColor: bg,
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={sermonLoaderStyles.content}>
        <Spinner compact size={88} />
        <Text
          style={[
            styles.loadingText,
            sermonLoaderStyles.message,
            { color: textColor },
          ]}
        >
          {SERMON_LOADER_MESSAGES[messageIndex]}
        </Text>
      </View>
    </Animated.View>
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
    marginTop: spacing.xxl,
    maxWidth: 320,
  },
});

const AudioSkeletonLoader = ({ backgroundColor }) => (
  <Spinner backgroundColor={backgroundColor} size={88} />
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
    fontSize: responsiveFontSize(15.5),
    fontFamily: "serif",
    fontWeight: "300",
    letterSpacing: 1.2,
    textAlign: "center",
    opacity: 0.82,
  },
});

export default LoadingScreen;
export { SermonSkeletonLoader, AudioSkeletonLoader };



