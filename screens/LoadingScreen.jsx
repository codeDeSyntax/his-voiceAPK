import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Animated, Easing } from "react-native";

const SPINNER_SIZE = 48;
const DASH_COUNT = 12;

const LoaderScreen = () => {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.spinner, { transform: [{ rotate }] }]}>
        {Array.from({ length: DASH_COUNT }).map((_, i) => {
          const angle = (i / DASH_COUNT) * 360;
          const opacity = 0.15 + (i / DASH_COUNT) * 0.85;
          return (
            <View
              key={i}
              style={[
                styles.dash,
                {
                  opacity,
                  transform: [
                    { rotate: `${angle}deg` },
                    { translateY: -(SPINNER_SIZE / 2) },
                  ],
                },
              ]}
            />
          );
        })}
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
  spinner: {
    width: SPINNER_SIZE,
    height: SPINNER_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  dash: {
    position: "absolute",
    width: 2.5,
    height: 10,
    borderRadius: 2,
    backgroundColor: "#d57a3e",
  },
});

export default LoaderScreen;
