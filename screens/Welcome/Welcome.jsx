import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  Animated,
  Easing,
  Dimensions,
  Platform,
  Vibration,
} from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAppContext } from "../../Logic/globalState";
import {
  responsiveFontSize,
  horizontalScale,
  verticalScale,
  spacing,
} from "../../Utils/responsiveUtils";

const { width: screenWidth } = Dimensions.get("window");

const Welcome = () => {
  const navigation = useNavigation();
  const { theme } = useAppContext();
  const [fontsLoaded] = useFonts({
    "ZillaSlab-Regular": require("../../assets/fonts/ZillaSlab-Regular.ttf"),
  });

  // Enhanced animation values with better performance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const buttonPulseAnim = useRef(new Animated.Value(1)).current;

  // Enhanced slider animation values
  const slideX = useRef(new Animated.Value(0)).current;
  const sliderOpacity = useRef(new Animated.Value(0.8)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const backgroundWidth = useRef(new Animated.Value(0)).current;
  const thumbScale = useRef(new Animated.Value(1)).current;
  const glowIntensity = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const rippleScale = useRef(new Animated.Value(0)).current;

  // Responsive slider dimensions
  const sliderWidth = Math.min(horizontalScale(280), screenWidth * 0.8);
  const thumbSize = horizontalScale(56);
  const maxSlideDistance = sliderWidth - thumbSize - 8;

  // Haptic feedback helper
  const triggerHaptic = (type = "impactMedium") => {
    if (Platform.OS === "ios") {
      switch (type) {
        case "impactLight":
          Vibration.vibrate(10);
          break;
        case "impactMedium":
          Vibration.vibrate(20);
          break;
        case "impactHeavy":
          Vibration.vibrate(30);
          break;
        case "success":
          Vibration.vibrate([0, 50, 50, 50]);
          break;
      }
    } else {
      Vibration.vibrate(50);
    }
  };

  // Enhanced reset slider with micro-animations
  const resetSlider = () => {
    Animated.parallel([
      Animated.spring(slideX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
      Animated.timing(backgroundWidth, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(thumbScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 8,
      }),
      Animated.timing(glowIntensity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(rippleScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    sliderOpacity.setValue(0.8);
  };

  // Reset slider when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      resetSlider();
    }, [])
  );

  // Enhanced initialization with micro-interactions
  useEffect(() => {
    // Reset all animations to initial state
    resetSlider();
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.8);
    logoRotateAnim.setValue(0);
    shimmerAnim.setValue(0);

    // Staggered entrance animations with better physics
    Animated.sequence([
      // Logo entrance with enhanced rotation and scale
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.spring(logoRotateAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
          velocity: 0,
        }),
      ]),
      // Content slide up with spring physics
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 120,
          friction: 8,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]),
    ]).start();

    // Enhanced shimmer effect for slider
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );

    // Breathing pulse animation for slider
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(sliderOpacity, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(sliderOpacity, {
          toValue: 0.7,
          duration: 2500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );

    // Start animations with delay
    setTimeout(() => {
      shimmerAnimation.start();
      pulseAnimation.start();
    }, 1500);

    return () => {
      shimmerAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  // Enhanced gesture handling with haptic feedback
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: slideX } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const { translationX } = event.nativeEvent;

        // Progressive glow effect based on slide progress
        const progress = Math.min(
          Math.max(translationX / maxSlideDistance, 0),
          1
        );
        glowIntensity.setValue(progress);

        // Scale effect on thumb
        const scaleValue = 1 + progress * 0.1;
        thumbScale.setValue(scaleValue);

        // Haptic feedback at 50% progress
        if (progress > 0.5 && progress < 0.55) {
          triggerHaptic("impactLight");
        }
      },
    }
  );

  const onHandlerStateChange = (event) => {
    const { state, translationX } = event.nativeEvent;

    if (state === State.BEGAN) {
      // Start gesture feedback
      triggerHaptic("impactLight");
      Animated.timing(rippleScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    if (state === State.ACTIVE) {
      const progress = translationX / maxSlideDistance;

      // Update background width in real-time
      backgroundWidth.setValue(progress);

      // Text fade out based on progress
      const textOpacityValue = Math.max(0, 1 - progress * 2);
      textOpacity.setValue(textOpacityValue);
    }

    if (state === State.END || state === State.CANCELLED) {
      const progress = translationX / maxSlideDistance;

      if (progress > 0.75) {
        // Success - Complete the slide with enhanced feedback
        triggerHaptic("success");

        Animated.parallel([
          Animated.spring(slideX, {
            toValue: maxSlideDistance,
            useNativeDriver: true,
            tension: 200,
            friction: 8,
          }),
          Animated.timing(backgroundWidth, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
            easing: Easing.out(Easing.ease),
          }),
          Animated.timing(textOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(thumbScale, {
            toValue: 1.2,
            useNativeDriver: true,
            tension: 150,
            friction: 6,
          }),
          Animated.timing(glowIntensity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Navigate after animation completes
          setTimeout(() => {
            navigation?.navigate("AllSermons");
          }, 150);
        });
      } else {
        // Snap back with spring physics
        triggerHaptic("impactMedium");

        Animated.parallel([
          Animated.spring(slideX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 180,
            friction: 10,
            velocity: -translationX * 0.1,
          }),
          Animated.timing(backgroundWidth, {
            toValue: 0,
            duration: 400,
            useNativeDriver: false,
            easing: Easing.out(Easing.ease),
          }),
          Animated.spring(textOpacity, {
            toValue: 1,
            useNativeDriver: true,
            tension: 150,
            friction: 8,
          }),
          Animated.spring(thumbScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 200,
            friction: 8,
          }),
          Animated.timing(glowIntensity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(rippleScale, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  };

  // Enhanced interpolations for smoother animations
  const clampedSlideX = slideX.interpolate({
    inputRange: [0, maxSlideDistance],
    outputRange: [0, maxSlideDistance],
    extrapolate: "clamp",
  });

  const backgroundWidthInterpolate = backgroundWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [0, sliderWidth],
    extrapolate: "clamp",
  });

  const logoRotation = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-5deg", "0deg"],
  });

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-sliderWidth, sliderWidth],
  });

  const glowOpacity = glowIntensity.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  const rippleScaleInterpolate = rippleScale.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });

  const rippleOpacity = rippleScale.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.1, 0],
  });

  // if (!fontsLoaded) {
  //   return null; // Or a loading component
  // }

  return (
    <View style={styles.mainContainer}>
      <ImageBackground
        source={require("../../assets/cloud.png")}
        style={styles.backgroundImage}
        blurRadius={5}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            "rgba(28, 25, 23, 0.3)",
            "rgba(28, 25, 23, 0.5)",
            "rgba(28, 25, 23, 0.8)",
            "rgba(28, 25, 23, 0.95)",
          ]}
          style={styles.gradient}
        >
          <Animated.View
            style={[
              styles.container,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            {/* Logo Section */}
            {/* <Animated.View
              style={[
                styles.logoContainer,
                {
                  transform: [{ rotate: logoRotation }, { scale: scaleAnim }],
                },
              ]}
            >
              <View style={styles.logoWrapper}>
                <Image
                  source={require("../../assets/roundedLam.jpg")}
                  style={styles.logo}
                />
                <View style={styles.logoGlow} />
              </View>
            </Animated.View> */}

            {/* Content Section */}
            <Animated.View
              style={[
                styles.contentContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.title}>
                Transcribed and audio versions of{"\n"}
                <Text style={styles.titleHighlight}>Robert Lambert Lee</Text>
                {"\n"}
                sermons
              </Text>

              <View style={styles.subtitleContainer}>
                <View style={styles.divider} />
                <Text style={styles.subtitle}>1964 - 1973</Text>
                <View style={styles.divider} />
              </View>

              <Text style={styles.description}>
                My sheep know my voice, and I know them, and they follow me.
                {"\n"}
              </Text>
            </Animated.View>

            {/* Enhanced Slider Section with Glassmorphism */}
            <Animated.View
              style={[
                styles.sliderContainer,
                {
                  opacity: sliderOpacity,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Ripple Effect */}
              <Animated.View
                style={[
                  styles.rippleEffect,
                  {
                    transform: [{ scale: rippleScaleInterpolate }],
                    opacity: rippleOpacity,
                  },
                ]}
              />

              <View style={styles.sliderTrack}>
                {/* Enhanced Background with Gradient */}
                <Animated.View
                  style={[
                    styles.sliderBackground,
                    {
                      width: backgroundWidthInterpolate,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[
                      "rgba(230, 195, 184, 0.1)",
                      "rgba(230, 195, 184, 0.25)",
                      "rgba(230, 195, 184, 0.15)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.backgroundGradient}
                  />
                </Animated.View>

                {/* Shimmer Effect */}
                <Animated.View
                  style={[
                    styles.shimmerOverlay,
                    {
                      transform: [{ translateX: shimmerTranslate }],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[
                      "transparent",
                      "rgba(255, 255, 255, 0.1)",
                      "rgba(255, 255, 255, 0.2)",
                      "rgba(255, 255, 255, 0.1)",
                      "transparent",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.shimmerGradient}
                  />
                </Animated.View>

                {/* Enhanced Slide Text */}
                <Animated.Text
                  style={[
                    styles.sliderText,
                    {
                      opacity: textOpacity,
                    },
                  ]}
                >
                  Slide to enter
                </Animated.Text>

                {/* Enhanced Thumb with Glow */}
                <PanGestureHandler
                  onGestureEvent={onGestureEvent}
                  onHandlerStateChange={onHandlerStateChange}
                >
                  <Animated.View
                    style={[
                      styles.sliderThumb,
                      {
                        transform: [
                          { translateX: clampedSlideX },
                          { scale: thumbScale },
                        ],
                      },
                    ]}
                  >
                    {/* Glow Effect */}
                    <Animated.View
                      style={[
                        styles.thumbGlow,
                        {
                          opacity: glowOpacity,
                        },
                      ]}
                    />

                    <Image
                      source={require("../../assets/pyramid.png")}
                      style={styles.thumbImage}
                      resizeMode="contain"
                    />
                  </Animated.View>
                </PanGestureHandler>
              </View>

              {/* Instruction Text */}
              <Text style={styles.instructionText}>
                Swipe right to begin your journey
              </Text>
            </Animated.View>
          </Animated.View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#1c1917",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl * 2,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logoWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    height: verticalScale(80),
    width: horizontalScale(80),
    borderRadius: horizontalScale(40),
    borderWidth: 3,
    borderColor: "rgba(230, 195, 184, 0.3)",
  },
  logoGlow: {
    position: "absolute",
    height: verticalScale(80),
    width: horizontalScale(80),
    borderRadius: horizontalScale(40),
    backgroundColor: "rgba(230, 195, 184, 0.1)",
    shadowColor: "#e6c3b8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: horizontalScale(10),
    elevation: 8,
  },
  contentContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    maxWidth: "90%",
  },
  title: {
    fontFamily: "ZillaSlab-Regular",
    fontSize: responsiveFontSize(22),
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "300",
    lineHeight: responsiveFontSize(28),
    marginBottom: spacing.xl,
  },
  titleHighlight: {
    color: "#e6c3b8",
    fontWeight: "400",
    fontSize: responsiveFontSize(24),
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  divider: {
    height: 1,
    width: horizontalScale(40),
    backgroundColor: "rgba(180, 175, 175, 0.5)",
    marginHorizontal: spacing.md,
  },
  subtitle: {
    fontFamily: "ZillaSlab-Regular",
    fontSize: responsiveFontSize(18),
    color: "#b4afaf",
    fontWeight: "300",
    letterSpacing: 2,
  },
  description: {
    fontFamily: "ZillaSlab-Regular",
    fontSize: responsiveFontSize(14),
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: responsiveFontSize(20),
    fontWeight: "200",
    fontStyle: "italic",
    marginTop: spacing.md,
  },
  sliderContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
    position: "relative",
  },
  rippleEffect: {
    position: "absolute",
    width: horizontalScale(300),
    height: horizontalScale(300),
    borderRadius: horizontalScale(150),
    backgroundColor: "rgba(230, 195, 184, 0.1)",
    zIndex: 0,
  },
  sliderTrack: {
    width: horizontalScale(280),
    height: verticalScale(64),
    borderRadius: horizontalScale(32),
    borderWidth: 1.5,
    borderColor: "rgba(230, 195, 184, 0.25)",
    backgroundColor: "rgba(28, 25, 23, 0.4)",
    backdropFilter: "blur(10px)",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1,
  },
  sliderBackground: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    borderRadius: horizontalScale(32),
    overflow: "hidden",
  },
  backgroundGradient: {
    flex: 1,
    borderRadius: horizontalScale(32),
  },
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: -horizontalScale(100),
    right: -horizontalScale(100),
    height: "100%",
    zIndex: 1,
  },
  shimmerGradient: {
    flex: 1,
    width: horizontalScale(100),
  },
  sliderText: {
    fontFamily: "ZillaSlab-Regular",
    fontSize: responsiveFontSize(15),
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "400",
    letterSpacing: 1.2,
    position: "absolute",
    zIndex: 2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sliderThumb: {
    position: "absolute",
    left: horizontalScale(4),
    width: horizontalScale(56),
    height: verticalScale(56),
    borderRadius: horizontalScale(28),
    zIndex: 3,
    shadowColor: "#e6c3b8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: horizontalScale(8),
    elevation: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbGlow: {
    position: "absolute",
    top: -horizontalScale(4),
    left: -horizontalScale(4),
    right: -horizontalScale(4),
    bottom: -horizontalScale(4),
    borderRadius: horizontalScale(32),
    backgroundColor: "rgba(230, 195, 184, 0.3)",
    shadowColor: "#e6c3b8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: horizontalScale(12),
    elevation: 8,
  },
  thumbImage: {
    width: horizontalScale(56),
    height: verticalScale(56),
    borderRadius: horizontalScale(28),
    borderWidth: 2,
    borderColor: "rgba(230, 195, 184, 0.4)",
    opacity: 0.95,
  },
  instructionText: {
    fontFamily: "ZillaSlab-Regular",
    fontSize: responsiveFontSize(12),
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "300",
    letterSpacing: 0.8,
    marginTop: spacing.md,
    textAlign: "center",
    fontStyle: "italic",
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginBottom: spacing.xs,
  },
  buttonText: {
    fontFamily: "ZillaSlab-Regular",
    color: "#e6c3b8",
    fontSize: responsiveFontSize(14),
    fontWeight: "300",
    letterSpacing: 1,
  },
  buttonRipple: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: horizontalScale(60),
    backgroundColor: "rgba(230, 195, 184, 0.1)",
    opacity: 0,
  },
});

export default Welcome;
