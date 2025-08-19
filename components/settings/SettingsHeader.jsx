// File: components/SettingsHeader.js
import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const SettingsHeader = ({ theme, accentColor, compact = false }) => {
  const router = useNavigation();

  const getIconButtonStyle = () => ({
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.dark
      ? "rgba(255, 255, 255, 0.08)"
      : "rgba(0, 0, 0, 0.05)",
 
  });

  return (
    <View
      style={{
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            // fontFamily: "serif",
            color: theme.colors.text,
            letterSpacing: 0.5,
          }}
        >
          Settings
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "ZillaSlab",
            color: theme.colors.text + "80",
            marginTop: 4,
            letterSpacing: 0.2,
          }}
        >
          Customize your experience
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => router?.navigate("AllSermons")}
        style={getIconButtonStyle()}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>
    </View>
  );
};

export default SettingsHeader;
