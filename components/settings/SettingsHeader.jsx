// File: components/SettingsHeader.js
import React from "react";
import { View, Text, Pressable } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { styles } from "../../styles/settings";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const SettingsHeader = ({ theme, accentColor }) => {
  const router = useNavigation();
  const getIconContainerStyle = () => {
    return [
      styles.iconContainer,
      {
        // backgroundColor: accentColor,
        borderRadius: 100,
        borderStyle: "dashed",
        borderWidth: 1,
        borderColor: theme.colors.text,
        opacity: 0.9,
        shadowColor: theme.dark ? "#000" : "#888",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme.dark ? 0.3 : 0.1,
        shadowRadius: 4,
      },
    ];
  };

  return (
    <View style={styles.headerContainer}>
      <View>
        <Text
          style={[
            styles.headerTitle,
            { color: theme.dark ? "#FFFFFF" : "#1A1A1A" },
          ]}
        >
          Settings
        </Text>
        <Text
          style={[
            styles.headerSubtitle,
            { color: theme.dark ? theme.colors.hlight : "#666666" },
          ]}
        >
          Customize {"\n"}your experience
        </Text>
      </View>
      <View style={{ gap: 4, flexDirection: "row" }}>
        <View
          style={[
            getIconContainerStyle(),
            // { backgroundColor: theme.colors.secondary },
          ]}
        >
          <Icon name="settings-outline" size={24} color={theme.colors.text} />
        </View>
        <Pressable
          onPress={() => router?.navigate("AllSermons")}
          style={[
            getIconContainerStyle(),
            // { backgroundColor: theme.dark ? "#121212":"gray"},
          ]}
          android_ripple={{
            color: theme.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
          }}
        >
          <Ionicons
            name="arrow-back-outline"
            size={24}
            color={theme.colors.text}
          />
        </Pressable>
      </View>
    </View>
  );
};

export default SettingsHeader;
