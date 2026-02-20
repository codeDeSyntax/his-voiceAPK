import React, { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import ActionToolbar from "./ActionToolbar";
import { styles } from "../../styles/currentsermon";
import { useNavigation } from "@react-navigation/native";
import { responsiveFontSize } from "../../Utils/responsiveUtils";

/**
 * CustomTopCardController — sleek bottom pill toolbar for the reading screen.
 *
 * Layout (left → right):
 *   [← back]  |  [↑ prev]  [title/toggle]  [↓ next]  |  [🔍 search]
 *
 * Tapping the centre title area toggles the expanded ActionToolbar card above.
 */
const CustomTopCardController = ({
  theme,
  onOpenSearch,
  onScrollToPrev,
  onScrollToNext,
  sermonTitle,
}) => {
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const navigation = useNavigation();

  const isDark = theme.dark;
  const accentColor = isDark ? theme.colors.hlight : "#5d3211";
  const pillBg = isDark
    ? "rgba(38, 30, 26, 0.96)"
    : "rgba(250, 238, 209, 0.97)";
  const pillBorder = isDark
    ? "rgba(242, 205, 180, 0.14)"
    : "rgba(93, 50, 17, 0.14)";
  const iconColor = isDark ? theme.colors.hlight : "#5d3211";
  const iconColorMuted = isDark
    ? "rgba(242, 205, 180, 0.55)"
    : "rgba(93, 50, 17, 0.5)";
  const dividerColor = isDark
    ? "rgba(242, 205, 180, 0.18)"
    : "rgba(93, 50, 17, 0.15)";

  const handleToggle = () => setIsToolbarVisible((v) => !v);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("AllSermons");
    }
  };

  const handlePrev = () => {
    onScrollToPrev?.();
    setIsToolbarVisible(false);
  };

  const handleNext = () => {
    onScrollToNext?.();
    setIsToolbarVisible(false);
  };

  const handleSearch = () => {
    onOpenSearch?.();
    setIsToolbarVisible(false);
  };

  return (
    <>
      {/* ── Expanded action card (above pill) ── */}
      <ActionToolbar
        theme={theme}
        isVisible={isToolbarVisible}
        onClose={() => setIsToolbarVisible(false)}
        onOpenSearch={handleSearch}
        onScrollToPrev={handlePrev}
        onScrollToNext={handleNext}
        sermonTitle={sermonTitle}
      />

      {/* ── Bottom pill toolbar ── */}
      <View
        style={[
          styles.bottomToolbar,
          {
            backgroundColor: pillBg,
            borderColor: pillBorder,
          },
        ]}
      >
        {/* Back button */}
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="arrow-back"
            size={responsiveFontSize(20)}
            color={iconColor}
          />
        </TouchableOpacity>

        {/* Divider */}
        <View style={[styles.toolbarDivider, { backgroundColor: dividerColor }]} />

        {/* Prev paragraph */}
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={handlePrev}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="keyboard-arrow-up"
            size={responsiveFontSize(22)}
            color={iconColorMuted}
          />
        </TouchableOpacity>

        {/* Centre: sermon title / toggle */}
        <TouchableOpacity
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 4,
          }}
          onPress={handleToggle}
          activeOpacity={0.75}
        >
          {isToolbarVisible ? (
            <MaterialIcons
              name="close"
              size={responsiveFontSize(18)}
              color={accentColor}
            />
          ) : (
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                fontSize: responsiveFontSize(11),
                fontFamily: "ZillaSlab",
                color: accentColor,
                opacity: 0.75,
                letterSpacing: 0.4,
                textAlign: "center",
              }}
            >
              {sermonTitle || "···"}
            </Text>
          )}
        </TouchableOpacity>

        {/* Next paragraph */}
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={handleNext}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="keyboard-arrow-down"
            size={responsiveFontSize(22)}
            color={iconColorMuted}
          />
        </TouchableOpacity>

        {/* Divider */}
        <View style={[styles.toolbarDivider, { backgroundColor: dividerColor }]} />

        {/* Search */}
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={handleSearch}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="search"
            size={responsiveFontSize(20)}
            color={iconColor}
          />
        </TouchableOpacity>
      </View>
    </>
  );
};

export default CustomTopCardController;
