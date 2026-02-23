import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Easing,
  ScrollView,
  Dimensions,
} from "react-native";
import { useAppContext } from "../Logic/globalState";
import { responsiveFontSize, spacing } from "../Utils/responsiveUtils";

const SCREEN_WIDTH = Dimensions.get("window").width;

const LoadingScreen = ({ message = "Loading..." }) => {
  const { theme } = useAppContext();
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start entrance animation
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.primary,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Enhanced loading indicator */}
      <ActivityIndicator
        size="large"
        color={theme.colors.text}
        style={styles.loader}
      />

      {/* Loading Text */}
      <Text style={[styles.loadingText, { color: theme.colors.text }]}>
        {message}
      </Text>
    </Animated.View>
  );
};

// New Skeleton Loader Component for Sermon Content
const SermonSkeletonLoader = ({ message = "Loading sermon..." }) => {
  const { theme } = useAppContext();

  // Animation values for shimmer effect
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeInAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Continuous shimmer animation
    const createShimmerAnimation = () => {
      return Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        }),
      ]);
    };

    const shimmerLoop = Animated.loop(createShimmerAnimation());
    shimmerLoop.start();

    return () => shimmerLoop.stop();
  }, []);

  // Shimmer interpolation
  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.6],
  });

  // Skeleton line component
  const SkeletonLine = ({ width = "100%", height = 14, marginBottom = 4 }) => (
    <Animated.View
      style={[
        styles.skeletonLine,
        {
          width,
          height,
          marginBottom,
          backgroundColor: theme.dark
            ? "rgba(255, 255, 255, 0.08)"
            : "rgba(0, 0, 0, 0.1)",
          opacity: shimmerOpacity,
        },
      ]}
    />
  );

  // Compact paragraph component that mimics actual sermon text
  const SkeletonParagraph = ({ paragraphNumber, lines = 3 }) => (
    <View style={styles.skeletonParagraphContainer}>
      {/* Paragraph number - compact and realistic */}
      <View style={styles.skeletonParagraphNumber}>
        <SkeletonLine width={24} height={12} marginBottom={0} />
      </View>

      {/* Paragraph text lines - more realistic spacing */}
      <View style={styles.skeletonParagraphText}>
        {Array.from({ length: lines }).map((_, index) => {
          // Vary line widths to simulate real text
          const lineWidths = ["100%", "95%", "88%", "92%", "78%"];
          const width =
            index === lines - 1
              ? lineWidths[Math.floor(Math.random() * 2) + 3] // Last line shorter
              : lineWidths[Math.floor(Math.random() * 3)];

          return (
            <SkeletonLine
              key={index}
              width={width}
              height={13}
              marginBottom={3}
            />
          );
        })}
      </View>
    </View>
  );

  return (
    <Animated.View
      style={[
        styles.skeletonContainer,
        {
          backgroundColor: theme.colors.background,
          opacity: fadeInAnim,
        },
      ]}
    >
      <ScrollView
        style={styles.skeletonScrollView}
        contentContainerStyle={styles.skeletonContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Compact header skeleton */}
        <View style={styles.skeletonHeader}>
          <SkeletonLine width="70%" height={18} marginBottom={6} />
          <SkeletonLine width="45%" height={13} marginBottom={4} />
          <View style={styles.skeletonDivider}>
            <SkeletonLine width="100%" height={0.5} marginBottom={12} />
          </View>
        </View>

        {/* Realistic paragraph skeletons - more compact and sermon-like */}
        {Array.from({ length: 12 }).map((_, index) => (
          <SkeletonParagraph
            key={index}
            paragraphNumber={index + 1}
            lines={Math.floor(Math.random() * 2) + 2} // 2-3 lines per paragraph
          />
        ))}

        {/* Compact loading message */}
        <View style={styles.skeletonMessage}>
          <SkeletonLine width="50%" height={12} marginBottom={8} />
          <Text
            style={[styles.skeletonMessageText, { color: theme.colors.text }]}
          >
            {message}
          </Text>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

// Audio page skeleton loader
const AudioSkeletonLoader = () => {
  const { theme } = useAppContext();

  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeInAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        }),
      ]),
    );
    shimmerLoop.start();
    return () => shimmerLoop.stop();
  }, []);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.5],
  });

  const skeletonBg = theme.dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";

  const Block = ({ style }) => (
    <Animated.View
      style={[
        {
          borderRadius: 6,
          backgroundColor: skeletonBg,
          opacity: shimmerOpacity,
        },
        style,
      ]}
    />
  );

  const ARTWORK_SIZE = SCREEN_WIDTH * 0.52;

  return (
    <Animated.View
      style={[
        audioSkeletonStyles.root,
        { backgroundColor: theme.colors.background, opacity: fadeInAnim },
      ]}
    >
      {/* Artwork circle */}
      <Block
        style={{
          width: ARTWORK_SIZE,
          height: ARTWORK_SIZE,
          borderRadius: ARTWORK_SIZE / 2,
          alignSelf: "center",
          marginBottom: 32,
        }}
      />

      {/* Title lines */}
      <Block
        style={{
          height: 20,
          width: "60%",
          alignSelf: "center",
          marginBottom: 10,
          borderRadius: 4,
        }}
      />
      <Block
        style={{
          height: 14,
          width: "40%",
          alignSelf: "center",
          marginBottom: 32,
          borderRadius: 4,
        }}
      />

      {/* Slider */}
      <Block
        style={{
          height: 4,
          width: "88%",
          alignSelf: "center",
          borderRadius: 2,
          marginBottom: 8,
        }}
      />

      {/* Time stamps */}
      <View style={audioSkeletonStyles.timeRow}>
        <Block style={{ height: 11, width: 32, borderRadius: 3 }} />
        <Block style={{ height: 11, width: 32, borderRadius: 3 }} />
      </View>

      {/* Controls row: skip | play circle | skip */}
      <View style={audioSkeletonStyles.controls}>
        <Block style={{ width: 36, height: 36, borderRadius: 18 }} />
        <Block style={{ width: 64, height: 64, borderRadius: 32 }} />
        <Block style={{ width: 36, height: 36, borderRadius: 18 }} />
      </View>

      {/* Status pill */}
      <Block
        style={{
          height: 28,
          width: 96,
          borderRadius: 14,
          alignSelf: "center",
          marginTop: 28,
        }}
      />
    </Animated.View>
  );
};

