// File: components/AppSettings.js
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { styles } from "../../styles/settings";

const AppSettings = ({ theme, router }) => {
  const getSettingItemStyle = (disabled) => {
    return [styles.settingItem, { opacity: disabled ? 0.5 : 1 }];
  };

  const getIconContainerStyle = () => {
    return [
      styles.iconContainer,
      {
        backgroundColor: theme.dark
          ? "rgba(255, 255, 255, 0.08)"
          : "rgba(0, 0, 0, 0.04)",
        shadowColor: theme.dark ? "#000" : "#888",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme.dark ? 0.3 : 0.1,
        shadowRadius: 4,
      },
    ];
  };

  return (
    <View
      style={[
        styles.settingsGroup,
        { backgroundColor: theme.colors.secondary },
      ]}
    >
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => router.push("About")}
      >
        <View style={styles.settingLeft}>
          <View style={getIconContainerStyle()}>
            <Icon
              name="help-circle"
              size={20}
              color={theme.dark ? "#FFFFFF" : "#333333"}
            />
          </View>
          <View style={styles.settingTextContainer}>
            <Text
              style={[
                styles.settingText,
                { color: theme.dark ? "#FFFFFF" : "#1A1A1A" },
              ]}
            >
              About
            </Text>
            <Text
              style={[
                styles.settingDescription,
                { color: theme.dark ? "#BBBBBB" : "#666666" },
              ]}
            >
              App information, privacy policy
            </Text>
          </View>
        </View>
        <Icon
          name="chevron-forward"
          size={20}
          color={theme.dark ? "#FFFFFF" : "#333333"}
        />
      </TouchableOpacity>

      <View
        style={[
          styles.separator,
          { backgroundColor: theme.dark ? "#FFFFFF" : "#000000" },
        ]}
      />

      <TouchableOpacity style={getSettingItemStyle(true)} disabled={true}>
        <View style={styles.settingLeft}>
          <View style={getIconContainerStyle()}>
            <Icon
              name="download"
              size={20}
              color={theme.dark ? "#999999" : "#888888"}
            />
          </View>
          <View style={styles.settingTextContainer}>
            <Text
              style={[
                styles.settingText,
                { color: theme.dark ? "#999999" : "#888888" },
              ]}
            >
              Check for Updates
            </Text>
            <Text
              style={[
                styles.settingDescription,
                { color: theme.dark ? "#777777" : "#999999" },
              ]}
            >
              Current version 1.0.0
            </Text>
          </View>
        </View>
        <Icon
          name="arrow-down-circle"
          size={20}
          color={theme.dark ? "#999999" : "#888888"}
        />
      </TouchableOpacity>
    </View>
  );
};

export default AppSettings;
