import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Animated,
  Easing,
  Image,
} from "react-native";
import Slider from "@react-native-community/slider";
import * as Audio from "expo-audio";
import { setAudioModeAsync } from "expo-audio";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../../../providers/SermonProvider";
import { responsiveFontSize } from "../../../shared/utils/responsiveUtils";
import { AudioSkeletonLoader } from "../../../shared/components/Loader";
import { Asset } from "expo-asset";
import type { AudioPlayerProps } from "../types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ICON_SIZE_LG = responsiveFontSize(28);
const ICON_SIZE_MD = responsiveFontSize(22);
const ICON_SIZE_SM = responsiveFontSize(18);
const PLAY_BTN_SIZE = 68;

const normalizeAudioUrl = (url: string): string => {
  try {
    return encodeURI(new URL(url).toString());
  } catch {
    return encodeURI(url);
  }
};

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const AudioPlayer = ({ audioUrl, sermonTitle }: AudioPlayerProps) => {
  const { theme } = useAppContext();
  const playableAudioUrl = audioUrl ? normalizeAudioUrl(audioUrl) : "";
  const [error, setError] = useState<string | null>(null);
  const [looping, setLooping] = useState(false);
  const [shuffling, setShuffling] = useState(false);

  // Theme colors
  const isDark = theme.dark;
  const bgColor = isDark ? "#221b17" : "#faeed1";
  const textColor = isDark ? "#f2cdb4" : "#5d3211";
  const mutedTextColor = isDark
    ? "rgba(242,205,180,0.5)"
    : "rgba(93,50,17,0.5)";
  const accentColor = "#d57a3e";
  const ringColor = isDark ? "rgba(213,122,62,0.12)" : "rgba(93,50,17,0.08)";
  const buttonBg = "rgba(255,255,255,0.92)";
  const buttonIcon = isDark ? "#2c2420" : "#5d3211";
  const sliderBg = isDark ? "rgba(213,122,62,0.2)" : "rgba(93,50,17,0.15)";

  useEffect(() => {
    setError(null);
  }, [playableAudioUrl]);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    }).catch(() => {});
  }, []);

  const player = Audio.useAudioPlayer(playableAudioUrl, {
    updateInterval: 500,
    downloadFirst: true,
  });
  const status = Audio.useAudioPlayerStatus(player);

  // Ambient pulse and vinyl rotation animations for sleek audio player experience
  const pulseAnim = useState(() => new Animated.Value(1))[0];
  const rotateAnim = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    if (status.playing) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      pulseLoop.start();

      const rotateLoop = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 30000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      rotateLoop.start();

      return () => {
        pulseLoop.stop();
        rotateLoop.stop();
      };
    } else {
      pulseAnim.setValue(1);
    }
  }, [status.playing, pulseAnim, rotateAnim]);

  useEffect(() => {
    if (status.error) setError("Failed to load message");
  }, [status.error]);

  // Lock screen controls
  useEffect(() => {
    if (!player || !status.isLoaded || !sermonTitle) return;
    const activate = async () => {
      try {
        const asset = Asset.fromModule(require("../../../../assets/roundedLam.png"));
        await asset.downloadAsync();
        const artworkUri = asset.localUri ?? asset.uri;
        let displayTitle = sermonTitle;
        if (sermonTitle.length > 10) {
          const trimmed = sermonTitle.slice(0, 10);
          const lastSpace = trimmed.lastIndexOf(" ");
          displayTitle =
            (lastSpace > 3 ? trimmed.slice(0, lastSpace) : trimmed) + "...";
        }
        player.setActiveForLockScreen?.(
          true,
          {
            title: displayTitle,
            artist: "Robert Lambert Lee",
            albumTitle: "His Voice",
            artworkUrl: artworkUri,
          },
          { showSeekBackward: true, showSeekForward: true },
        );
      } catch (e) {
        if (__DEV__)
          console.warn("[AudioPlayer] setActiveForLockScreen failed:", e);
      }
    };
    activate();
  }, [status.isLoaded, sermonTitle]);

  if (!playableAudioUrl) return <Text>No message available</Text>;
  if (!theme?.colors) return <Text>Theme not available</Text>;
  if (!player) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color={accentColor} />
      </View>
    );
  }

  const togglePlayPause = () => {
    try {
      if (status.playing) player.pause();
      else player.play();
    } catch (err) {
      console.error("Error toggling play/pause:", err);
      setError("Failed to play message");
    }
  };

  const handleSliderChange = (value: number) => {
    try {
      player.seekTo(value);
    } catch (err) {
      console.error("Error seeking:", err);
    }
  };

  const handleSkipBackward = () => {
    try {
      player.seekTo(Math.max(0, status.currentTime - 10));
    } catch (err) {
      console.error("Error skipping:", err);
    }
  };

  const handleSkipForward = () => {
    try {
      player.seekTo(Math.min(status.duration, status.currentTime + 10));
    } catch (err) {
      console.error("Error skipping:", err);
    }
  };

  const toggleLoop = () => {
    const next = !looping;
    setLooping(next);
    try {
      player.loop = next;
    } catch (e) {}
  };

  const toggleShuffle = () => setShuffling((s) => !s);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* ── Decorative background pattern ──────────────────────────────── */}
      <View style={styles.bgPattern} pointerEvents="none">
        {/* Top wave */}
        <View
          style={[
            styles.wave,
            {
              backgroundColor: isDark
                ? "rgba(213,122,62,0.06)"
                : "rgba(93,50,17,0.04)",
              top: 20,
              right: 0,
              left: -SCREEN_WIDTH * 0.1,
              width: SCREEN_WIDTH * 1.2,
              height: SCREEN_WIDTH * 1.2,
              borderRadius: (SCREEN_WIDTH * 1.2) / 2,
            },
          ]}
        />
        {/* Bottom wave */}
        <View
          style={[
            styles.wave,
            {
              backgroundColor: isDark
                ? "rgba(213,122,62,0.04)"
                : "rgba(93,50,17,0.03)",
              bottom: -50,
              left: -60,
              width: SCREEN_WIDTH * 1.4,
              height: SCREEN_WIDTH * 1.4,
              borderRadius: (SCREEN_WIDTH * 1.4) / 2,
            },
          ]}
        />
        {/* Center subtle glow */}
        <View
          style={[
            styles.wave,
            {
              backgroundColor: isDark
                ? "rgba(213,122,62,0.03)"
                : "rgba(93,50,17,0.02)",
              top: "60%",
              left: "50%",
              marginLeft: -(SCREEN_WIDTH * 0.8) / 2,
              marginTop: -(SCREEN_WIDTH * 0.8) / 2,
              width: SCREEN_WIDTH * 0.8,
              height: SCREEN_WIDTH * 0.8,
              borderRadius: (SCREEN_WIDTH * 0.8) / 2,
            },
          ]}
        />
      </View>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <View style={styles.mainContent}>
        {/* Animated Vinyl Artwork Disc */}
        <Animated.View
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
            transform: [{ scale: pulseAnim }],
          }}
        >
          <View
            style={{
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: isDark
                ? "rgba(242, 205, 180, 0.08)"
                : "rgba(93, 50, 17, 0.06)",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1.5,
              borderColor: isDark
                ? "rgba(242, 205, 180, 0.22)"
                : "rgba(93, 50, 17, 0.16)",
              shadowColor: isDark ? "#000000" : "#5d3211",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Animated.Image
              source={require("../../../../assets/roundedLam.png")}
              style={{
                width: 124,
                height: 124,
                borderRadius: 62,
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                ],
              }}
            />
          </View>
        </Animated.View>

        {/* Sermon title & artist label */}
        <View style={styles.titleArea}>
          <Text
            style={[styles.sermonTitle, { color: textColor }]}
            numberOfLines={2}
          >
            {sermonTitle}
          </Text>
          <Text style={[styles.artistLabel, { color: mutedTextColor }]}>
            Robert Lambert Lee
          </Text>
        </View>

        {/* Timer */}
        <Text style={[styles.timerText, { color: accentColor }]}>
          {formatTime(status.currentTime)}
        </Text>
        {!status.isLoaded && !error && (
          <Text style={[styles.loadingHint, { color: mutedTextColor }]}>
            Loading audio…
          </Text>
        )}
        {error && (
          <Text style={[styles.errorText, { color: "#ff6b6b" }]}>{error}</Text>
        )}

        {/* Progress bar */}
        <View style={styles.sliderSection}>
          <View style={styles.sliderRow}>
            <View style={styles.sliderTrackWrap}>
              <View
                style={[styles.sliderTrackBg, { backgroundColor: sliderBg }]}
              />
              <View
                style={[
                  styles.sliderTrackFill,
                  {
                    backgroundColor: textColor,
                    width: `${Math.min(100, (status.currentTime / (status.duration || 1)) * 100)}%`,
                  },
                ]}
              />
              <Slider
                style={styles.sliderOverlay}
                minimumValue={0}
                maximumValue={status.duration || 1}
                value={Math.max(
                  0,
                  Math.min(status.currentTime, status.duration || 1),
                )}
                onValueChange={handleSliderChange}
                minimumTrackTintColor="transparent"
                maximumTrackTintColor="transparent"
                thumbTintColor={textColor}
                disabled={!status.isLoaded}
                step={1}
              />
            </View>
          </View>
          <View style={styles.timeRow}>
            <Text style={[styles.timeText, { color: mutedTextColor }]}>
              {formatTime(status.currentTime)}
            </Text>
            <Text style={[styles.timeText, { color: mutedTextColor }]}>
              {formatTime(status.duration)}
            </Text>
          </View>
        </View>

        {/* Play / Pause — white circle */}
        <TouchableOpacity
          style={[
            styles.playBtn,
            {
              backgroundColor: buttonBg,
              shadowColor: buttonIcon,
            },
          ]}
          onPress={togglePlayPause}
          disabled={!status.isLoaded}
          activeOpacity={0.8}
        >
          {/* Glass sheen */}
          <View
            pointerEvents="none"
            style={[
              styles.playBtnSheen,
              { backgroundColor: "rgba(255,255,255,0.5)" },
            ]}
          />
          {!status.isLoaded ? (
            <ActivityIndicator size="small" color={buttonIcon} />
          ) : (
            <Ionicons
              name={status.playing ? "pause" : "play"}
              size={ICON_SIZE_LG}
              color={buttonIcon}
              style={!status.playing && { marginLeft: 3 }}
            />
          )}
        </TouchableOpacity>

        {/* Secondary controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.flatBtn}
            onPress={toggleLoop}
            activeOpacity={0.65}
          >
            <Ionicons
              name="repeat"
              size={ICON_SIZE_SM}
              color={looping ? textColor : mutedTextColor}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.flatBtn}
            onPress={handleSkipBackward}
            disabled={!status.isLoaded}
            activeOpacity={0.65}
          >
            <MaterialCommunityIcons
              name="rewind-10"
              size={ICON_SIZE_MD}
              color={status.isLoaded ? textColor : mutedTextColor}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.flatBtn}
            onPress={handleSkipForward}
            disabled={!status.isLoaded}
            activeOpacity={0.65}
          >
            <MaterialCommunityIcons
              name="fast-forward-10"
              size={ICON_SIZE_MD}
              color={status.isLoaded ? textColor : mutedTextColor}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.flatBtn}
            onPress={toggleShuffle}
            activeOpacity={0.65}
          >
            <Ionicons
              name="shuffle"
              size={ICON_SIZE_SM}
              color={shuffling ? textColor : mutedTextColor}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── Background pattern ──────────────────────────────────────────────────
  bgPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  wave: {
    position: "absolute",
  },

  // ── Main content ────────────────────────────────────────────────────
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  // Title area — centered over rings
  titleArea: {
    alignItems: "center",
    marginBottom: 20,
    maxWidth: "80%",
  },
  sermonTitle: {
    fontSize: responsiveFontSize(22),
    fontFamily: "Philosopher",
    textAlign: "center",
    lineHeight: responsiveFontSize(28),
    marginBottom: 6,
  },
  artistLabel: {
    fontSize: responsiveFontSize(13),
    fontFamily: "Philosopher",
    letterSpacing: 0.3,
  },

  // Timer
  timerText: {
    fontSize: responsiveFontSize(18),
    fontFamily: "Philosopher",
    letterSpacing: 1,
    marginBottom: 18,
  },

  // Progress bar
  sliderSection: {
    width: "88%",
    marginBottom: 24,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sliderTrackWrap: {
    flex: 1,
    height: 36,
    justifyContent: "center",
  },
  sliderTrackBg: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 2,
  },
  sliderTrackFill: {
    position: "absolute",
    left: 0,
    height: 4,
    borderRadius: 2,
  },
  sliderOverlay: {
    position: "absolute",
    left: -8,
    right: -8,
    height: 36,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -4,
  },
  timeText: {
    fontSize: responsiveFontSize(11),
    fontFamily: "Philosopher",
    letterSpacing: 0.2,
  },

  // Play button
  playBtn: {
    width: PLAY_BTN_SIZE,
    height: PLAY_BTN_SIZE,
    borderRadius: PLAY_BTN_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
    overflow: "hidden",
  },
  playBtnSheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "48%",
    borderTopLeftRadius: PLAY_BTN_SIZE / 2,
    borderTopRightRadius: PLAY_BTN_SIZE / 2,
  },

  // Secondary controls
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
  },
  flatBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingHint: {
    fontSize: responsiveFontSize(12),
    marginBottom: 10,
    textAlign: "center",
    opacity: 0.85,
    fontFamily: "Philosopher",
  },

  errorText: {
    fontSize: responsiveFontSize(13),
    marginBottom: 8,
    fontFamily: "Philosopher",
    textAlign: "center",
  },
});

export default AudioPlayer;
