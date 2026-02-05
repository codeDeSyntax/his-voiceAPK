import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { WebView } from "react-native-webview";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { useAppContext } from "../Logic/globalState";
import Icon from "react-native-vector-icons/Ionicons";
import DraggableFloatingButton from "../components/FloatButton";

const { width, height } = Dimensions.get("window");

// Sleek Minimalist Loader Component
const MinimalLoader = React.memo(({ theme }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Smooth entrance
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Gentle spin animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }),
    );

    // Subtle pulse
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );

    spinAnimation.start();
    pulseAnimation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const pulseOpacity = pulseValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });
  const isDark = theme?.dark || theme?.name === "dark";

  return (
    <Animated.View
      style={[
        styles.loaderContainer,
        {
          opacity: fadeValue,
          backgroundColor: isDark
            ? "rgba(28, 25, 23, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
        },
      ]}
    >
      <View style={styles.loaderContent}>
        <Animated.View
          style={[
            styles.loaderRing,
            {
              borderColor: theme?.colors?.hlight || "#d57a3e",
              borderBottomColor: isDark
                ? "rgba(213, 122, 62, 0.3)"
                : "rgba(213, 122, 62, 0.2)",
              borderLeftColor: isDark
                ? "rgba(213, 122, 62, 0.3)"
                : "rgba(213, 122, 62, 0.2)",
              transform: [{ rotate: spin }],
              opacity: pulseOpacity,
            },
          ]}
        >
          <View style={styles.loaderInner}>
            <Icon
              name="musical-notes"
              size={24}
              color={theme?.colors?.text || "#1c1917"}
            />
          </View>
        </Animated.View>

        <Animated.View
          style={[styles.loadingTextContainer, { opacity: pulseOpacity }]}
        >
          <Text
            style={[
              styles.loadingText,
              { color: theme?.colors?.text || "#1c1917" },
            ]}
          >
            Loading audio...
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
});

