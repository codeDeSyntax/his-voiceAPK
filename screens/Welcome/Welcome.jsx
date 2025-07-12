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

const Welcome = () => {
  const navigation = useNavigation();
  const { theme } = useAppContext();
  const [fontsLoaded] = useFonts({
    "ZillaSlab-Regular": require("../../assets/fonts/ZillaSlab-Regular.ttf"),
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const buttonPulseAnim = useRef(new Animated.Value(1)).current;

  // Slider animation values
  const slideX = useRef(new Animated.Value(0)).current;
  const sliderOpacity = useRef(new Animated.Value(0.8)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const backgroundWidth = useRef(new Animated.Value(0)).current;

  const sliderWidth = horizontalScale(250);
  const thumbSize = horizontalScale(50);
  const maxSlideDistance = sliderWidth - thumbSize - 8; // 8 for padding

  // Reset slider to initial state
  const resetSlider = () => {
    slideX.setValue(0);
    backgroundWidth.setValue(0);
    textOpacity.setValue(1);
    sliderOpacity.setValue(0.8);
  };

  // Reset slider when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      resetSlider();
    }, [])
  );

  // Reset slider position when component mounts
  useEffect(() => {
    // Reset all slider-related animations to initial state
    resetSlider();

    // Reset entrance animations
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.8);
    logoRotateAnim.setValue(0);

    // Staggered entrance animations
    Animated.sequence([
      // Logo entrance with rotation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(logoRotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.2)),
        }),
      ]),
      // Content slide up and scale in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]),
    ]).start();

    // Button pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(sliderOpacity, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(sliderOpacity, {
          toValue: 0.8,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );

    // Start pulse animation after initial animations
    setTimeout(() => {
      pulseAnimation.start();
    }, 1500);

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: slideX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;

      if (translationX > maxSlideDistance * 0.7) {
        // Complete the slide animation
        Animated.parallel([
          Animated.timing(slideX, {
            toValue: maxSlideDistance,
            duration: 200,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
          Animated.timing(backgroundWidth, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(textOpacity, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Navigate after animation completes
          setTimeout(() => {
            navigation?.navigate("AllSermons");
          }, 100);
        });
      } else {
        // Snap back to start
        Animated.parallel([
          Animated.spring(slideX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.timing(backgroundWidth, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  };

  const clampedSlideX = slideX.interpolate({
    inputRange: [0, maxSlideDistance],
    outputRange: [0, maxSlideDistance],
    extrapolate: "clamp",
  });

  const backgroundWidthInterpolate = backgroundWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [0, sliderWidth],
  });

  const logoRotation = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-10deg", "0deg"],
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

            {/* Slider Section */}
            <Animated.View
              style={[
                styles.sliderContainer,
                {
                  opacity: sliderOpacity,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.sliderTrack}>
                <Animated.View
                  style={[
                    styles.sliderBackground,
                    {
                      width: backgroundWidthInterpolate,
                    },
                  ]}
                />
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
                <PanGestureHandler
                  onGestureEvent={onGestureEvent}
                  onHandlerStateChange={onHandlerStateChange}
                >
                  <Animated.View
                    style={[
                      styles.sliderThumb,
                      {
                        transform: [{ translateX: clampedSlideX }],
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(230, 195, 184, 0.9)",
                        "rgba(230, 195, 184, 0.7)",
                        "rgba(230, 195, 184, 0.9)",
                      ]}
                      style={styles.thumbGradient}
                    >
                      <Ionicons
                        name="arrow-forward"
                        size={responsiveFontSize(20)}
                        color="rgba(28, 25, 23, 0.8)"
                      />
                    </LinearGradient>
                  </Animated.View>
                </PanGestureHandler>
              </View>
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
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  sliderContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  sliderTrack: {
    width: horizontalScale(250),
    height: verticalScale(60),
    borderRadius: horizontalScale(30),
    borderWidth: 2,
    borderColor: "rgba(230, 195, 184, 0.3)",
    backgroundColor: "rgba(28, 25, 23, 0.4)",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  sliderBackground: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    backgroundColor: "rgba(230, 195, 184, 0.15)",
    borderRadius: horizontalScale(30),
  },
  sliderText: {
    fontFamily: "ZillaSlab-Regular",
    fontSize: responsiveFontSize(14),
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "300",
    letterSpacing: 1,
    position: "absolute",
    zIndex: 1,
  },
  sliderThumb: {
    position: "absolute",
    left: 4,
    width: horizontalScale(50),
    height: verticalScale(50),
    borderRadius: horizontalScale(25),
    zIndex: 2,
    shadowColor: "#e6c3b8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: horizontalScale(4),
    elevation: 5,
  },
  thumbGradient: {
    flex: 1,
    borderRadius: horizontalScale(25),
    justifyContent: "center",
    alignItems: "center",
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
