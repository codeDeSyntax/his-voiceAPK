// File: Settings.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, ScrollView, Animated } from "react-native";
import { useFonts } from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UpdateScreen from "../LoadingScreen";
import { useAppContext } from "../../Logic/globalState";
import { styles } from "../../styles/settings";

// Import components
import SettingsHeader from "../../components/settings/SettingsHeader";
import ProfileSection from "../../components/settings/ProfileSection";
import DisplaySettings from "../../components/settings/DisplaySettings";
import AppSettings from "../../components/settings/AppSettings";
import ActionButtons from "../../components/settings/ActionsButtons";
import SavingModal from "../../components/settings/SavingModal";

import DraggableFloatingBackButton from "../../components/FloatButton";
import { useNavigation } from "@react-navigation/native";

// Constants moved here to be accessible to all components
export const FONT_OPTIONS = [
  { name: "Default", value: "System" },
  { name: "Merienda", value: "Merienda-VariableFont" },
  { name: "Philosopher", value: "Philosopher-Regular" },
  { name: "Serif", value: "serif" },
  { name: "ZillaSlab", value: "ZillaSlab" },
];

export const COLOR_OPTIONS = [
  { name: "Blue", value: "#4bb7e6", textColor: "#FFFFFF" },
  { name: "Green", value: "#10B981", textColor: "#FFFFFF" },
  { name: "Purple", value: "#8B5CF6", textColor: "#FFFFFF" },
  { name: "Orange", value: "#F59E0B", textColor: "#FFFFFF" },
  { name: "Pink", value: "#EC4899", textColor: "#FFFFFF" },
];

// Memoized fonts configuration to prevent recreation
const FONTS_CONFIG = {
  "Merienda-VariableFont": require("../../assets/fonts/Merienda-VariableFont_wght.ttf"),
  "Philosopher-Regular": require("../../assets/fonts/Philosopher-Regular.ttf"),
  ZillaSlab: require("../../assets/fonts/ZillaSlab-Regular.ttf"),
};

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
  const [fontsLoaded] = useFonts(FONTS_CONFIG);

  const {
    settings,
    updateSettings,
    theme,
    isDarkMode,
    setIsDarkMode,
    numberOfColumns,
    setNumberOfColumns,
    updateLastVisitedScreen,
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
    [settings, isDarkMode]
  );

  const [fontSize, setFontSize] = useState(initialValues.fontSize);
  const [fontFamily, setFontFamily] = useState(initialValues.fontFamily);
  const [textColor, setTextColor] = useState(initialValues.textColor);
  const [accentColor, setAccentColor] = useState(initialValues.accentColor);
  const [backgroundColor, setBackgroundColor] = useState(
    initialValues.backgroundColor
  );

  const [savingTheme, setSavingTheme] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Memoized animation value to prevent recreation
  const animation = useMemo(() => new Animated.Value(isDarkMode ? 1 : 0), []);

  const router = useNavigation();

  // Track that user visited Settings screen
  useEffect(() => {
    updateLastVisitedScreen("Settings");
  }, [updateLastVisitedScreen]);

  // Memoized container style
  const containerStyle = useMemo(
    () => [styles.container, { backgroundColor: theme.colors.background }],
    [theme.colors.primary]
  );

  // Memoized section header style
  const sectionHeaderStyle = useMemo(
    () => [styles.sectionHeader, { color: theme.dark ? "#BBBBBB" : "#666666" }],
    [theme.dark]
  );

  // Memoized version text style
  const versionTextStyle = useMemo(
    () => [styles.versionText, { color: theme.dark ? "#777777" : "#999999" }],
    [theme.dark]
  );

  // Animation effect for theme toggling - optimized with useCallback
  useEffect(() => {
    Animated.timing(animation, {
      toValue: isDarkMode ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isDarkMode, animation]);

  // Optimized toggle theme function with useCallback
  const toggleTheme = useCallback(async () => {
    try {
      setSavingTheme(true);
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
      setSettings(updatedSettings);
      await AsyncStorage.setItem(
        "sermonSettings",
        JSON.stringify(updatedSettings)
      );

      // Slightly delayed to show animation
      setTimeout(() => {
        setSavingTheme(false);
      }, 400);
    } catch (error) {
      console.error("Error saving theme settings:", error);
      setSavingTheme(false);
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
    setSettings,
  ]);

  // Optimized save settings function with useCallback
  const saveSettings = useCallback(async () => {
    try {
      setSavingTheme(true);
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

      updateSettings(updatedSettings);

      setTimeout(() => {
        setSavingTheme(false);
      }, 400);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSavingTheme(false);
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
  ]);

  // Optimized restore default function with useCallback
  const restoreDefault = useCallback(async () => {
    try {
      setSavingTheme(true);

      setFontSize(DEFAULT_SETTINGS.fontSize);
      setFontFamily(DEFAULT_SETTINGS.fontFamily);
      setTextColor(DEFAULT_SETTINGS.textColor);
      setAccentColor(DEFAULT_SETTINGS.accentColor);
      setBackgroundColor(DEFAULT_SETTINGS.backgroundColor);
      setIsDarkMode(DEFAULT_SETTINGS.darkMode);
      setSettings(DEFAULT_SETTINGS);

      await AsyncStorage.setItem(
        "sermonSettings",
        JSON.stringify(DEFAULT_SETTINGS)
      );

      setTimeout(() => {
        setSavingTheme(false);
      }, 800);
    } catch (error) {
      console.error("Error restoring settings:", error);
      setSavingTheme(false);
    }
  }, [setSettings, setIsDarkMode]);

  // Early return for updating state
  if (isUpdating) {
    return <UpdateScreen />;
  }

  return (
    <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
      <DraggableFloatingBackButton />
      <View style={[containerStyle, { paddingTop: 40 }]}>
        <SettingsHeader
          theme={theme}
          accentColor={accentColor}
          compact={true}
        />

        <ProfileSection
          theme={theme}
          accentColor={FIXED_ACCENT_COLOR}
          compact={true}
        />

        <Text style={[sectionHeaderStyle, { fontSize: 14, marginBottom: 8 }]}>
          DISPLAY
        </Text>

        <DisplaySettings
          theme={theme}
          accentColor={accentColor}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          fontSize={fontSize}
          setFontSize={setFontSize}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          compact={true}
        />

        <Text
          style={[
            sectionHeaderStyle,
            { marginTop: 16, fontSize: 14, marginBottom: 8 },
          ]}
        >
          APP
        </Text>

        <AppSettings theme={theme} router={router} compact={true} />

        <ActionButtons
          theme={theme}
          accentColor={FIXED_ACCENT_COLOR}
          saveSettings={saveSettings}
          restoreDefault={restoreDefault}
          compact={true}
        />

        <Text
          style={[
            versionTextStyle,
            { textAlign: "center", fontSize: 10, marginTop: 8 },
          ]}
        >
          Version 1.0.0 • Build 2025.05.09
        </Text>

        <SavingModal
          visible={savingTheme}
          theme={theme}
          accentColor={FIXED_ACCENT_COLOR}
        />
      </View>
    </View>
  );
});

// Display name for debugging
Settings.displayName = "Settings";

export default Settings;
