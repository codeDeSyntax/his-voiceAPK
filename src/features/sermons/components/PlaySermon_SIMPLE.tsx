import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { useAppContext } from "../../../providers/SermonProvider";
import { useRouter } from "expo-router";
import AudioPlayer from "./AudioPlayer";
import AudioPlaylist from "./AudioPlaylist";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { responsiveFontSize } from "../../../shared/utils/responsiveUtils";
import type { Sermon } from "../types";

const PlaySermon = () => {
  const { selectedSermon, setSelectedSermon, theme } = useAppContext();
  const navigation = useRouter();
  const [showPlaylist, setShowPlaylist] = useState(false);

  // Use app theme colors
  const bgColor = theme.colors.background;
  const textColor = theme.dark ? "#f2cdb4" : "#5d3211";
  const mutedColor = theme.dark ? "rgba(242,205,180,0.4)" : "rgba(93,50,17,0.4)";

  const handleOpenPlaylist = useCallback(() => {
    setShowPlaylist(true);
  }, []);

  const handleClosePlaylist = useCallback(() => {
    setShowPlaylist(false);
  }, []);

  const handleSermonSelect = useCallback((sermon: Sermon) => {
    setSelectedSermon(sermon);
  }, [setSelectedSermon]);



  if (!selectedSermon) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No sermon selected</Text>
      </View>
    );
  }

  if (selectedSermon.type !== "mp3") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>This is not an audio sermon</Text>
      </View>
    );
  }

  const downloadLink =
    selectedSermon.downloadLink || selectedSermon.audioUrl || "";

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.back();
    } else {
      navigation.replace("/");
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: "transparent" }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backBtn}
            activeOpacity={0.65}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color={textColor} />
          </TouchableOpacity>

          <View style={styles.topCenter}>
            <Text style={[styles.topSubLabel, { color: mutedColor }]}>
              PLAYING NOW
            </Text>
            <Text
              style={[styles.topTitle, { color: textColor }]}
              numberOfLines={2}
            >
              {selectedSermon.title.slice(0, 30)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.menuBtn}
            activeOpacity={0.65}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={handleOpenPlaylist}
          >
            <AntDesign name="align-left" size={22} color={textColor} />
          </TouchableOpacity>
        </View>

        {/* Player */}
        {downloadLink ? (
          <AudioPlayer
            key={downloadLink}
            audioUrl={downloadLink}
            sermonTitle={selectedSermon.title}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Ionicons
              name="musical-note-outline"
              size={48}
              color={mutedColor}
              style={{ marginBottom: 16 }}
            />
            <Text style={[styles.errorText, { color: mutedColor }]}>
              No audio available for this sermon
            </Text>
          </View>
        )}
      </SafeAreaView>

      {/* Audio Playlist Modal */}
      <AudioPlaylist
        visible={showPlaylist}
        onClose={handleClosePlaylist}
        currentSermon={selectedSermon}
        onSermonSelect={handleSermonSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 8 : 12,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  menuBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  topCenter: {
    flex: 1,
    alignItems: "center",
  },
  topSubLabel: {
    fontSize: responsiveFontSize(9),
    fontFamily: "Philosopher",
    letterSpacing: 2,
    marginBottom: 2,
  },
  topTitle: {
    fontSize: responsiveFontSize(13),
    fontFamily: "Philosopher",
    letterSpacing: 0.2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: responsiveFontSize(14),
    fontFamily: "Philosopher",
    textAlign: "center",
    lineHeight: 22,
  },
});

export default PlaySermon;
