// Lightweight save confirmation — does not block touches or cover the screen.
import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles/settings";

const SavingModal = ({ visible, theme }) => {
  if (!visible) return null;

  const pillBg = theme.dark
    ? "rgba(28, 22, 18, 0.94)"
    : "rgba(252, 242, 220, 0.96)";
  const pillBorder = theme.dark
    ? "rgba(242, 205, 180, 0.18)"
    : "rgba(93, 50, 17, 0.14)";
  const textColor = theme.dark ? "#fce5d8" : "#5d3211";
  const iconColor = theme.dark ? "#d57a3e" : "#8a4820";

  return (
    <View style={styles.saveToast} pointerEvents="none">
      <View
        style={[
          styles.saveToastInner,
          {
            backgroundColor: pillBg,
            borderColor: pillBorder,
          },
        ]}
      >
        <Ionicons name="checkmark-circle" size={18} color={iconColor} />
        <Text style={[styles.saveToastText, { color: textColor }]}>Saved</Text>
      </View>
    </View>
  );
};

export default SavingModal;
