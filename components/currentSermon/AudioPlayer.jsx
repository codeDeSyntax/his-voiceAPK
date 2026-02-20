import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import Slider from "@react-native-community/slider";
import * as Audio from "expo-audio";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../../Logic/globalState";
import { responsiveFontSize } from "../../Utils/responsiveUtils";

// Precomputed icon sizes — stable across renders
const ICON_SIZE_LG = responsiveFontSize(32);
const ICON_SIZE_MD = responsiveFontSize(24);

// Pure utility — no closure dependencies, defined at module level
const formatTime = (seconds) => {
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

const AudioPlayer = ({ audioUrl, sermonTitle }) => {
  // ALL hooks must be called unconditionally before any early return.
  const { theme } = useAppContext();
  const [error, setError] = useState(null);

  // Reset error state when audio URL changes
  useEffect(() => {
    setError(null);
  }, [audioUrl]);

  // updateInterval 500ms → 2 status updates/sec while playing instead of 20.
  // The slider moves smoothly via native animation; the JS label update at 2Hz is enough.
  const player = Audio.useAudioPlayer(audioUrl || "", {
    updateInterval: 500,
    downloadFirst: true,
  });

  const status = Audio.useAudioPlayerStatus(player);

  useEffect(() => {
    if (status.error) {
      setError("Failed to load message");
    }
  }, [status.error]);

  // --- Early returns go here, after all hooks ---
  if (!audioUrl) {
    return <Text>No message available</Text>;
  }

  if (!theme?.colors) {
    return <Text>Theme not available</Text>;
  }

  if (!player) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.secondary }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Handlers — defined after hooks, stable references via useCallback are not
  // needed here because re-renders only happen at 2Hz (updateInterval) while
  // playing, which is acceptable. The player ref is stable.
  const togglePlayPause = () => {
    try {
      if (status.playing) {
        player.pause();
      } else {
        player.play();
      }
    } catch (err) {
      console.error("Error toggling play/pause:", err);
      setError("Failed to play message");
    }
  };

  const handleSliderChange = (value) => {
    try {
      player.seekTo(value);
    } catch (err) {
      console.error("Error seeking audio:", err);
    }
  };

  const handleSkipBackward = () => {
    try {
      const newTime = Math.max(0, status.currentTime - 10);
      player.seekTo(newTime);
    } catch (err) {
      console.error("Error skipping backward:", err);
    }
  };

  const handleSkipForward = () => {
    try {
      const newTime = Math.min(status.duration, status.currentTime + 10);
      player.seekTo(newTime);
    } catch (err) {
      console.error("Error skipping forward:", err);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.secondary, borderRadius: 32 },
      ]}
    >
      {/* Sermon Image - Rounded */}
      {status.isLoaded && (
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/roundedLam.jpg")}
            style={[
              styles.sermonImage,
              { backgroundColor: theme.colors.primary + "10" },
            ]}
          />
        </View>
      )}

      {/* Sermon Info */}
      <View style={styles.infoSection}>
        <Text style={[styles.sermonTitle, { color: theme.colors.text }]}>
          {sermonTitle}
        </Text>
        <Text style={[styles.label, { color: theme.colors.text + "DD" }]}>
          Word of God
        </Text>
      </View>

      {error && (
        <Text style={[styles.errorText, { color: "#ff6b6b" }]}>{error}</Text>
      )}

      {/* Progress Bar */}
      {status.isLoaded && status.duration > 0 && (
        <View
          style={[
            styles.progressSection,
            { backgroundColor: theme.colors.primary + "08" },
          ]}
        >
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={status.duration}
            value={Math.max(0, Math.min(status.currentTime, status.duration))}
            onValueChange={handleSliderChange}
            minimumTrackTintColor={theme.dark ? "#f2cdb4" : "#8b4513"}
            maximumTrackTintColor={
              theme.dark ? "rgba(242, 205, 180, 0.2)" : "rgba(93, 50, 17, 0.15)"
            }
            thumbTintColor={theme.dark ? "#f2cdb4" : "#5d3211"}
            disabled={!status.isLoaded}
            step={1}
          />
          <View style={styles.timeRow}>
            <Text style={[styles.timeText, { color: theme.colors.text }]}>
              {formatTime(status.currentTime)}
            </Text>
            <Text style={[styles.timeText, { color: theme.colors.text }]}>
              {formatTime(status.duration)}
            </Text>
          </View>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleSkipBackward}
          disabled={!status.isLoaded}
        >
          <MaterialCommunityIcons
            name="rewind-10"
            size={ICON_SIZE_MD}
            color={
              status.isLoaded
                ? theme.colors.text + "99"
                : theme.colors.text + "44"
            }
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: "#d4a574" }]}
          onPress={togglePlayPause}
          disabled={!status.isLoaded}
        >
          {!status.isLoaded ? (
            <ActivityIndicator size="small" color={theme.colors.background} />
          ) : (
            <Ionicons
              name={status.playing ? "pause" : "play"}
              size={ICON_SIZE_LG}
              color={theme.colors.background}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleSkipForward}
          disabled={!status.isLoaded}
        >
          <MaterialCommunityIcons
            name="fast-forward-10"
            size={ICON_SIZE_MD}
            color={
              status.isLoaded
                ? theme.colors.text + "99"
                : theme.colors.text + "44"
            }
          />
        </TouchableOpacity>
      </View>

      {/* Status Text */}
      <Text style={[styles.statusText, { color: theme.colors.text + "88" }]}>
        {status.playing ? "Now playing" : "Ready to listen"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  imageContainer: {
    marginBottom: 12,
    alignItems: "center",
  },
  sermonImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  infoSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  sermonTitle: {
    fontSize: responsiveFontSize(14),
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
    lineHeight: 18,
    fontFamily: "ZillaSlab",
  },
  label: {
    fontSize: responsiveFontSize(13),
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontFamily: "ZillaSlab",
  },
  progressSection: {
    width: "100%",
    marginBottom: 12,
    borderRadius: 20,
    padding: 12,
  },
  slider: {
    width: "100%",
    height: 30,
    marginVertical: 2,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginTop: 2,
  },
  timeText: {
    fontSize: responsiveFontSize(14),
    fontWeight: "700",
    letterSpacing: 0.3,
    fontFamily: "ZillaSlab",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
    columnGap: 30,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  secondaryButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  statusText: {
    fontSize: responsiveFontSize(10),
    fontWeight: "600",
    letterSpacing: 0.2,
    textTransform: "capitalize",
    fontFamily: "ZillaSlab",
  },
  errorText: {
    fontSize: responsiveFontSize(13),
    marginBottom: 20,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default AudioPlayer;
