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
  Easing,
  Vibration,
  TouchableWithoutFeedback,
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

const DraggableFloatingBackButton = React.memo(
  ({
    size = 54,
    iconSize = 26,
    iconColor = "white",
    backgroundColor = "#29252490",
    accentColor = "#8d4b13",
    initialPosition = { x: 50, y: 700 },
    onPress,
    snapToEdge = true,
    vibrationEnabled = true,
    animationEnabled = true,
  }) => {
    const router = useNavigation();
    const insets = useSafeAreaInsets();

    const safeAreaBounds = useMemo(
      () => ({
        top: insets.top + 10,
        bottom: height - insets.bottom - size - 10,
        left: insets.left + 10,
        right: width - insets.right - size - 10,
      }),
      [insets, size]
    );

    // Pre-calculate colors to avoid runtime parsing
    const accentRgba = useMemo(
      () => hexToRgba(accentColor, 0.3),
      [accentColor]
    );

    const pressedRgba = useMemo(
      () => hexToRgba(accentColor, 0.6),
      [accentColor]
    );

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
    const pressAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    
    // Dragging is disabled
    const draggableEnabled = false;

    // Enhanced blinking effect for interactivity
    useEffect(() => {
      if (animationEnabled && !isDragging) {
        const blinkSequence = Animated.loop(
          Animated.sequence([
            Animated.timing(blinkAnim, {
              toValue: 0.6,
              duration: 3000,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.ease),
            }),
            Animated.timing(blinkAnim, {
              toValue: 1,
              duration: 3000,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.ease),
            }),
          ])
        );

        blinkSequence.start();

        return () => blinkSequence.stop();
      }
    }, [animationEnabled, isDragging]);

    // Enhanced haptic feedback function
    const triggerHapticFeedback = useCallback((type = 'light') => {
      if (vibrationEnabled) {
        try {
          if (Platform.OS === "ios") {
            // Enhanced iOS haptic feedback
            import("react-native-haptic-feedback")
              .then((HapticFeedback) => {
                const feedbackType = type === 'press' ? 'impactMedium' : 'impactLight';
                HapticFeedback.default.trigger(feedbackType, {
                  enableVibrateFallback: true,
                  ignoreAndroidSystemSettings: false,
                });
              })
              .catch(() => {
                // Enhanced fallback vibration pattern
                const pattern = type === 'press' ? [0, 100, 50, 100] : [0, 50];
                Vibration.vibrate(pattern);
              });
          } else {
            // Enhanced Android vibration patterns
            const pattern = type === 'press' ? [0, 80, 40, 80] : [0, 40];
            Vibration.vibrate(pattern);
          }
        } catch (error) {
          console.warn("Vibration not available:", error);
        }
      }
    }, [vibrationEnabled]);

    // Enhanced press in handler
    const handlePressIn = useCallback(() => {
      setIsPressed(true);
      triggerHapticFeedback('light');

      if (animationEnabled) {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.88,
            duration: 120,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
          Animated.timing(pressAnim, {
            toValue: 0.9,
            duration: 120,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
          Animated.timing(rippleAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
        ]).start();
      }
    }, [animationEnabled, triggerHapticFeedback]);

    // Enhanced press out handler
    const handlePressOut = useCallback(() => {
      setIsPressed(false);

      if (animationEnabled) {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 300,
            friction: 20,
            useNativeDriver: true,
          }),
          Animated.spring(pressAnim, {
            toValue: 1,
            tension: 300,
            friction: 20,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
          Animated.timing(rippleAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
        ]).start();
      }
    }, [animationEnabled]);

    // Enhanced press handler with stronger feedback
    const handlePress = useCallback(() => {
      // Stronger haptic feedback for actual press
      triggerHapticFeedback('press');
      
      // Visual feedback for press
      if (animationEnabled) {
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.85,
            duration: 80,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 400,
            friction: 25,
            useNativeDriver: true,
          }),
        ]).start();
      }

      // Execute navigation
      setTimeout(() => {
        if (onPress) {
          onPress();
        } else if (router && router.canGoBack()) {
          router.goBack();
        }
      }, 50); // Small delay to feel the feedback
    }, [onPress, router, triggerHapticFeedback, animationEnabled]);

    const ensureWithinBounds = useCallback(
      (x, y) => {
        const boundedX = Math.min(
          Math.max(x, safeAreaBounds.left),
          safeAreaBounds.right
        );
        const boundedY = Math.min(
          Math.max(y, safeAreaBounds.top),
          safeAreaBounds.bottom
        );
        return { x: boundedX, y: boundedY };
      },
      [safeAreaBounds]
    );

    const snapToNearestEdge = useCallback(
      (x, y) => {
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
          useNativeDriver: false,
        }).start();
      },
      [pan, safeAreaBounds, size]
    );

    // Keep pan responder structure but disable it
    const panResponder = useMemo(() => {
      return { panHandlers: {} }; // Disabled dragging
    }, []);

    const buttonContainerStyle = useMemo(
      () => ({
        ...styles.buttonContainer,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: isPressed ? pressedRgba : backgroundColor,
        borderColor: accentColor,
        borderWidth: isPressed ? 2 : 1,
        borderStyle:"dashed",
        transform: [
          { scale: scaleAnim },
          { scale: pressAnim }
        ],
        shadowColor: accentColor,
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowOpacity: glowAnim,
        shadowRadius: 8,
        // elevation: isPressed ? 8 : 4,
      }),
      [size, isPressed, pressedRgba, backgroundColor, accentColor, scaleAnim, pressAnim, glowAnim]
    );

    const rippleStyle = useMemo(
      () => ({
        ...styles.ripple,
        width: size * 1.6,
        height: size * 1.6,
        borderRadius: (size * 1.6) / 2,
        backgroundColor: accentColor,
        opacity: rippleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.3],
        }),
        transform: [
          {
            scale: rippleAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.4, 1.8],
            }),
          },
        ],
      }),
      [size, accentColor, rippleAnim]
    );

    const glowStyle = useMemo(
      () => ({
        ...styles.glow,
        width: size * 1.3,
        height: size * 1.3,
        borderRadius: (size * 1.3) / 2,
        backgroundColor: accentColor,
        opacity: glowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.4],
        }),
      }),
      [size, accentColor, glowAnim]
    );

    return (
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
            opacity: blinkAnim,
          },
        ]}
      >
        {/* Ripple effect */}
        <Animated.View style={rippleStyle} />
        
        {/* Glow effect */}
        <Animated.View style={glowStyle} />
        
        {/* Main button */}
        <TouchableWithoutFeedback
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          delayPressIn={0}
          delayPressOut={0}
        >
          <Animated.View style={buttonContainerStyle}>
            <View style={styles.button}>
              <Ionicons 
                name="chevron-back" 
                size={iconSize} 
                color={iconColor}
                style={{
                  textShadowColor: 'rgba(0,0,0,0.3)',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 2,
                }}
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
  glow: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default DraggableFloatingBackButton;