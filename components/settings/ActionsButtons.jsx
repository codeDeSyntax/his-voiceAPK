// File: components/ActionButtons.js
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../../styles/settings"

const ActionButtons = ({ theme, accentColor, saveSettings, restoreDefault }) => {
  return (
    <View style={styles.buttonsContainer}>
      <TouchableOpacity
        style={[
          styles.saveButton,
          { backgroundColor: "#150b04" },
        ]}
        onPress={saveSettings}
      >
        <Text style={styles.saveButtonText}>Save Settings</Text>
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