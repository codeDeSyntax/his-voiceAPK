import React, { useCallback } from "react";
import { Pressable, StyleSheet, Vibration, View } from "react-native";
import { useRouter } from "expo-router";
import {
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { styles } from "../styles/reader";
import type { BottomSheetControllerProps, ReaderToolbarButtonProps } from "../types";

const ToolbarButton = ({
  label,
  onPress,
  theme,
  children,
}: ReaderToolbarButtonProps) => {
  const handlePress = useCallback(() => {
    Vibration.vibrate(10);
    onPress();
  }, [onPress]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={handlePress}
      style={({ pressed }) => [
        localStyles.button,
        {
          backgroundColor: pressed
            ? `${theme.colors.text}14`
            : theme.colors.secondary,
        },
      ]}
    >
      {children}
    </Pressable>
  );
};

const BottomSheetController = React.memo(
  ({
    theme,
    onOpenSearch,
    onScrollToPrev,
    onScrollToNext,
    onBookmarkPress,
    onHighlightPress,
    isVisible = true,
  }: BottomSheetControllerProps) => {
    const router = useRouter();

    const handleBack = useCallback(() => {
      if (router.canGoBack()) router.back();
      else router.navigate("/sermons");
    }, [router]);

    if (!isVisible) return null;

    const ink = theme.colors.text;
    const muted = `${ink}A6`;
    const separatorStyle = [
      localStyles.separator,
      { backgroundColor: `${ink}1A` },
    ];

    return (
      <View
        style={[
          styles.bottomToolbar,
          {
            backgroundColor: theme.colors.primary,
            borderColor: `${ink}1A`,
          },
        ]}
      >
        <ToolbarButton label="Back to sermons" onPress={handleBack} theme={theme}>
          <MaterialCommunityIcons name="backburger" size={23} color={ink} />
        </ToolbarButton>
        <View style={separatorStyle} />
        <ToolbarButton
          label="Previous paragraph"
          onPress={onScrollToPrev}
          theme={theme}
        >
          <FontAwesome name="hand-o-up" size={22} color={muted} />
        </ToolbarButton>
        <ToolbarButton
          label="Next paragraph"
          onPress={onScrollToNext}
          theme={theme}
        >
          <FontAwesome name="hand-o-down" size={22} color={muted} />
        </ToolbarButton>
        <View style={separatorStyle} />
        <ToolbarButton
          label="Bookmark a paragraph"
          onPress={onBookmarkPress}
          theme={theme}
        >
          <Ionicons name="bookmarks" size={21} color={ink} />
        </ToolbarButton>
        <ToolbarButton
          label="Highlight a paragraph"
          onPress={onHighlightPress}
          theme={theme}
        >
          <FontAwesome5 name="highlighter" size={21} color={ink} />
        </ToolbarButton>
        <View style={separatorStyle} />
        <ToolbarButton label="Search this sermon" onPress={onOpenSearch} theme={theme}>
          <FontAwesome5 name="search-location" size={21} color={ink} />
        </ToolbarButton>
      </View>
    );
  },
);

BottomSheetController.displayName = "BottomSheetController";

const localStyles = StyleSheet.create({
  button: {
    flex: 1,
    minWidth: 44,
    height: 44,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  separator: {
    width: StyleSheet.hairlineWidth,
    height: 18,
    marginHorizontal: 1,
  },
});

export default BottomSheetController;
