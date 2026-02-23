import React, { useCallback } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles/currentsermon";
import { useNavigation } from "@react-navigation/native";
import { responsiveFontSize } from "../../Utils/responsiveUtils";

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

  // -- Colours - derived once per render (theme rarely changes) ---------------
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
  const clusterBg = isDark ? "rgba(242,205,180,0.07)" : "rgba(93,50,17,0.055)";
  const clusterBorder = isDark
    ? "rgba(242,205,180,0.12)"
    : "rgba(93,50,17,0.11)";

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

  // -- Shared button hit-slop -------------------------------------------------
  const hitSlop = { top: 8, bottom: 8, left: 4, right: 4 };

  return (
    <View
      style={[
        styles.bottomToolbar,
        { backgroundColor: pillBg, borderColor: pillBorder },
      ]}
    >
      {/* Back */}
      <TouchableOpacity
        style={p.btn}
        onPress={handleBack}
        activeOpacity={0.65}
        hitSlop={hitSlop}
      >
        <MaterialIcons
          name="arrow-back"
          size={responsiveFontSize(20)}
          color={iconPrimary}
        />
      </TouchableOpacity>

      <View style={[p.divider, { backgroundColor: dividerColor }]} />

      {/* Prev paragraph */}
      <TouchableOpacity
        style={p.btn}
        onPress={handlePrev}
        activeOpacity={0.65}
        hitSlop={hitSlop}
      >
        <MaterialIcons
          name="keyboard-arrow-up"
          size={responsiveFontSize(22)}
          color={iconMuted}
        />
      </TouchableOpacity>

      {/* Next paragraph */}
      <TouchableOpacity
        style={p.btn}
        onPress={handleNext}
        activeOpacity={0.65}
        hitSlop={hitSlop}
      >
        <MaterialIcons
          name="keyboard-arrow-down"
          size={responsiveFontSize(22)}
          color={iconMuted}
        />
      </TouchableOpacity>

      <View style={[p.divider, { backgroundColor: dividerColor }]} />

      {/* -- Bookmark + Highlight cluster -- */}
      <View
        style={[
          p.cluster,
          { backgroundColor: clusterBg, borderColor: clusterBorder },
        ]}
      >
        <TouchableOpacity
          style={p.clusterBtn}
          onPress={handleBookmark}
          activeOpacity={0.6}
          hitSlop={hitSlop}
        >
          <Ionicons
            name="bookmark-outline"
            size={responsiveFontSize(17)}
            color={iconPrimary}
          />
        </TouchableOpacity>

        <View style={[p.clusterDivider, { backgroundColor: clusterBorder }]} />

        <TouchableOpacity
          style={p.clusterBtn}
          onPress={handleHighlight}
          activeOpacity={0.6}
          hitSlop={hitSlop}
        >
          <Ionicons
            name="color-palette-outline"
            size={responsiveFontSize(17)}
            color={iconPrimary}
          />
        </TouchableOpacity>
      </View>

      <View style={[p.divider, { backgroundColor: dividerColor }]} />

      {/* Search */}
      <TouchableOpacity
        style={p.btn}
        onPress={handleSearch}
        activeOpacity={0.65}
        hitSlop={hitSlop}
      >
        <MaterialIcons
          name="search"
          size={responsiveFontSize(20)}
          color={iconPrimary}
        />
      </TouchableOpacity>
    </View>
  );
};

// -- Pill-local stylesheet (no theme values - those are applied inline) --------
const p = StyleSheet.create({
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    width: StyleSheet.hairlineWidth * 2,
    height: 22,
    borderRadius: 1,
  },
  cluster: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginHorizontal: 2,
  },
  clusterBtn: {
    width: 40,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  clusterDivider: {
    width: StyleSheet.hairlineWidth,
    height: 18,
  },
});

export default CustomTopCardController;
