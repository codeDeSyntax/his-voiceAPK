import React, { useMemo } from "react";
import { View, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { responsiveFontSize, spacing } from "../../Utils/responsiveUtils";

// Pre-defined colors for better performance - moved outside component
const HIGHLIGHT_COLORS = [
  { name: "yellow", light: "#F59E0B", dark: "#FCD34D" },
  { name: "green", light: "#059669", dark: "#34D399" },
  { name: "brown", light: "#8B4513", dark: "#D2B48C" },
  { name: "purple", light: "#7C3AED", dark: "#C084FC" },
  { name: "pink", light: "#DB2777", dark: "#F472B6" },
  { name: "orange", light: "#EA580C", dark: "#FB923C" },
];

const HighlightColorPalette = React.memo(
  ({ isVisible, onColorSelect, onClose, theme, currentColor }) => {
    // Memoized container style for performance
    const containerStyle = useMemo(
      () => [
        styles.container,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.text + "20",
        },
      ],
      [theme.colors.background, theme.colors.text]
    );

    // Memoized color options for better performance
    const colorOptions = useMemo(
      () =>
        HIGHLIGHT_COLORS.map((color) => {
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
              activeOpacity={0.7}
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
        }),
      [theme.dark, theme.colors.text, currentColor, onColorSelect]
    );

    // Memoized remove option
    const removeOption = useMemo(
      () => (
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
          activeOpacity={0.7}
        >
          <Ionicons
            name="close"
            size={responsiveFontSize(16)}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      ),
      [theme.colors.text, onColorSelect]
    );

    if (!isVisible) return null;

    return (
      <Animated.View style={containerStyle}>
        <View style={styles.colorGrid}>
          {colorOptions}
          {removeOption}
        </View>
      </Animated.View>
    );
  }
);

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
