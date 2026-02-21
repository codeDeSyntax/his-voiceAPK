import React from "react";
import { View, Text, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { responsiveFontSize } from "../../Utils/responsiveUtils";
import { styles } from "../../styles/currentsermon";

/**
 * ActionToolbar — expanded card that appears above the bottom pill toolbar.
 * Shows sermon title and quick navigation actions.
 */
const ActionToolbar = ({
  theme,
  isVisible,
  onClose,
  onOpenSearch,
  onScrollToPrev,
  onScrollToNext,
  sermonTitle,
}) => {
  if (!isVisible) return null;

  const isDark = theme.dark;
  const accentColor = isDark ? "#f6ceb0" : "#5d3211";
  const cardBg = isDark
    ? "rgba(38, 30, 26, 0.97)"
    : "rgba(250, 238, 209, 0.98)";
  const borderColor = isDark
    ? "rgba(242, 205, 180, 0.12)"
    : "rgba(93, 50, 17, 0.12)";
  const itemBg = isDark
    ? "rgba(242, 205, 180, 0.08)"
    : "rgba(93, 50, 17, 0.06)";
  const itemBorder = isDark
    ? "rgba(242, 205, 180, 0.1)"
    : "rgba(93, 50, 17, 0.1)";

  const ActionItem = ({ icon, label, onPress, isPrimary = false }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionToolbarItem,
        {
          backgroundColor: pressed
            ? isDark
              ? "rgba(242, 205, 180, 0.15)"
              : "rgba(93, 50, 17, 0.12)"
            : isPrimary
              ? accentColor + "18"
              : itemBg,
          borderColor: isPrimary ? accentColor + "40" : itemBorder,
        },
      ]}
      android_ripple={{
        color: isDark ? "rgba(255,255,255,0.12)" : "rgba(93,50,17,0.1)",
        borderless: false,
      }}
    >
      <MaterialIcons
        name={icon}
        size={responsiveFontSize(20)}
        color={isPrimary ? accentColor : theme.colors.text}
        style={{ opacity: isPrimary ? 1 : 0.75 }}
      />
      <Text
        style={[
          styles.actionToolbarItemLabel,
          {
            color: isPrimary ? accentColor : theme.colors.text,
            opacity: isPrimary ? 0.9 : 0.6,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View
      style={[
        styles.actionToolbarExpanded,
        {
          backgroundColor: cardBg,
          borderColor: borderColor,
        },
      ]}
    >
      {/* Sermon title */}
      {sermonTitle ? (
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          style={[
            styles.actionToolbarTitle,
            { color: accentColor },
          ]}
        >
          {sermonTitle.toUpperCase()}
        </Text>
      ) : null}

      {/* Action buttons row */}
      <View style={styles.actionToolbarRow}>
        <ActionItem
          icon="search"
          label="Search"
          onPress={onClose ? () => { onClose(); onOpenSearch?.(); } : onOpenSearch}
          isPrimary
        />
        <ActionItem
          icon="keyboard-arrow-up"
          label="Prev"
          onPress={onScrollToPrev}
        />
        <ActionItem
          icon="keyboard-arrow-down"
          label="Next"
          onPress={onScrollToNext}
        />
      </View>
    </View>
  );
};

export default ActionToolbar;
