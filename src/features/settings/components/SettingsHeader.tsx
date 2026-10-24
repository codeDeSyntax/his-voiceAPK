// File: components/SettingsHeader.js
import React from "react";
import { View, Text, TouchableOpacity, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SettingsHeaderProps } from "../types";

const SettingsHeader = ({ theme, accentColor, compact = false }: SettingsHeaderProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const mutedText = theme.colors.text + "72";
  const accent = theme.dark ? theme.colors.hlight : accentColor;

  const getIconButtonStyle = (): ViewStyle => ({
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.dark
      ? "rgba(255, 255, 255, 0.07)"
      : "rgba(93, 50, 17, 0.07)",
  });

  return (
    <View
      style={{
        paddingHorizontal: 24,
        paddingTop: insets.top + 10,
        paddingBottom: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
      }}
    >
      <TouchableOpacity
        onPress={() => router?.navigate("/sermons")}
        style={getIconButtonStyle()}
        activeOpacity={0.78}
      >
        <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: accent,
            }}
          />
          <Text
            style={{
              fontSize: 12,
              // fontWeight: "700",
              fontFamily: "ZillaSlab-SemiBold",
              color: mutedText,
              // letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            Preferences
          </Text>
        </View>
        <Text
          style={{
            fontSize: 26,
            // fontWeight: "700",
            fontFamily: "Serif",
            color: theme.colors.text,
            letterSpacing: 0,
            marginTop: 4,
          }}
        >
          Settings
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "ZillaSlab",
            color: mutedText,
            marginTop: 2,
            letterSpacing: 0,
          }}
        >
          Tune the reading experience
        </Text>
      </View>
    </View>
  );
};

export default SettingsHeader;
