// File: components/ActionButtons.js
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../../styles/settings";

const ActionButtons = ({
  theme,
  accentColor,
  saveSettings,
  restoreDefault,
  compact = false,
}) => {
  return (
    <View
      style={[
        styles.buttonsContainer,
        {
          marginTop: compact ? 12 : 24,
          marginBottom: compact ? 8 : 24,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.saveButton,
          {
            backgroundColor: theme.dark ? "#150b04" : "#432815",
            paddingVertical: compact ? 12 : 16,
          },
        ]}
        onPress={saveSettings}
      >
        <Text style={[styles.saveButtonText, { fontSize: compact ? 14 : 16 }]}>
          Save Settings
        </Text>
      </TouchableOpacity>

      {/* <TouchableOpacity
        style={[
          styles.resetButton,
          { 
            backgroundColor: theme.dark ? "#2A2A2A" : "#F0F0F0",
          }
        ]}
        onPress={restoreDefault}
      >
        <Text
          style={[
            styles.resetButtonText,
            { color: theme.dark ? "#FFFFFF" : "#333333" },
          ]}
        >
          Reset to Defaults
        </Text>
      </TouchableOpacity> */}
    </View>
  );
};

export default ActionButtons;
