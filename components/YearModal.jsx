import React from "react";
import { View, Text, Modal, Pressable, FlatList } from "react-native";
import { styles } from "../styles/Allsermons";

const YearModal = ({
  theme,
  isVisible,
  closeDropdown,
  years,
  setSelectedYear,
}) => {
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
                backgroundColor: theme.colors.background,
              },
            ]}
            onPress={() => {
              setSelectedYear("All Years");
              closeDropdown();
            }}
            android_ripple={{
              color: theme.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
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
              All Years
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

export default YearModal;
