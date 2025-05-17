import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  Dimensions,
  Platform,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const DraggableFloatingBackButton = ({
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

  // Calculate safe area boundaries
  const safeAreaBounds = {
    top: insets.top + 10,
    bottom: height - insets.bottom - size - 10,
    left: insets.left + 10,
    right: width - insets.right - size - 10,
  };

  // State for tracking position
  const pan = useRef(
    new Animated.ValueXY({
      x: initialPosition.x,
      y: Math.max(initialPosition.y, safeAreaBounds.top),
    })
  ).current;

  // State for visual feedback
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  // For touch feedback
  const handlePressIn = () => {
    setIsPressed(true);

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

    if (vibrationEnabled && Platform.OS === "ios") {
      const ReactNativeHapticFeedback = require("react-native-haptic-feedback");
      ReactNativeHapticFeedback.trigger("impactLight", {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
    }
  };

  const handlePressOut = () => {
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
  };

  // Function to snap to the nearest edge
  const snapToNearestEdge = (x, y) => {
    const distanceToLeft = x;
    const distanceToRight = width - x - size;

    const targetX =
      distanceToLeft < distanceToRight
        ? safeAreaBounds.left
        : safeAreaBounds.right;

    Animated.spring(pan, {
      toValue: { x: targetX, y },
      tension: 50,
      friction: 10,
      useNativeDriver: false, // We need to animate layout properties
    }).start();
  };

  // Function to ensure button stays within safe area
  const ensureWithinBounds = (x, y) => {
    const boundedX = Math.min(
      Math.max(x, safeAreaBounds.left),
      safeAreaBounds.right
    );
    const boundedY = Math.min(
      Math.max(y, safeAreaBounds.top),
      safeAreaBounds.bottom
    );
    return { x: boundedX, y: boundedY };
  };

  // Configure PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: (_, gestureState) => {
        // Store initial touch position
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
        // End the gesture
        pan.flattenOffset();
        handlePressOut();

        // Check if this was a tap or a drag
        const wasTap =
          Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5;

        if (wasTap) {
          // Handle tap (navigate back)
          if (onPress) {
            onPress();
          } else if (router && router.canGoBack()) {
            router.goBack();
          }
        } else if (snapToEdge) {
          // Snap to nearest edge if enabled
          const boundedPosition = ensureWithinBounds(
            pan.x._value,
            pan.y._value
          );
          snapToNearestEdge(boundedPosition.x, boundedPosition.y);
        } else {
          // Just ensure within bounds
          const boundedPosition = ensureWithinBounds(
            pan.x._value,
            pan.y._value
          );
          pan.setValue(boundedPosition);
        }
      },
    })
  ).current;

  // Shadow styles that depend on platform
  const shadowStyle = Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
    },
    android: {
      elevation: 6,
    },
    default: {},
  });

  // Apply styles based on pressed state
  const buttonContainerStyle = {
    ...styles.buttonContainer,
    ...shadowStyle,
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: isPressed
      ? `rgba(${parseInt(accentColor.slice(1, 3), 16)}, ${parseInt(
          accentColor.slice(3, 5),
          16
        )}, ${parseInt(accentColor.slice(5, 7), 16)}, 0.25)`
      : backgroundColor,
    borderColor: accentColor,
    borderStyle: "dashed",
    transform: [{ scale: scaleAnim }],
  };

  // Ripple animation styles
  const rippleStyle = {
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
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
      ]}
      {...panResponder.panHandlers}
    >
      <Animated.View style={rippleStyle} />
      <Animated.View style={buttonContainerStyle}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (onPress) {
              onPress();
            } else if (router && router.canGoBack()) {
              router.goBack();
            }
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={iconSize} color={iconColor} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

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
