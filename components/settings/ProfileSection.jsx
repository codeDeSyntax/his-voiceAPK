// File: components/ProfileSection.js
import React from "react";
import { View, Text, Image } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { styles } from "../../styles/settings";

const ProfileSection = ({ theme, accentColor }) => {
  return (
    <View
      style={[
        styles.profileSection,
        {
          backgroundColor: theme.dark
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.02)",
        },
      ]}
    >
      <View
        style={[
          styles.profileImage,
          {
            backgroundColor: "#121212",
            borderRadius: 100,
          },
        ]}
      >
        <Image
          source={require("../../assets/cloud.png")}
          height={50}
          width={50}
          style={{ height: 50, width: 50 }}
        />
      </View>
      <View style={styles.profileInfo}>
        <Text
          style={[
            styles.profileName,
            { color: theme.dark ? "#FFFFFF" : "#1A1A1A" },
          ]}
        >
          His voice
        </Text>
        <Text
          style={[
            styles.profileEmail,
            { color: theme.dark ? "#BBBBBB" : "#666666" },
          ]}
        >
          RobertLambertLee
        </Text>
      </View>
      <View style={[styles.chip, { backgroundColor: accentColor }]}>
        <Text style={[styles.chipText, { color: "#FFFFFF" }]}>Hisv</Text>
      </View>
    </View>
  );
};

export default ProfileSection;
