// File: components/ProfileSection.js
import React from "react";
import { View, Text, Image, Platform } from "react-native";

const ProfileSection = ({ theme, accentColor, compact = false }) => {
  const imageSize = compact ? 50 : 60;
  const imageRadius = compact ? 25 : 30;

  return (
    <View
      style={{
        marginHorizontal: 0,
        marginBottom: 24,
        backgroundColor: theme.dark
          ? theme.colors.primary
          : "rgba(93, 50, 17, 0.04)",
        borderRadius: 16,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: theme.dark
          ? "rgba(242, 205, 180, 0.15)"
          : "rgba(93, 50, 17, 0.15)",
      }}
    >
      <View
        style={{
          width: imageSize,
          height: imageSize,
          borderRadius: imageRadius,
          backgroundColor: theme.dark
            ? "rgba(213, 122, 62, 0.15)"
            : "rgba(93, 50, 17, 0.15)",
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 2,
          borderColor: theme.dark ? theme.colors.hlight + "30" : "#5d321130",
        }}
      >
        <Image
          source={require("../../assets/splashicon.png")}
          style={{
            height: imageSize - 8,
            width: imageSize - 8,
            borderRadius: imageRadius - 4,
          }}
          resizeMode="cover"
        />
      </View>

      <View style={{ marginLeft: 16, flex: 1 }}>
        <Text
          style={{
            fontSize: compact ? 16 : 18,
            fontWeight: "600",
            fontFamily: "ZillaSlab",
            color: theme.colors.text,
            letterSpacing: 0.2,
          }}
        >
          His Voice
        </Text>
        <Text
          style={{
            fontSize: compact ? 12 : 14,
            fontFamily: "ZillaSlab",
            color: theme.colors.text + "70",
            marginTop: 2,
            letterSpacing: 0.1,
          }}
        >
          Robert Lambert Lee Collection
        </Text>
      </View>

      <View
        style={{
          backgroundColor: theme.dark
            ? theme.colors.hlight + "20"
            : "#5d321120",
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderWidth: 1,
          borderColor: theme.dark ? theme.colors.hlight + "30" : "#5d321130",
        }}
      >
        <Text
          style={{
            color: theme.dark ? theme.colors.hlight : "#5d3211",
            fontSize: 11,
            fontWeight: "500",
            fontFamily: "ZillaSlab",
            letterSpacing: 0.5,
          }}
        >
          HISV
        </Text>
      </View>
    </View>
  );
};

export default ProfileSection;
