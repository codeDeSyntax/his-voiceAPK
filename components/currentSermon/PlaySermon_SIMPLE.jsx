import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useAppContext } from "../../Logic/globalState";
import { useNavigation, CommonActions } from "@react-navigation/native";
import DraggableFloatingButton from "../FloatButton";
import AudioPlayer from "./AudioPlayer";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            const navigationState = navigation.getState();
            const canGoBack = navigationState && navigationState.index > 0;
            if (canGoBack) {
              navigation.goBack();
            } else {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: "welcome" }],
                }),
              );
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          <Text style={[styles.backButtonText, { color: theme.colors.text }]}>
            Back
          </Text>
        </TouchableOpacity>
      </View>

      {/* Audio Player */}
      <ScrollView style={styles.scrollView}>
        {downloadLink ? (
          <AudioPlayer
            audioUrl={downloadLink}
            sermonTitle={selectedSermon.title}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.colors.text }]}>
              No audio URL available
            </Text>
          </View>
        )}

        {/* Sermon Info */}
        <View
          style={[styles.infoCard, { backgroundColor: theme.colors.secondary }]}
        >
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {selectedSermon.title}
          </Text>
          <Text style={[styles.meta, { color: theme.colors.text }]}>
            {selectedSermon.year} • {selectedSermon.date}
          </Text>
          {selectedSermon.location && (
            <Text style={[styles.meta, { color: theme.colors.text }]}>
              📍 {selectedSermon.location}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
  },
  infoCard: {
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: "cursive",
  },
  meta: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: "ZillaSlab",
  },
});

export default PlaySermon;
