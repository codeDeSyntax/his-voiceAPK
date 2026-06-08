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

import { useAppContext } from "../../Logic/globalState";
import { styles } from "../../styles/settings";

// Import components
import SettingsHeader from "../../components/settings/SettingsHeader";
import DisplaySettings from "../../components/settings/DisplaySettings";
import AppSettings from "../../components/settings/AppSettings";
import SavingModal from "../../components/settings/SavingModal";
import DraggableFloatingButton from "../../components/FloatButton";
import { useNavigation } from "@react-navigation/native";

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
  darkMode: true,
  backgroundColor: "#121212",
  fontSize: 16,
  fontFamily: "System",
  textColor: "#FFFFFF",
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
  const saveTimerRef = useRef(null);

  // Memoized animation value to prevent recreation
  const animation = useMemo(() => new Animated.Value(isDarkMode ? 1 : 0), []);

  const router = useNavigation();

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

  // Ensure pending save timers do not outlive the screen
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const beginSaving = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    setIsSaving(true);
  }, []);

  const endSavingAfter = useCallback((ms = 300) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      setIsSaving(false);
      saveTimerRef.current = null;
    }, ms);
  }, []);

  // Optimized toggle theme function with useCallback
  const toggleTheme = useCallback(async () => {
    try {
      beginSaving();
      const newMode = !isDarkMode;

      const updatedSettings = {
        ...settings,
        darkMode: newMode,
        backgroundColor: newMode ? "#121212" : "#F8F9FA",
        fontSize,
        fontFamily,
        textColor: newMode ? "#FFFFFF" : "#1A1A1A",
        accentColor,
        numberOfColumns,
      };

      setIsDarkMode(newMode);
      await updateSettings(updatedSettings);

      // Slightly delayed to show animation
      endSavingAfter(400);
    } catch (error) {
      console.error("Error saving theme settings:", error);
      setIsSaving(false);
    }
  }, [
    isDarkMode,
    settings,
    fontSize,
    fontFamily,
    textColor,
    accentColor,
    numberOfColumns,
    setIsDarkMode,
    updateSettings,
    beginSaving,
    endSavingAfter,
  ]);

  // Auto-save font size changes
  useEffect(() => {
    if (settings.fontSize !== fontSize) {
      const autoSaveFontSize = async () => {
        try {
          beginSaving();
          await updateSettings({ fontSize });
          endSavingAfter(300);
        } catch (error) {
          console.error("Error auto-saving font size:", error);
          setIsSaving(false);
        }
      };
      autoSaveFontSize();
    }
  }, [
    fontSize,
    settings.fontSize,
    updateSettings,
    beginSaving,
    endSavingAfter,
  ]);

  // Auto-save font family changes
  useEffect(() => {
    if (settings.fontFamily !== fontFamily) {
      const autoSaveFontFamily = async () => {
        try {
          beginSaving();
          await updateSettings({ fontFamily });
          endSavingAfter(300);
        } catch (error) {
          console.error("Error auto-saving font family:", error);
          setIsSaving(false);
        }
      };
      autoSaveFontFamily();
    }
  }, [
    fontFamily,
    settings.fontFamily,
    updateSettings,
    beginSaving,
    endSavingAfter,
  ]);

  // Auto-save accent color changes
  useEffect(() => {
    if (settings.accentColor !== accentColor) {
      const autoSaveAccentColor = async () => {
        try {
          beginSaving();
          await updateSettings({ accentColor });
          endSavingAfter(300);
        } catch (error) {
          console.error("Error auto-saving accent color:", error);
          setIsSaving(false);
        }
      };
      autoSaveAccentColor();
    }
  }, [
    accentColor,
    settings.accentColor,
    updateSettings,
    beginSaving,
    endSavingAfter,
  ]);

  // Optimized save settings function with useCallback (for theme and other settings)
  const saveSettings = useCallback(async () => {
    try {
      beginSaving();
      const updatedSettings = {
        ...settings,
        darkMode: isDarkMode,
        backgroundColor,
        fontSize,
        fontFamily,
        textColor,
        accentColor,
        numberOfColumns,
      };

      await updateSettings(updatedSettings);
      endSavingAfter(400);
    } catch (error) {
      console.error("Error saving settings:", error);
      setIsSaving(false);
    }
  }, [
    settings,
    isDarkMode,
    backgroundColor,
    fontSize,
    fontFamily,
    textColor,
    accentColor,
    numberOfColumns,
    updateSettings,
    beginSaving,
    endSavingAfter,
  ]);

  // Optimized restore default function with useCallback
  const restoreDefault = useCallback(async () => {
    try {
      beginSaving();

      setFontSize(DEFAULT_SETTINGS.fontSize);
      setFontFamily(DEFAULT_SETTINGS.fontFamily);
      setTextColor(DEFAULT_SETTINGS.textColor);
      setAccentColor(DEFAULT_SETTINGS.accentColor);
      setBackgroundColor(DEFAULT_SETTINGS.backgroundColor);
      setIsDarkMode(DEFAULT_SETTINGS.darkMode);
      await updateSettings(DEFAULT_SETTINGS);

      endSavingAfter(800);
    } catch (error) {
      console.error("Error restoring settings:", error);
      setIsSaving(false);
    }
  }, [updateSettings, setIsDarkMode, beginSaving, endSavingAfter]);

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

      <SavingModal
        visible={isSaving}
        theme={theme}
        accentColor={FIXED_ACCENT_COLOR}
      />
    </View>
  );
});

// Display name for debugging
Settings.displayName = "Settings";

export default Settings;
