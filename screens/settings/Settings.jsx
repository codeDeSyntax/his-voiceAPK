// File: Settings.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Animated,
} from "react-native";
import { useFonts } from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UpdateScreen from "../Updating";
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

function Settings() {
  const [fontsLoaded] = useFonts({
    "Merienda-VariableFont": require("../../assets/fonts/Merienda-VariableFont_wght.ttf"),
    "Philosopher-Regular": require("../../assets/fonts/Philosopher-Regular.ttf"),
    "ZillaSlab": require("../../assets/fonts/ZillaSlab-Regular.ttf"),
  });

  const {
    settings,
    setSettings,
    updateSettings,
    theme,
    setIsDarkMode,
    isDarkMode,
    numberOfColumns,
    setNumberOfColumns,
  } = useAppContext();

  const [fontSize, setFontSize] = useState(settings.fontSize || 16);
  const [fontFamily, setFontFamily] = useState(settings.fontFamily || "System");
  const [textColor, setTextColor] = useState(settings.textColor || "#FFFFFF");
  const [accentColor, setAccentColor] = useState(
    settings.accentColor || COLOR_OPTIONS[0].value
  );

  const [savingTheme, setSavingTheme] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState(
    settings.backgroundColor || (isDarkMode ? "#121212" : "#F8F9FA")
  );
  const [animation] = useState(new Animated.Value(0));

  // Animation effect for theme toggling
  useEffect(() => {
    Animated.timing(animation, {
      toValue: isDarkMode ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isDarkMode]);

  const toggleTheme = async () => {
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
  };

  const saveSettings = async () => {
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

      // setSettings(updatedSettings);
      // await AsyncStorage.setItem("sermonSettings", JSON.stringify(updatedSettings));
      setTimeout(() => {
        setSavingTheme(false);
      }, 400);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSavingTheme(false);
    }
  };

  const restoreDefault = async () => {
    try {
      setSavingTheme(true);
      const defaultSettings = {
        darkMode: true,
        backgroundColor: "#121212",
        fontSize: 16,
        fontFamily: "System",
        textColor: "#FFFFFF",
        accentColor: "#4bb7e6",
      };

      setFontSize(defaultSettings.fontSize);
      setFontFamily(defaultSettings.fontFamily);
      setTextColor(defaultSettings.textColor);
      setAccentColor(defaultSettings.accentColor);
      setBackgroundColor(defaultSettings.backgroundColor);
      setIsDarkMode(defaultSettings.darkMode);
      setSettings(defaultSettings);

      await AsyncStorage.setItem(
        "sermonSettings",
        JSON.stringify(defaultSettings)
      );

      setTimeout(() => {
        setSavingTheme(false);
      }, 800);
    } catch (error) {
      console.error("Error restoring settings:", error);
      setSavingTheme(false);
    }
  };

  const router = useNavigation();

  if (isUpdating) {
    return <UpdateScreen />;
  }

  return (
    <>
        <DraggableFloatingBackButton/>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.primary }]}
        showsVerticalScrollIndicator={false}
      >
        <SettingsHeader theme={theme} accentColor={accentColor} />

        <ProfileSection theme={theme} accentColor={"#4bb7e6"} />

        <Text
          style={[
            styles.sectionHeader,
            { color: theme.dark ? "#BBBBBB" : "#666666" },
          ]}
        >
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
        />

        {/* number of columns selector UI */}

        {/* <View
          style={[styles.settingBlock, { backgroundColor: theme.colors.secondary }]}
        > */}
          {/* <NumberOfColumnsSelector
            theme={theme}
            numberOfColumns={numberOfColumns}
            setNumberOfColumns={setNumberOfColumns}
            accentColor={accentColor}
          /> */}
        {/* </View> */}

        <Text
          style={[
            styles.sectionHeader,
            { color: theme.dark ? "#BBBBBB" : "#666666", marginTop: 24 },
          ]}
        >
          APP
        </Text>

        <AppSettings theme={theme} router={router} />

        <Text
          style={[
            styles.versionText,
            { color: theme.dark ? "#777777" : "#999999" },
          ]}
        >
          Version 1.0.0 • Build 2025.05.09
        </Text>

        <ActionButtons
          theme={theme}
          accentColor={"#4bb7e6"}
          saveSettings={saveSettings}
          restoreDefault={restoreDefault}
        />

        <SavingModal
          visible={savingTheme}
          theme={theme}
          accentColor={"#4bb7e6"}
        />
      </ScrollView>
    </>
  );
}

export default Settings;