// File: Settings.js
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  View,
  Text,
  ScrollView,
  Animated,

  SafeAreaView,

} from "react-native";

import { useAppContext } from "../../../providers/SermonProvider";
import { styles } from "../styles/settings";

// Import components
import SettingsHeader from "../components/SettingsHeader";
import DisplaySettings from "../components/DisplaySettings";
import AppSettings from "../components/AppSettings";
import SavingModal from "../components/SavingModal";
import DraggableFloatingButton from "../../../shared/components/FloatButton";
import { useRouter } from "expo-router";
import type { ReaderSettings } from "../types";

// Constants moved here to be accessible to all components
export const FONT_OPTIONS = [
  { name: "System Default", value: "System" },
  { name: "ZillaSlab Regular", value: "ZillaSlab-Regular" },
  { name: "ZillaSlab SemiBold", value: "ZillaSlab-SemiBold" },
  { name: "Merriweather", value: "Merriweather" },
  { name: "Lora", value: "Lora" },
  { name: "Merienda", value: "Merienda-VariableFont_wght" },
  { name: "Philosopher", value: "Philosopher-Regular" },
];

export const COLOR_OPTIONS = [
  { name: "Blue", value: "#4bb7e6", textColor: "#FFFFFF" },
  { name: "Green", value: "#10B981", textColor: "#FFFFFF" },
  { name: "Purple", value: "#8B5CF6", textColor: "#FFFFFF" },
  { name: "Orange", value: "#F59E0B", textColor: "#FFFFFF" },
  { name: "Pink", value: "#EC4899", textColor: "#FFFFFF" },
];

// Default settings constant
const DEFAULT_SETTINGS = {
  darkMode: false,
  backgroundColor: "#faeed1",
  fontSize: 22,
  fontFamily: "Lora",
  textColor: "#5d3211",
  accentColor: "#512914",
};

// Fixed accent color constant
const FIXED_ACCENT_COLOR = "#643819";

