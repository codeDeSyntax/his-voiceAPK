import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Dimensions,
  Easing,
} from "react-native";

const { width } = Dimensions.get("window");

const DOT_COUNT = 3;
const DOT_SIZE = 8;

const Dot = ({ delay }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(DOT_COUNT * 200 - delay),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });

  return (
    <Animated.View
      style={[
        styles.dot,
        { transform: [{ scale }], opacity },
      ]}
    />
  );
};

const LoaderScreen = () => {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeIn, transform: [{ translateY: slideUp }] },
        ]}
      >
        {/* Decorative line */}
        <View style={styles.line} />

        {/* Title */}
        <Text style={styles.title}>His Voice</Text>
        <Text style={styles.subtitle}>Robert Lambert Lee</Text>

        {/* Another decorative line */}
        <View style={styles.line} />

        {/* Animated dots */}
        <View style={styles.dotsRow}>
          {Array.from({ length: DOT_COUNT }).map((_, i) => (
            <Dot key={i} delay={i * 200} />
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a130e",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    gap: 16,
  },
  line: {
    width: 48,
    height: 1,
    backgroundColor: "#7a5230",
    borderRadius: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: "300",
    letterSpacing: 8,
    color: "#f2cdb4",
    textTransform: "uppercase",
    marginTop: 4,
  },
  subtitle: {
    fontSize: 13,
    letterSpacing: 3,
    color: "#7a5230",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: "#d57a3e",
  },
});

export default LoaderScreen;
