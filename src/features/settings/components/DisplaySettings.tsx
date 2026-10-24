import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Modal,
  Pressable,
  StyleSheet,
  Animated,
  ScrollView,
  Easing,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlassTile } from "../../../shared/components/GlassButton";
import type {
  DisplaySettingsProps,
  FontFamilySheetProps,
  FontSizeSheetProps,
  SettingsRowProps,
  TextPreviewModalProps,
} from "../types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

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

const DisplaySettingItem = ({
  icon,
  title,
  subtitle,
  children,
  onPress,
  theme,
}: SettingsRowProps) => {
  const [pressed, setPressed] = useState(false);
  const rowDivider = theme.dark ? "rgba(242, 205, 180, 0.09)" : "rgba(93, 50, 17, 0.08)";
  const rowPressedBg = theme.dark ? "rgba(255, 255, 255, 0.04)" : "rgba(93, 50, 17, 0.04)";
  const iconBg = theme.dark ? "rgba(242, 205, 180, 0.10)" : "rgba(93, 50, 17, 0.08)";
  const accent = theme.dark ? "#fcceab" : "#5d3211";
  const RowComponent = onPress ? TouchableOpacity : View;

  return (
    <RowComponent
      style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: rowDivider, backgroundColor: pressed ? rowPressedBg : "transparent" }}
      onPress={onPress}
      onPressIn={onPress ? () => setPressed(true) : undefined}
      onPressOut={onPress ? () => setPressed(false) : undefined}
      activeOpacity={onPress ? 0.9 : undefined}
    >
      <View style={{ width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: iconBg, marginRight: 14 }}>
        <Ionicons name={icon} size={19} color={accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: "500", color: theme.colors.text, fontFamily: "ZillaSlab", marginBottom: subtitle ? 2 : 0 }}>{title}</Text>
        {subtitle ? <Text style={{ fontSize: 13, color: `${theme.colors.text}68`, fontFamily: "ZillaSlab", lineHeight: 18 }}>{subtitle}</Text> : null}
      </View>
      {children}
    </RowComponent>
  );
};

// ─── Font Family Bottom Sheet ─────────────────────────────────────────────────
const FontFamilySheet = ({ visible, onClose, fontFamily, setFontFamily, FONT_OPTIONS, theme }: FontFamilySheetProps) => {
  const slideAnim = useState(() => new Animated.Value(0))[0];
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (visible && !modalVisible) {
      const openTimer = setTimeout(() => {
        setModalVisible(true);
        Animated.spring(slideAnim, {
          toValue: 1,
          damping: 26,
          stiffness: 320,
          useNativeDriver: true,
        }).start();
      }, 0);
      return () => clearTimeout(openTimer);
    } else if (modalVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    }
  }, [visible, modalVisible, slideAnim]);

  if (!modalVisible) return null;

  const dark = theme.dark;
  const sheetBg = dark ? "#1a1310" : "#fefcf9";
  const handle = dark ? "rgba(242,205,180,0.20)" : "rgba(93,50,17,0.18)";
  const divider = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const accent = dark ? "#f2cdb4" : "#5d3211";
  const SHEET_HEIGHT = Math.min(SCREEN_HEIGHT * 0.52, 420);

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      {/* Backdrop */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: dark ? "rgba(8,5,3,0.62)" : "rgba(0,0,0,0.32)",
            opacity: slideAnim,
          },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: SHEET_HEIGHT,
          backgroundColor: sheetBg,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.18,
          shadowRadius: 20,
          elevation: 20,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [SHEET_HEIGHT, 0],
              }),
            },
          ],
        }}
      >
        {/* Handle */}
        <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 6 }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: handle }} />
        </View>

        {/* Title row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingBottom: 12,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: divider,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "ZillaSlab-SemiBold",
              color: theme.colors.text,
              letterSpacing: 0.3,
            }}
          >
            Font Family
          </Text>
          <Pressable
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 12, right: 12 }}
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
              width: 28, height: 28, borderRadius: 14,
              alignItems: "center", justifyContent: "center",
              backgroundColor: dark ? "rgba(242,205,180,0.09)" : "rgba(93,50,17,0.07)",
            })}
          >
            <Ionicons name="close" size={15} color={dark ? "rgba(242,205,180,0.70)" : "rgba(93,50,17,0.65)"} />
          </Pressable>
        </View>

        {/* Font list */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
        >
          {FONT_OPTIONS.map((font, index) => {
            const isSelected = fontFamily === font.value;
            return (
              <Pressable
                key={font.value}
                onPress={() => {
                  setFontFamily(font.value);
                  onClose();
                }}
                android_ripple={{ color: dark ? "rgba(242,205,180,0.08)" : "rgba(93,50,17,0.06)" }}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  paddingVertical: 13,
                  marginHorizontal: 8,
                  borderRadius: 10,
                  backgroundColor: isSelected
                    ? dark ? "rgba(242,205,180,0.08)" : "rgba(93,50,17,0.06)"
                    : pressed ? (dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)") : "transparent",
                })}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: font.value !== "System" ? font.value : undefined,
                      color: isSelected ? accent : theme.colors.text,
                      letterSpacing: 0.1,
                    }}
                  >
                    {font.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: font.value !== "System" ? font.value : undefined,
                      color: dark ? "rgba(242,205,180,0.38)" : "rgba(93,50,17,0.42)",
                      marginTop: 2,
                    }}
                    numberOfLines={1}
                  >
                    Worthy is the Lamb that was slain
                  </Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark" size={17} color={accent} style={{ marginLeft: 12 }} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

