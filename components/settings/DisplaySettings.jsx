import React, { useState } from "react";
import { View, Text, TouchableOpacity, Switch } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const DisplaySettings = ({
  theme,
  isDarkMode,
  toggleTheme,
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  accentColor,
  navigation,
}) => {
  const [showFontOptions, setShowFontOptions] = useState(false);
  const [showColorOptions, setShowColorOptions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [localAccentColor, setLocalAccentColor] = useState(
    accentColor || "#e9925c",
  );

  const FONT_OPTIONS = [
    { name: "System Default", value: "System" },
    { name: "ZillaSlab Regular", value: "ZillaSlab-Regular" },
    { name: "ZillaSlab SemiBold", value: "ZillaSlab-SemiBold" },
    { name: "Merriweather", value: "Merriweather" },
    { name: "Lora", value: "Lora" },
    { name: "Merienda", value: "Merienda-VariableFont_wght" },
    { name: "Philosopher", value: "Philosopher-Regular" },
  ];

  const COLOR_OPTIONS = [
    { name: "Orange", value: "#e9925c" },
    { name: "Blue", value: "#5c7ce9" },
    { name: "Green", value: "#5ce989" },
    { name: "Purple", value: "#b65ce9" },
    { name: "Red", value: "#e95c5c" },
    { name: "Teal", value: "#5ce9c4" },
  ];

  const getCurrentFontName = () => {
    const font = FONT_OPTIONS.find((f) => f.value === fontFamily);
    return font ? font.name : "System Default";
  };

  const SettingItem = ({ icon, title, subtitle, children, onPress, theme }) => {
    const [pressed, setPressed] = useState(false);

    return (
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 16,
          paddingHorizontal: 4,
          borderBottomWidth: 1,
          borderBottomColor: theme.dark
            ? "rgba(242, 205, 180, 0.08)"
            : "rgba(93, 50, 17, 0.08)",
          opacity: pressed ? 0.7 : 1,
        }}
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        activeOpacity={1}
      >
        <Ionicons
          name={icon}
          size={24}
          color={theme.colors.text}
          style={{ marginRight: 16 }}
        />

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: theme.colors.text,
              fontFamily: "ZillaSlab",
              marginBottom: subtitle ? 2 : 0,
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={{
                fontSize: 13,
                color: theme.colors.text + "60",
                fontFamily: "ZillaSlab",
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {children}
      </TouchableOpacity>
    );
  };

  const handleFontSizeChange = (action) => {
    if (action === "increase" && fontSize < 32) {
      setFontSize(fontSize + 1);
    } else if (action === "decrease" && fontSize > 12) {
      setFontSize(fontSize - 1);
    }
  };

  return (
    <View style={{ paddingHorizontal: 0 }}>
      {/* Dark Mode */}
      <SettingItem
        icon="moon"
        title="Dark Mode"
        subtitle={`${
          isDarkMode ? "Enabled" : "Disabled"
        } • Easier on the eyes at night`}
        theme={theme}
      >
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          trackColor={{
            false: theme.dark
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
            true: theme.dark ? theme.colors.hlight : "#5d3211",
          }}
          thumbColor={
            isDarkMode
              ? theme.dark
                ? "#f2cdb4"
                : "#522b11"
              : theme.dark
                ? "rgba(255, 255, 255, 0.8)"
                : "#ffffff"
          }
        />
      </SettingItem>

      {/* Font Size */}
      <SettingItem
        icon="text-outline"
        title="Font Size"
        subtitle={`${fontSize}px`}
        theme={theme}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => handleFontSizeChange("decrease")}
            disabled={fontSize <= 12}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: theme.dark
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(0, 0, 0, 0.08)",
              justifyContent: "center",
              alignItems: "center",
              opacity: fontSize <= 12 ? 0.5 : 1,
            }}
          >
            <Ionicons name="remove" size={16} color={theme.colors.text} />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: theme.colors.text,
              minWidth: 30,
              textAlign: "center",
            }}
          >
            {fontSize}
          </Text>

          <TouchableOpacity
            onPress={() => handleFontSizeChange("increase")}
            disabled={fontSize >= 32}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: theme.dark
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(0, 0, 0, 0.08)",
              justifyContent: "center",
              alignItems: "center",
              opacity: fontSize >= 32 ? 0.5 : 1,
            }}
          >
            <Ionicons name="add" size={16} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </SettingItem>

      {/* Font Family */}
      <SettingItem
        icon="text"
        title="Font Family"
        subtitle={`Current: ${getCurrentFontName()}`}
        theme={theme}
        onPress={() => setShowFontOptions(!showFontOptions)}
      >
        <Ionicons
          name={showFontOptions ? "chevron-up" : "chevron-down"}
          size={18}
          color={theme.colors.text + "60"}
        />
      </SettingItem>

      {/* Font Options (when expanded) */}
      {showFontOptions && (
        <View
          style={{
            backgroundColor: theme.dark
              ? "rgba(255, 255, 255, 0.02)"
              : "rgba(0, 0, 0, 0.01)",
            borderRadius: 12,
            padding: 8,
            gap: 4,
            marginTop: -8,
          }}
        >
          {FONT_OPTIONS.map((font) => (
            <TouchableOpacity
              key={font.value}
              onPress={() => {
                setFontFamily(font.value);
                setShowFontOptions(false);
              }}
              style={{
                padding: 12,
                borderRadius: 8,
                backgroundColor:
                  fontFamily === font.value
                    ? theme.dark
                      ? theme.colors.hlight + "20"
                      : "#5d321120"
                    : "transparent",
                borderWidth: fontFamily === font.value ? 1 : 0,
                borderColor:
                  fontFamily === font.value
                    ? theme.dark
                      ? theme.colors.hlight + "40"
                      : "#5d321140"
                    : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  // fontWeight: fontFamily === font.value ? "600" : "400",
                  color:
                    fontFamily === font.value
                      ? theme.dark
                        ? theme.colors.hlight
                        : "#5d3211"
                      : theme.colors.text,
                  fontFamily:
                    font.value !== "System Default" ? font.value : undefined,
                }}
              >
                {font.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Accent Color */}
      <SettingItem
        icon="color-palette"
        title="Accent Color"
        subtitle="Choose your app's accent color"
        theme={theme}
        onPress={() => setShowColorOptions(!showColorOptions)}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: localAccentColor,
              borderWidth: 1,
              borderColor: theme.dark
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(0, 0, 0, 0.1)",
            }}
          />
          <Ionicons
            name={showColorOptions ? "chevron-up" : "chevron-down"}
            size={18}
            color={theme.colors.text + "60"}
          />
        </View>
      </SettingItem>

      {/* Color Options (when expanded) */}
      {showColorOptions && (
        <View
          style={{
            backgroundColor: theme.dark
              ? "rgba(255, 255, 255, 0.02)"
              : "rgba(0, 0, 0, 0.01)",
            borderRadius: 12,
            padding: 12,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            marginTop: -8,
          }}
        >
          {COLOR_OPTIONS.map((color) => (
            <TouchableOpacity
              key={color.value}
              disabled={true}
              onPress={() => {
                setLocalAccentColor(color.value);
                // Note: setAccentColor would need to be passed as prop if needed
                setShowColorOptions(false);
              }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: color.value,
                borderWidth: localAccentColor === color.value ? 3 : 1,
                borderColor:
                  localAccentColor === color.value
                    ? theme.dark
                      ? "#FFFFFF"
                      : "#000000"
                    : theme.dark
                      ? "rgba(255, 255, 255, 0.2)"
                      : "rgba(0, 0, 0, 0.1)",
              }}
            />
          ))}
        </View>
      )}

      {/* Preview Section */}
      <SettingItem
        icon="eye"
        title="Text Preview"
        subtitle="See how your text will look"
        theme={theme}
        onPress={() => setShowPreview(!showPreview)}
      >
        <Ionicons
          name={showPreview ? "chevron-up" : "chevron-down"}
          size={18}
          color={theme.colors.text + "60"}
        />
      </SettingItem>

      {/* Preview Box (when expanded) */}
      {showPreview && (
        <View
          style={{
            backgroundColor: theme.dark
              ? "rgba(255, 255, 255, 0.02)"
              : "rgba(0, 0, 0, 0.01)",
            borderRadius: 12,
            padding: 16,
            marginTop: -8,
            borderWidth: 1,
            borderColor: theme.dark
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.02)",
          }}
        >
          <Text
            style={{
              fontFamily: fontFamily !== "System" ? fontFamily : undefined,
              fontSize: fontSize,
              color: theme.colors.text,
              lineHeight: fontSize * 1.4,
              textAlign: "justify",
            }}
          >
            This is a preview of how your text will appear throughout the app.
            The current font size is {fontSize}px and the font family is set to{" "}
            {getCurrentFontName()}. This preview helps you see how readable your
            chosen settings will be when reading sermons.
          </Text>

          <TouchableOpacity
            onPress={() => navigation?.navigate("currentsermon")}
            style={{
              marginTop: 12,
              padding: 8,
              backgroundColor: theme.dark
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(0, 0, 0, 0.05)",
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.text + "90",
                fontFamily: "ZillaSlab",
              }}
            >
              Open Full Reading View
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default DisplaySettings;
