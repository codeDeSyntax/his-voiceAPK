import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
  Easing,
  Vibration,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

// Helper function to convert hex to rgba - memoized outside component
const hexToRgba = (hex, alpha = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const DraggableFloatingBackButton = React.memo(({
  size = 54,
  iconSize = 26,
  iconColor = "white",
  backgroundColor = "rgba(17, 193, 241, 0.85)",
  accentColor = "#34aed6",
  initialPosition = { x: 50, y: 700 },
  onPress,
  snapToEdge = true,
  vibrationEnabled = true,
  animationEnabled = true,
}) => {
  const router = useNavigation();
  const insets = useSafeAreaInsets();

  const safeAreaBounds = useMemo(() => ({
    top: insets.top + 10,
    bottom: height - insets.bottom - size - 10,
    left: insets.left + 10,
    right: width - insets.right - size - 10,
  }), [insets, size]);

  // Pre-calculate colors to avoid runtime parsing
  const accentRgba = useMemo(() => hexToRgba(accentColor, 0.25), [accentColor]);

  const pan = useRef(
    new Animated.ValueXY({
      x: initialPosition.x,
      y: Math.max(initialPosition.y, safeAreaBounds.top),
    })
  ).current;

  const [isPressed, setIsPressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;

  // Add blinking effect for interactivity
  useEffect(() => {
    if (animationEnabled && !isDragging) {
      const blinkSequence = Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.4,
            duration: 2000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      );
      
      blinkSequence.start();
      
      return () => blinkSequence.stop();
    }
  }, [animationEnabled, isDragging]);

  const triggerHapticFeedback = useCallback(() => {
    if (vibrationEnabled) {
      try {
        if (Platform.OS === "ios") {
          // Use dynamic import for haptic feedback
          import("react-native-haptic-feedback").then((HapticFeedback) => {
            HapticFeedback.default.trigger("impactLight", {
              enableVibrateFallback: true,
              ignoreAndroidSystemSettings: false,
            });
          }).catch(() => {
            // Fallback to basic vibration if haptic feedback is not available
            const { Vibration } = require("react-native");
            Vibration.vibrate(50);
          });
        } else {
          // Android fallback
          const { Vibration } = require("react-native");
          Vibration.vibrate(50);
        }
      } catch (error) {
        console.warn("Vibration not available:", error);
      }
    }
  }, [vibrationEnabled]);

  const handlePressIn = useCallback(() => {
    setIsPressed(true);
    triggerHapticFeedback();

    if (animationEnabled) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.92,
          duration: 150,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animationEnabled, triggerHapticFeedback]);

  const handlePressOut = useCallback(() => {
    setIsPressed(false);

    if (animationEnabled) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 200,
          friction: 15,
          useNativeDriver: true,
        }),
        Animated.timing(rippleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animationEnabled]);

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    } else if (router && router.canGoBack()) {
      router.goBack();
    }
  }, [onPress, router]);

  const ensureWithinBounds = useCallback((x, y) => {
    const boundedX = Math.min(
      Math.max(x, safeAreaBounds.left),
      safeAreaBounds.right
    );
    const boundedY = Math.min(
      Math.max(y, safeAreaBounds.top),
      safeAreaBounds.bottom
    );
    return { x: boundedX, y: boundedY };
  }, [safeAreaBounds]);

  const snapToNearestEdge = useCallback((x, y) => {
    const distanceToLeft = x;
    const distanceToRight = width - x - size;

    const targetX =
      distanceToLeft < distanceToRight
        ? safeAreaBounds.left
        : safeAreaBounds.right;

    // Use spring animation without native driver for pan values
    Animated.spring(pan, {
      toValue: { x: targetX, y },
      tension: 50,
      friction: 10,
      useNativeDriver: false,
    }).start();
  }, [pan, safeAreaBounds, size]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      // Only start dragging if movement is significant
      return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
    },
    onPanResponderGrant: () => {
      setIsDragging(true);
      pan.setOffset({
        x: pan.x._value,
        y: pan.y._value,
      });
      pan.setValue({ x: 0, y: 0 });
      handlePressIn();
    },
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (_, gestureState) => {
      setIsDragging(false);
      pan.flattenOffset();
      handlePressOut();

      const wasTap =
        Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5;

      if (wasTap) {
        handlePress();
      } else if (snapToEdge) {
        const boundedPosition = ensureWithinBounds(
          pan.x._value,
          pan.y._value
        );
        snapToNearestEdge(boundedPosition.x, boundedPosition.y);
      } else {
        const boundedPosition = ensureWithinBounds(
          pan.x._value,
          pan.y._value
        );
        // Use setValue instead of animated setValue to avoid native driver conflicts
        Animated.timing(pan, {
          toValue: boundedPosition,
          duration: 200,
          useNativeDriver: false,
          easing: Easing.out(Easing.ease),
        }).start();
      }
    },
  }), [pan, handlePressIn, handlePressOut, handlePress, snapToEdge, ensureWithinBounds, snapToNearestEdge]);

  const buttonContainerStyle = useMemo(() => ({
    ...styles.buttonContainer,
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: isPressed ? accentRgba : backgroundColor,
    borderColor: accentColor,
    transform: [{ scale: scaleAnim }],
  }), [size, isPressed, accentRgba, backgroundColor, accentColor, scaleAnim]);

  const rippleStyle = useMemo(() => ({
    ...styles.ripple,
    width: size * 1.4,
    height: size * 1.4,
    borderRadius: (size * 1.4) / 2,
    backgroundColor: accentColor,
    opacity: rippleAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 0],
    }),
    transform: [
      {
        scale: rippleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1.5],
        }),
      },
    ],
  }), [size, accentColor, rippleAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        { 
          transform: [
            { translateX: pan.x }, 
            { translateY: pan.y }
          ],
          opacity: blinkAnim, // Add blinking effect
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Animated.View style={rippleStyle} />
      <Animated.View style={buttonContainerStyle}>
        <View style={styles.button}>
          <Ionicons name="chevron-back" size={iconSize} color={iconColor} />
        </View>
      </Animated.View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    overflow: "hidden",
  },
  button: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  ripple: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default DraggableFloatingBackButton;