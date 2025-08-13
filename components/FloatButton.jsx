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

const DraggableFloatingBackButton = React.memo(
  ({
    size = 48,
    iconSize = 20,
    iconColor = "white",
    backgroundColor = "",
    initialPosition = { x: 20, y: height - 140 },
    onPress,
    snapToEdge = true,
    vibrationEnabled = true,
    animationEnabled = true,
  }) => {
    const { theme, goBack } = useAppContext();
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
      [insets, size]
    );

    const pan = useRef(
      new Animated.ValueXY({
        x: Math.max(initialPosition.x, safeAreaBounds.left),
        y: Math.max(initialPosition.y, safeAreaBounds.top),
      })
    ).current;

    const [isPressed, setIsPressed] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const breatheAnim = useRef(new Animated.Value(1)).current;

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
        ])
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
      [vibrationEnabled]
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

    const handlePress = useCallback(() => {
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

      // Ultra-fast navigation with smart fallback logic
      if (onPress) {
        onPress();
      } else if (router) {
        const navigationState = router.getState();
        const canGoBack = navigationState && navigationState.index > 0;

        // Debug logging to see what's happening
        console.log("Navigation State:", navigationState);
        console.log(
          "Current route:",
          navigationState?.routes?.[navigationState.index]?.name
        );
        console.log(
          "Previous route:",
          navigationState?.routes?.[navigationState.index - 1]?.name
        );

        // Check if the previous screen would be Welcome
        let shouldGoToSermonList = false;
        if (canGoBack && navigationState.routes) {
          const previousRoute =
            navigationState.routes[navigationState.index - 1];
          // Never navigate back to Welcome screen - check for different possible names
          const welcomeScreenNames = ["Welcome", "WelcomeScreen", "welcome"];
          shouldGoToSermonList = welcomeScreenNames.includes(
            previousRoute?.name
          );
        }

        if (canGoBack && !shouldGoToSermonList) {
          // Safe to go back - previous screen is not Welcome
          console.log(
            "Going back to:",
            navigationState?.routes?.[navigationState.index - 1]?.name
          );
          router.goBack();
        } else {
          // No history or previous screen is Welcome - go to sermon list
          console.log("Navigating to AllSermons instead of Welcome");
          router.navigate("AllSermons");
        }

        // Update our custom history asynchronously after navigation (optional)
        setTimeout(() => {
          goBack().catch(console.error);
        }, 0);
      }
    }, [onPress, router, goBack, triggerHapticFeedback, animationEnabled]);

    // Optimized animation values with memoization
    const rotateInterpolate = useMemo(
      () =>
        rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "180deg"],
        }),
      [rotateAnim]
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
      ]
    );

    return (
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
          },
        ]}
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
            {/* Sleek background with frosted glass effect */}
            <View
              style={[
                styles.buttonSleek,
                {
                  backgroundColor: theme?.colors?.primary || "#fafafa",
                  borderColor: theme?.dark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.08)",
                },
              ]}
            >
              {/* Icon with optimized animation */}
              <Animated.View
                style={[
                  styles.iconContainer,
                  animationEnabled && {
                    transform: [{ rotate: rotateInterpolate }],
                  },
                ]}
              >
                <Ionicons
                  name="arrow-back"
                  size={iconSize}
                  color={theme?.colors?.text || "#1c1917"}
                  style={styles.iconSleek}
                />
              </Animated.View>

              {/* Conditional shimmer overlay - simplified for performance */}
              {animationEnabled && (
                <Animated.View
                  style={[
                    styles.shimmerSleek,
                    {
                      opacity: 0.3, // Static opacity for better performance
                    },
                  ]}
                />
              )}
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Animated.View>
    );
  }
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
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSleek: {
    width: "100%",
    height: "100%",
    borderRadius: 24, // Half of default size (48/2)
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.3,
    borderColor: "rgba(0,0,0,0.08)",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  iconSleek: {
    ...Platform.select({
      ios: {
        textShadowColor: "rgba(0,0,0,0.1)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
    }),
  },
  shimmerSleek: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 12,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 6,
    transform: [{ skewX: "-10deg" }],
  },
});

export default DraggableFloatingBackButton;
