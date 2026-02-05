import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
  Vibration,
  TouchableWithoutFeedback,
} from "react-native";
const { Easing } = Animated;
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAppContext } from "../Logic/globalState";

const { width, height } = Dimensions.get("window");

const DraggableFloatingButton = React.memo(
  ({
    size = 44,
    iconSize = 18,
    iconColor = "white",
    backgroundColor = "",
    initialPosition = { x: 20, y: height - 140 },
    onPress,
    snapToEdge = true,
    vibrationEnabled = true,
    animationEnabled = true,
  }) => {
    const { theme } = useAppContext();
    const route = useRoute();
    const router = useNavigation();
    const insets = useSafeAreaInsets();

    // Original theme color integration
    const isAudioScreen = route.name === "audiowebscreen";
    const primaryColor = isAudioScreen
      ? theme.colors.primary
      : theme.colors.primary;
    const secondaryColor = isAudioScreen
      ? theme.colors.secondary
      : theme.colors.secondary;

    const safeAreaBounds = useMemo(
      () => ({
        top: insets.top + 20,
        bottom: height - insets.bottom - size - 20,
        left: 20,
        right: width - size - 20,
      }),
      [insets, size],
    );

    const pan = useRef(
      new Animated.ValueXY({
        x: Math.max(initialPosition.x, safeAreaBounds.left),
        y: Math.max(initialPosition.y, safeAreaBounds.top),
      }),
    ).current;

    const [isPressed, setIsPressed] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const hasMoved = useRef(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const breatheAnim = useRef(new Animated.Value(1)).current;

    // Pan responder for drag functionality
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          hasMoved.current = false;
          triggerHapticFeedback("light");
          pan.setOffset({
            x: pan.x._value,
            y: pan.y._value,
          });
        },
        onPanResponderMove: (evt, gestureState) => {
          // Only consider it a drag if moved more than 5 pixels
          if (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5) {
            hasMoved.current = true;
            setIsDragging(true);
          }
          pan.x.setValue(gestureState.dx);
          pan.y.setValue(gestureState.dy);
        },
        onPanResponderRelease: (evt, gestureState) => {
          pan.flattenOffset();

          // If it was a tap (not a drag), trigger the press action
          if (!hasMoved.current) {
            setIsDragging(false);
            handlePressAction();
          } else {
            setIsDragging(false);
          }

          // Snap to nearest edge if enabled
          if (snapToEdge) {
            const newX = pan.x._value;
            const newY = Math.max(
              Math.min(pan.y._value, safeAreaBounds.bottom),
              safeAreaBounds.top,
            );

            // Snap to left or right edge
            const shouldSnapLeft = newX < width / 2;
            const snapX = shouldSnapLeft
              ? safeAreaBounds.left
              : safeAreaBounds.right;

            Animated.parallel([
              Animated.timing(pan.x, {
                toValue: snapX,
                duration: 200,
                useNativeDriver: false,
              }),
              Animated.timing(pan.y, {
                toValue: newY,
                duration: 200,
                useNativeDriver: false,
              }),
            ]).start();
          }
        },
      }),
    ).current;

    // New sleek effects
    const opacityAnim = useRef(new Animated.Value(0.9)).current;
    const blinkAnim = useRef(new Animated.Value(1)).current;
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    // Simplified animations for maximum performance - only essential animations
    useEffect(() => {
      if (!animationEnabled) return;

      // Single breathing animation for subtle life indication
      const breatheAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, {
            toValue: 1.005, // Very subtle scale
            duration: 4000, // Very slow for minimal CPU usage
            useNativeDriver: true,
          }),
          Animated.timing(breatheAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
      );

      breatheAnimation.start();
      return () => breatheAnimation.stop();
    }, [animationEnabled]);

    // Enhanced haptic feedback
    const triggerHapticFeedback = useCallback(
      (type = "light") => {
        if (vibrationEnabled && Platform.OS === "android") {
          const pattern = type === "press" ? [0, 50, 30, 50] : [0, 30];
          Vibration.vibrate(pattern);
        }
      },
      [vibrationEnabled],
    );

    const handlePressIn = useCallback(() => {
      setIsPressed(true);
      triggerHapticFeedback("light");

      if (animationEnabled) {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.92,
            duration: 120,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 150,
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
            tension: 400,
            friction: 12,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [animationEnabled]);

    // Performance optimization - create static handlers when animations disabled
    const handlePressInOptimized = useMemo(() => {
      if (!animationEnabled) {
        return () => {
          setIsPressed(true);
          triggerHapticFeedback("light");
        };
      }
      return handlePressIn;
    }, [animationEnabled, triggerHapticFeedback, handlePressIn]);

    const handlePressOutOptimized = useMemo(() => {
      if (!animationEnabled) {
        return () => setIsPressed(false);
      }
      return handlePressOut;
    }, [animationEnabled, handlePressOut]);

    // Core navigation action - extracted for use in panResponder
    const handlePressAction = useCallback(() => {
      triggerHapticFeedback("press");

      if (animationEnabled) {
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.88,
            duration: 60,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 500,
            friction: 10,
            useNativeDriver: true,
          }),
        ]).start();
      }

      // Ultra-fast navigation - behaves like native back button
      if (onPress) {
        onPress();
      } else if (router) {
        // Simply check if we can go back, like native back button
        if (router.canGoBack()) {
          router.goBack();
        } else {
          // No history - go to sermon list as fallback
          router.navigate("AllSermons");
        }
      }
    }, [onPress, router, triggerHapticFeedback, animationEnabled]);

    const handlePress = useCallback(() => {
      // Don't trigger action if we were dragging
      if (isDragging) {
        return;
      }
      handlePressAction();
    }, [isDragging, handlePressAction]);

    // Optimized animation values with memoization
    const rotateInterpolate = useMemo(
      () =>
        rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "180deg"],
        }),
      [rotateAnim],
    );

    // Simplified button style for maximum performance
    const buttonStyle = useMemo(
      () => ({
        ...styles.buttonContainer,
        width: size,
        height: size,
        borderRadius: size / 2,
        opacity: 0.95, // Static opacity for better performance
        transform: animationEnabled
          ? [{ scale: Animated.multiply(scaleAnim, breatheAnim) }]
          : [{ scale: 1 }],
        ...Platform.select({
          ios: {
            shadowColor: theme?.colors?.text || "#1c1917",
            shadowOffset: { width: 0, height: isPressed ? 2 : 4 },
            shadowOpacity: isPressed ? 0.1 : 0.08,
            shadowRadius: isPressed ? 8 : 6,
          },
          android: {
            elevation: isPressed ? 2 : 3,
          },
        }),
      }),
      [
        size,
        animationEnabled,
        scaleAnim,
        breatheAnim,
        theme?.colors?.text,
        isPressed,
      ],
    );

    return (
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
            opacity: isDragging ? 0.7 : 1,
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Main button */}
        <TouchableWithoutFeedback
          onPressIn={handlePressInOptimized}
          onPressOut={handlePressOutOptimized}
          onPress={handlePress}
          delayPressIn={0}
          delayPressOut={0}
        >
          <Animated.View style={buttonStyle}>
            {/* Modern glassmorphism background */}
            <View
              style={[
                styles.buttonGlass,
                {
                  backgroundColor: theme?.dark
                    ? "rgba(45, 35, 30, 0.85)"
                    : "rgba(255, 255, 255, 0.9)",
                  borderColor: theme?.dark
                    ? "rgba(230, 195, 184, 0.2)"
                    : "rgba(93, 50, 17, 0.15)",
                },
              ]}
            >
              {/* Chevron icon - more modern than arrow */}
              <Ionicons
                name="chevron-back"
                size={iconSize}
                color={theme?.dark ? "#e6c3b8" : "#5d3211"}
              />
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Animated.View>
    );
  },
);

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
    overflow: "hidden",
  },
  buttonGlass: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});

export default DraggableFloatingButton;
