// File: Settings.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Animated,
  ImageBackground,
  StyleSheet,
  SafeAreaView,
  Platform,
} from "react-native";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UpdateScreen from "../LoadingScreen";
import { useAppContext } from "../../Logic/globalState";
import { styles } from "../../styles/settings";

// Import components
import SettingsHeader from "../../components/settings/SettingsHeader";
import ProfileSection from "../../components/settings/ProfileSection";
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

// Memoized fonts configuration to prevent recreation
const FONTS_CONFIG = {
  "Merienda-VariableFont_wght": require("../../assets/fonts/Merienda-VariableFont_wght.ttf"),
  "Philosopher-Regular": require("../../assets/fonts/Philosopher-Regular.ttf"),
  "ZillaSlab-Regular": require("../../assets/fonts/ZillaSlab-Regular.ttf"),
  "ZillaSlab-SemiBold": require("../../assets/fonts/ZillaSlab-SemiBold.ttf"),
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
      await updateSettings(updatedSettings);

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
    updateSettings,
  ]);

  // Auto-save font size changes
  useEffect(() => {
    if (settings.fontSize !== fontSize) {
      const autoSaveFontSize = async () => {
        try {
          const updatedSettings = {
            ...settings,
            fontSize,
          };
          await updateSettings(updatedSettings);
        } catch (error) {
          console.error("Error auto-saving font size:", error);
        }
      };
      autoSaveFontSize();
    }
  }, [fontSize, settings, updateSettings]);

  // Auto-save font family changes
  useEffect(() => {
    if (settings.fontFamily !== fontFamily) {
      const autoSaveFontFamily = async () => {
        try {
          const updatedSettings = {
            ...settings,
            fontFamily,
          };
          await updateSettings(updatedSettings);
        } catch (error) {
          console.error("Error auto-saving font family:", error);
        }
      };
      autoSaveFontFamily();
    }
  }, [fontFamily, settings, updateSettings]);

  // Optimized save settings function with useCallback (for theme and other settings)
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
      await updateSettings(DEFAULT_SETTINGS);

      setTimeout(() => {
        setSavingTheme(false);
      }, 800);
    } catch (error) {
      console.error("Error restoring settings:", error);
      setSavingTheme(false);
    }
  }, [updateSettings, setIsDarkMode]);

  // Early return for updating state
  if (isUpdating) {
    return <UpdateScreen />;
  }

  // Wait for fonts to load before rendering
  if (!fontsLoaded) {
    return <UpdateScreen />;
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Background with gradient overlay */}
      <ImageBackground
        source={require("../../assets/gradbg.png")}
        style={styles.backgroundImage}
        blurRadius={3}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            theme.dark ? "rgba(28, 25, 23, 0.85)" : "rgba(250, 250, 250, 0.90)",
            theme.dark ? "rgba(28, 25, 23, 0.95)" : "rgba(250, 250, 250, 0.95)",
          ]}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

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
          <ProfileSection
            theme={theme}
            accentColor={FIXED_ACCENT_COLOR}
            compact={true}
          />

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionHeader, { color: theme.colors.text }]}>
              Display Settings
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
              navigation={router}
              compact={true}
            />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionHeader, { color: theme.colors.text }]}>
              App Settings
            </Text>
            <AppSettings theme={theme} router={router} compact={true} />
          </View>

          <Text
            style={[styles.versionText, { color: theme.colors.text + "60" }]}
          >
            Version 1.0.0 • Build 2025.08.19
          </Text>
        </ScrollView>
      </SafeAreaView>

      <SavingModal
        visible={savingTheme}
        theme={theme}
        accentColor={FIXED_ACCENT_COLOR}
      />
    </View>
  );
});

// Display name for debugging
Settings.displayName = "Settings";

export default Settings;