// ─── Text Preview Modal (Compact Centered Card) ────────────────────────────────
const TextPreviewModal = ({ visible, onClose, fontFamily, fontSize, getCurrentFontName, navigation, theme }: TextPreviewModalProps) => {
  const panelAnim = useState(() => new Animated.Value(0))[0];
  const backdropAnim = useState(() => new Animated.Value(0))[0];
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (visible && !modalVisible) {
      const openTimer = setTimeout(() => {
        setModalVisible(true);
        panelAnim.setValue(0);
        backdropAnim.setValue(0);
        Animated.parallel([
          Animated.timing(backdropAnim, {
            toValue: 1, duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: true,
          }),
          Animated.spring(panelAnim, {
            toValue: 1, damping: 24, stiffness: 300, useNativeDriver: true,
          }),
        ]).start();
      }, 0);
      return () => clearTimeout(openTimer);
    } else if (modalVisible) {
      Animated.parallel([
        Animated.timing(backdropAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.timing(panelAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]).start(() => setModalVisible(false));
    }
  }, [visible, modalVisible, panelAnim, backdropAnim]);

  if (!modalVisible) return null;

  const dark = theme.dark;
  const cardBg = dark ? "rgba(30,21,15,0.97)" : "rgba(252,246,237,0.98)";
  const titleColor = dark ? "rgba(255,255,255,0.95)" : "rgba(15,10,5,0.92)";
  const subtitleColor = dark ? "rgba(242,205,180,0.42)" : "rgba(93,50,17,0.40)";
  const divider = dark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)";
  const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.84, 320);

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      {/* Backdrop */}
      <Animated.View
        style={[StyleSheet.absoluteFill, {
          backgroundColor: dark ? "rgba(10,6,4,0.60)" : "rgba(0,0,0,0.35)",
          opacity: backdropAnim,
        }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Centered card */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }} pointerEvents="box-none">
        <Animated.View
          style={[
            {
              backgroundColor: cardBg,
              width: CARD_WIDTH,
              borderRadius: 18,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 16 },
              shadowOpacity: 0.30,
              shadowRadius: 28,
              elevation: 18,
              paddingVertical: 14,
              paddingHorizontal: 18,
              opacity: panelAnim,
              transform: [
                { scale: panelAnim.interpolate({ inputRange: [0, 1], outputRange: [0.90, 1] }) },
                { translateY: panelAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
              ],
            },
          ]}
        >
          {/* Header */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: divider }}>
            <View>
              <Text style={{ fontFamily: "ZillaSlab-SemiBold", fontSize: 15, letterSpacing: 0.3, color: titleColor }}>
                Text Preview
              </Text>
              <Text style={{ fontFamily: "ZillaSlab-SemiBold", fontSize: 10, letterSpacing: 0.4, color: subtitleColor, marginTop: 2 }}>
                {fontSize}px · {getCurrentFontName()}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
                width: 28, height: 28, borderRadius: 14,
                alignItems: "center", justifyContent: "center",
                backgroundColor: dark ? "rgba(242,205,180,0.09)" : "rgba(93,50,17,0.07)",
              })}
            >
              <Ionicons name="close" size={15} color={dark ? "rgba(242,205,180,0.70)" : "rgba(93,50,17,0.65)"} />
            </Pressable>
          </View>

          {/* Preview Body */}
          <View style={{ paddingVertical: 14 }}>
            <Text
              style={{
                fontFamily: fontFamily !== "System" ? fontFamily : undefined,
                fontSize: fontSize,
                color: theme.colors.text,
                lineHeight: fontSize * 1.5,
                textAlign: "justify",
              }}
            >
              Worthy is the Lamb that was slain to receive power, and riches, and wisdom, and strength, and honour, and glory, and blessing.
            </Text>
          </View>

          {/* Action button */}
          <TouchableOpacity
            onPress={() => {
              onClose();
              navigation?.navigate("/reader");
            }}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              backgroundColor: dark
                ? "rgba(242, 205, 180, 0.10)"
                : "rgba(93, 50, 17, 0.08)",
              borderRadius: 12,
              alignItems: "center",
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: dark ? "rgba(242,205,180,0.18)" : "rgba(93,50,17,0.14)",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                color: dark ? "#f2cdb4" : "#5d3211",
                fontFamily: "ZillaSlab-SemiBold",
                letterSpacing: 0.2,
              }}
            >
              Open Full Reading View
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ─── Font Size Modal (Compact Centered Card) ──────────────────────────────────
const FontSizeSheet = ({ visible, onClose, fontSize, selectFontSize, getFontSizeLabel, FONT_SIZE_OPTIONS, theme }: FontSizeSheetProps) => {
  const panelAnim = useState(() => new Animated.Value(0))[0];
  const backdropAnim = useState(() => new Animated.Value(0))[0];
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (visible && !modalVisible) {
      const openTimer = setTimeout(() => {
        setModalVisible(true);
        panelAnim.setValue(0);
        backdropAnim.setValue(0);
        Animated.parallel([
          Animated.timing(backdropAnim, {
            toValue: 1, duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: true,
          }),
          Animated.spring(panelAnim, {
            toValue: 1, damping: 24, stiffness: 300, useNativeDriver: true,
          }),
        ]).start();
      }, 0);
      return () => clearTimeout(openTimer);
    } else if (modalVisible) {
      Animated.parallel([
        Animated.timing(backdropAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.timing(panelAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]).start(() => setModalVisible(false));
    }
  }, [visible, modalVisible, panelAnim, backdropAnim]);

  if (!modalVisible) return null;

  const dark = theme.dark;
  const cardBg = dark ? "rgba(30,21,15,0.97)" : "rgba(252,246,237,0.98)";
  const titleColor = dark ? "rgba(255,255,255,0.95)" : "rgba(15,10,5,0.92)";
  const subtitleColor = dark ? "rgba(242,205,180,0.42)" : "rgba(93,50,17,0.40)";
  const divider = dark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)";
  const accent = dark ? "#f2cdb4" : "#5d3211";
  const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.78, 300);

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      {/* Backdrop */}
      <Animated.View
        style={[StyleSheet.absoluteFill, {
          backgroundColor: dark ? "rgba(10,6,4,0.60)" : "rgba(0,0,0,0.35)",
          opacity: backdropAnim,
        }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Centered card */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }} pointerEvents="box-none">
        <Animated.View
          style={[
            {
              backgroundColor: cardBg,
              width: CARD_WIDTH,
              maxHeight: Math.min(SCREEN_HEIGHT * 0.70, 460),
              borderRadius: 18,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 16 },
              shadowOpacity: 0.30,
              shadowRadius: 28,
              elevation: 18,
              paddingVertical: 8,
              paddingHorizontal: 14,
              opacity: panelAnim,
              transform: [
                { scale: panelAnim.interpolate({ inputRange: [0, 1], outputRange: [0.90, 1] }) },
                { translateY: panelAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
              ],
            },
          ]}
        >
          {/* Header */}
          <View style={{ alignItems: "center", paddingHorizontal: 12, paddingTop: 14, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: divider }}>
            <Text style={{ fontFamily: "ZillaSlab-SemiBold", fontSize: 15, letterSpacing: 0.3, color: titleColor, marginBottom: 2 }}>
              Font Size
            </Text>
            <Text style={{ fontFamily: "ZillaSlab-SemiBold", fontSize: 10, letterSpacing: 0.4, color: subtitleColor }}>
              {fontSize}px · {getFontSizeLabel(Number(fontSize))}
            </Text>
          </View>

          {/* Size list */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
            {FONT_SIZE_OPTIONS.map((option, index) => {
              const isSelected = Number(fontSize) === option.value;
              const isLast = index === FONT_SIZE_OPTIONS.length - 1;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => selectFontSize(option.value)}
                  android_ripple={{ color: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)" }}
                  style={({ pressed }) => [
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                    },
                    !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: divider },
                    pressed && { opacity: 0.55 },
                  ]}
                >
                  <Text style={{ fontFamily: "Merriweather", fontSize: 12.5, color: isSelected ? accent : (dark ? "rgba(242,205,180,0.95)" : "rgba(30,15,5,0.88)") }}>
                    {option.value}px · {option.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={15} color={accent} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

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
}: DisplaySettingsProps) => {
  const [showFontSizeSheet, setShowFontSizeSheet] = useState(false);
  const [showFontSheet, setShowFontSheet] = useState(false);
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

  

  const getFontSizeLabel = useCallback((size: number): string => {
    const match = FONT_SIZE_OPTIONS.find((opt) => opt.value === Number(size));
    if (match) return match.label;
    if (size < 16) return "Small";
    if (size < 20) return "Comfortable";
    if (size < 24) return "Large";
    return "Extra large";
  }, []);

  const openFontSizeSheet = useCallback(() => setShowFontSizeSheet(true), []);
  const closeFontSizeSheet = useCallback(() => setShowFontSizeSheet(false), []);

  const openFontSheet = useCallback(() => {
    setShowFontSheet(true);
  }, []);

  const closeFontSheet = useCallback(() => {
    setShowFontSheet(false);
  }, []);

  const selectFontSize = useCallback(
    (value: number) => {
      if (Number(fontSize) !== value) {
        setFontSize(value);
      }
      setShowFontSizeSheet(false);
    },
    [fontSize, setFontSize],
  );

return (
    <View style={{ paddingHorizontal: 0 }}>
      <DisplaySettingItem    
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
      </DisplaySettingItem>

      <DisplaySettingItem    
        icon="text-outline"
        title="Font Size"
        subtitle={`${fontSize}px · ${getFontSizeLabel(Number(fontSize))}`}
        theme={theme}
        onPress={openFontSizeSheet}
      >
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 20,
            backgroundColor: theme.dark
              ? "rgba(242,205,180,0.12)"
              : "rgba(93,50,17,0.09)",
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontFamily: "ZillaSlab-SemiBold",
              color: theme.dark ? "#f2cdb4" : "#5d3211",
              letterSpacing: 0.3,
            }}
          >
            {fontSize}px
          </Text>
        </View>
      </DisplaySettingItem>

      <DisplaySettingItem    
        icon="text"
        title="Font Family"
        subtitle={`Current: ${getCurrentFontName()}`}
        theme={theme}
        onPress={openFontSheet}
      >
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 20,
            backgroundColor: theme.dark
              ? "rgba(242,205,180,0.12)"
              : "rgba(93,50,17,0.09)",
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontFamily: "ZillaSlab-SemiBold",
              color: theme.dark ? "#f2cdb4" : "#5d3211",
              letterSpacing: 0.3,
            }}
          >
            {getCurrentFontName()}
          </Text>
        </View>
      </DisplaySettingItem>

      {/* Font Family Bottom Sheet */}
      <FontFamilySheet
        visible={showFontSheet}
        onClose={closeFontSheet}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        FONT_OPTIONS={FONT_OPTIONS}
        theme={theme}
      />

     

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

      <DisplaySettingItem    
        icon="eye"
        title="Text Preview"
        subtitle="See how your text will look"
        theme={theme}
        onPress={() => setShowPreview(true)}
      >
        <Ionicons
          name="open-outline"
          size={18}
          color={theme.colors.text + "60"}
        />
      </DisplaySettingItem>

      <TextPreviewModal
        visible={showPreview}
        onClose={() => setShowPreview(false)}
        fontFamily={fontFamily}
        fontSize={fontSize}
        getCurrentFontName={getCurrentFontName}
        navigation={navigation}
        theme={theme}
      />

      {/* Font Size Bottom Sheet */}
      <FontSizeSheet
        visible={showFontSizeSheet}
        onClose={closeFontSizeSheet}
        fontSize={fontSize}
        selectFontSize={selectFontSize}
        getFontSizeLabel={getFontSizeLabel}
        FONT_SIZE_OPTIONS={FONT_SIZE_OPTIONS}
        theme={theme}
      />
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
    ...StyleSheet.absoluteFill,
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
