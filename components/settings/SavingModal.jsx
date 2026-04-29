// File: components/SavingModal.js
import React from "react";
import { View, Text, Modal } from "react-native";
import { styles } from "../../styles/settings";

const SavingModal = ({ visible, theme, accentColor }) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.modalBackground}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.dark ? theme.colors.primary : "#FFFFFF" },
          ]}
        >
          <Text
            style={[
              styles.modalText,
              { color: theme.dark ? "#FFFFFF" : "#1A1A1A" },
            ]}
          >
            Saved
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default SavingModal;
