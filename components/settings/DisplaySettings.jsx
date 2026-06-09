import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Modal,
  Pressable,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlassTile } from "../../styles/glassButton";

const FONT_SIZE_OPTIONS = [
  { value: 12, label: "Compact" },
  { value: 14, label: "Small" },
  { value: 16, label: "Comfortable" },
  { value: 18, label: "Relaxed" },
  { value: 20, label: "Large" },
  { value: 22, label: "Roomy" },
  { value: 24, label: "Spacious" },
  { value: 28, label: "Extra large" },
  { value: 32, label: "Maximum" },
];

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
  const [showFontSizeOptions, setShowFontSizeOptions] = useState(false);
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

  const accent = theme.dark ? "#fcceab" : "#5d3211";
  const rowDivider = theme.dark
    ? "rgba(242, 205, 180, 0.09)"
    : "rgba(93, 50, 17, 0.08)";
  const rowPressedBg = theme.dark
    ? "rgba(255, 255, 255, 0.04)"
    : "rgba(93, 50, 17, 0.04)";
  const iconBg = theme.dark
    ? "rgba(242, 205, 180, 0.10)"
    : "rgba(93, 50, 17, 0.08)";
  const softPanelBg = theme.dark
    ? "rgba(255, 255, 255, 0.035)"
    : "rgba(93, 50, 17, 0.035)";
  const controlPanelBg = theme.dark
    ? "rgba(242, 205, 180, 0.075)"
    : "rgba(93, 50, 17, 0.075)";

  const SettingItem = ({ icon, title, subtitle, children, onPress, theme }) => {
    const [pressed, setPressed] = useState(false);
    const RowComponent = onPress ? TouchableOpacity : View;

    return (
      <RowComponent
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 14,
          paddingHorizontal: 14,
          borderBottomWidth: 1,
          borderBottomColor: rowDivider,
          backgroundColor: pressed ? rowPressedBg : "transparent",
        }}
        onPress={onPress}
        onPressIn={onPress ? () => setPressed(true) : undefined}
        onPressOut={onPress ? () => setPressed(false) : undefined}
        activeOpacity={onPress ? 0.9 : undefined}
      >
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: iconBg,
            marginRight: 14,
          }}
        >
          <Ionicons name={icon} size={19} color={accent} />
        </View>

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
                color: theme.colors.text + "68",
                fontFamily: "ZillaSlab",
                lineHeight: 18,
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {children}
      </RowComponent>
    );
  };

  const getFontSizeLabel = useCallback((size) => {
    const match = FONT_SIZE_OPTIONS.find((opt) => opt.value === Number(size));
    if (match) return match.label;
    if (size < 16) return "Small";
    if (size < 20) return "Comfortable";
    if (size < 24) return "Large";
    return "Extra large";
  }, []);

  const toggleFontSizeMenu = useCallback(() => {
    setShowFontSizeOptions((open) => {
      const next = !open;
      if (next) setShowFontOptions(false);
      return next;
    });
  }, []);

  const toggleFontFamilyMenu = useCallback(() => {
    setShowFontOptions((open) => {
      const next = !open;
      if (next) setShowFontSizeOptions(false);
      return next;
    });
  }, []);

  const selectFontSize = useCallback(
    (value) => {
      if (Number(fontSize) !== value) {
        setFontSize(value);
      }
      setShowFontSizeOptions(false);
    },
    [fontSize, setFontSize],
  );

  return (
    <View style={{ paddingHorizontal: 0 }}>
      <SettingItem
        icon="moon"
        title="Dark Mode"
        subtitle={`${isDarkMode ? "Enabled" : "Disabled"} - Easier on the eyes at night`}
        theme={theme}
      >
        <View
          style={{
            minWidth: 66,
            minHeight: 42,
            borderRadius: 21,
            paddingHorizontal: 4,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: controlPanelBg,
          }}
        >
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{
              false: theme.dark ? "#4a4038" : "#d8c9b3",
              true: accent,
            }}
            thumbColor="#ffffff"
            testID="display-dark-mode-switch"
          />
        </View>
      </SettingItem>

      <SettingItem
        icon="text-outline"
        title="Font Size"
        subtitle={`${fontSize}px · ${getFontSizeLabel(Number(fontSize))}`}
        theme={theme}
        onPress={toggleFontSizeMenu}
      >
        <Ionicons
          name={showFontSizeOptions ? "chevron-up" : "chevron-down"}
          size={18}
          color={theme.colors.text + "60"}
        />
      </SettingItem>

      <SettingItem
        icon="text"
        title="Font Family"
        subtitle={`Current: ${getCurrentFontName()}`}
        theme={theme}
        onPress={toggleFontFamilyMenu}
      >
        <Ionicons
          name={showFontOptions ? "chevron-up" : "chevron-down"}
          size={18}
          color={theme.colors.text + "60"}
        />
      </SettingItem>

      {showFontOptions && (
        <View
          style={{
            backgroundColor: softPanelBg,
            borderRadius: 18,
            padding: 8,
            gap: 6,
            marginHorizontal: 12,
            marginTop: 8,
            marginBottom: 10,
          }}
        >
          {FONT_OPTIONS.map((font) => (
            <TouchableOpacity
              key={font.value}
              onPress={() => {
                setFontFamily(font.value);
                setShowFontOptions(false);
                setShowFontSizeOptions(false);
              }}
              style={{
                paddingVertical: 11,
                paddingHorizontal: 12,
                borderRadius: 14,
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
                  color:
                    fontFamily === font.value
                      ? theme.dark
                        ? theme.colors.hlight
                        : "#5d3211"
                      : theme.colors.text,
                  fontFamily: font.value !== "System" ? font.value : undefined,
                }}
              >
                {font.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

     

      {showColorOptions && (
        <View
          style={{
            backgroundColor: softPanelBg,
            borderRadius: 18,
            padding: 12,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            marginHorizontal: 12,
            marginTop: 8,
            marginBottom: 10,
          }}
        >
          {COLOR_OPTIONS.map((color) => (
            <TouchableOpacity
              key={color.value}
              disabled={true}
              onPress={() => {
                setLocalAccentColor(color.value);
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

      {showPreview && (
        <View
          style={{
            backgroundColor: softPanelBg,
            borderRadius: 18,
            padding: 16,
            marginHorizontal: 12,
            marginTop: 8,
            marginBottom: 10,
          }}
        >
          <Text
            style={{
              fontFamily: fontFamily !== "System" ? fontFamily : undefined,
              fontSize: fontSize,
              color: theme.colors.text,
              lineHeight: fontSize * 1.5,
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
              paddingVertical: 10,
              paddingHorizontal: 12,
              backgroundColor: theme.dark
                ? "rgba(242, 205, 180, 0.08)"
                : "rgba(93, 50, 17, 0.07)",
              borderRadius: 14,
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

      <Modal
        visible={showFontSizeOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFontSizeOptions(false)}
      >
        <View style={styles.menuRoot}>
          <Pressable
            style={[
              styles.menuBackdrop,
              {
                backgroundColor: theme.dark
                  ? "rgba(0, 0, 0, 0.58)"
                  : "rgba(30, 20, 10, 0.34)",
              },
            ]}
            onPress={() => setShowFontSizeOptions(false)}
          />

          <View
            style={[
              styles.menuPanel,
              {
                backgroundColor: theme.dark
                  ? "rgba(26, 19, 16, 0.94)"
                  : "rgba(254, 252, 249, 0.97)",
                borderColor: theme.dark
                  ? "rgba(242, 205, 180, 0.16)"
                  : "rgba(93, 50, 17, 0.12)",
                shadowColor: theme.dark ? "#000" : "#5d3211",
              },
            ]}
          >
            <View
              pointerEvents="none"
              style={[
                styles.menuPanelGlow,
                {
                  backgroundColor: theme.dark
                    ? "rgba(255, 255, 255, 0.04)"
                    : "rgba(255, 255, 255, 0.55)",
                },
              ]}
            />

            <View style={styles.menuHeader}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.menuTitle, { color: theme.colors.text }]}
                >
                  Font size
                </Text>
                <Text
                  style={[
                    styles.menuSubtitle,
                    { color: theme.colors.text + "68" },
                  ]}
                >
                  {fontSize}px · {getFontSizeLabel(Number(fontSize))}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowFontSizeOptions(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="close"
                  size={16}
                  color={theme.colors.text + "70"}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.menuGrid}>
              {FONT_SIZE_OPTIONS.map((option) => {
                const isSelected = Number(fontSize) === option.value;
                const labelColor = isSelected
                  ? theme.dark
                    ? theme.colors.hlight
                    : "#5d3211"
                  : theme.colors.text;

                return (
                  <GlassTile
                    key={option.value}
                    theme={theme}
                    selected={isSelected}
                    compact
                    onPress={() => selectFontSize(option.value)}
                    style={styles.menuGridItem}
                    testID={`display-font-size-${option.value}`}
                  >
                    <Text
                      style={[
                        styles.menuGridValue,
                        {
                          color: labelColor,
                          fontWeight: isSelected ? "700" : "500",
                        },
                      ]}
                    >
                      {option.value}
                    </Text>
                  </GlassTile>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  menuRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menuPanel: {
    alignSelf: "center",
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 10,
  },
  menuPanelGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 36,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 8,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "ZillaSlab",
  },
  menuSubtitle: {
    marginTop: 1,
    fontSize: 11,
    fontFamily: "ZillaSlab",
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
    maxWidth: 228,
  },
  menuGridItem: {
    minWidth: 38,
  },
  menuGridValue: {
    fontSize: 12,
    fontFamily: "ZillaSlab",
    textAlign: "center",
  },
});

export default DisplaySettings;
