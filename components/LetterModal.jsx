import React from "react";
import { View, Text, Modal, Pressable, FlatList } from "react-native";
import { styles } from "../styles/Allsermons";

const LetterModal = ({ theme, isVisible, closeDropdown, alphabet, setSelectedLetter }) => {
  return (
    <Modal
      // transparent={true}
      backdropColor={theme.colors.primary}
      visible={isVisible}
      onRequestClose={closeDropdown}
    >
      <Pressable style={styles.modalOverlay} onPress={closeDropdown}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.secondary,
            },
          ]}
        >
          <FlatList
            data={alphabet}
            renderItem={({ item, index }) => (
              <Pressable
                style={[
                  styles.gridItem,
                  {
                    elevation: 3,
                    backgroundColor: theme.dark
                      ? parseInt(index) % 2 === 0
                        ? theme.colors.primary
                        : theme.colors.primary
                      : "#fafafa",
                  },
                ]}
                onPress={() => {
                  setSelectedLetter(item);
                  closeDropdown();
                }}
              >
                <Text
                  style={[
                    styles.gridItemText,
                    {
                      color: theme.dark === true ? theme.colors.text : "gray",
                    },
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            )}
            numColumns={5}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.gridContainer}
          />
          <Pressable
            style={[
              styles.allLettersOption,
              {
                backgroundColor: theme.colors.background,
                elevation: 5,
              },
            ]}
            onPress={() => {
              setSelectedLetter("All Letters");
              closeDropdown();
            }}
          >
            <Text
              style={[
                styles.gridBtnText,
                {
                  color: "white",
                },
              ]}
            >
              All Letters
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

export default LetterModal;