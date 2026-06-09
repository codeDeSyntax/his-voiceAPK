import React from "react";
import { View, TouchableOpacity } from "react-native";

const getGlassColors = (theme, selected = false) => {
  const dark = theme.dark;

  return {
    baseColor: selected
      ? dark
        ? "rgba(213, 122, 62, 0.22)"
        : "rgba(213, 122, 62, 0.14)"
      : dark
        ? "rgba(66, 54, 47, 0.54)"
        : "rgba(255, 248, 232, 0.52)",
    topGlow: dark
      ? "rgba(242, 205, 180, 0.10)"
      : "rgba(255, 255, 255, 0.58)",
    glint: dark
      ? "rgba(255, 255, 255, 0.12)"
      : "rgba(255, 255, 255, 0.52)",
    lowerShade: dark
      ? "rgba(0, 0, 0, 0.18)"
      : "rgba(93, 50, 17, 0.045)",
    rimColor: selected
      ? dark
        ? "rgba(251, 193, 162, 0.42)"
        : "rgba(213, 122, 62, 0.38)"
      : dark
        ? "rgba(242, 205, 180, 0.18)"
        : "rgba(255, 255, 255, 0.62)",
    lowerRimColor: dark
      ? "rgba(0, 0, 0, 0.26)"
      : "rgba(93, 50, 17, 0.16)",
    shadowColor: dark ? "#000" : "#5d3211",
  };
};

/**
 * Reusable glass-morphic circular button with layered translucent highlights.
 */
export const GlassButton = ({
  theme,
  size = 40,
  onPress,
  activeOpacity = 0.72,
  style,
  children,
}) => {
  const dark = theme.dark;
  const radius = size / 2;
  const {
    baseColor,
    topGlow,
    glint,
    lowerShade,
    rimColor,
    lowerRimColor,
    shadowColor,
  } = getGlassColors(theme);

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius,
          shadowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: dark ? 0.28 : 0.12,
          shadowRadius: 9,
          elevation: 4,
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={activeOpacity}
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          overflow: "hidden",
          backgroundColor: baseColor,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: size * 0.58,
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
            backgroundColor: topGlow,
          }}
        />

        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: size * 0.15,
            left: size * 0.18,
            width: size * 0.30,
            height: size * 0.18,
            borderRadius: size * 0.1,
            backgroundColor: glint,
            transform: [{ rotate: "-18deg" }],
          }}
        />

        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: size * 0.42,
            borderBottomLeftRadius: radius,
            borderBottomRightRadius: radius,
            backgroundColor: lowerShade,
          }}
        />

        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: radius,
            borderWidth: 1,
            borderColor: rimColor,
            borderBottomColor: lowerRimColor,
          }}
        />

        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 2,
            left: 2,
            right: 2,
            bottom: 2,
            borderRadius: Math.max(radius - 2, 0),
            borderWidth: 1,
            borderColor: dark
              ? "rgba(255, 255, 255, 0.055)"
              : "rgba(255, 255, 255, 0.30)",
          }}
        />

        {children}
      </TouchableOpacity>
    </View>
  );
};

/**
 * Glass-morphic rounded tile for grids, menus, and picker cells.
 */
export const GlassTile = ({
  theme,
  onPress,
  selected = false,
  compact = false,
  activeOpacity = 0.82,
  borderRadius,
  style,
  testID,
  children,
}) => {
  const dark = theme.dark;
  const {
    baseColor,
    topGlow,
    glint,
    lowerShade,
    rimColor,
    lowerRimColor,
    shadowColor,
  } = getGlassColors(theme, selected);

  const radius = borderRadius ?? (compact ? 11 : 16);
  const minHeight = compact ? 30 : 54;
  const padV = compact ? 4 : 10;
  const padH = compact ? 10 : 6;

  return (
    <View
      style={[
        {
          borderRadius: radius,
          shadowColor,
          shadowOffset: { width: 0, height: compact ? 2 : 3 },
          shadowOpacity: dark ? (compact ? 0.16 : 0.22) : compact ? 0.08 : 0.1,
          shadowRadius: compact ? 4 : 7,
          elevation: selected ? (compact ? 3 : 5) : compact ? 2 : 3,
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={activeOpacity}
        testID={testID}
        style={{
          borderRadius: radius,
          overflow: "hidden",
          backgroundColor: baseColor,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: padV,
          paddingHorizontal: padH,
          minHeight,
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "58%",
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
            backgroundColor: topGlow,
          }}
        />

        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: compact ? 4 : 6,
            left: compact ? 7 : 10,
            width: compact ? 12 : 22,
            height: compact ? 5 : 10,
            borderRadius: compact ? 3 : 6,
            backgroundColor: glint,
            transform: [{ rotate: "-16deg" }],
          }}
        />

        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "42%",
            borderBottomLeftRadius: radius,
            borderBottomRightRadius: radius,
            backgroundColor: lowerShade,
          }}
        />

        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: radius,
            borderWidth: 1,
            borderColor: rimColor,
            borderBottomColor: lowerRimColor,
          }}
        />

        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 1,
            left: 1,
            right: 1,
            bottom: 1,
            borderRadius: Math.max(radius - 1, 0),
            borderWidth: 1,
            borderColor: dark
              ? "rgba(255, 255, 255, 0.055)"
              : "rgba(255, 255, 255, 0.30)",
          }}
        />

        {children}
      </TouchableOpacity>
    </View>
  );
};

/**
 * Plain style fallback for non-interactive uses or spreading into custom components.
 */
export const glassButton = (theme, size = 40) => ({
  width: size,
  height: size,
  borderRadius: size / 2,
  backgroundColor: theme.dark
    ? "rgba(66, 54, 47, 0.54)"
    : "rgba(255, 248, 232, 0.52)",
  borderWidth: 1,
  borderColor: theme.dark
    ? "rgba(242, 205, 180, 0.18)"
    : "rgba(255, 255, 255, 0.62)",
  borderTopColor: theme.dark
    ? "rgba(242, 205, 180, 0.24)"
    : "rgba(255, 255, 255, 0.74)",
  borderBottomColor: theme.dark
    ? "rgba(0, 0, 0, 0.26)"
    : "rgba(93, 50, 17, 0.16)",
  alignItems: "center",
  justifyContent: "center",
  shadowColor: theme.dark ? "#000" : "#5d3211",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: theme.dark ? 0.28 : 0.12,
  shadowRadius: 9,
  elevation: 4,
});
