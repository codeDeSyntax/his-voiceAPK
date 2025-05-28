// File: components/DisplaySettings.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Pressable } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Switch } from "react-native";
import Slider from "@react-native-community/slider";
import { styles } from "../../styles/settings";
import { FONT_OPTIONS, COLOR_OPTIONS } from "../../screens/settings/Settings";
import { useAppContext } from "../../Logic/globalState";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5, FontAwesome6, MaterialIcons } from "@expo/vector-icons";

const DisplaySettings = ({
  theme,
  accentColor,
  isDarkMode,
  toggleTheme,
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showFontOptions, setShowFontOptions] = useState(false);
  const [showColorOptions, setShowColorOptions] = useState(false);
  const [localAccentColor, setLocalAccentColor] = useState(accentColor);
  const { updateSettings } = useAppContext();

  const navigation = useNavigation();

  const getSettingItemStyle = (disabled) => {
    return [styles.settingItem, { opacity: disabled ? 0.5 : 1 }];
  };

  const getIconContainerStyle = () => {
    return [
      styles.iconContainer,
      {
        backgroundColor: theme.dark
          ? theme.colors.primary
          : "rgba(0, 0, 0, 0.04)",
        shadowColor: theme.dark ? "#000" : "#888",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme.dark ? 0.3 : 0.1,
        shadowRadius: 4,
      },
    ];
  };

  const getPreviewSectionStyle = () => {
    return [
      styles.previewSection,
      {
        backgroundColor: theme.dark
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(0, 0, 0, 0.03)",
        borderWidth: 1,
        borderColor: theme.dark
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.05)",
      },
    ];
  };

  const getFontOptionStyle = (option) => {
    const isSelected = fontFamily === option.value;
    return [
      styles.fontOption,
      {
        backgroundColor: isSelected
          ? localAccentColor
          : theme.dark
          ? "rgba(255, 255, 255, 0.08)"
          : "rgba(0, 0, 0, 0.04)",
        borderColor: isSelected ? localAccentColor : "transparent",
      },
    ];
  };

  const getColorOptionStyle = (color) => {
    const isSelected = localAccentColor === color.value;
    return [
      styles.colorOption,
      {
        backgroundColor: color.value,
        borderColor: isSelected
          ? theme.dark
            ? "#FFFFFF"
            : "#000000"
          : "transparent",
      },
    ];
  };

  return (
    <View
      style={[
        styles.settingsGroup,
        { backgroundColor: theme.colors.primary },
      ]}
    >
      <TouchableOpacity style={getSettingItemStyle(true)} disabled={true}>
        <View style={styles.settingLeft}>
          <View style={getIconContainerStyle()}>
            <Icon
              name="language"
              size={20}
              color={theme.dark ? "#999999" : "#888888"}
            />
          </View>
          <View style={styles.settingTextContainer}>
            <Text
              style={[
                styles.settingText,
                { color: theme.dark ? theme.colors.text : "#888888" },
              ]}
            >
              App Language
            </Text>
            <Text
              style={[
                styles.settingDescription,
                { color: theme.dark ? theme.colors.text : "#999999" },
              ]}
            >
              English (United States)
            </Text>
          </View>
        </View>
        <Icon
          name="chevron-forward"
          size={20}
          color={theme.dark ? "#777777" : "#999999"}
        />
      </TouchableOpacity>

      <View
        style={[
          styles.separator,
          { backgroundColor: theme.dark ? theme.colors.primary : "#000000" },
        ]}
      />

      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => setShowPreview(!showPreview)}
      >
        <View style={styles.settingLeft}>
          <View style={getIconContainerStyle()}>
            <Icon
              name="text"
              size={20}
              color={theme.dark ? "#FFFFFF" : "#333333"}
            />
          </View>
          <View style={styles.settingTextContainer}>
            <Text
              style={[
                styles.settingText,
                { color: theme.dark ? theme.colors.text : "#1A1A1A" },
              ]}
            >
              Font Settings
            </Text>
            <Text
              style={[
                styles.settingDescription,
                { color: theme.dark ? "#BBBBBB" : "#666666" },
              ]}
            >
              Size: {fontSize}px • {fontFamily.split("-")[0]}
            </Text>
          </View>
        </View>
        <Icon
          name={showPreview ? "chevron-up" : "chevron-down"}
          size={20}
          color={theme.dark ? theme.colors.text : "#333333"}
        />
      </TouchableOpacity>

      {showPreview && (
        <View style={getPreviewSectionStyle()}>
          <View style={styles.sliderContainer}>
            <Text
              style={[
                styles.sliderLabel,
                { color: theme.dark ? theme.colors.text : "#1A1A1A" },
              ]}
            >
              Font Size: {fontSize}px
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={12}
              maximumValue={24}
              value={fontSize}
              onValueChange={setFontSize}
              minimumTrackTintColor={theme.colors.background}
              step={1}
              maximumTrackTintColor={theme.dark ? "#555555" : "#DDDDDD"}
              thumbTintColor={theme.colors.hlight}
            />
          </View>

          <TouchableOpacity
            onPress={() => setShowFontOptions(!showFontOptions)}
            style={{ marginBottom: 16 }}
          >
            <Text
              style={[
                styles.sliderLabel,
                { color: theme.dark ? theme.colors.text : "#1A1A1A" },
              ]}
            >
              Font Family: {fontFamily.split("-")[0]}
            </Text>
          </TouchableOpacity>

          {showFontOptions && (
            <View style={styles.fontOptionsContainer}>
              {FONT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={getFontOptionStyle(option)}
                  onPress={() => setFontFamily(option.value)}
                >
                  <Text
                    style={[
                      styles.fontOptionText,
                      {
                        color:
                          fontFamily === option.value
                            ? "#FFFFFF"
                            : theme.dark
                            ? "#FFFFFF"
                            : "#333333",
                        fontFamily:
                          option.value !== "System" ? option.value : undefined,
                      },
                    ]}
                  >
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            onPress={() => setShowColorOptions(!showColorOptions)}
          >
            <Text
              style={[
                styles.sliderLabel,
                { color: theme.dark ? theme.colors.text : "#1A1A1A" },
              ]}
            >
              Accent Color
            </Text>
          </TouchableOpacity>

          {showColorOptions && (
            <View style={styles.colorOptionsContainer}>
              {COLOR_OPTIONS.map((color) => (
                <TouchableOpacity
                  key={color.value}
                  style={getColorOptionStyle(color)}
                  onPress={() => setLocalAccentColor(color.value)}
                />
              ))}
            </View>
          )}

          <View
            style={[
              styles.previewBox,
              {
                backgroundColor: theme.dark ? theme.colors.background : "#F5F5F5",
                borderWidth: 1,
                borderColor: theme.dark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.05)",
              },
            ]}
          >
            <Text
              style={[
                styles.previewText,
                {
                  fontFamily: fontFamily !== "System" ? fontFamily : undefined,
                  fontSize: fontSize,
                  color: theme.dark ? "#dedbdb" : "#1A1A1A",
                },
              ]}
            >
              This is a preview of how your text will appear in the app.
            </Text>
            <Pressable
              onPress={() => navigation.navigate("currentsermon")}
              style={[getIconContainerStyle(), { marginTop: 4 }]}
            >
              <MaterialIcons
                name="open-in-full"
                size={20}
                color={theme.dark ? theme.colors.text : "#333333"}
              />
            </Pressable>
          </View>
        </View>
      )}

      <View
        style={[
          styles.separator,
          { backgroundColor: theme.dark ? theme.colors.primary : "#000000" },
        ]}
      />

      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <View style={getIconContainerStyle()}>
            <Icon
              name="moon"
              size={20}
              color={theme.dark ? "#FFFFFF" : "#333333"}
            />
          </View>
          <View style={styles.settingTextContainer}>
            <Text
              style={[
                styles.settingText,
                { color: theme.dark ? theme.colors.text : "#1A1A1A" },
              ]}
            >
              Dark Mode
            </Text>
            <Text
              style={[
                styles.settingDescription,
                { color: theme.dark ? "#BBBBBB" : "#666666" },
              ]}
            >
              {theme.dark ? "On" : "Off"} • Easier on the eyes at night
            </Text>
          </View>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          color={localAccentColor}
          trackColor={{
            false: theme.dark.background,
            true: theme.colors.background
          }}
          thumbColor={theme.dark ? "#f2cdb4" : "#522b11"}
        />
      </View>
    </View>
  );
};

export default DisplaySettings;