// Clean Error State Component
const CleanErrorState = React.memo(({ onRetry, theme }) => {
  const fadeValue = useRef(new Animated.Value(0)).current;
  const slideValue = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideValue, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isDark = theme?.dark || theme?.name === "dark";

  return (
    <Animated.View
      style={[
        styles.errorContainer,
        {
          opacity: fadeValue,
          transform: [{ translateY: slideValue }],
          backgroundColor: isDark
            ? "rgba(28, 25, 23, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
        },
      ]}
    >
      <View
        style={[
          styles.errorContent,
          {
            backgroundColor: isDark
              ? "rgba(39, 35, 32, 0.9)"
              : "rgba(255, 255, 255, 0.9)",
            borderWidth: isDark ? 1 : 0,
            borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "transparent",
          },
        ]}
      >
        <View
          style={[
            styles.errorIconContainer,
            {
              backgroundColor: isDark
                ? "rgba(28, 25, 23, 0.8)"
                : theme?.colors?.background || "#fafafa",
            },
          ]}
        >
          <Icon
            name="wifi-off"
            size={40}
            color={isDark ? "#ef4444" : theme?.colors?.text || "#1c1917"}
          />
        </View>

        <Text
          style={[
            styles.errorTitle,
            { color: theme?.colors?.text || "#1c1917" },
          ]}
        >
          Connection Issue
        </Text>

        <Text
          style={[
            styles.errorMessage,
            {
              color: theme?.colors?.text || "#1c1917",
              opacity: isDark ? 0.8 : 0.7,
            },
          ]}
        >
          Unable to load sermon audio. Check your connection and try again.
        </Text>

        <TouchableOpacity
          style={[
            styles.retryButton,
            {
              backgroundColor: theme?.colors?.hlight || "#d57a3e",
              ...Platform.select({
                ios: {
                  shadowColor: isDark ? "#000" : "#000",
                  shadowOffset: { width: 0, height: isDark ? 4 : 2 },
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: isDark ? 6 : 4,
                },
                android: {
                  elevation: isDark ? 4 : 2,
                },
              }),
            },
          ]}
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <Icon
            name="refresh"
            size={18}
            color="#FFFFFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});

export default function SermonAudioWebScreen() {
  const { selectedSermon, theme } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [key, setKey] = useState(0);
  const [progress, setProgress] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Safety check to prevent rendering without proper data
  if (!theme) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>Loading...</Text>
      </View>
    );
  }

  // Enhanced error handling for selectedSermon
  const audioUrl = selectedSermon?.audioUrl;
  const hasValidUrl =
    audioUrl && typeof audioUrl === "string" && audioUrl.trim() !== "";
  const isDark = theme?.dark || theme?.name === "dark";

  // Memoized handlers for better performance
  const handleLoadStart = useCallback(() => {
    setLoading(true);
    setError(false);
    setProgress(0);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
    setProgress(100);
    // Smooth fade in of WebView
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleLoadProgress = useCallback(({ nativeEvent }) => {
    if (nativeEvent?.progress !== undefined) {
      const progressValue = nativeEvent.progress * 100;
      setProgress(Math.max(0, Math.min(100, progressValue)));
    }
  }, []);

  const handleError = useCallback((syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn("WebView error: ", nativeEvent);
    setLoading(false);
    setError(true);
  }, []);

  const handleRetry = useCallback(() => {
    setError(false);
    setLoading(true);
    setProgress(0);
    setKey((prev) => prev + 1);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Memoized WebView props for optimization
  const webViewProps = useMemo(() => {
    if (!hasValidUrl) {
      return {
        key,
        source: { uri: "about:blank" },
        javaScriptEnabled: false,
      };
    }

    return {
      key,
      source: { uri: audioUrl },
      javaScriptEnabled: true,
      domStorageEnabled: true,
      onLoadStart: handleLoadStart,
      onLoadEnd: handleLoadEnd,
      onLoadProgress: handleLoadProgress,
      onError: handleError,
      onHttpError: handleError,
      startInLoadingState: false,
      mixedContentMode: "compatibility",
      allowsInlineMediaPlayback: true,
      mediaPlaybackRequiresUserAction: false,
      allowsBackForwardNavigationGestures: false,
      bounces: false,
      scrollEnabled: true,
      showsHorizontalScrollIndicator: false,
      showsVerticalScrollIndicator: false,
      decelerationRate: 0.998,
      cacheEnabled: true,
      cacheMode: "LOAD_CACHE_ELSE_NETWORK",
      // Performance optimizations
      androidHardwareAccelerationDisabled: false,
      androidLayerType: "hardware",
      renderToHardwareTextureAndroid: true,
      removeClippedSubviews: true,
    };
  }, [
    key,
    hasValidUrl,
    audioUrl,
    handleLoadStart,
    handleLoadEnd,
    handleLoadProgress,
    handleError,
  ]);

  const containerStyle = useMemo(
    () => [
      styles.container,
      {
        backgroundColor: theme?.colors?.background || "#fafafa",
      },
    ],
    [theme?.colors?.background],
  );

  const webViewStyle = useMemo(
    () => [
      styles.webview,
      {
        opacity: fadeAnim,
        backgroundColor: isDark ? "#1c1917" : "transparent",
      },
    ],
    [fadeAnim, isDark],
  );

  // Render immersive full-screen experience
  return (
    <View style={containerStyle}>
      <StatusBar
        backgroundColor={theme?.colors?.background || "#fafafa"}
        barStyle={isDark ? "light-content" : "dark-content"}
        translucent={false}
      />

      <DraggableFloatingButton />

      {/* Subtle progress indicator */}
      {loading && !error && (
        <View
          style={[
            styles.progressContainer,
            {
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.05)",
            },
          ]}
        >
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: `${Math.max(0, Math.min(100, progress || 0))}%`,
                backgroundColor: theme?.colors?.hlight || "#d57a3e",
                boxShadow: isDark ? "0 0 4px rgba(213, 122, 62, 0.3)" : "none",
              },
            ]}
          />
        </View>
      )}

      {/* Main content area */}
      {hasValidUrl ? (
        <Animated.View style={webViewStyle}>
          <WebView {...webViewProps} />
        </Animated.View>
      ) : (
        <View
          style={[
            styles.noSermonContainer,
            {
              backgroundColor: isDark ? "rgba(28, 25, 23, 0.3)" : "transparent",
            },
          ]}
        >
          <View
            style={[
              styles.noSermonIconContainer,
              {
                backgroundColor: isDark
                  ? "rgba(39, 35, 32, 0.7)"
                  : "rgba(255, 255, 255, 0.8)",
                borderWidth: isDark ? 1 : 0,
                borderColor: isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "transparent",
              },
            ]}
          >
            <Icon
              name="musical-notes-outline"
              size={48}
              color={theme?.colors?.text || "#1c1917"}
              style={{ opacity: isDark ? 0.6 : 0.3 }}
            />
          </View>
          <Text
            style={[
              styles.noSermonText,
              {
                color: theme?.colors?.text || "#1c1917",
                opacity: isDark ? 0.8 : 0.7,
              },
            ]}
          >
            {selectedSermon
              ? "No audio available for this sermon"
              : "Please select a sermon to play"}
          </Text>
        </View>
      )}

      {/* Overlay states */}
      {loading && !error && <MinimalLoader theme={theme} />}
      {error && <CleanErrorState onRetry={handleRetry} theme={theme} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackText: {
    fontSize: 16,
    color: "#666",
  },
  progressContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(0,0,0,0.05)",
    zIndex: 1000,
  },
  progressBar: {
    height: "100%",
    borderRadius: 1,
  },
  noSermonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  noSermonIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  noSermonText: {
    fontSize: 16,
    fontFamily: "serif",
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.7,
  },

  // Minimalist Loader Styles
  loaderContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loaderContent: {
    alignItems: "center",
  },
  loaderRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderTopColor: "transparent",
    borderRightColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loaderInner: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingTextContainer: {
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "serif",
    textAlign: "center",
  },

  // Clean Error State Styles
  errorContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    zIndex: 999,
  },
  errorContent: {
    alignItems: "center",
    maxWidth: width * 0.8,
    borderRadius: 16,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "serif",
  },
  errorMessage: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.7,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});