const Settings = React.memo(() => {
  const {
    settings,
    updateSettings,
    theme,
    isDarkMode,
    setIsDarkMode,
    numberOfColumns,
    setNumberOfColumns,
  } = useAppContext();

  // Memoized initial values to prevent unnecessary recalculations
  const initialValues = useMemo(
    () => ({
      fontSize: settings.fontSize || 16,
      fontFamily: settings.fontFamily || "System",
      textColor: settings.textColor || "#FFFFFF",
      accentColor: settings.accentColor || COLOR_OPTIONS[0].value,
      backgroundColor:
        settings.backgroundColor || (isDarkMode ? "#121212" : "#F8F9FA"),
    }),
    [settings, isDarkMode],
  );

  const [fontSize, setFontSize] = useState(initialValues.fontSize);
  const [fontFamily, setFontFamily] = useState(initialValues.fontFamily);
  const [textColor, setTextColor] = useState(initialValues.textColor);
  const [accentColor, setAccentColor] = useState(initialValues.accentColor);
  const [backgroundColor, setBackgroundColor] = useState(
    initialValues.backgroundColor,
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSavesRef = useRef(0);

  // Memoized animation value to prevent recreation
  const animation = useMemo(() => new Animated.Value(isDarkMode ? 1 : 0), []);

  const router = useRouter();

  // Memoized container style
  const containerStyle = useMemo(
    () => [styles.container, { backgroundColor: theme.colors.background }],
    [theme.colors.primary],
  );

  // Memoized section header style
  const sectionHeaderStyle = useMemo(
    () => [styles.sectionHeader, { color: theme.dark ? "#BBBBBB" : "#666666" }],
    [theme.dark],
  );

  // Memoized version text style
  const versionTextStyle = useMemo(
    () => [styles.versionText, { color: theme.dark ? "#777777" : "#999999" }],
    [theme.dark],
  );

  // Animation effect for theme toggling - optimized with useCallback
  useEffect(() => {
    Animated.timing(animation, {
      toValue: isDarkMode ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isDarkMode, animation]);

  // Sync local display-settings state when persisted settings arrive from
  // AsyncStorage (loadStoredData runs async after mount, so useState
  // initial values are stale until this effect fires).
  useEffect(() => {
    setFontFamily(settings.fontFamily || "Lora");
  }, [settings.fontFamily]);

  useEffect(() => {
    setFontSize(settings.fontSize || 22);
  }, [settings.fontSize]);

  useEffect(() => {
    setAccentColor(settings.accentColor || COLOR_OPTIONS[0].value);
  }, [settings.accentColor]);

  // Ensure pending save timers do not outlive the screen
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const scheduleHideSaving = useCallback((ms = 400) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      setIsSaving(false);
      saveTimerRef.current = null;
    }, ms);
  }, []);

  const runSave = useCallback(
    async (saveFn: () => Promise<void>, hideDelay = 400) => {
      pendingSavesRef.current += 1;
      setIsSaving(true);
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }

      try {
        await saveFn();
      } catch (error) {
        console.error("Error saving settings:", error);
      } finally {
        pendingSavesRef.current = Math.max(0, pendingSavesRef.current - 1);
        if (pendingSavesRef.current === 0) {
          scheduleHideSaving(hideDelay);
        }
      }
    },
    [scheduleHideSaving],
  );

  // Optimized toggle theme function with useCallback
  const toggleTheme = useCallback(async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    await runSave(async () => {
      await updateSettings({
        darkMode: newMode,
        backgroundColor: newMode ? "#121212" : "#F8F9FA",
        fontSize: Number(fontSize),
        fontFamily,
        textColor: newMode ? "#FFFFFF" : "#1A1A1A",
        accentColor,
        numberOfColumns,
      });
    });
  }, [
    isDarkMode,
    fontSize,
    fontFamily,
    accentColor,
    numberOfColumns,
    setIsDarkMode,
    updateSettings,
    runSave,
  ]);

  // Safety net — never block the UI indefinitely if a save path misbehaves.
  useEffect(() => {
    if (!isSaving) return undefined;
    const safetyTimer = setTimeout(() => setIsSaving(false), 5000);
    return () => clearTimeout(safetyTimer);
  }, [isSaving]);

  // Debounced auto-save for display settings — avoids overlapping saves and a
  // stuck "Saved" modal when the slider fires many updates in a row.
  useEffect(() => {
    const normalizedFontSize = Number(fontSize);
    const savedFontSize = Number(settings.fontSize);
    const needsSave =
      savedFontSize !== normalizedFontSize ||
      settings.fontFamily !== fontFamily ||
      settings.accentColor !== accentColor;

    if (!needsSave) {
      return undefined;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;

      const patch: Partial<ReaderSettings> = {};
      if (savedFontSize !== normalizedFontSize) {
        patch.fontSize = normalizedFontSize;
      }
      if (settings.fontFamily !== fontFamily) {
        patch.fontFamily = fontFamily;
      }
      if (settings.accentColor !== accentColor) {
        patch.accentColor = accentColor;
      }

      if (Object.keys(patch).length === 0) {
        return;
      }

      runSave(async () => {
        await updateSettings(patch);
      });
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [
    fontSize,
    fontFamily,
    accentColor,
    settings.fontSize,
    settings.fontFamily,
    settings.accentColor,
    updateSettings,
    runSave,
  ]);

  // Optimized restore default function with useCallback
  const restoreDefault = useCallback(async () => {
    setFontSize(DEFAULT_SETTINGS.fontSize);
    setFontFamily(DEFAULT_SETTINGS.fontFamily);
    setTextColor(DEFAULT_SETTINGS.textColor);
    setAccentColor(DEFAULT_SETTINGS.accentColor);
    setBackgroundColor(DEFAULT_SETTINGS.backgroundColor);
    setIsDarkMode(DEFAULT_SETTINGS.darkMode);

    await runSave(async () => {
      await updateSettings(DEFAULT_SETTINGS);
    }, 600);
  }, [updateSettings, setIsDarkMode, runSave]);

  // Early return for updating state - render content while updating in background
  // if (isUpdating) {
  //   return <UpdateScreen />;
  // }

  // Don't wait for fonts - render with fallback and fonts will load in background
  // if (!fontsLoaded) {
  //   return <UpdateScreen />;
  // }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <DraggableFloatingButton />

      <SafeAreaView style={styles.safeArea}>
        <SettingsHeader
          theme={theme}
          accentColor={FIXED_ACCENT_COLOR}
          compact={true}
        />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionHeader, { color: theme.colors.text }]}>
              Display Settings
            </Text>
            <View
              style={[
                styles.settingsPanel,
                {
                  backgroundColor: theme.dark
                    ? "rgba(255, 255, 255, 0.025)"
                    : "rgba(93, 50, 17, 0.035)",
                },
              ]}
            >
              <DisplaySettings
                theme={theme}
                accentColor={accentColor}
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
                fontSize={fontSize}
                setFontSize={setFontSize}
                fontFamily={fontFamily}
                setFontFamily={setFontFamily}
                navigation={router}
                compact={true}
              />
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionHeader, { color: theme.colors.text }]}>
              App Settings
            </Text>
            <View
              style={[
                styles.settingsPanel,
                {
                  backgroundColor: theme.dark
                    ? "rgba(255, 255, 255, 0.025)"
                    : "rgba(93, 50, 17, 0.035)",
                },
              ]}
            >
              <AppSettings theme={theme} router={router} compact={true} />
            </View>
          </View>

          <Text
            style={[styles.versionText, { color: theme.colors.text + "60" }]}
          >
            Version 1.0.0 - Build 2025.08.19
          </Text>
        </ScrollView>
      </SafeAreaView>

      <SavingModal visible={isSaving} theme={theme} />
    </View>
  );
});

// Display name for debugging
Settings.displayName = "Settings";

export default Settings;
