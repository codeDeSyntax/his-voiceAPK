import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const SkeletonLoader = ({ theme, count = 10 }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  const SkeletonItem = () => (
    <View
      style={[
        styles.skeletonItem,
        {
          backgroundColor: theme.dark
            ? "rgba(242, 205, 180, 0.05)"
            : "rgba(93, 50, 17, 0.03)",
          borderColor: theme.dark
            ? "rgba(242, 205, 180, 0.1)"
            : "rgba(93, 50, 17, 0.08)",
        },
      ]}
    >
      <View style={styles.skeletonContent}>
        {/* Title skeleton */}
        <View style={styles.skeletonTextContainer}>
          <View
            style={[
              styles.skeletonText,
              styles.skeletonTitle,
              {
                backgroundColor: theme.dark
                  ? "rgba(242, 205, 180, 0.1)"
                  : "rgba(93, 50, 17, 0.08)",
              },
            ]}
          >
            <Animated.View
              style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}
            >
              <LinearGradient
                colors={
                  theme.dark
                    ? [
                        "transparent",
                        "rgba(242, 205, 180, 0.15)",
                        "transparent",
                      ]
                    : ["transparent", "rgba(93, 50, 17, 0.12)", "transparent"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
        </View>

        {/* Metadata skeleton */}
        <View style={styles.skeletonMetadata}>
          <View
            style={[
              styles.skeletonText,
              styles.skeletonDate,
              {
                backgroundColor: theme.dark
                  ? "rgba(242, 205, 180, 0.08)"
                  : "rgba(93, 50, 17, 0.06)",
              },
            ]}
          >
            <Animated.View
              style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}
            >
              <LinearGradient
                colors={
                  theme.dark
                    ? [
                        "transparent",
                        "rgba(242, 205, 180, 0.12)",
                        "transparent",
                      ]
                    : ["transparent", "rgba(93, 50, 17, 0.1)", "transparent"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>

          <View
            style={[
              styles.skeletonText,
              styles.skeletonType,
              {
                backgroundColor: theme.dark
                  ? "rgba(242, 205, 180, 0.08)"
                  : "rgba(93, 50, 17, 0.06)",
              },
            ]}
          >
            <Animated.View
              style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}
            >
              <LinearGradient
                colors={
                  theme.dark
                    ? [
                        "transparent",
                        "rgba(242, 205, 180, 0.12)",
                        "transparent",
                      ]
                    : ["transparent", "rgba(93, 50, 17, 0.1)", "transparent"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonItem key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  skeletonItem: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  skeletonContent: {
    gap: 12,
  },
  skeletonTextContainer: {
    gap: 8,
  },
  skeletonText: {
    borderRadius: 6,
    overflow: "hidden",
  },
  skeletonTitle: {
    height: 20,
    width: "80%",
  },
  skeletonMetadata: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  skeletonDate: {
    height: 14,
    width: 100,
  },
  skeletonType: {
    height: 14,
    width: 60,
  },
});

export default SkeletonLoader;