const audioSkeletonStyles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: "6%",
    marginBottom: 36,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 36,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  loader: {
    marginBottom: spacing.lg,
  },
  loadingText: {
    fontSize: responsiveFontSize(16),
    fontFamily: "serif",
    fontWeight: "300",
    letterSpacing: 1.2,
    textAlign: "center",
    opacity: 0.8,
  },

  // Skeleton styles
  skeletonContainer: {
    flex: 1,
  },
  skeletonScrollView: {
    flex: 1,
  },
  skeletonContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  skeletonHeader: {
    marginBottom: 16,
    alignItems: "center",
  },
  skeletonDivider: {
    width: "100%",
  },
  skeletonParagraphContainer: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  skeletonParagraphNumber: {
    width: 32,
    marginRight: 8,
    alignItems: "flex-start",
    paddingTop: 1,
  },
  skeletonParagraphText: {
    flex: 1,
    paddingRight: 4,
  },
  skeletonParagraph: {
    flex: 1,
  },
  skeletonLine: {
    borderRadius: 2,
  },
  skeletonMessage: {
    alignItems: "center",
    marginTop: 24,
    paddingVertical: 16,
  },
  skeletonMessageText: {
    fontSize: responsiveFontSize(12),
    fontFamily: "serif",
    opacity: 0.5,
    textAlign: "center",
    fontWeight: "300",
    letterSpacing: 0.3,
  },
});

export default LoadingScreen;
export { SermonSkeletonLoader, AudioSkeletonLoader };
