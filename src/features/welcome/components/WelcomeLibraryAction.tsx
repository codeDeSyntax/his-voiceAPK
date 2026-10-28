import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { getWelcomePalette, welcomeStyles as styles } from "../styles";
import type { WelcomeLibraryActionProps } from "../types";

const WelcomeLibraryAction = ({
  theme,
  dbExists,
  dbNeedsUpdate,
  isChecking,
  isDownloading,
  downloadProgress,
  downloadError,
  onOpen,
  handleDownloadDatabase,
  handleCancelDownload,
}: WelcomeLibraryActionProps) => {
  const colors = getWelcomePalette(theme);
  const progress = Math.min(100, Math.max(0, Math.round(downloadProgress)));
  const preparing = progress >= 100;
  // If local database exists, user is ready to open sermons!
  const ready = dbExists;
  // Checking is only blocking if we don't have a local database yet
  const checking = isChecking && !dbExists;
  const label = downloadError
    ? "Try again"
    : ready
    ? "Open sermons"
    : "Download sermons";

  return (
    <View style={[styles.actionArea, { borderTopColor: colors.border }]}>
      {isDownloading ? (
        <>
          <View style={styles.progressHeader}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text
              accessibilityLiveRegion="polite"
              style={[styles.progressTitle, { color: colors.ink }]}
            >
              {preparing
                ? "Preparing your library"
                : dbNeedsUpdate
                ? "Updating your library"
                : "Downloading sermons"}
            </Text>
            <Text style={[styles.percentage, { color: colors.muted }]}>
              {progress}%
            </Text>
          </View>
          <View
            accessibilityRole="progressbar"
            accessibilityLabel="Sermon library download"
            accessibilityValue={{ min: 0, max: 100, now: progress }}
            style={[styles.progressTrack, { backgroundColor: colors.surface }]}
          >
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%`, backgroundColor: colors.accent },
              ]}
            />
          </View>
          <View style={styles.downloadFooter}>
            <Text style={[styles.progressHint, { color: colors.muted }]}>
              {preparing
                ? "Getting the sermons ready to open…"
                : "Keep the app open while your library downloads."}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: preparing }}
              onPress={handleCancelDownload}
              disabled={preparing}
              style={({ pressed }) => [
                styles.cancel,
                {
                  opacity: preparing ? 0.4 : 1,
                  backgroundColor: pressed ? colors.surface : "transparent",
                },
              ]}
            >
              <Text style={[styles.cancelLabel, { color: colors.ink }]}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          {downloadError && (
            <Text
              accessibilityRole="alert"
              style={[styles.error, { color: colors.error }]}
            >
              {downloadError}
            </Text>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={checking ? "Checking your library" : label}
            accessibilityState={{ disabled: checking, busy: checking }}
            disabled={checking}
            onPress={
              downloadError
                ? handleDownloadDatabase
                : ready
                ? onOpen
                : handleDownloadDatabase
            }
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor: colors.accent,
                opacity: checking ? 0.45 : pressed ? 0.85 : 1,
              },
            ]}
          >
            {checking ? (
              <ActivityIndicator size="small" color={colors.onAccent} />
            ) : ready && !downloadError ? (
              <Ionicons
                name="library-outline"
                size={21}
                color={colors.onAccent}
              />
            ) : (
              <Feather
                name={downloadError ? "rotate-ccw" : "download-cloud"}
                size={21}
                color={colors.onAccent}
              />
            )}
            <Text style={[styles.buttonLabel, { color: colors.onAccent }]}>
              {checking ? "One moment…" : label}
            </Text>
            <Feather name="arrow-right" size={19} color={colors.onAccent} />
          </Pressable>

          {/* If an update is available online and we have local sermons, offer the update non-intrusively */}
          {ready && !downloadError && dbNeedsUpdate && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Update sermon database"
              onPress={handleDownloadDatabase}
              style={({ pressed }) => [
                styles.updateNotice,
                {
                  backgroundColor: pressed ? colors.surface : "transparent",
                  borderColor: colors.border,
                },
              ]}
            >
              <Feather name="refresh-cw" size={14} color={colors.accent} />
              <Text style={[styles.updateNoticeText, { color: colors.ink }]}>
                New database update available • Tap to update
              </Text>
            </Pressable>
          )}

          {/* If update download failed but local database exists, provide immediate access to local sermons */}
          {ready && downloadError && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue to existing sermons"
              onPress={onOpen}
              style={styles.secondaryAction}
            >
              <Text style={[styles.secondaryActionText, { color: colors.ink }]}>
                Continue to existing sermons offline →
              </Text>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
};

export default WelcomeLibraryAction;
