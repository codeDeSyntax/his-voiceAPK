import React from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const ActionToolbar = ({
  theme,
  isVisible,
  onClose,
  onOpenSearch,
  onScrollToTop,
  onScrollToBottom,
}) => {
  if (!isVisible) return null;

  const toolbarBg = theme.dark
    ? "rgba(44, 36, 32, 0.98)"
    : "rgba(245, 230, 195, 0.98)";
  const buttonBg = theme.dark
    ? "rgba(242, 205, 180, 0.15)"
    : "rgba(93, 50, 17, 0.08)";
  const accentColor = theme.dark ? "#f2cdb4" : "#5d3211";

  const ActionButton = ({ icon, onPress, variant = "default" }) => {
    const isPrimary = variant === "primary";
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          {
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: pressed
              ? theme.dark
                ? "rgba(255,255,255,0.1)"
                : "rgba(93,50,17,0.12)"
              : isPrimary
                ? accentColor
                : buttonBg,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
        android_ripple={{
          color: theme.dark ? "rgba(255,255,255,0.2)" : "rgba(93,50,17,0.2)",
          borderless: true,
        }}
      >
        <MaterialIcons
          name={icon}
          size={20}
          color={isPrimary ? (theme.dark ? "#1a1512" : "#fff") : accentColor}
        />
      </Pressable>
    );
  };

  return (
    <View
      style={{
        position: "absolute",
        top: 12,
        left: 16,
        right: 16,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: toolbarBg,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 200,
      }}
    >
      {/* Action Buttons */}
      <ActionButton icon="search" onPress={onOpenSearch} variant="primary" />

      <View style={{ width: 12 }} />

      <ActionButton icon="vertical-align-top" onPress={onScrollToTop} />

      <View style={{ width: 12 }} />

      <ActionButton icon="vertical-align-bottom" onPress={onScrollToBottom} />

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Close Button */}
      <Pressable
        onPress={onClose}
        style={({ pressed }) => [
          {
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: pressed
              ? theme.dark
                ? "rgba(255,255,255,0.1)"
                : "rgba(93,50,17,0.08)"
              : "transparent",
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
        android_ripple={{
          color: theme.dark ? "rgba(255,255,255,0.15)" : "rgba(93,50,17,0.1)",
          borderless: true,
        }}
      >
        <MaterialIcons
          name="close"
          size={18}
          color={theme.dark ? "#e6c3b8" : "#8b5a2b"}
        />
      </Pressable>
    </View>
  );
};

export default ActionToolbar;
