import React from "react";
import { View, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { responsiveFontSize, spacing } from "../../Utils/responsiveUtils";

const HighlightColorPalette = ({
  isVisible,
  onColorSelect,
  onClose,
  theme,
  currentColor,
}) => {
  // Define highlight colors that work well for text highlighting in both light and dark themes
  const highlightColors = [
    { name: "yellow", light: "#F59E0B", dark: "#FCD34D" }, // Amber for text
    { name: "green", light: "#059669", dark: "#34D399" }, // Emerald for text
    { name: "brown", light: "#8B4513", dark: "#D2B48C" }, // Brown for text (matches theme)
    { name: "purple", light: "#7C3AED", dark: "#C084FC" }, // Violet for text
    { name: "pink", light: "#DB2777", dark: "#F472B6" }, // Pink for text
    { name: "orange", light: "#EA580C", dark: "#FB923C" }, // Orange for text
  ];

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.text + "20",
        },
      ]}
    >
      <View style={styles.colorGrid}>
        {highlightColors.map((color) => {
          const backgroundColor = theme.dark ? color.dark : color.light;
          const isSelected = currentColor === color.name;

          return (
            <TouchableOpacity
              key={color.name}
              style={[
                styles.colorOption,
                {
                  backgroundColor,
                  borderColor: isSelected
                    ? theme.colors.text
                    : "rgba(0,0,0,0.2)",
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => onColorSelect(color.name)}
            >
              {isSelected && (
                <Ionicons
                  name="checkmark"
                  size={responsiveFontSize(16)}
                  color={theme.colors.text}
                />
              )}
            </TouchableOpacity>
          );
        })}

        {/* Remove highlight option */}
        <TouchableOpacity
          style={[
            styles.colorOption,
            styles.removeOption,
            {
              borderColor: theme.colors.text + "40",
              backgroundColor: "transparent",
            },
          ]}
          onPress={() => onColorSelect(null)}
        >
          <Ionicons
            name="close"
            size={responsiveFontSize(16)}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: -10,
    left: 0,
    // right: 4,
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  colorGrid: {
    flexDirection: "row",
    // flexWrap: "wrap",
    // width: 160,
    justifyContent: "flex-start",
  },
  colorOption: {
    width: 32,
    height: 32,
    minWidth: 32,
    minHeight: 32,
    borderRadius: 16,
    margin: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  removeOption: {
    borderWidth: 1,
    borderStyle: "dashed",
  },
});

export default HighlightColorPalette;
