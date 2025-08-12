// File: components/ProfileSection.js
import React from "react";
import { View, Text, Image } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { styles } from "../../styles/settings";

const ProfileSection = ({ theme, accentColor, compact = false }) => {
  const imageSize = compact ? 40 : 60;
  const imageRadius = compact ? 20 : 30;
  const innerImageSize = compact ? 32 : 50;
  const innerImageRadius = compact ? 16 : 25;

  return (
    <View
      style={[
        styles.profileSection,
        {
          backgroundColor: theme.dark
            ? theme.colors.primary
            : "rgba(0, 0, 0, 0.02)",
          paddingVertical: compact ? 12 : 20,
        },
      ]}
    >
      <View
        style={[
          styles.profileImage,
          {
            backgroundColor: theme.colors.primary,
            borderRadius: imageRadius,
            width: imageSize,
            height: imageSize,
          },
        ]}
      >
        <Image
          source={require("../../assets/splashicon.png")}
          height={innerImageSize}
          width={innerImageSize}
          style={{
            height: innerImageSize,
            width: innerImageSize,
            borderRadius: innerImageRadius,
          }}
          resizeMode="cover"
        />
      </View>
      <View style={[styles.profileInfo, { marginLeft: compact ? 12 : 16 }]}>
        <Text
          style={[
            styles.profileName,
            {
              color: theme.dark ? "#FFFFFF" : "#1A1A1A",
              fontSize: compact ? 14 : 18,
            },
          ]}
        >
          His voice
        </Text>
        <Text
          style={[
            styles.profileEmail,
            {
              color: theme.dark ? "#BBBBBB" : "#666666",
              fontSize: compact ? 11 : 14,
            },
          ]}
        >
          RobertLambertLee
        </Text>
      </View>
      <View
        style={[
          styles.chip,
          {
            backgroundColor: "#432917",
            borderRadius: compact ? 12 : 20,
            paddingHorizontal: compact ? 8 : 12,
            paddingVertical: compact ? 4 : 6,
          },
        ]}
      >
        <Text
          style={[
            styles.chipText,
            {
              color: "#FFFFFF",
              fontSize: compact ? 10 : 12,
            },
          ]}
        >
          Hisv
        </Text>
      </View>
    </View>
  );
};

export default ProfileSection;
