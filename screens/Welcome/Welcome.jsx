import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Platform,
  Vibration,
  ActivityIndicator,
} from "react-native";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAppContext } from "../../Logic/globalState";
import {
  responsiveFontSize,
  horizontalScale,
  verticalScale,
  spacing,
} from "../../Utils/responsiveUtils";
import {
  downloadDatabaseFromGitHub,
  databaseExists,
} from "../../database/downloadDatabase";
import { forceStopIndexing, closeDatabase } from "../../database/sermonDB";
import * as Updates from "expo-updates";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const Welcome = () => {
  const navigation = useNavigation();
  const { theme, allSermons } = useAppContext();
  const [fontsLoaded] = useFonts({
    "ZillaSlab-Regular": require("../../assets/fonts/ZillaSlab-Regular.ttf"),
    "ZillaSlab-SemiBold": require("../../assets/fonts/ZillaSlab-SemiBold.ttf"),
    Merriweather: require("../../assets/fonts/Merriweather-VariableFont_opsz,wdth,wght.ttf"),
    Philosopher: require("../../assets/fonts/Philosopher-Regular.ttf"),
  });

  // Download state
  const [dbExists, setDbExists] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadError, setDownloadError] = useState(null);

  // Check if database exists on mount
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const exists = await databaseExists();
        setDbExists(exists);
      } catch (error) {
        console.error("Error checking database:", error);
      }
    };
    checkDatabase();
  }, []);

  // Re-check when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const hasLoadedSermons = allSermons && allSermons.length > 0;
      setDbExists(hasLoadedSermons);
      setIsDownloading(false);
      setDownloadProgress(0);
      setDownloadError(null);
    }, [allSermons]),
  );

  // Navigate to sermon list
  const navigateToMainScreen = () => {
    navigation?.navigate("AllSermons");
  };

  // Handle database download
  const handleDownloadDatabase = async () => {
    try {
      setIsDownloading(true);
      setDownloadError(null);
      setDownloadProgress(0);

      if (allSermons.length > 0) {
        forceStopIndexing();
        try {
          await closeDatabase();
        } catch (closeError) {
          console.warn("Error closing database:", closeError.message);
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      const result = await downloadDatabaseFromGitHub((percentage) => {
        setDownloadProgress(percentage);
      });

      if (result.success) {
        setDownloadProgress(100);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        try {
          await Updates.reloadAsync();
        } catch (restartError) {
          try {
            const { DevSettings } = require("react-native");
            DevSettings.reload();
          } catch (devError) {
            setDownloadError(
              "Download complete! Please close and reopen the app.",
            );
            setIsDownloading(false);
          }
        }
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Download error:", error);
      setDownloadError(error.message || "Failed to download database");
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const btnFade = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  // Reset animations when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fadeAnim.setValue(0);
      slideAnim.setValue(40);
      btnFade.setValue(0);

      // Content entrance
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
        ]),
        Animated.timing(btnFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]).start();

      // Smooth infinite background spin
      spinAnim.setValue(0);
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 90000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    }, [fadeAnim, slideAnim, btnFade, spinAnim]),
  );

  // Handle button press
  const handleBeginReading = () => {
    if (Platform.OS === "ios") {
      Vibration.vibrate(20);
    } else {
      Vibration.vibrate(50);
    }
    navigateToMainScreen();
  };

  // Theme-derived colors
  const accent = theme.dark ? "#e6c3b8" : "#5d3211";
  const accentMuted = theme.dark
    ? "rgba(230, 195, 184, 0.7)"
    : "rgba(93, 50, 17, 0.6)";
  const divider = theme.dark
    ? "rgba(230, 195, 184, 0.15)"
    : "rgba(93, 50, 17, 0.12)";

  // Background pattern colors
  const patternColor = theme.dark
    ? "rgba(230, 195, 184, 0.04)"
    : "rgba(93, 50, 17, 0.035)";
  const patternAccent = theme.dark
    ? "rgba(212, 165, 116, 0.06)"
    : "rgba(139, 69, 19, 0.045)";

  // Pre-computed pattern data
  const concentricCircles = [0.18, 0.35, 0.52, 0.7, 0.9, 1.1];
  const radiatingLines = Array.from({ length: 24 }, (_, i) => i * 15);

  const spinRotation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const buttonBg = useMemo(
    () => ({
      backgroundColor: theme.dark
        ? "rgba(230, 195, 184, 0.1)"
        : "rgba(93, 50, 17, 0.8)",
    }),
    [theme.dark],
  );

  return (
    <LinearGradient
      colors={
        theme.dark
          ? ["#1a130e", "#221b17", "#1a130e"]
          : ["#faf3ea", "#f5e6d3", "#faf3ea"]
      }
      style={styles.mainContainer}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      {/* Background Art Pattern — spinning */}
      <Animated.View
        style={[
          styles.patternContainer,
          { transform: [{ rotate: spinRotation }] },
        ]}
      >
        {/* Concentric circles — eternity / harmony */}
        {concentricCircles.map((scale, i) => (
          <View
            key={`c-${i}`}
            style={[
              styles.concentricCircle,
              {
                width: screenWidth * scale * 1.2,
                height: screenWidth * scale * 1.2,
                borderRadius: (screenWidth * scale * 1.2) / 2,
                borderColor: i % 2 === 0 ? patternColor : patternAccent,
                borderWidth: i === concentricCircles.length - 1 ? 1.5 : 1,
              },
            ]}
          />
        ))}

        {/* Radiating lines — truth / light */}
        {radiatingLines.map((angle, i) => (
          <View
            key={`r-${i}`}
            style={[
              styles.radiatingLine,
              {
                backgroundColor: i % 3 === 0 ? patternAccent : patternColor,
                transform: [{ rotate: `${angle}deg` }],
                height: screenHeight * 0.55,
              },
            ]}
          />
        ))}

        {/* Gentle arcs — dove-wing motif */}
        <View
          style={[
            styles.wingArc,
            styles.wingLeft,
            { borderColor: patternAccent },
          ]}
        />
        <View
          style={[
            styles.wingArc,
            styles.wingRight,
            { borderColor: patternAccent },
          ]}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Thin decorative line */}
        <View style={[styles.dividerLine, { backgroundColor: divider }]} />

        {/* Small label */}
        <Text style={[styles.label, { color: accentMuted }]}>SERMONS OF</Text>

        {/* Main title */}
        <Text style={[styles.mainTitle, { color: accent }]}>
          Robert Lambert Lee
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: accentMuted }]}>
          Transcribed & Audio Sermons
        </Text>

        {/* Year pill */}
        <View
          style={[
            styles.yearPill,
            {
              borderColor: divider,
              backgroundColor: theme.dark
                ? "rgba(230, 195, 184, 0.04)"
                : "rgba(93, 50, 17, 0.03)",
            },
          ]}
        >
          <Text style={[styles.yearText, { color: accentMuted }]}>
            1964 – 1973
          </Text>
        </View>

        {/* Thin decorative line */}
        <View style={[styles.dividerLine, { backgroundColor: divider }]} />

        {/* Scripture quote */}
        <View style={styles.quoteWrap}>
          <Text style={[styles.quoteText, { color: accentMuted }]}>
            And I saw another mighty angel come down{"\n"}from heaven, clothed
            with a cloud: and a{"\n"}rainbow was upon his head.
          </Text>
          <Text
            style={[
              styles.quoteRef,
              {
                color: theme.dark
                  ? "rgba(230, 195, 184, 0.5)"
                  : "rgba(93, 50, 17, 0.45)",
              },
            ]}
          >
            Revelation 10:1
          </Text>
        </View>
      </Animated.View>

      {/* Button area — separate so it fades in after content */}
      <Animated.View style={[styles.buttonArea, { opacity: btnFade }]}>
        {isDownloading ? (
          <View style={styles.downloadWrap}>
            <ActivityIndicator size="small" color={accent} />
            <Text style={[styles.downloadLabel, { color: accent }]}>
              {downloadProgress >= 100
                ? "Complete — restarting…"
                : `Downloading… ${Math.round(downloadProgress)}%`}
            </Text>
            <View style={[styles.progressTrack, { backgroundColor: divider }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${downloadProgress}%`,
                    backgroundColor: accent,
                  },
                ]}
              />
            </View>
          </View>
        ) : downloadError ? (
          <View style={styles.errorWrap}>
            <Text
              style={[
                styles.errorLabel,
                { color: theme.dark ? "#ff6b6b" : "#cc0000" },
              ]}
            >
              {downloadError}
            </Text>
            <TouchableOpacity
              onPress={handleDownloadDatabase}
              activeOpacity={0.8}
            >
              <View style={[styles.btn, buttonBg]}>
                <Text style={styles.btnText}>Retry</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : dbExists ? (
          <TouchableOpacity onPress={handleBeginReading} activeOpacity={0.85}>
            <View style={[styles.btn, buttonBg]}>
              <Text style={styles.btnText}>Begin Reading</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleDownloadDatabase}
            activeOpacity={0.85}
          >
            <View style={[styles.btn, buttonBg]}>
              <Text style={styles.btnText}>Download Sermons</Text>
            </View>
          </TouchableOpacity>
        )}
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  patternContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  concentricCircle: {
    position: "absolute",
    borderWidth: 1,
    borderStyle: "solid",
  },
  radiatingLine: {
    position: "absolute",
    width: 1,
    transformOrigin: "center center",
  },
  wingArc: {
    position: "absolute",
    width: horizontalScale(160),
    height: verticalScale(90),
    borderWidth: 1.5,
    borderRadius: horizontalScale(110),
    borderStyle: "solid",
  },
  wingLeft: {
    top: "22%",
    left: -horizontalScale(55),
    transform: [{ rotate: "-25deg" }],
    borderRightWidth: 0,
  },
  wingRight: {
    top: "22%",
    right: -horizontalScale(55),
    transform: [{ rotate: "25deg" }],
    borderLeftWidth: 0,
  },
  container: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    gap: 20,
  },
  dividerLine: {
    width: 40,
    height: 1,
    borderRadius: 1,
  },
  label: {
    fontFamily: "ZillaSlab-SemiBold",
    fontSize: responsiveFontSize(13),
    letterSpacing: 5,
    textTransform: "uppercase",
    marginTop: 4,
  },
  mainTitle: {
    fontFamily: "Philosopher",
    fontSize: responsiveFontSize(32),
    textAlign: "center",
    lineHeight: responsiveFontSize(42),
  },
  subtitle: {
    fontFamily: "Merriweather",
    fontSize: responsiveFontSize(14),
    letterSpacing: 0.6,
    textAlign: "center",
  },
  yearPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
  },
  yearText: {
    fontFamily: "ZillaSlab-Regular",
    fontSize: responsiveFontSize(13),
    letterSpacing: 3,
  },
  quoteWrap: {
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: spacing.md,
  },
  quoteText: {
    fontFamily: "Merriweather",
    fontSize: responsiveFontSize(14),
    // fontStyle: "italic",
    textAlign: "center",
    lineHeight: responsiveFontSize(24),
  },
  quoteRef: {
    fontFamily: "ZillaSlab-Regular",
    fontSize: responsiveFontSize(12),
    marginTop: 12,
    letterSpacing: 1.5,
  },

  /* Button area */
  buttonArea: {
    position: "absolute",
    bottom: verticalScale(56),
    alignItems: "center",
    width: "100%",
  },
  btn: {
    paddingHorizontal: horizontalScale(48),
    paddingVertical: verticalScale(14),
    borderRadius: 100,
    shadowColor: "#5d3211",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  btnText: {
    fontFamily: "Merriweather",
    color: "#fff",
    fontSize: responsiveFontSize(15),
    fontWeight: "600",
    letterSpacing: 0.8,
    textAlign: "center",
  },

  /* Download & error */
  downloadWrap: {
    alignItems: "center",
    paddingHorizontal: horizontalScale(40),
    gap: 12,
  },
  downloadLabel: {
    fontFamily: "ZillaSlab-Regular",
    fontSize: responsiveFontSize(13),
  },
  progressTrack: {
    width: screenWidth * 0.6,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  errorWrap: {
    alignItems: "center",
    gap: 14,
  },
  errorLabel: {
    fontFamily: "ZillaSlab-Regular",
    fontSize: responsiveFontSize(13),
    textAlign: "center",
  },
});

export default Welcome;
