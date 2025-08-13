import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";

const SearchFeedback = ({
  isVisible,
  message = "Paragraph found",
  theme,
  duration = 1500, // Reduced duration for better UX
  type = "info", // 'info', 'success', 'warning', 'error'
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isVisible) {
      fadeAnim.setValue(0); // Reset first to avoid glitches
      scaleAnim.setValue(0.8);

      const fadeIn = Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200, // Faster fade in
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 6,
          useNativeDriver: true,
        }),
      ]);

      const fadeOut = Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200, // Faster fade out
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]);

      Animated.sequence([
        fadeIn,
        Animated.delay(duration - 400), // Account for fade in/out
        fadeOut,
      ]).start();
    }
  }, [isVisible, duration]);

  if (!isVisible) return null;

  // Get colors based on type
  const getTypeColors = () => {
    switch (type) {
      case "success":
        return {
          backgroundColor: theme?.dark ? "#059669" : "#10B981",
          textColor: "#ffffff",
        };
      case "warning":
        return {
          backgroundColor: theme?.dark ? "#D97706" : "#F59E0B",
          textColor: "#ffffff",
        };
      case "error":
        return {
          backgroundColor: theme?.dark ? "#DC2626" : "#EF4444",
          textColor: "#ffffff",
        };
      default:
        return {
          backgroundColor: theme?.colors?.primary || "#000",
          textColor: theme?.colors?.text || "#fff",
        };
    }
  };

  const { backgroundColor, textColor } = getTypeColors();

  const containerStyle = {
    opacity: fadeAnim,
    backgroundColor,
    transform: [
      { scale: scaleAnim },
      {
        translateY: fadeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Text style={[styles.message, { color: textColor }]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: "80%",
  },
  message: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default React.memo(SearchFeedback);
