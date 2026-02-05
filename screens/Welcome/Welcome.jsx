import React, { useEffect, useRef, useState } from "react";
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

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const Welcome = () => {
  const navigation = useNavigation();
  const { theme, refreshSermons } = useAppContext();
  const [fontsLoaded] = useFonts({
    "ZillaSlab-Regular": require("../../assets/fonts/ZillaSlab-Regular.ttf"),
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
      const checkDatabase = async () => {
        try {
          const exists = await databaseExists();
          setDbExists(exists);
          // Reset download state when returning to this screen
          setIsDownloading(false);
          setDownloadProgress(0);
          setDownloadError(null);
        } catch (error) {
          console.error("Error checking database:", error);
        }
      };
      checkDatabase();
    }, []),
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

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev < 90) {
            return prev + Math.random() * 30;
          }
          return prev;
        });
      }, 500);

      // Download the database
      const result = await downloadDatabaseFromGitHub((message) => {
        console.log("Download progress:", message);
      });

      clearInterval(progressInterval);

      if (result.success) {
        setDownloadProgress(100);
        setDbExists(true);
        console.log("✅ Database downloaded successfully");

        // Reload sermons from database before navigating
        console.log("Loading sermons after download...");
        await refreshSermons();

        // Navigate after loading sermons
        setTimeout(() => {
          setIsDownloading(false);
          setDownloadProgress(0);
          navigateToMainScreen();
        }, 500);
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
    }, []),
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
        {/* Cloud with Audio Lines */}
        <Animated.View
          style={[
            styles.cloudContainer,
            {
              backgroundColor: theme.dark
                ? "rgba(230, 195, 184, 0.1)"
                : "rgba(93, 50, 17, 0.08)",
            },
          ]}
        >
          <Image
            source={require("../../assets/cloud.png")}
            style={styles.cloudImage}
            resizeMode="contain"
          />
          {/* Audio waveform bars */}
          <View style={styles.audioLinesContainer}>
            {[0.4, 0.7, 0.9, 0.65, 0.5, 0.8, 0.45, 0.6, 0.85, 0.55, 0.7].map(
              (height, index) => (
                <Animated.View
                  key={`bar-${index}`}
                  style={[
                    styles.audioBar,
                    {
                      height: verticalScale(15 * height),
                      backgroundColor: theme.dark ? "#e6c3b8" : "#5d3211",
                      opacity: 0.8 + height * 0.2,
                    },
                  ]}
                />
              ),
            )}
          </View>
        </Animated.View>

        {/* Title Section */}
        <Animated.View style={[styles.contentContainer]}>
          <Text
            style={[
              styles.title,
              { color: theme.dark ? "rgba(255, 255, 255, 0.95)" : "#1a1a1a" },
            ]}
          >
            Transcribed and audio versions of{"\n"}
            <Text
              style={[
                styles.titleHighlight,
                { color: theme.dark ? "#e6c3b8" : "#5d3211" },
              ]}
            >
              Robert Lambert Lee
            </Text>
            {"\n"}
            sermons
          </Text>

          <View style={styles.subtitleContainer}>
            <View
              style={[
                styles.divider,
                {
                  backgroundColor: theme.dark
                    ? "rgba(180, 175, 175, 0.5)"
                    : "rgba(93, 50, 17, 0.3)",
                },
              ]}
            />
            <Text
              style={[
                styles.subtitle,
                { color: theme.dark ? "#b4afaf" : "#5d3211" },
              ]}
            >
              1964 - 1973
            </Text>
            <View
              style={[
                styles.divider,
                {
                  backgroundColor: theme.dark
                    ? "rgba(180, 175, 175, 0.5)"
                    : "rgba(93, 50, 17, 0.3)",
                },
              ]}
            />
          </View>

          <Text
            style={[
              styles.description,
              { color: theme.dark ? "rgba(255, 255, 255, 0.7)" : "#333" },
            ]}
          >
            And I saw another mighty angel come down from heaven, clothed with a
            cloud: and a rainbow was upon his head.
            {"\n"}
            <Text
              style={{ fontSize: responsiveFontSize(12), fontStyle: "normal" }}
            >
              — Revelation 10:1
            </Text>
          </Text>
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
                Downloading... {Math.round(downloadProgress)}%
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
                <LinearGradient
                  colors={
                    theme.dark ? ["#d4a574", "#b8845d"] : ["#e6c3b8", "#d4a574"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>RETRY DOWNLOAD</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : dbExists ? (
            <TouchableOpacity onPress={handleBeginReading} activeOpacity={0.8}>
              <LinearGradient
                colors={
                  theme.dark ? ["#d4a574", "#b8845d"] : ["#e6c3b8", "#d4a574"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>BEGIN READING</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleDownloadDatabase}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  theme.dark ? ["#d4a574", "#b8845d"] : ["#e6c3b8", "#d4a574"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>DOWNLOAD SERMON</Text>
              </LinearGradient>
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
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderRadius: 9999,
    padding: spacing.md,
  },
  cloudImage: {
    width: horizontalScale(100),
    height: verticalScale(100),
    opacity: 0.85,
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
    marginVertical: spacing.xl,
  },
  title: {
    fontFamily: "ZillaSlab-Regular",
    fontSize: responsiveFontSize(22),
    textAlign: "center",
    fontWeight: "300",
    lineHeight: responsiveFontSize(28),
    marginBottom: spacing.lg,
  },
  titleHighlight: {
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
    marginHorizontal: spacing.md,
  },
  subtitle: {
    fontFamily: "ZillaSlab-Regular",
    fontSize: responsiveFontSize(16),
    fontWeight: "300",
    letterSpacing: 2,
  },
  description: {
    fontFamily: "serif",
    fontSize: responsiveFontSize(14),
    textAlign: "center",
    lineHeight: responsiveFontSize(20),
    fontWeight: "200",
    fontStyle: "italic",
    marginTop: spacing.md,
  },
  buttonContainer: {
    marginBottom: spacing.xxl,
  },
  button: {
    paddingHorizontal: horizontalScale(50),
    paddingVertical: verticalScale(16),
    borderRadius: horizontalScale(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    fontFamily: "ZillaSlab-Regular",
    color: "#fff",
    fontSize: responsiveFontSize(16),
    fontWeight: "600",
    letterSpacing: 1.2,
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
