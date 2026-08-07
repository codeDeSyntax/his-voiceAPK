import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Platform,
  Vibration,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAppContext } from "../../Logic/globalState";
import {
  responsiveFontSize,
  horizontalScale,
  verticalScale,
  spacing,
} from "../../Utils/responsiveUtils";
import {
  downloadDatabaseWithSignal,
  getDatabaseStatus,
  databaseExists,
} from "../../database/downloadDatabase";
import {
  forceStopIndexing,
  closeDatabase,
  resetDatabaseState,
} from "../../database/sermonDB";


const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const Welcome = () => {
  const navigation = useNavigation();
  const { theme, allSermons, refreshSermons } = useAppContext();
  // Download state
  const [dbExists, setDbExists] = useState(false);
  const [dbNeedsUpdate, setDbNeedsUpdate] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadError, setDownloadError] = useState(null);
  const [isDone, setIsDone] = useState(false);
  const downloadControllerRef = useRef(null);

  // Check if database exists on mount
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const status = await getDatabaseStatus();
        setDbExists(status.exists && !status.needsUpdate);
        setDbNeedsUpdate(status.needsUpdate);
      } catch (error) {
        console.error("Error checking database:", error);
        // getDatabaseStatus() failed — fall back to a direct local file check
        // so a transient error never incorrectly shows the Download button.
        try {
          const locallyExists = await databaseExists();
          setDbExists(locallyExists);
        } catch (_) {
          // If even the file check fails, leave state as-is (default false).
        }
      }
    };
    checkDatabase();
  }, []);

  // Re-check when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const refreshDatabaseState = async () => {
        try {
          const status = await getDatabaseStatus();
          if (!isActive) return;
          const hasLoadedSermons = allSermons && allSermons.length > 0;
          setDbExists((status.exists || hasLoadedSermons) && !status.needsUpdate);
          setDbNeedsUpdate(status.needsUpdate);
        } catch (error) {
          if (!isActive) return;
          // getDatabaseStatus() failed — fall back to a direct local file check
          // rather than relying on allSermons (which may not be loaded yet).
          try {
            const locallyExists = await databaseExists();
            const hasLoadedSermons = allSermons && allSermons.length > 0;
            setDbExists(locallyExists || hasLoadedSermons);
          } catch (_) {
            const hasLoadedSermons = allSermons && allSermons.length > 0;
            setDbExists(hasLoadedSermons);
          }
          setDbNeedsUpdate(false);
        } finally {
          if (!isActive) return;
          setIsDownloading(false);
          setDownloadProgress(0);
          setDownloadError(null);
        }
      };

      refreshDatabaseState();

      return () => {
        isActive = false;
      };
    }, [allSermons]),
  );

  // Navigate to sermon list
  const navigateToMainScreen = () => {
    navigation?.navigate("AllSermons");
  };

  const handleDownloadDatabase = async () => {
    try {
      setIsDownloading(true);
      setDownloadError(null);
      setDownloadProgress(0);

      const controller = new AbortController();
      downloadControllerRef.current = controller;

      forceStopIndexing();
      try {
        await closeDatabase();
      } catch (closeError) {
        console.warn("Error closing database:", closeError.message);
      }
      await new Promise((resolve) => setTimeout(resolve, 200));

      const result = await downloadDatabaseWithSignal(
        (percentage) => {
          setDownloadProgress(percentage);
        },
        controller.signal,
      );

      if (result.success) {
        setDownloadProgress(100);
        setIsDone(true);
        await new Promise((resolve) => setTimeout(resolve, 1200));

        // Try to reload sermons in-place — avoids a full JS bundle restart.
        // If refreshSermons returns data, navigate immediately (fast path).
        try {
          const refreshed = await refreshSermons?.();
          resetDatabaseState();
          setDbNeedsUpdate(false);
          setDbExists(true);
          setIsDownloading(false);
          setIsDone(false);
          if (refreshed) {
            navigateToMainScreen();
            return;
          }
          // Sermons loaded but refreshed was falsy; still navigate forward.
          navigateToMainScreen();
        } catch (refreshError) {
          console.warn("Sermon refresh failed, navigating anyway:", refreshError?.message);
          resetDatabaseState();
          setDbNeedsUpdate(false);
          setDbExists(true);
          setIsDownloading(false);
          setIsDone(false);
          navigateToMainScreen();
        }
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      if (downloadControllerRef.current?.signal?.aborted) {
        setDownloadError("Download cancelled.");
        setIsDownloading(false);
        setDownloadProgress(0);
        return;
      }
      console.error("Download error:", error);
      setDownloadError(error.message || "Failed to download database");
      setIsDownloading(false);
      setDownloadProgress(0);
    } finally {
      downloadControllerRef.current = null;
    }
  };

  const handleCancelDownload = () => {
    downloadControllerRef.current?.abort();
  };

  useEffect(() => {
    return () => {
      downloadControllerRef.current?.abort();
    };
  }, []);

  // Animation values — staggered entrance for each element
  const spinAnim = useRef(new Animated.Value(0)).current;
  const labelFade = useRef(new Animated.Value(0)).current;
  const labelSlide = useRef(new Animated.Value(20)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(30)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;
  const yearFade = useRef(new Animated.Value(0)).current;
  const yearScale = useRef(new Animated.Value(0.85)).current;
  const quoteFade = useRef(new Animated.Value(0)).current;
  const quoteSlide = useRef(new Animated.Value(15)).current;
  const dividerScale = useRef(new Animated.Value(0)).current;
  const btnFade = useRef(new Animated.Value(0)).current;
  const btnSlide = useRef(new Animated.Value(20)).current;

  // Reset animations when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Reset all
      [
        labelFade,
        titleFade,
        subtitleFade,
        yearFade,
        quoteFade,
        btnFade,
        dividerScale,
      ].forEach((a) => a.setValue(0));
      [labelSlide, quoteSlide, btnSlide].forEach((a) => a.setValue(15));
      titleSlide.setValue(30);
      yearScale.setValue(0.85);

      const stagger = (delay, anims) =>
        Animated.sequence([Animated.delay(delay), Animated.parallel(anims)]);

      // Staggered cascade entrance
      Animated.parallel([
        stagger(200, [
          Animated.spring(dividerScale, {
            toValue: 1,
            damping: 18,
            stiffness: 200,
            useNativeDriver: true,
          }),
        ]),
        stagger(400, [
          Animated.timing(labelFade, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(labelSlide, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        stagger(600, [
          Animated.timing(titleFade, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(titleSlide, {
            toValue: 0,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        stagger(900, [
          Animated.timing(subtitleFade, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        stagger(1100, [
          Animated.timing(yearFade, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(yearScale, {
            toValue: 1,
            damping: 14,
            stiffness: 180,
            useNativeDriver: true,
          }),
        ]),
        stagger(1400, [
          Animated.timing(quoteFade, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(quoteSlide, {
            toValue: 0,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        stagger(1800, [
          Animated.timing(btnFade, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(btnSlide, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
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
    }, [
      spinAnim,
      labelFade,
      labelSlide,
      titleFade,
      titleSlide,
      subtitleFade,
      yearFade,
      yearScale,
      quoteFade,
      quoteSlide,
      dividerScale,
      btnFade,
      btnSlide,
    ]),
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
  const downloadPanelBg = theme.dark
    ? "rgba(34, 27, 23, 0.88)"
    : "rgba(250, 243, 234, 0.88)";
  const downloadPanelBorder = theme.dark
    ? "rgba(230, 195, 184, 0.18)"
    : "rgba(93, 50, 17, 0.16)";
  const downloadTrack = theme.dark
    ? "rgba(230, 195, 184, 0.14)"
    : "rgba(93, 50, 17, 0.12)";
  const downloadFillEnd = theme.dark ? "#d4a574" : "#8b4513";
  const downloadCancelBg = theme.dark
    ? "rgba(230, 195, 184, 0.08)"
    : "rgba(93, 50, 17, 0.08)";

  // Background pattern colors
  const patternColor = theme.dark
    ? "rgba(230, 195, 184, 0.04)"
    : "rgba(93, 50, 17, 0.035)";
  const patternAccent = theme.dark
    ? "rgba(212, 165, 116, 0.06)"
    : "rgba(139, 69, 19, 0.045)";

  // Pre-computed pattern data
  const concentricCircles = [0.12, 0.24, 0.38, 0.52, 0.68, 0.85, 1.05, 1.3];
  const radiatingLines = Array.from({ length: 36 }, (_, i) => i * 10);

  const spinRotation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Transforming Download Button — morphs seamlessly through 3 states (Initial -> Downloading % -> Done ✓)
  const TransformingDownloadButton = useCallback(
    ({
      label,
      onPress,
      iconName,
      isDownloading,
      downloadProgress,
      isDone,
      onCancel,
    }) => {
      const scaleAnim = useRef(new Animated.Value(1)).current;
      const progressAnim = useRef(new Animated.Value(0)).current;

      useEffect(() => {
        if (isDownloading) {
          Animated.timing(progressAnim, {
            toValue: downloadProgress,
            duration: 180,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }).start();
        } else {
          progressAnim.setValue(0);
        }
      }, [isDownloading, downloadProgress, progressAnim]);

      const handlePressIn = () => {
        Animated.spring(scaleAnim, {
          toValue: 0.96,
          damping: 15,
          stiffness: 320,
          useNativeDriver: true,
        }).start();
      };

      const handlePressOut = () => {
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 14,
          stiffness: 220,
          useNativeDriver: true,
        }).start();
      };

      const isDark = theme.dark;

      // Theme-derived colors matching app theme (less bright, matching spinner tones):
      const capsuleBg = isDark ? "rgba(42, 32, 26, 0.95)" : "rgba(252,246,237,0.98)";
      const capsuleBorder = isDark
        ? "rgba(242, 205, 180, 0.22)"
        : "rgba(93, 50, 17, 0.16)";
      const circleBg = isDark ? "#f2cdb4" : "#5d3211";
      const circleIconColor = isDark ? "#281e18" : "#ffffff";
      const labelColor = isDark ? "#f2cdb4" : "#3d220b";
      const progressFillBg = isDark ? "#8b573c" : "#5d3211";

      // ── STATE C: DONE ✓ (Reference Image 1) ──
      if (isDone) {
        return (
          <Animated.View style={{ transform: [{ scale: scaleAnim }], width: "100%", alignItems: "center" }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: capsuleBg,
                borderRadius: 999,
                paddingLeft: horizontalScale(36),
                paddingRight: 6,
                paddingVertical: 6,
                borderWidth: 1.5,
                borderColor: capsuleBorder,
                shadowColor: isDark ? "#000000" : "#5d3211",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: isDark ? 0.35 : 0.16,
                shadowRadius: 14,
                elevation: 7,
                width: 280,
                alignSelf: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "Philosopher",
                  color: labelColor,
                  fontSize: responsiveFontSize(19),
                  letterSpacing: 0.5,
                }}
              >
                Done
              </Text>
              {/* Circular Green Checkmark Badge (Image 1) */}
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: "#00c853",
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#00c853",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Feather name="check" size={22} color="#ffffff" />
              </View>
            </View>
          </Animated.View>
        );
      }

      // ── STATE B: DOWNLOADING PERCENTAGE IN-PROGRESS (Reference Image 2) ──
      if (isDownloading) {
        const progressWidth = progressAnim.interpolate({
          inputRange: [0, 100],
          outputRange: ["0%", "100%"],
          extrapolate: "clamp",
        });

        return (
          <Animated.View style={{ transform: [{ scale: scaleAnim }], width: "100%", alignItems: "center" }}>
            <Pressable
              onPress={onCancel}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={{
                width: 280,
                height: 54,
                borderRadius: 999,
                backgroundColor: capsuleBg,
                borderWidth: 1.5,
                borderColor: capsuleBorder,
                overflow: "hidden",
                justifyContent: "center",
                alignSelf: "center",
                shadowColor: isDark ? "#000000" : "#5d3211",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: isDark ? 0.35 : 0.16,
                shadowRadius: 14,
                elevation: 7,
              }}
            >
              {/* Animated Inner Progress Fill Bar */}
              <Animated.View
                style={{
                  position: "absolute",
                  top: 3,
                  bottom: 3,
                  left: 3,
                  width: progressWidth,
                  backgroundColor: progressFillBg,
                  borderRadius: 999,
                }}
              />

              {/* Overlaid Percentage Text and Right Arrow */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 20,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Philosopher",
                    color: "#ffffff",
                    fontSize: responsiveFontSize(19),
                    letterSpacing: 0.5,
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  {Math.round(downloadProgress)}%
                </Text>
                <Feather name="arrow-right" size={20} color="#ffffff" style={{ position: "absolute", right: 20 }} />
              </View>
            </Pressable>
          </Animated.View>
        );
      }

      // ── STATE A: INITIAL / IDLE BUTTON (Reference Image 3) ──
      let icon = iconName;
      if (!icon) {
        const lower = label.toLowerCase();
        if (lower.includes("begin") || lower.includes("read")) {
          icon = "library";
        } else if (lower.includes("download")) {
          icon = "download-cloud";
        } else if (lower.includes("update")) {
          icon = "refresh-cw";
        } else if (lower.includes("retry")) {
          icon = "rotate-ccw";
        } else {
          icon = "arrow-right";
        }
      }

      return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }], width: "100%", alignItems: "center" }}>
          <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: capsuleBg,
              borderRadius: 999,
              paddingLeft: 6,
              paddingRight: horizontalScale(28),
              paddingVertical: 6,
              borderWidth: 1.5,
              borderColor: capsuleBorder,
              shadowColor: isDark ? "#000000" : "#5d3211",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: isDark ? 0.35 : 0.16,
              shadowRadius: 14,
              elevation: 7,
              maxWidth: 320,
              alignSelf: "center",
            }}
          >
            {/* Circular Left Icon Badge (Reference Image 3) */}
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: circleBg,
                justifyContent: "center",
                alignItems: "center",
                marginRight: horizontalScale(14),
                shadowColor: circleBg,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              {icon === "library" ? (
                <Ionicons name="library-outline" size={20} color={circleIconColor} />
              ) : (
                <Feather name={icon} size={20} color={circleIconColor} />
              )}
            </View>

            {/* Button Text Label */}
            <Text
              style={{
                fontFamily: "Philosopher",
                color: labelColor,
                fontSize: responsiveFontSize(18),
                letterSpacing: 0.5,
                textAlign: "left",
              }}
            >
              {label}
            </Text>
          </Pressable>
        </Animated.View>
      );
    },
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
      {/* Top image bleeds into gradient */}
      <View pointerEvents="none" style={styles.topImageWrap}>
        <ImageBackground
          source={require("../../assets/browntrees.jpg")}
          style={styles.topImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={
              theme.dark
                ? ["rgba(26,19,14,0.05)", "rgba(31,24,19,0.80)", "#221b17"]
                : ["rgba(250,243,234,0.04)", "rgba(245,230,211,0.78)", "#f5e6d3"]
            }
            locations={[0, 0.55, 0.92]}
            style={StyleSheet.absoluteFill}
          />
        </ImageBackground>
      </View>

      {/* Spinning mandala art — preserved exactly */}
      <Animated.View
        style={[styles.patternContainer, { transform: [{ rotate: spinRotation }] }]}
      >
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
        <View style={[styles.wingArc, styles.wingLeft, { borderColor: patternAccent }]} />
        <View style={[styles.wingArc, styles.wingRight, { borderColor: patternAccent }]} />
      </Animated.View>

      {/* ── Single centered content column ── */}
      <View style={styles.contentColumn}>

        {/* Eyebrow */}
        <Animated.Text
          style={[
            styles.eyebrow,
            {
              color: accentMuted,
              opacity: labelFade,
              transform: [{ translateY: labelSlide }],
            },
          ]}
        >
          SERMONS OF
        </Animated.Text>

        {/* Thin accent bar */}
        <Animated.View
          style={[
            styles.accentBar,
            { backgroundColor: accent, transform: [{ scaleX: dividerScale }] },
          ]}
        />

        {/* Prophet name */}
        <Animated.Text
          style={[
            styles.mainTitle,
            {
              color: accent,
              opacity: titleFade,
              transform: [{ translateY: titleSlide }],
            },
          ]}
        >
          Robert{"\n"}Lambert Lee
        </Animated.Text>

        {/* Subtitle — flanked by hairlines */}
        <Animated.View style={[styles.subtitleRow, { opacity: subtitleFade }]}>
          <View style={[styles.hairline, { backgroundColor: divider }]} />
          <Text style={[styles.subtitleText, { color: accentMuted }]}>
            Transcribed · Audio
          </Text>
          <View style={[styles.hairline, { backgroundColor: divider }]} />
        </Animated.View>

        {/* Year range */}
        <Animated.Text
          style={[
            styles.yearText,
            {
              color: accentMuted,
              opacity: yearFade,
              transform: [{ scale: yearScale }],
            },
          ]}
        >
          1964 – 1973
        </Animated.Text>

        {/* Section divider before quote */}
        <View style={[styles.sectionDivider, { backgroundColor: divider }]} />

        {/* Scripture quote */}
        <Animated.View
          style={{ opacity: quoteFade, transform: [{ translateY: quoteSlide }] }}
        >
          <Text
            style={[
              styles.quoteOpen,
              {
                color: theme.dark
                  ? "rgba(230,195,184,0.15)"
                  : "rgba(93,50,17,0.10)",
              },
            ]}
          >
            {"\u201C"}
          </Text>
          <Text style={[styles.quoteText, { color: accentMuted }]}>
            And I saw another mighty angel come down from
            heaven, clothed with a cloud: and a rainbow was upon his head.
          </Text>
          <View style={styles.quoteRefRow}>
            <View
              style={[
                styles.quoteRefLine,
                {
                  backgroundColor: theme.dark
                    ? "rgba(242,205,180,0.4)"
                    : "rgba(93,50,17,0.3)",
                },
              ]}
            />
            <Text
              style={[
                styles.quoteRef,
                {
                  color: theme.dark ? "#f2cdb4" : "#5d3211",
                  textShadowColor: theme.dark
                    ? "rgba(242, 205, 180, 0.55)"
                    : "rgba(93, 50, 17, 0.28)",
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 6,
                },
              ]}
            >
              REVELATION 10 : 1
            </Text>
            <View
              style={[
                styles.quoteRefLine,
                {
                  backgroundColor: theme.dark
                    ? "rgba(242,205,180,0.4)"
                    : "rgba(93,50,17,0.3)",
                },
              ]}
            />
          </View>
        </Animated.View>

        {/* CTA — Morphing Button Flow matching reference images */}
        <Animated.View
          style={{
            opacity: btnFade,
            transform: [{ translateY: btnSlide }],
            marginTop: verticalScale(28),
            width: "100%",
            alignItems: "center",
          }}
        >
          {downloadError ? (
            <View style={{ alignItems: "center", width: "100%" }}>
              <Text style={[styles.errorText, { color: theme.dark ? "#ff8a80" : "#b71c1c", marginBottom: 12 }]}>
                {downloadError}
              </Text>
              <TransformingDownloadButton
                label="Retry"
                onPress={handleDownloadDatabase}
              />
            </View>
          ) : (
            <TransformingDownloadButton
              label={
                dbExists
                  ? "Read"
                  : dbNeedsUpdate
                  ? "Update Sermons"
                  : "Download Sermons"
              }
              onPress={dbExists ? handleBeginReading : handleDownloadDatabase}
              isDownloading={isDownloading}
              downloadProgress={downloadProgress}
              isDone={isDone}
              onCancel={handleCancelDownload}
            />
          )}
        </Animated.View>

      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* Background layers */
  topImageWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "42%",
    overflow: "hidden",
  },
  topImage: { width: "100%", height: "100%" },
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

  /* Single centered content column */
  contentColumn: {
    alignItems: "center",
    paddingHorizontal: horizontalScale(28),
    width: "100%",
  },

  /* Eyebrow label */
  eyebrow: {
    fontFamily: "ZillaSlab-SemiBold",
    fontSize: responsiveFontSize(10),
    letterSpacing: 5,
    textTransform: "uppercase",
    marginBottom: verticalScale(8),
  },

  /* Thin accent bar beneath eyebrow */
  accentBar: {
    width: 32,
    height: 2,
    borderRadius: 2,
    marginBottom: verticalScale(12),
    opacity: 0.6,
  },

  /* Prophet name */
  mainTitle: {
    fontFamily: "Philosopher",
    fontSize: responsiveFontSize(50),
    textAlign: "center",
    lineHeight: responsiveFontSize(56),
    marginBottom: verticalScale(14),
  },

  /* Subtitle row — text flanked by hairlines */
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: verticalScale(6),
    width: "80%",
  },
  hairline: {
    flex: 1,
    height: 1,
    borderRadius: 1,
    opacity: 0.7,
  },
  subtitleText: {
    fontFamily: "Philosopher",
    fontSize: responsiveFontSize(11.5),
    letterSpacing: 1.5,
  },

  /* Year */
  yearText: {
    fontFamily: "Philosopher",
    fontSize: responsiveFontSize(12),
    letterSpacing: 4,
    marginBottom: verticalScale(18),
  },

  /* Thin full-width section divider */
  sectionDivider: {
    width: "55%",
    height: 1,
    borderRadius: 1,
    marginBottom: verticalScale(14),
    opacity: 0.45,
  },

  /* Scripture quote */
  quoteOpen: {
    fontFamily: "Philosopher",
    fontSize: responsiveFontSize(34),
    textAlign: "center",
    lineHeight: responsiveFontSize(20),
    marginBottom: -verticalScale(2),
  },
  quoteText: {
    fontFamily: "Philosopher",
    fontSize: responsiveFontSize(17),
    textAlign: "center",
    lineHeight: responsiveFontSize(23),
  },
  quoteRefRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: verticalScale(10),
  },
  quoteRefLine: {
    width: 28,
    height: 1,
    borderRadius: 1,
  },
  quoteRef: {
    fontFamily: "Philosopher",
    fontSize: responsiveFontSize(13),
    textAlign: "center",
    letterSpacing: 4,
    textTransform: "uppercase",
  },

  /* Download progress panel */
  downloadPanel: {
    width: Math.min(screenWidth * 0.84, 400),
    paddingHorizontal: horizontalScale(18),
    paddingVertical: verticalScale(14),
    gap: 14,
    borderWidth: 1,
    borderRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 7,
  },
  dlRow: { flexDirection: "row", alignItems: "center" },
  dlSpinner: {
    width: horizontalScale(34),
    height: horizontalScale(34),
    borderRadius: horizontalScale(17),
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dlTitle: {
    fontFamily: "Philosopher",
    fontSize: responsiveFontSize(14.5),
  },
  dlSub: {
    fontFamily: "Philosopher",
    fontSize: responsiveFontSize(10.5),
    marginTop: 2,
  },
  dlPercent: {
    fontFamily: "Philosopher",
    fontSize: responsiveFontSize(19),
    minWidth: horizontalScale(46),
    textAlign: "right",
  },
  dlTrack: {
    width: "100%",
    height: 7,
    borderRadius: 999,
    overflow: "hidden",
  },
  dlFill: {
    height: "100%",
    minWidth: 6,
    borderRadius: 999,
  },
  dlCancel: {
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  dlCancelText: {
    fontFamily: "Philosopher",
    fontSize: responsiveFontSize(11),
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  /* Error state */
  errorWrap: { alignItems: "center", gap: 14 },
  errorText: {
    fontFamily: "Philosopher",
    fontSize: responsiveFontSize(13),
    textAlign: "center",
    lineHeight: responsiveFontSize(20),
  },
});

export default Welcome;
