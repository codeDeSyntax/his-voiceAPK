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
    const { theme, goBack, getPreviousScreen } = useAppContext();
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

    // Sleek opacity breathing effect
    useEffect(() => {
      const opacityAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.92,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );

      opacityAnimation.start();
      return () => opacityAnimation.stop();
    }, []);

    // Subtle blinking effect
    useEffect(() => {
      const blinkAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.85,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.delay(3000), // Pause between blinks
        ])
      );

      blinkAnimation.start();
      return () => blinkAnimation.stop();
    }, []);

    // Shimmer effect
    useEffect(() => {
      const shimmerAnimation = Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        })
      );

      shimmerAnimation.start();
      return () => shimmerAnimation.stop();
    }, []);

    // Breathing animation for subtle life
    useEffect(() => {
      const breatheAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, {
            toValue: 1.02,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(breatheAnim, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      );

      breatheAnimation.start();
      return () => breatheAnimation.stop();
    }, []);

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

      setTimeout(() => {
        if (onPress) {
          onPress();
        } else {
          // Use our custom navigation history instead of router.goBack()
          const handleBackNavigation = async () => {
            const previousScreen = await goBack();
            if (router) {
              router.navigate(previousScreen);
            }
          };
          handleBackNavigation();
        }
      }, 50);
    }, [onPress, router, goBack, triggerHapticFeedback, animationEnabled]);

    // Animation values
    const rotateInterpolate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "180deg"],
    });

    const buttonStyle = useMemo(
      () => ({
        ...styles.buttonContainer,
        width: size,
        height: size,
        borderRadius: size / 2,
        opacity: Animated.multiply(opacityAnim, blinkAnim),
        transform: [{ scale: Animated.multiply(scaleAnim, breatheAnim) }],
        ...Platform.select({
          ios: {
            shadowColor: theme?.colors?.text || "#1c1917",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isPressed ? 0.25 : 0.15,
            shadowRadius: isPressed ? 20 : 16,
          },
          android: {
            elevation: isPressed ? 8 : 6,
          },
        }),
      }),
      [
        size,
        scaleAnim,
        breatheAnim,
        theme?.colors?.text,
        isPressed,
        opacityAnim,
        blinkAnim,
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
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
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
              {/* Icon with smooth animation */}
              <Animated.View
                style={[
                  styles.iconContainer,
                  {
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

              {/* Shimmer overlay for premium feel */}
              <Animated.View
                style={[
                  styles.shimmerSleek,
                  {
                    opacity: shimmerAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 0.6, 0],
                    }),
                    transform: [
                      {
                        translateX: shimmerAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-size, size],
                        }),
                      },
                    ],
                  },
                ]}
              />
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
