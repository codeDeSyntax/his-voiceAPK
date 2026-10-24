import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { getWelcomePalette, welcomeStyles as styles } from "../styles";
import type { WelcomeLibraryActionProps } from "../types";

const WelcomeLibraryAction = ({
  theme, dbExists, dbNeedsUpdate, isChecking, isDownloading, downloadProgress,
  downloadError, onOpen, handleDownloadDatabase, handleCancelDownload,
}: WelcomeLibraryActionProps) => {
  const colors = getWelcomePalette(theme);
  const progress = Math.min(100, Math.max(0, Math.round(downloadProgress)));
  const preparing = progress >= 100;
  const ready = dbExists && !downloadError;
  const label = downloadError ? "Try again" : ready ? "Open sermons" : dbNeedsUpdate ? "Update library" : "Download sermons";

  return (
    <View style={[styles.actionArea, { borderTopColor: colors.border }]}>
      {isDownloading ? (
        <>
          <View style={styles.progressHeader}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text accessibilityLiveRegion="polite" style={[styles.progressTitle, { color: colors.ink }]}>
              {preparing ? "Preparing your library" : dbNeedsUpdate ? "Updating your library" : "Downloading sermons"}
            </Text>
            <Text style={[styles.percentage, { color: colors.muted }]}>{progress}%</Text>
          </View>
          <View accessibilityRole="progressbar" accessibilityLabel="Sermon library download"
            accessibilityValue={{ min: 0, max: 100, now: progress }}
            style={[styles.progressTrack, { backgroundColor: colors.surface }]}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.accent }]} />
          </View>
          <View style={styles.downloadFooter}>
            <Text style={[styles.progressHint, { color: colors.muted }]}>
              {preparing ? "Getting the sermons ready to open…" : "Keep the app open while your library downloads."}
            </Text>
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: preparing }} onPress={handleCancelDownload} disabled={preparing}
              style={({ pressed }) => [styles.cancel, { opacity: preparing ? 0.4 : 1, backgroundColor: pressed ? colors.surface : "transparent" }]}>
              <Text style={[styles.cancelLabel, { color: colors.ink }]}>Cancel</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          {downloadError && <Text accessibilityRole="alert" style={[styles.error, { color: colors.error }]}>{downloadError}</Text>}
          <Pressable accessibilityRole="button" accessibilityLabel={isChecking ? "Checking your library" : label}
            accessibilityState={{ disabled: isChecking, busy: isChecking }} disabled={isChecking}
            onPress={ready ? onOpen : handleDownloadDatabase}
            style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.accent, opacity: isChecking ? 0.45 : pressed ? 0.85 : 1 }]}>
            {isChecking ? <ActivityIndicator size="small" color={colors.onAccent} /> : ready ? <Ionicons name="library-outline" size={21} color={colors.onAccent} /> :
              <Feather name={downloadError ? "rotate-ccw" : dbNeedsUpdate ? "refresh-cw" : "download-cloud"} size={21} color={colors.onAccent} />}
            <Text style={[styles.buttonLabel, { color: colors.onAccent }]}>{isChecking ? "One moment…" : label}</Text>
            <Feather name="arrow-right" size={19} color={colors.onAccent} />
          </Pressable>
        </>
      )}
    </View>
  );
};

export default WelcomeLibraryAction;
