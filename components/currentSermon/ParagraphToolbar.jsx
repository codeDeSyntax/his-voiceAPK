import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { responsiveFontSize } from "../../Utils/responsiveUtils";
import HighlightColorPalette from "./HighlightColorPalette";

const ParagraphToolbar = ({
  visible,
  selectedParagraphIndex,
  isBookmarked,
  currentHighlight,
  onBookmarkPress,
  onHighlightPress,
  onColorSelect,
  showColorPalette,
  onClose,
  theme,
}) => {
  if (!visible) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.dark
            ? "rgba(44, 36, 32, 0.95)"
            : "rgba(245, 230, 195, 0.98)",
          borderColor: theme.dark
            ? "rgba(242, 205, 180, 0.1)"
            : "rgba(93, 50, 17, 0.12)",
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.labelContainer}>
          <View
            style={[
              styles.labelDot,
              {
                backgroundColor: theme.dark ? theme.colors.hlight : "#d57a3e",
              },
            ]}
          />
          <Text
            style={[
              styles.paragraphLabel,
              {
                color: theme.dark
                  ? "rgba(242, 205, 180, 0.85)"
                  : "rgba(93, 50, 17, 0.8)",
              },
            ]}
          >
            Paragraph {selectedParagraphIndex + 1}
          </Text>
        </View>

        <View style={styles.actions}>
          {/* Bookmark Button */}
          <TouchableOpacity
            onPress={onBookmarkPress}
            style={[
              styles.button,
              {
                backgroundColor: isBookmarked
                  ? theme.dark
                    ? "rgba(213, 122, 62, 0.25)"
                    : "rgba(213, 122, 62, 0.15)"
                  : theme.dark
                    ? "rgba(242, 205, 180, 0.08)"
                    : "rgba(93, 50, 17, 0.08)",
              },
            ]}
            activeOpacity={0.6}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={responsiveFontSize(18)}
              color={
                isBookmarked
                  ? theme.dark
                    ? theme.colors.hlight
                    : "#d57a3e"
                  : theme.dark
                    ? "rgba(242, 205, 180, 0.6)"
                    : "rgba(93, 50, 17, 0.5)"
              }
            />
          </TouchableOpacity>

          {/* Highlight Button */}
          <TouchableOpacity
            onPress={onHighlightPress}
            style={[
              styles.button,
              {
                backgroundColor: currentHighlight
                  ? theme.dark
                    ? "rgba(213, 122, 62, 0.25)"
                    : "rgba(213, 122, 62, 0.15)"
                  : theme.dark
                    ? "rgba(242, 205, 180, 0.08)"
                    : "rgba(93, 50, 17, 0.08)",
              },
            ]}
            activeOpacity={0.6}
          >
            <Ionicons
              name={
                currentHighlight ? "color-palette" : "color-palette-outline"
              }
              size={responsiveFontSize(18)}
              color={
                currentHighlight
                  ? theme.dark
                    ? theme.colors.hlight
                    : "#d57a3e"
                  : theme.dark
                    ? "rgba(242, 205, 180, 0.6)"
                    : "rgba(93, 50, 17, 0.5)"
              }
            />
          </TouchableOpacity>

          {/* Divider */}
          <View
            style={[
              styles.divider,
              {
                backgroundColor: theme.dark
                  ? "rgba(242, 205, 180, 0.15)"
                  : "rgba(93, 50, 17, 0.1)",
              },
            ]}
          />

          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.button,
              {
                backgroundColor: "transparent",
              },
            ]}
            activeOpacity={0.6}
          >
            <Ionicons
              name="close"
              size={responsiveFontSize(16)}
              color={
                theme.dark
                  ? "rgba(242, 205, 180, 0.5)"
                  : "rgba(93, 50, 17, 0.4)"
              }
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Color Palette Dropdown */}
      {showColorPalette && (
        <View style={styles.paletteWrapper}>
          <HighlightColorPalette
            isVisible={showColorPalette}
            onColorSelect={onColorSelect}
            onClose={onHighlightPress}
            theme={theme}
            currentColor={currentHighlight}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 12,
    left: 16,
    right: 16,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 1000,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  labelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  paragraphLabel: {
    fontSize: responsiveFontSize(13),
    fontFamily: "ZillaSlab",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    width: 1,
    height: 20,
    marginHorizontal: 4,
  },
  paletteWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 4,
  },
});

export default ParagraphToolbar;
