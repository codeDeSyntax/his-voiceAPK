import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles/currentsermon";
import { useNavigation } from "@react-navigation/native";
import { responsiveFontSize } from "../../Utils/responsiveUtils";
import { GlassButton } from "../../styles/glassButton";

/**
 * CustomTopCardController - sleek bottom pill toolbar for the reading screen.
 *
 * Layout (left -> right):
 *   [<- back]  |  [^ prev]  [v next]  |  [bookmark | highlight]  |  [search]
 */
const CustomTopCardController = ({
  theme,
  onOpenSearch,
  onScrollToPrev,
  onScrollToNext,
  onBookmarkPress,
  onHighlightPress,
}) => {
  const navigation = useNavigation();

  const isDark = theme.dark;

  // -- Colours ----------------------------------------------------------------
  const pillBg = isDark
    ? "rgba(28, 22, 18, 0.97)"
    : "rgba(252, 242, 220, 0.98)";
  const pillBorder = isDark
    ? "rgba(242, 205, 180, 0.13)"
    : "rgba(93, 50, 17, 0.13)";
  const iconPrimary = isDark ? theme.colors.hlight : "#5d3211";
  const iconMuted = isDark ? "rgba(242,205,180,0.5)" : "rgba(93,50,17,0.45)";
  const dividerColor = isDark
    ? "rgba(242,205,180,0.15)"
    : "rgba(93,50,17,0.12)";

  // -- Stable handlers --------------------------------------------------------
  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate("AllSermons");
  }, [navigation]);

  const handlePrev = useCallback(() => {
    onScrollToPrev?.();
  }, [onScrollToPrev]);
  const handleNext = useCallback(() => {
    onScrollToNext?.();
  }, [onScrollToNext]);
  const handleSearch = useCallback(() => {
    onOpenSearch?.();
  }, [onOpenSearch]);
  const handleBookmark = useCallback(() => {
    onBookmarkPress?.();
  }, [onBookmarkPress]);
  const handleHighlight = useCallback(() => {
    onHighlightPress?.();
  }, [onHighlightPress]);

  return (
    <View
      style={[
        styles.bottomToolbar,
        { backgroundColor: pillBg, borderColor: pillBorder },
      ]}
    >
      {/* Back */}
      <GlassButton theme={theme} size={40} onPress={handleBack}>
        <MaterialIcons
          name="arrow-back"
          size={responsiveFontSize(20)}
          color={iconPrimary}
        />
      </GlassButton>

      <View style={[p.divider, { backgroundColor: dividerColor }]} />

      {/* Prev paragraph */}
      <GlassButton theme={theme} size={38} onPress={handlePrev}>
        <MaterialIcons
          name="keyboard-arrow-up"
          size={responsiveFontSize(22)}
          color={iconMuted}
        />
      </GlassButton>

      {/* Next paragraph */}
      <GlassButton theme={theme} size={38} onPress={handleNext}>
        <MaterialIcons
          name="keyboard-arrow-down"
          size={responsiveFontSize(22)}
          color={iconMuted}
        />
      </GlassButton>

      <View style={[p.divider, { backgroundColor: dividerColor }]} />

      {/* Bookmark */}
      <GlassButton theme={theme} size={38} onPress={handleBookmark}>
        <Ionicons
          name="bookmark-outline"
          size={responsiveFontSize(17)}
          color={iconPrimary}
        />
      </GlassButton>

      {/* Highlight */}
      <GlassButton theme={theme} size={38} onPress={handleHighlight}>
        <Ionicons
          name="color-palette-outline"
          size={responsiveFontSize(17)}
          color={iconPrimary}
        />
      </GlassButton>

      <View style={[p.divider, { backgroundColor: dividerColor }]} />

      {/* Search */}
      <GlassButton theme={theme} size={40} onPress={handleSearch}>
        <MaterialIcons
          name="search"
          size={responsiveFontSize(20)}
          color={iconPrimary}
        />
      </GlassButton>
    </View>
  );
};

const p = StyleSheet.create({
  divider: {
    width: StyleSheet.hairlineWidth * 2,
    height: 22,
    borderRadius: 1,
  },
});

export default CustomTopCardController;
