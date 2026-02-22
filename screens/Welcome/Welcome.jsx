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
  Image,
  ActivityIndicator,
} from "react-native";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAppContext } from "../../Logic/globalState";
import Logo from "../../components/Logo";
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
import {
  forceStopIndexing,
  closeDatabase,
  resetDatabaseState,
} from "../../database/sermonDB";
import * as Updates from "expo-updates";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const Welcome = () => {
  const navigation = useNavigation();
  const { theme, refreshSermons, allSermons } = useAppContext();
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

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;

  // Check if database exists on component mount and when screen comes into focus
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

  // Re-check database when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Primary check: if allSermons is loaded in context, we have a database
      const hasLoadedSermons = allSermons && allSermons.length > 0;

      console.log("📚 Sermons in context:", allSermons?.length || 0);
      console.log("✅ Database ready:", hasLoadedSermons);

      // Set dbExists based on sermon data in context
      setDbExists(hasLoadedSermons);

      // Reset download state when returning to this screen
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

      console.log("Starting database download...");

      // Only stop indexing and close DB if database already exists
      if (allSermons.length > 0) {
        console.log("🛑 Stopping any ongoing indexing...");
        forceStopIndexing();

        try {
          await closeDatabase();
          console.log("✅ Database closed before download");
        } catch (closeError) {
          console.warn("⚠️ Error closing database:", closeError.message);
        }

        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Download the database with real progress tracking
      const result = await downloadDatabaseFromGitHub((percentage, message) => {
        setDownloadProgress(percentage);
      });

      if (result.success) {
        setDownloadProgress(100);
        console.log("✅ Database downloaded successfully. Restarting app...");

        // Brief delay so user sees 100%
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Restart the app to load fresh data
        try {
          await Updates.reloadAsync();
        } catch (restartError) {
          // Fallback for dev mode (Expo Go) where Updates.reloadAsync doesn't work
          console.warn("⚠️ Updates.reloadAsync failed, trying DevSettings...");
          try {
            const { DevSettings } = require("react-native");
            DevSettings.reload();
          } catch (devError) {
            console.warn(
              "⚠️ DevSettings.reload also failed:",
              devError.message,
            );
            setDownloadError(
              "Download complete! Please close and reopen the app to load your sermons.",
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

  // Reset animations when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.8);
      logoRotateAnim.setValue(0);

      // Entrance animations
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
          Animated.spring(logoRotateAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
        ]),
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
    }, [fadeAnim, slideAnim, scaleAnim, logoRotateAnim]),
  );

  // Handle button press
  const handleBeginReading = () => {
    // Haptic feedback
    if (Platform.OS === "ios") {
      Vibration.vibrate(20);
    } else {
      Vibration.vibrate(50);
    }

    navigateToMainScreen();
  };

  const logoRotation = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Background pattern colors based on theme
  const patternColor = theme.dark
    ? "rgba(230, 195, 184, 0.04)"
    : "rgba(93, 50, 17, 0.04)";
  const patternAccent = theme.dark
    ? "rgba(212, 165, 116, 0.06)"
    : "rgba(139, 69, 19, 0.05)";

  // Memoize button style to prevent recalculation on every render
  const buttonStyleMemo = useMemo(
    () => ({
      backgroundColor: theme.dark
        ? "rgba(230, 195, 184, 0.1)"
        : "rgba(93, 50, 17, 0.8)",
    }),
    [theme.dark],
  );

  // Generate radiating lines for "truth/light" symbolism
  const radiatingLines = Array.from({ length: 12 }, (_, i) => i * 30);

  // Generate concentric circles for "peace/harmony" symbolism
  const concentricCircles = [0.15, 0.3, 0.45, 0.6, 0.8, 1];

  return (
    <LinearGradient
      colors={
        theme.dark
          ? ["#221b17", "#2d1f15", "#221b17"]
          : ["#faeed1", "#f5e6d3", "#faeed1"]
      }
      style={styles.mainContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Background Art Pattern - Peace & Truth */}
      <View style={styles.patternContainer}>
        {/* Concentric circles - representing peace and harmony */}
        {concentricCircles.map((scale, index) => (
          <View
            key={`circle-${index}`}
            style={[
              styles.concentricCircle,
              {
                width: screenWidth * scale * 1.5,
                height: screenWidth * scale * 1.5,
                borderRadius: (screenWidth * scale * 1.5) / 2,
                borderColor: index % 2 === 0 ? patternColor : patternAccent,
                borderWidth: index === concentricCircles.length - 1 ? 2 : 1,
              },
            ]}
          />
        ))}

        {/* Radiating lines - representing truth and light */}
        {radiatingLines.map((angle, index) => (
          <View
            key={`line-${index}`}
            style={[
              styles.radiatingLine,
              {
                backgroundColor: index % 3 === 0 ? patternAccent : patternColor,
                transform: [{ rotate: `${angle}deg` }],
                height: screenHeight * 0.6,
              },
            ]}
          />
        ))}

        {/* Dove wings pattern - subtle curved lines for peace */}
        <View
          style={[
            styles.wingPattern,
            styles.wingLeft,
            { borderColor: patternAccent },
          ]}
        />
        <View
          style={[
            styles.wingPattern,
            styles.wingRight,
            { borderColor: patternAccent },
          ]}
        />

        {/* Olive branch dots - scattered for peace symbolism */}
        {[...Array(8)].map((_, i) => (
          <View
            key={`dot-${i}`}
            style={[
              styles.oliveDot,
              {
                backgroundColor: patternAccent,
                top: `${15 + i * 10}%`,
                left: i % 2 === 0 ? `${10 + i * 5}%` : undefined,
                right: i % 2 !== 0 ? `${10 + i * 5}%` : undefined,
              },
            ]}
          />
        ))}
      </View>

      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        {/* Cloud Badge */}
        <Animated.View style={styles.cloudOuter}>
          <View
            style={[
              styles.cloudRing,
              {
                borderColor: theme.dark
                  ? "rgba(230, 195, 184, 0.2)"
                  : "rgba(93, 50, 17, 0.15)",
              },
            ]}
          />
          <Animated.View
            style={[
              styles.cloudContainer,
              {
                backgroundColor: theme.dark
                  ? "rgba(230, 195, 184, 0.12)"
                  : "rgba(93, 50, 17, 0.09)",
                borderColor: theme.dark
                  ? "rgba(230, 195, 184, 0.25)"
                  : "rgba(93, 50, 17, 0.2)",
              },
            ]}
          >
            <Image
              source={require("../../assets/cloud.png")}
              style={styles.cloudImage}
              resizeMode="contain"
            />
          </Animated.View>
        </Animated.View>

        {/* Title Section */}
        <Animated.View style={[styles.contentContainer]}>
          {/* Name tag */}
          <Text
            style={[
              styles.nameLabel,
              {
                color: theme.dark
                  ? "rgba(230, 195, 184, 0.55)"
                  : "rgba(93, 50, 17, 0.45)",
              },
            ]}
          >
            SERMONS OF
          </Text>

          <Text
            style={[
              styles.titleHighlight,
              { color: theme.dark ? "#e6c3b8" : "#5d3211" },
            ]}
          >
            Robert Lambert Lee
          </Text>

          <Text
            style={[
              styles.title,
              {
                color: theme.dark
                  ? "rgba(255, 255, 255, 0.55)"
                  : "rgba(93,50,17,0.55)",
              },
            ]}
          >
            Transcribed & Audio Sermons
          </Text>

          {/* Year badge */}
          <View
            style={[
              styles.yearBadge,
              {
                backgroundColor: theme.dark
                  ? "rgba(230, 195, 184, 0.08)"
                  : "rgba(93, 50, 17, 0.07)",
                borderColor: theme.dark
                  ? "rgba(230, 195, 184, 0.2)"
                  : "rgba(93, 50, 17, 0.18)",
              },
            ]}
          >
            <View
              style={[
                styles.yearDot,
                { backgroundColor: theme.dark ? "#e6c3b8" : "#5d3211" },
              ]}
            />
            <Text
              style={[
                styles.subtitle,
                { color: theme.dark ? "#c4b5b0" : "#5d3211" },
              ]}
            >
              1964 – 1973
            </Text>
            <View
              style={[
                styles.yearDot,
                { backgroundColor: theme.dark ? "#e6c3b8" : "#5d3211" },
              ]}
            />
          </View>

          {/* Scripture quote */}
          <View
            style={[
              styles.quoteBlock,
              {
                borderLeftColor: theme.dark
                  ? "rgba(230, 195, 184, 0.35)"
                  : "rgba(93, 50, 17, 0.3)",
                backgroundColor: theme.dark
                  ? "rgba(230, 195, 184, 0.04)"
                  : "rgba(93, 50, 17, 0.03)",
              },
            ]}
          >
            <Text
              style={[
                styles.description,
                { color: theme.dark ? "rgba(255, 255, 255, 0.65)" : "#4a3526" },
              ]}
            >
              And I saw another mighty angel come down from heaven, clothed with
              a cloud: and a rainbow was upon his head.
            </Text>
            <Text
              style={[
                styles.reference,
                {
                  color: theme.dark
                    ? "rgba(230, 195, 184, 0.6)"
                    : "rgba(93, 50, 17, 0.6)",
                },
              ]}
            >
              — Revelation 10:1
            </Text>
          </View>
        </Animated.View>

        {/* Begin Reading / Download Button */}
        <View style={[styles.buttonContainer]}>
          {isDownloading ? (
            <View style={styles.downloadContainer}>
              <ActivityIndicator
                size="large"
                color={theme.dark ? "#e6c3b8" : "#5d3211"}
              />
              <Text
                style={[
                  styles.downloadText,
                  { color: theme.dark ? "#e6c3b8" : "#5d3211" },
                ]}
              >
                {downloadProgress >= 100
                  ? "Download complete! Restarting app..."
                  : `Downloading... ${Math.round(downloadProgress)}%`}
              </Text>
              <View
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: theme.dark
                      ? "rgba(230, 195, 184, 0.2)"
                      : "rgba(93, 50, 17, 0.1)",
                  },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${downloadProgress}%`,
                      backgroundColor: theme.dark ? "#e6c3b8" : "#5d3211",
                    },
                  ]}
                />
              </View>
            </View>
          ) : downloadError ? (
            <View style={styles.errorContainer}>
              <Text
                style={[
                  styles.errorText,
                  { color: theme.dark ? "#ff6b6b" : "#cc0000" },
                ]}
              >
                {downloadError}
              </Text>
              <TouchableOpacity
                onPress={handleDownloadDatabase}
                activeOpacity={0.8}
              >
                <View style={[styles.button, buttonStyleMemo]}>
                  <Text style={styles.buttonText}>RETRY DOWNLOAD</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : dbExists ? (
            <TouchableOpacity onPress={handleBeginReading} activeOpacity={0.85}>
              <View style={[styles.button, buttonStyleMemo]}>
                <Text style={styles.buttonText}>Begin Reading</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleDownloadDatabase}
              activeOpacity={0.85}
            >
              <View style={[styles.button, buttonStyleMemo]}>
                <Text style={styles.buttonText}>Download Sermons</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
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
  cloudOuter: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
  },
  cloudRing: {
    position: "absolute",
    width: horizontalScale(130),
    height: horizontalScale(130),
    borderRadius: horizontalScale(65),
    borderWidth: 1,
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
  wingPattern: {
    position: "absolute",
    width: horizontalScale(150),
    height: verticalScale(80),
    borderWidth: 1.5,
    borderRadius: horizontalScale(100),
    borderStyle: "solid",
  },
  wingLeft: {
    top: "25%",
    left: -horizontalScale(50),
    transform: [{ rotate: "-30deg" }],
    borderRightWidth: 0,
  },
  wingRight: {
    top: "25%",
    right: -horizontalScale(50),
    transform: [{ rotate: "30deg" }],
    borderLeftWidth: 0,
  },
  oliveDot: {
    position: "absolute",
    width: horizontalScale(6),
    height: horizontalScale(6),
    borderRadius: horizontalScale(3),
  },
  container: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    width: "100%",
  },
  cloudContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    padding: horizontalScale(22),
    borderWidth: 1,
  },
  cloudImage: {
    width: horizontalScale(88),
    height: verticalScale(88),
    opacity: 0.9,
  },
  audioLinesContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: horizontalScale(3),
    position: "absolute",
  },
  audioBar: {
    width: horizontalScale(2),
    borderRadius: horizontalScale(1),
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  nameLabel: {
    fontFamily: "ZillaSlab-SemiBold",
    fontSize: responsiveFontSize(11),
    letterSpacing: 3,
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: "Merriweather",
    fontSize: responsiveFontSize(14),
    textAlign: "center",
    fontWeight: "300",
    lineHeight: responsiveFontSize(22),
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  titleHighlight: {
    fontFamily: "Philosopher",
    fontWeight: "400",
    fontSize: responsiveFontSize(28),
    textAlign: "center",
    lineHeight: responsiveFontSize(36),
    marginBottom: spacing.xs,
  },
  yearBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 2,
    borderRadius: 100,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  yearDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.6,
  },
  subtitle: {
    fontFamily: "ZillaSlab-Regular",
    fontSize: responsiveFontSize(14),
    fontWeight: "300",
    letterSpacing: 2.5,
  },
  quoteBlock: {
    borderLeftWidth: 2,
    borderRadius: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignSelf: "stretch",
    marginHorizontal: spacing.sm,
  },
  description: {
    fontFamily: "Merriweather",
    fontSize: responsiveFontSize(13),
    textAlign: "left",
    lineHeight: responsiveFontSize(21),
    fontWeight: "300",
    fontStyle: "italic",
  },
  reference: {
    fontFamily: "ZillaSlab-Regular",
    fontSize: responsiveFontSize(11.5),
    textAlign: "right",
    marginTop: spacing.sm,
    letterSpacing: 0.3,
  },
  buttonContainer: {
    marginBottom: spacing.xxl,
  },
  button: {
    paddingHorizontal: horizontalScale(52),
    paddingVertical: verticalScale(15),
    borderRadius: 100,
    shadowColor: "#5d3211",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    fontFamily: "Merriweather",
    color: "#fff",
    fontSize: responsiveFontSize(14.5),
    fontWeight: "600",
    letterSpacing: 0.8,
    textAlign: "center",
  },
  downloadContainer: {
    alignItems: "center",
    paddingHorizontal: horizontalScale(40),
    paddingVertical: verticalScale(20),
    gap: spacing.md,
  },
  downloadText: {
    fontFamily: "ZillaSlab-Regular",
    fontSize: responsiveFontSize(14),
    fontWeight: "500",
    marginTop: spacing.md,
  },
  progressBar: {
    width: "100%",
    height: verticalScale(8),
    borderRadius: 4,
    overflow: "hidden",
    marginTop: spacing.md,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  errorContainer: {
    alignItems: "center",
    gap: spacing.md,
  },
  errorText: {
    fontFamily: "ZillaSlab-Regular",
    fontSize: responsiveFontSize(14),
    fontWeight: "500",
    textAlign: "center",
  },
});

export default Welcome;
