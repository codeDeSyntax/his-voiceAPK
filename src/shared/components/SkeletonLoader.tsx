import { useState } from "react";
import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { AppTheme } from "../theme/types";
import type { StyleProp, ViewStyle } from "react-native";

interface SkeletonLoaderProps { theme: AppTheme; count?: number }
const SkeletonLoader = ({ theme, count = 10 }: SkeletonLoaderProps) => {
  const animatedValue = useState(() => new Animated.Value(0))[0];

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

  const shimmer = (
    <Animated.View
      style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}
    >
      <LinearGradient
        colors={
          theme.dark
            ? ["transparent", "rgba(242, 205, 180, 0.14)", "transparent"]
            : ["transparent", "rgba(93, 50, 17, 0.11)", "transparent"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );

  const blockColor = theme.dark
    ? "rgba(242, 205, 180, 0.09)"
    : "rgba(93, 50, 17, 0.065)";
  const faintBlockColor = theme.dark
    ? "rgba(242, 205, 180, 0.065)"
    : "rgba(93, 50, 17, 0.045)";
  const separatorColor = theme.dark
    ? "rgba(242, 205, 180, 0.10)"
    : "rgba(93, 50, 17, 0.15)";

  

  

  const SkeletonBlock = ({ style, faint = false }: { style?: StyleProp<ViewStyle>; faint?: boolean }) => (
    <View
      style={[
        styles.skeletonBlock,
        { backgroundColor: faint ? faintBlockColor : blockColor },
        style,
      ]}
    >
      {shimmer}
    </View>
  );

const SkeletonItem = ({ index }: { index: number }) => (
    <View
      style={[
        styles.skeletonItem,
        {
          backgroundColor:
            index % 2 === 0
              ? theme.dark
                ? "rgba(242, 205, 180, 0.02)"
                : "rgba(93, 50, 17, 0.02)"
              : "transparent",
        },
      ]}
    >
      <View style={styles.skeletonRow}>
        <SkeletonBlock style={styles.skeletonIcon} />

        <View style={styles.skeletonTextContainer}>
          <SkeletonBlock
            style={[
              styles.skeletonTitle,
              { width: `${index % 3 === 0 ? 78 : index % 3 === 1 ? 88 : 68}%` },
            ]}
          />
          <View style={styles.skeletonMetadata}>
            <SkeletonBlock style={styles.skeletonDate} faint />
            <SkeletonBlock
              style={[
                styles.skeletonLocation,
                { width: index % 2 === 0 ? 92 : 118 },
              ]}
              faint
            />
            <SkeletonBlock style={styles.skeletonType} faint />
          </View>
        </View>
      </View>
      <View
        style={[
          styles.skeletonSeparator,
          { backgroundColor: separatorColor },
        ]}
      />
    </View>
  );

return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonItem      key={index} index={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 6,
  },
  skeletonItem: {
    marginHorizontal: 8,
    paddingVertical: 3,
    paddingHorizontal: 12,
    overflow: "hidden",
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  skeletonTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  skeletonBlock: {
    borderRadius: 8,
    overflow: "hidden",
  },
  skeletonIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 8,
  },
  skeletonTitle: {
    height: 14,
    marginBottom: 6,
  },
  skeletonMetadata: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  skeletonDate: {
    height: 10,
    width: 82,
  },
  skeletonLocation: {
    height: 10,
  },
  skeletonType: {
    height: 16,
    width: 42,
    borderRadius: 999,
  },
  skeletonSeparator: {
    height: 0.8,
    marginHorizontal: 12,
    marginLeft: 56,
    marginTop: 3,
  },
});

export default SkeletonLoader;



