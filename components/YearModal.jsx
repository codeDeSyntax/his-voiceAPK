import React from "react";
import { View, Text, Modal, Pressable, FlatList } from "react-native";
import { styles } from "../styles/Allsermons";

const YearModal = ({ theme, isVisible, closeDropdown, years, setSelectedYear }) => {
  return (
    <Modal
      transparent={true}
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
            data={years}
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
                  setSelectedYear(item);
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
            numColumns={4}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.gridContainer}
          />
          <Pressable
            style={[
              styles.allYearsOption,
              {
                backgroundColor: theme.colors.primary,
              },
            ]}
            onPress={() => {
              setSelectedYear("All Years");
              closeDropdown();
            }}
          >
            <Text
              style={[
                styles.gridBtnText,
                {
                  color: theme.dark === true ? theme.colors.text : "gray",
                },
              ]}
            >
              All Years
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

export default YearModal;