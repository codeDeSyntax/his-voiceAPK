import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useAppContext } from "../../Logic/globalState";
import { useNavigation, CommonActions } from "@react-navigation/native";
import AudioPlayer from "./AudioPlayer";
import { Ionicons } from "@expo/vector-icons";
import { responsiveFontSize } from "../../Utils/responsiveUtils";

const PlaySermon = () => {
  const { selectedSermon, theme } = useAppContext();
  const navigation = useNavigation();

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

  const isDark = theme.dark;
  const accentColor = isDark ? "#f2cdb4" : "#5d3211";
  const mutedColor = isDark ? "rgba(242,205,180,0.4)" : "rgba(93,50,17,0.4)";

  const handleBack = () => {
    const navigationState = navigation.getState();
    const canGoBack = navigationState && navigationState.index > 0;
    if (canGoBack) {
      navigation.goBack();
    } else {
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: "welcome" }] }),
      );
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backBtn}
            activeOpacity={0.65}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color={accentColor} />
          </TouchableOpacity>

          <View style={styles.topCenter}>
            <Text style={[styles.topSubLabel, { color: mutedColor }]}>
              PLAYING NOW
            </Text>
            <Text
              style={[styles.topTitle, { color: accentColor }]}
              numberOfLines={1}
            >
              {selectedSermon.title}
            </Text>
          </View>

          {/* Menu icon balances the back button, mirrors the reference design */}
          <TouchableOpacity
            style={styles.menuBtn}
            activeOpacity={0.65}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="menu" size={22} color={accentColor} />
          </TouchableOpacity>
        </View>

        {/* Player — fills remaining height */}
        {downloadLink ? (
          <AudioPlayer
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
    paddingVertical: 12,
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
    fontFamily: "Merriweather",
    letterSpacing: 2,
    marginBottom: 2,
  },
  topTitle: {
    fontSize: responsiveFontSize(12),
    fontFamily: "Merriweathersm",
    letterSpacing: 0.2,
    fontWeight: "700",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: responsiveFontSize(14),
    fontFamily: "Merriweather",
    textAlign: "center",
    lineHeight: 22,
  },
});

export default PlaySermon;
