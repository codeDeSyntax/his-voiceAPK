import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const AppSettings = ({ theme, router, compact = false }) => {
  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    disabled = false,
    rightIcon = "chevron-forward",
  }) => {
    const [pressed, setPressed] = useState(false);

    return (
      <TouchableOpacity
        style={{
          backgroundColor: theme.dark
            ? "rgba(255, 255, 255, 0.02)"
            : "rgba(255, 255, 255, 0.7)",
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: theme.dark
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.02)",
          transform: [{ scale: pressed ? 0.98 : 1 }],
          opacity: disabled ? 0.6 : 1,
        }}
        onPress={onPress}
        onPressIn={() => !disabled && setPressed(true)}
        onPressOut={() => setPressed(false)}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: theme.dark
                  ? disabled
                    ? "rgba(255, 255, 255, 0.04)"
                    : "rgba(255, 255, 255, 0.08)"
                  : disabled
                  ? "rgba(0, 0, 0, 0.03)"
                  : "rgba(0, 0, 0, 0.05)",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              <Ionicons
                name={icon}
                size={18}
                color={
                  disabled
                    ? theme.dark
                      ? "#666666"
                      : "#888888"
                    : theme.colors.text
                }
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: disabled
                    ? theme.dark
                      ? "#666666"
                      : "#888888"
                    : theme.colors.text,
                  fontFamily: "ZillaSlab",
                }}
              >
                {title}
              </Text>
              {subtitle && (
                <Text
                  style={{
                    fontSize: 13,
                    color: disabled
                      ? theme.dark
                        ? "#555555"
                        : "#999999"
                      : theme.colors.text + "80",
                    marginTop: 2,
                    fontFamily: "ZillaSlab",
                  }}
                >
                  {subtitle}
                </Text>
              )}
            </View>
          </View>

          <Ionicons
            name={rightIcon}
            size={18}
            color={
              disabled
                ? theme.dark
                  ? "#666666"
                  : "#888888"
                : theme.colors.text + "60"
            }
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ gap: 12 }}>
      {/* About */}
      <SettingItem
        icon="help-circle-outline"
        title="About"
        subtitle="App information, privacy policy"
        onPress={() => router.push("About")}
      />

      {/* Check for Updates */}
      <SettingItem
        icon="download-outline"
        title="Check for Updates"
        subtitle="Current version 1.0.0"
        disabled={true}
        rightIcon="arrow-down-circle-outline"
      />

      {/* Feedback */}
      <SettingItem
        icon="mail-outline"
        title="Send Feedback"
        subtitle="Help us improve the app"
        disabled={true}
        rightIcon="open-outline"
      />

      {/* Rate App */}
      <SettingItem
        icon="star-outline"
        title="Rate App"
        subtitle="Rate us on the App Store"
        disabled={true}
        rightIcon="heart-outline"
      />
    </View>
  );
};

export default AppSettings;
