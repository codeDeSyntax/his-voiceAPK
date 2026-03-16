import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import Slider from "@react-native-community/slider";
import * as Audio from "expo-audio";
import { setAudioModeAsync } from "expo-audio";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../../Logic/globalState";
import { responsiveFontSize } from "../../Utils/responsiveUtils";
import { AudioSkeletonLoader } from "../Loader";
import { Asset } from "expo-asset";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ARTWORK_SIZE = SCREEN_WIDTH * 0.62;

// Precomputed icon sizes — stable across renders
const ICON_SIZE_LG = responsiveFontSize(28);
const ICON_SIZE_MD = responsiveFontSize(22);
const ICON_SIZE_SM = responsiveFontSize(18);
const PLAY_BTN_SIZE = 62;

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
  const [looping, setLooping] = useState(false);
  const [shuffling, setShuffling] = useState(false);

  // Reset error state when audio URL changes
  useEffect(() => {
    setError(null);
  }, [audioUrl]);

  // Configure audio session for background playback on mount
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    }).catch((e) =>
      console.warn("[AudioPlayer] setAudioModeAsync failed:", e),
    );
  }, []);

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

  // Activate lock screen controls so Android keeps the foreground service alive
  // (without this, audio stops after ~3 min on Android in background)
  useEffect(() => {
    if (!player || !status.isLoaded || !sermonTitle) return;
    const activate = async () => {
      try {
        // Resolve bob.png to a local file URI (works in both dev and prod builds)
        const asset = Asset.fromModule(require("../../assets/roundedLam.png"));
        await asset.downloadAsync();
        const artworkUri = asset.localUri ?? asset.uri;

        // Truncate at word boundary so the media card title looks clean
        let displayTitle = sermonTitle;
        if (sermonTitle.length > 10) {
          const trimmed = sermonTitle.slice(0, 10);
          const lastSpace = trimmed.lastIndexOf(" ");
          displayTitle =
            (lastSpace > 3 ? trimmed.slice(0, lastSpace) : trimmed) + "...";
        }

        player.setActiveForLockScreen?.(true,
          {
            title: displayTitle,
            artist: "Robert Lambert Lee",
            albumTitle: "His Voice",
            artworkUrl: artworkUri,
          },
          {
            showSeekBackward: true,
            showSeekForward: true,
          },
        );
      } catch (e) {
        console.warn("[AudioPlayer] setActiveForLockScreen failed:", e);
      }
    };
    activate();
  }, [status.isLoaded, sermonTitle]);

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

  const toggleLoop = () => {
    const next = !looping;
    setLooping(next);
    try {
      player.loop = next;
    } catch (e) {}
  };

  const toggleShuffle = () => setShuffling((s) => !s);

  const isDark = theme.dark;
  const accent = isDark ? "#f2cdb4" : "#5d3211";
  const accentMid = isDark ? "rgba(242,205,180,0.55)" : "rgba(93,50,17,0.5)";
  const accentMuted = isDark ? "rgba(242,205,180,0.28)" : "rgba(93,50,17,0.7)";

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background,padding:10 }]}
    >
      <View 
      
      style={{
      gap:10
      }}
      >
 {/* Main player — always rendered so hooks/state stay stable */}
      <View
        style={{
         
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          opacity: status.isLoaded || error ? 1 : 0,
          pointerEvents: status.isLoaded || error ? "auto" : "none",
           backgroundColor:theme.colors.secondary,
         paddingVertical:60,
         borderRadius:40
         
        }}
      >
        {/* Floating artwork disc */}
        <View
          style={[
            styles.artworkWrapper,
            {
              shadowColor: isDark ? "#000" : "#7a5a40",
              shadowOpacity: isDark ? 0.6 : 0.28,
              
            },
          ]}
        >
          <Image
            source={require("../../assets/roundedLam.png")}
            resizeMode="contain"
            style={[
              styles.artwork,
              {
                borderColor: isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(255,255,255,0.85)",
                backgroundColor: isDark ? "#1e1208" : "#fff",
              },
            ]}
          />
        </View>

        {/* Title + subtitle */}
        <View style={styles.infoSection}>
          <Text
            style={[styles.sermonTitle, { color: theme.colors.text }]}
            numberOfLines={2}
          >
            {sermonTitle}
          </Text>
          <Text style={[styles.label, { color: accentMuted }]}>
            Robert Lambert Lee
          </Text>
        </View>

        {error && (
          <Text style={[styles.errorText, { color: "#ff6b6b" }]}>{error}</Text>
        )}

        {/* Slider with flanking timestamps + custom thick track */}
        <View style={styles.sliderSection}>
          <View style={styles.sliderRow}>
            <Text
              style={[
                styles.timeText,
                { color: accent, minWidth: 38, textAlign: "left" },
              ]}
            >
              {formatTime(status.currentTime)}
            </Text>

            {/* Custom track drawn behind the transparent-track Slider */}
            <View style={styles.sliderTrackWrap}>
              {/* Background track */}
              <View
                style={[
                  styles.sliderTrackBg,
                  {
                    backgroundColor: isDark
                      ? "rgba(242,205,180,0.18)"
                      : "rgba(93,50,17,0.18)",
                  },
                ]}
              />
              {/* Filled portion */}
              <View
                style={[
                  styles.sliderTrackFill,
                  {
                    backgroundColor: accent,
                    width: `${Math.min(100, (status.currentTime / (status.duration || 1)) * 100)}%`,
                  },
                ]}
              />
              {/* Native slider — transparent tracks, only thumb visible */}
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
                thumbTintColor={accent}
                disabled={!status.isLoaded}
                step={1}
              />
            </View>

            <Text
              style={[
                styles.timeText,
                { color: accent, minWidth: 38, textAlign: "right" },
              ]}
            >
              {formatTime(status.duration)}
            </Text>
          </View>
        </View>

       
      </View>
      <View 
        style={{
         backgroundColor:theme.colors.secondary,
         paddingVertical:30,
         borderRadius:30
      }}
      >
         {/* Controls — 5 flat buttons: repeat | skip-back | play | skip-forward | shuffle */}
        <View style={styles.controlsRow}>
          {/* Repeat */}
          <TouchableOpacity
            style={styles.flatBtn}
            onPress={toggleLoop}
            activeOpacity={0.65}
          >
            <Ionicons
              name="repeat"
              size={ICON_SIZE_SM}
              color={looping ? accent : accentMuted}
            />
          </TouchableOpacity>

          {/* Skip back 10 */}
          <TouchableOpacity
            style={styles.flatBtn}
            onPress={handleSkipBackward}
            disabled={!status.isLoaded}
            activeOpacity={0.65}
          >
            <MaterialCommunityIcons
              name="rewind-10"
              size={ICON_SIZE_MD}
              color={status.isLoaded ? accentMid : accentMuted}
            />
          </TouchableOpacity>

          {/* Play / Pause — filled accent circle */}
          <TouchableOpacity
            style={[
              styles.playBtn,
              {
                backgroundColor: isDark ? "#5a371fff" : "#5d3211",
                shadowColor: isDark ? "#784724ff" : "#5d3211",
              },
            ]}
            onPress={togglePlayPause}
            disabled={!status.isLoaded}
            activeOpacity={0.8}
          >
            {!status.isLoaded ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons
                name={status.playing ? "pause" : "play"}
                size={ICON_SIZE_LG}
                color="#fff"
                style={!status.playing && { marginLeft: 3 }}
              />
            )}
          </TouchableOpacity>

          {/* Skip forward 10 */}
          <TouchableOpacity
            style={styles.flatBtn}
            onPress={handleSkipForward}
            disabled={!status.isLoaded}
            activeOpacity={0.65}
          >
            <MaterialCommunityIcons
              name="fast-forward-10"
              size={ICON_SIZE_MD}
              color={status.isLoaded ? accentMid : accentMuted}
            />
          </TouchableOpacity>

          {/* Shuffle */}
          <TouchableOpacity
            style={styles.flatBtn}
            onPress={toggleShuffle}
            activeOpacity={0.65}
          >
            <Ionicons
              name="shuffle"
              size={ICON_SIZE_SM}
              color={shuffling ? accent : accentMuted}
            />
          </TouchableOpacity>
        </View>
      </View>
      {/* end inner player wrapper */}
      </View>
     

      {/* Skeleton overlay — absolutely positioned so it doesn't affect layout */}
      {!status.isLoaded && !error && (
        <View style={StyleSheet.absoluteFill}>
          <AudioSkeletonLoader />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Artwork — floating neumorphic disc
  artworkWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 36,
    shadowOffset: { width: 0, height: 18 },
    shadowRadius: 28,
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: ARTWORK_SIZE / 2,
    borderWidth: 3,
    overflow: "hidden",
  },

  // Info
  infoSection: {
    width: "88%",
    alignItems: "center",
    marginBottom: 32,
    gap: 6,
  },
  sermonTitle: {
    fontSize: responsiveFontSize(20),
    fontFamily: "cursive",
    textAlign: "center",
    lineHeight: 24,
    // fontWeight: "700",
  },
  label: {
    fontSize: responsiveFontSize(12),
    fontFamily: "Merriweather",
    letterSpacing: 0.3,
  },

  // Slider — flanked by timestamps on same row
  sliderSection: {
    width: "92%",
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
    height: 5,
    borderRadius: 3,
  },
  sliderTrackFill: {
    position: "absolute",
    left: 0,
    height: 5,
    borderRadius: 3,
  },
  sliderOverlay: {
    position: "absolute",
    left: -8,
    right: -8,
    height: 36,
  },
  timeText: {
    fontSize: responsiveFontSize(11),
    fontFamily: "Merriweather",
    letterSpacing: 0.2,
  },

  // Controls — 5 flat buttons
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "92%",
    gap: 0,
    justifyContent: "space-between",
  },
  flatBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  playBtn: {
    width: PLAY_BTN_SIZE,
    height: PLAY_BTN_SIZE,
    borderRadius: PLAY_BTN_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 7,
  },

  errorText: {
    fontSize: responsiveFontSize(13),
    marginBottom: 8,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default AudioPlayer;
