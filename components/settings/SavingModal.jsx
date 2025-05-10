// File: components/SavingModal.js
import React from "react";
import { View, Text, Modal, ActivityIndicator } from "react-native";
import { styles } from "../../styles/settings";

const SavingModal = ({ visible, theme, accentColor }) => {
  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View style={styles.modalBackground}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.dark ? "#2A2A2A" : "#FFFFFF" },
          ]}
        >
          <Text
            style={[
              styles.modalText,
              { color: theme.dark ? "#FFFFFF" : "#1A1A1A" },
            ]}
          >
            Saving Your Settings...
          </Text>
          <ActivityIndicator 
            style={styles.modalSpinner}
            size="large" 
            color={accentColor} 
          />
        </View>
      </View>
    </Modal>
  );
};

export default SavingModal;