import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const NumberOfColumnsSelector = ({
  theme,
  numberOfColumns,
  setNumberOfColumns,
  accentColor,
}) => {
  const columnOptions = [1, 2];

  return (
    <View
      style={[
        styles.settingContainer,
        { backgroundColor: theme.colors.secondary },
      ]}
    >
      <View style={styles.settingHeader}>
        <MaterialIcons name="view-column" size={22} color={accentColor} />
        <Text
          style={[
            styles.settingTitle,
            { color: theme.colors.text, fontFamily: "serif" },
          ]}
        >
          Number of Columns
        </Text>
      </View>

      <Text
        style={[
          styles.settingDescription,
          { color: theme.dark ? "#BBBBBB" : "#666666",fontFamily:"serif" },
        ]}
      >
        Choose how many columns to display in the grid view
      </Text>

      <View style={styles.columnSelector}>
        {columnOptions.map((number) => (
          <TouchableOpacity
            key={number}
            style={[
              styles.columnOption,
              {
                backgroundColor:
                  numberOfColumns === number
                    ? accentColor
                    : theme.dark
                    ? "#333333"
                    : "#E0E0E0",
                borderColor:
                  numberOfColumns === number ? accentColor : "transparent",
                // pointerEvents: number >= 3 && "none",
              },
            ]}
            onPress={() => setNumberOfColumns(number)}
          >
            <Text
              style={[
                styles.columnText,
                {
                  color:
                    numberOfColumns === number
                      ? "#FFFFFF"
                      : theme.dark
                      ? "#FFFFFF"
                      : "#333333",
                },
              ]}
            >
              {number}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  settingContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 24,
    shadowColor: "#000",
    padding: 16,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  settingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginLeft: 12,
  },
  settingDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  columnSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  columnOption: {
    width: 60,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 2,
  },
  columnText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily:"serif"
  },
  previewContainer: {
    marginTop: 8,
  },
  previewLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily:"serif"
  },
  preview: {
    height: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    borderRadius: 8,
    overflow: "hidden",
  },
  previewColumn: {
    height: "100%",
    borderRadius: 4,
  },
});

export default NumberOfColumnsSelector;
