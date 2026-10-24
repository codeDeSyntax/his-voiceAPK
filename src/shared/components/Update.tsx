import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Linking,
  AppState,
  Platform,
} from "react-native";
import * as Updates from "expo-updates";
import Constants from "expo-constants";
import { MaterialIcons } from "@expo/vector-icons";
import * as IntentLauncher from "expo-intent-launcher";
import * as LegacyFileSystem from "expo-file-system/legacy";
import { LinearGradient } from "expo-linear-gradient";
import type { ReleaseData, UpdateType } from "./types";

const { width } = Dimensions.get("window");

const RELEASE_CONFIG =
  Constants.expoConfig?.extra?.releaseConfig ||
  Constants.expoConfig?.extra?.updates ||
  {};

const GITHUB_OWNER = RELEASE_CONFIG.owner;
const GITHUB_REPO = RELEASE_CONFIG.repo;
const APK_ASSET_PATTERN = RELEASE_CONFIG.apkAssetPattern || ".apk";
const UPDATE_CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000;
const FOREGROUND_RECHECK_MIN_MS = 10 * 60 * 1000;

const normalizeVersion = (version: unknown): string => String(version || "").replace(/^v/i, "");

const compareSemver = (a: string, b: string): number => {
  const aParts = normalizeVersion(a)
    .split(".")
    .map((part) => parseInt(part, 10) || 0);
  const bParts = normalizeVersion(b)
    .split(".")
    .map((part) => parseInt(part, 10) || 0);

  const length = Math.max(aParts.length, bParts.length);
  for (let index = 0; index < length; index += 1) {
    const aValue = aParts[index] || 0;
    const bValue = bParts[index] || 0;
    if (aValue > bValue) return 1;
    if (aValue < bValue) return -1;
  }

  return 0;
};

const detectMandatoryFlag = (body = "") => {
  const normalizedBody = body.toLowerCase();
  return (
    normalizedBody.includes("mandatory: true") ||
    normalizedBody.includes("mandatory=true") ||
    normalizedBody.includes("#mandatory")
  );
};

