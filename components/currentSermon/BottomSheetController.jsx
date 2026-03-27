import React, { useCallback } from "react";
import { View, StyleSheet, Pressable, Vibration } from "react-native";
import {
  MaterialIcons,
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  FontAwesome,
} from "@expo/vector-icons";
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

  // -- Colours ----------------------------------------------------------------
  const pillBg = isDark
    ? "rgba(28, 22, 18, 0.97)"
    : "rgba(252, 242, 220, 0.98)";
  const pillBorder = isDark
    ? "rgba(242, 205, 180, 0.13)"
    : "rgba(93, 50, 17, 0.13)";
  const iconPrimary = isDark ? "#fbc1a2" : "#5d3211";
  const iconMuted = isDark ? "rgba(242,205,180,0.5)" : "rgba(93,50,17,0.45)";
  const dividerColor = isDark
    ? "rgba(242,205,180,0.15)"
    : "rgba(93,50,17,0.12)";

  const buttonBg = isDark ? "rgba(242,205,180,0.1)" : "rgba(93,50,17,0.08)";

  const triggerPressVibration = useCallback(() => {
    // Short, subtle feedback that feels like a tap confirm.
    Vibration.vibrate(10);
  }, []);

  const renderActionButton = ({
    onPress,
    icon,
    iconSet = "material",
    size = 0,
    iconSize = 30,
    color,
  }) => (
    <Pressable
      onPress={() => {
        triggerPressVibration();
        onPress?.();
      }}
      style={({ pressed }) => [
        p.iconButton,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: dividerColor,
          backgroundColor: pressed
            ? isDark
              ? "rgba(242,205,180,0.2)"
              : "rgba(93,50,17,0.14)"
            : buttonBg,
        },
      ]}
      android_ripple={{
        color: isDark ? "rgba(255,255,255,0.14)" : "rgba(93,50,17,0.12)",
        borderless: false,
      }}
    >
      {iconSet === "material" ? (
        <MaterialIcons
          name={icon}
          size={responsiveFontSize(iconSize)}
          color={color}
        />
      ) : iconSet === "ion" ? (
        <Ionicons
          name={icon}
          size={responsiveFontSize(iconSize)}
          color={color}
        />
      ) : iconSet === "fa5" ? (
        <FontAwesome5
          name={icon}
          size={responsiveFontSize(iconSize)}
          color={color}
        />
      ) : iconSet === "fa" ? (
        <FontAwesome
          name={icon}
          size={responsiveFontSize(iconSize)}
          color={color}
        />
      ) : (
        <MaterialCommunityIcons
          name={icon}
          size={responsiveFontSize(iconSize)}
          color={color}
        />
      )}
    </Pressable>
  );

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
      {renderActionButton({
        onPress: handleBack,
        icon: "backburger",
        iconSet: "mc",
        size: 40,
        iconSize: 24,
        color: iconPrimary,
      })}

      <View style={[p.divider, { backgroundColor: dividerColor }]} />

      {/* Prev paragraph */}
      {renderActionButton({
        onPress: handlePrev,
        icon: "hand-o-up",
        iconSet: "fa",
        size: 38,
        iconSize: 24,
        color: iconMuted,
      })}

      {/* Next paragraph */}
      {renderActionButton({
        onPress: handleNext,
        icon: "hand-o-down",
        iconSet: "fa",
        size: 38,
        iconSize: 24,
        color: iconMuted,
      })}

      <View style={[p.divider, { backgroundColor: dividerColor }]} />

      {/* Bookmark */}
      {renderActionButton({
        onPress: handleBookmark,
        icon: "bookmarks",
        iconSet: "ion",
        size: 38,
        iconSize: 24,
        color: iconPrimary,
      })}

      {/* Highlight */}
      {renderActionButton({
        onPress: handleHighlight,
        icon: "highlighter",
        iconSet: "fa5",
        size: 38,
        iconSize: 24,
        color: iconPrimary,
      })}

      <View style={[p.divider, { backgroundColor: dividerColor }]} />

      {/* Search */}
      {renderActionButton({
        onPress: handleSearch,
        icon: "search-location",
        iconSet: "fa5",
        size: 40,
        iconSize: 24,
        color: iconPrimary,
      })}
    </View>
  );
};

const p = StyleSheet.create({
  divider: {
    width: StyleSheet.hairlineWidth * 2,
    height: 22,
    borderRadius: 1,
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});

export default CustomTopCardController;
