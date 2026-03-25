import React from "react";
import { View, TouchableOpacity } from "react-native";

/**
 * Reusable glass-morphic circular button with depth.
 *
 * Usage:
 *   import { GlassButton } from "../styles/glassButton";
 *
 *   <GlassButton theme={theme} onPress={handlePress}>
 *     <Ionicons name="home-outline" size={22} color={theme.colors.text} />
 *   </GlassButton>
 *
 *   <GlassButton theme={theme} size={28} onPress={handleClose}>
 *     <Ionicons name="close" size={16} color={theme.colors.text} />
 *   </GlassButton>
 */
export const GlassButton = ({
  theme,
  size = 40,
  onPress,
  activeOpacity = 0.7,
  style,
  children,
}) => {
  const dark = theme.dark;
  const radius = size / 2;

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius,
          // Outer shadow for lift
          shadowColor: dark ? "#000" : "#5d3211",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: dark ? 0.5 : 0.2,
          shadowRadius: 5,
          elevation: 6,
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
          backgroundColor: dark
            ? "rgba(60, 50, 44, 0.85)"
            : "rgba(250, 238, 209, 0.85)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Top highlight — simulates light from above */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: size * 0.48,
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
            backgroundColor: dark
              ? "rgba(255, 255, 255, 0.10)"
              : "rgba(255, 255, 255, 0.45)",
          }}
        />
        {/* Bottom darkening — simulates shadow underneath */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: size * 0.35,
            borderBottomLeftRadius: radius,
            borderBottomRightRadius: radius,
            backgroundColor: dark
              ? "rgba(0, 0, 0, 0.20)"
              : "rgba(93, 50, 17, 0.06)",
          }}
        />
        {/* Subtle rim border */}
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
            borderColor: dark
              ? "rgba(255, 255, 255, 0.12)"
              : "rgba(93, 50, 17, 0.08)",
            borderTopColor: dark
              ? "rgba(255, 255, 255, 0.25)"
              : "rgba(255, 255, 255, 0.6)",
            borderBottomColor: dark
              ? "rgba(0, 0, 0, 0.3)"
              : "rgba(93, 50, 17, 0.15)",
          }}
        />
        {children}
      </TouchableOpacity>
    </View>
  );
};

/**
 * Plain style fallback (for non-interactive uses or spreading into custom components).
 */
export const glassButton = (theme, size = 40) => ({
  width: size,
  height: size,
  borderRadius: size / 2,
  backgroundColor: theme.dark
    ? "rgba(60, 50, 44, 0.85)"
    : "rgba(250, 238, 209, 0.85)",
  borderWidth: 1,
  borderColor: theme.dark
    ? "rgba(255, 255, 255, 0.12)"
    : "rgba(93, 50, 17, 0.08)",
  borderTopColor: theme.dark
    ? "rgba(255, 255, 255, 0.25)"
    : "rgba(255, 255, 255, 0.6)",
  borderBottomColor: theme.dark
    ? "rgba(0, 0, 0, 0.3)"
    : "rgba(93, 50, 17, 0.15)",
  alignItems: "center",
  justifyContent: "center",
  shadowColor: theme.dark ? "#000" : "#5d3211",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: theme.dark ? 0.5 : 0.2,
  shadowRadius: 5,
  elevation: 6,
});