export default function UpdateScreen() {
  const [updateType, setUpdateType] = useState<UpdateType | null>(null);
  const [releaseData, setReleaseData] = useState<ReleaseData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isApplyingOta, setIsApplyingOta] = useState(false);
  const [isOpeningApk, setIsOpeningApk] = useState(false);
  const [isDownloadingApk, setIsDownloadingApk] = useState(false);
  const [apkDownloadProgress, setApkDownloadProgress] = useState(0);

  const isCheckingRef = useRef(false);
  const lastCheckAtRef = useRef(0);
  const dismissedUpdateKeyRef = useRef<string | null>(null);
  const downloadTaskRef = useRef<LegacyFileSystem.DownloadResumable | null>(null);

  const checkForOTAUpdate = useCallback(async () => {
    try {
      if (__DEV__ || !Updates.isEnabled) {
        return { available: false };
      }

      const update = await Updates.checkForUpdateAsync();
      return { available: update.isAvailable };
    } catch (error) {
      console.error("OTA update check failed:", error);
      return { available: false };
    }
  }, []);

  const checkForGithubReleaseUpdate = useCallback(async () => {
    try {
      if (!GITHUB_OWNER || !GITHUB_REPO) {
        return { available: false };
      }

      const endpoint = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
      const response = await fetch(endpoint, {
        headers: {
          Accept: "application/vnd.github+json",
        },
      });

      if (!response.ok) {
        console.log(
          "GitHub release check skipped with status",
          response.status,
        );
        return { available: false };
      }

      const latestRelease = (await response.json()) as {
        tag_name?: string;
        name?: string;
        body?: string;
        assets?: Array<{ name?: string; browser_download_url?: string }>;
      };
      const currentVersion = normalizeVersion(Constants.expoConfig?.version);
      const latestVersion = normalizeVersion(latestRelease?.tag_name);

      if (!latestVersion || compareSemver(latestVersion, currentVersion) <= 0) {
        return { available: false };
      }

      const apkAsset = (latestRelease.assets || []).find((asset) =>
        String(asset.name || "")
          .toLowerCase()
          .includes(APK_ASSET_PATTERN.toLowerCase()),
      );

      const apkUrl = apkAsset?.browser_download_url;
      if (!apkUrl) {
        return { available: false };
      }

      return {
        available: true,
        data: {
          latestVersion,
          currentVersion,
          apkUrl,
          releaseName: latestRelease?.name || latestRelease?.tag_name || latestVersion,
          mandatory: detectMandatoryFlag(latestRelease?.body),
        },
      };
    } catch (error) {
      console.error("GitHub release check failed:", error);
      return { available: false };
    }
  }, []);

  const presentUpdate = useCallback((type: UpdateType, data: ReleaseData | null = null) => {
    const updateKey =
      type === "apk"
        ? `apk:${data?.latestVersion || data?.apkUrl || "latest"}`
        : "ota:available";

    if (dismissedUpdateKeyRef.current === updateKey && !data?.mandatory) {
      return;
    }

    setReleaseData(data);
    setUpdateType(type);
    setModalVisible(true);
  }, []);

  const checkForAnyUpdate = useCallback(
    async ({ force = false } = {}) => {
      const now = Date.now();

      if (isCheckingRef.current) {
        return;
      }

      if (
        !force &&
        lastCheckAtRef.current &&
        now - lastCheckAtRef.current < FOREGROUND_RECHECK_MIN_MS
      ) {
        return;
      }

      isCheckingRef.current = true;

      try {
        const [otaResult, releaseResult] = await Promise.all([
          checkForOTAUpdate(),
          checkForGithubReleaseUpdate(),
        ]);

        lastCheckAtRef.current = Date.now();

        // Native build update takes priority if both exist.
        if (releaseResult.available) {
          presentUpdate("apk", releaseResult.data ? {
            ...releaseResult.data,
            releaseName: releaseResult.data.releaseName ?? "",
          } : releaseResult.data);
          return;
        }

        if (otaResult.available) {
          presentUpdate("ota");
        }
      } finally {
        isCheckingRef.current = false;
      }
    },
    [checkForGithubReleaseUpdate, checkForOTAUpdate, presentUpdate],
  );

  useEffect(() => {
    checkForAnyUpdate({ force: true });

    let previousAppState = AppState.currentState;

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      const cameToForeground =
        String(previousAppState).match(/inactive|background/) &&
        nextAppState === "active";

      if (cameToForeground) {
        checkForAnyUpdate();
      }

      previousAppState = nextAppState;
    });

    const intervalId = setInterval(() => {
      if (AppState.currentState === "active") {
        checkForAnyUpdate();
      }
    }, UPDATE_CHECK_INTERVAL_MS);

    return () => {
      subscription.remove();
      clearInterval(intervalId);
    };
  }, [checkForAnyUpdate]);

  const dismissModal = () => {
    if (updateType === "apk" && releaseData?.mandatory) {
      return;
    }

    if (updateType === "apk") {
      dismissedUpdateKeyRef.current = `apk:${
        releaseData?.latestVersion || releaseData?.apkUrl || "latest"
      }`;
    } else if (updateType === "ota") {
      dismissedUpdateKeyRef.current = "ota:available";
    }

    setModalVisible(false);
  };

  const handleUpdate = async () => {
    try {
      if (updateType === "apk") {
        if (!releaseData?.apkUrl) {
          return;
        }

        if (Platform.OS === "android") {
          setIsDownloadingApk(true);
          setApkDownloadProgress(0);

          const fileUri = `${LegacyFileSystem.documentDirectory}hisvoice-update.apk`;

          const downloadTask = LegacyFileSystem.createDownloadResumable(
            releaseData.apkUrl,
            fileUri,
            {},
            ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
              if (totalBytesExpectedToWrite > 0) {
                const percent = Math.floor(
                  (totalBytesWritten / totalBytesExpectedToWrite) * 100,
                );
                setApkDownloadProgress(percent);
              }
            },
          );
          downloadTaskRef.current = downloadTask;

          const result = await downloadTask.downloadAsync();
          setIsDownloadingApk(false);

          if (result?.uri) {
            const contentUri = await LegacyFileSystem.getContentUriAsync(
              result.uri,
            );
            await IntentLauncher.startActivityAsync(
              "android.intent.action.VIEW",
              {
                data: contentUri,
                flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
                type: "application/vnd.android.package-archive",
              },
            );
            dismissModal();
            return;
          }
        }

        // Fallback for non-Android
        setIsOpeningApk(true);
        await Linking.openURL(releaseData.apkUrl);
        setIsOpeningApk(false);
        dismissModal();
        return;
      }

      if (__DEV__ || !Updates.isEnabled) {
        dismissModal();
        return;
      }

      setIsApplyingOta(true);
      await Updates.fetchUpdateAsync();
      dismissModal();
      setIsApplyingOta(false);

      setTimeout(async () => {
        await Updates.reloadAsync();
      }, 100);
    } catch (error) {
      console.error("Error applying update:", error);
      setIsApplyingOta(false);
      setIsOpeningApk(false);
      setIsDownloadingApk(false);
      dismissModal();
    }
  };

  const isBusy = isApplyingOta || isOpeningApk || isDownloadingApk;

  const isApkUpdate = updateType === "apk";
  const titleText = isApkUpdate ? "New Build Available" : "Update Available";
  const bodyText = isApkUpdate
    ? `A newer build (v${releaseData?.latestVersion}) is available. Download and install to continue.`
    : "An over-the-air update is available. Apply now to restart with the latest fixes.";
  const primaryText = isApkUpdate
    ? isDownloadingApk
      ? `DOWNLOADING... ${apkDownloadProgress}%`
      : isOpeningApk
        ? "[ OPENING DOWNLOAD... ]"
        : "[ INSTALL UPDATE ]"
    : isApplyingOta
      ? "[ APPLYING UPDATE... ]"
      : "[ UPDATE NOW ]";

  return (
    <Modal
      visible={modalVisible}
      transparent={false}
      animationType="fade"
      onRequestClose={dismissModal}
      statusBarTranslucent={true}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.fullScreenContainer}>
        <View style={{ marginTop: 40 }}>
          <Text style={styles.title}>{titleText}</Text>
          <Text style={styles.message}>{bodyText}</Text>
        </View>

        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <MaterialIcons
            name={isApkUpdate ? "system-update-alt" : "cloud-download"}
            size={140}
            color="#7e5619"
          />
        </View>

        {isApkUpdate && releaseData?.releaseName ? (
          <Text style={styles.releaseText}>{releaseData.releaseName}</Text>
        ) : null}

        {isApkUpdate && releaseData?.mandatory ? (
          <Text style={styles.mandatoryText}>
            This build is marked mandatory.
          </Text>
        ) : null}

        {isDownloadingApk ? (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={["#D4AF37", "#8b4513"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[
                  styles.progressFill,
                  { width: `${apkDownloadProgress}%` },
                ]}
              />
            </View>
          </View>
        ) : null}

        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.primaryButton, isBusy && { opacity: 0.7 }]}
            onPress={handleUpdate}
            disabled={isBusy}
          >
            <MaterialIcons
              name={isApkUpdate ? "download" : "refresh"}
              size={24}
              color="#000000"
            />
            <Text style={styles.primaryButtonText}>{primaryText}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, isBusy && { opacity: 0.4 }]}
            onPress={() => !isBusy && dismissModal()}
            disabled={isBusy || (isApkUpdate && releaseData?.mandatory)}
          >
            <Text style={styles.secondaryButtonText}>
              {isApkUpdate && releaseData?.mandatory
                ? "[ UPDATE REQUIRED ]"
                : "[ LATER ]"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            His Voice APK • Version {Constants.expoConfig?.version || "1.0.0"}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#000000",
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 2,
    textAlign: "center",
    fontFamily: "ZillaSlab-SemiBold",
  },
  message: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 24,
    fontFamily: "ZillaSlab-Regular",
    letterSpacing: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  releaseText: {
    color: "#D4AF37",
    textAlign: "center",
    fontFamily: "ZillaSlab-SemiBold",
    fontSize: 14,
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  mandatoryText: {
    color: "#ffcf8a",
    textAlign: "center",
    fontFamily: "ZillaSlab-Regular",
    fontSize: 13,
    letterSpacing: 0.4,
    marginBottom: 16,
  },
  progressContainer: {
    paddingHorizontal: 30,
    marginVertical: 12,
  },
  progressTrack: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    minWidth: 8,
  },
  actionSection: {
    paddingHorizontal: 30,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: "#D4AF37",
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  primaryButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
    letterSpacing: 1,
    fontFamily: "ZillaSlab-SemiBold",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1,
    fontFamily: "ZillaSlab-SemiBold",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 24,
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    letterSpacing: 1,
    fontFamily: "ZillaSlab-Regular",
  },
});
