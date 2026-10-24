import React, { useState, useCallback, useRef, useEffect } from "react";
import { View, TextInput, TouchableOpacity, Animated } from "react-native";
import { AntDesign, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import type { SearchHeaderProps } from "../types";

const DEBOUNCE_MS = 350;

const SearchHeader = React.memo(({ theme, onSearchChange, onOpenViewOptions, hasActiveViewOptions, viewOptionsVisible, viewOptionsSummary }: SearchHeaderProps) => {
  const [value, setValue] = useState("");
  const focusAnim = useState(() => new Animated.Value(0))[0];
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleFocus = useCallback(() => {
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [focusAnim]);

  const handleBlur = useCallback(() => {
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [focusAnim]);

  const handleChange = useCallback(
    (text: string) => {
      setValue(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearchChange(text);
      }, DEBOUNCE_MS);
    },
    [onSearchChange],
  );

  const handleClear = useCallback(() => {
    setValue("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSearchChange("");
  }, [onSearchChange]);

  const animatedBg = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      theme.dark ? "rgba(255,255,255,0.085)" : "rgba(93,50,17,0.070)",
      theme.dark ? "rgba(242,205,180,0.105)" : "rgba(93,50,17,0.090)",
    ],
  });

  const iconColor = theme.dark
    ? value
      ? "rgba(242,205,180,0.80)"
      : "rgba(255,255,255,0.42)"
    : value
      ? "#5d3211"
      : "rgba(93,50,17,0.48)";

  return (
    <View
      style={{
        paddingHorizontal: 18,
        paddingTop: 3,
        paddingBottom: 8,
        backgroundColor: theme.colors.background,
      }}
    >
      <Animated.View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: animatedBg,
          borderRadius: 13,
          paddingHorizontal: 12,
          paddingRight: 4,
          minHeight: 44,
        }}
      >
        <MaterialCommunityIcons
          name="magnify"
          size={21}
          color={iconColor}
          style={{ marginRight: 5 }}
        />

        <TextInput
          style={{
            flex: 1,
            minWidth: 0,
            paddingHorizontal: 6,
            fontSize: 14,
            minHeight: 44,
            color: theme.dark ? theme.colors.text : "#1a0e07",
            fontFamily: "ZillaSlab",
          }}
          accessibilityLabel="Search sermons by title, date, or year"
          placeholder="Search title, date, or year"
          value={value}
          onChangeText={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={
            theme.dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)"
          }
          selectionColor={theme.dark ? theme.colors.text : "#5d3211"}
          spellCheck={false}
          autoCorrect={false}
          returnKeyType="search"
          keyboardAppearance={theme.dark ? "dark" : "light"}
        />

        {value.length > 0 && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={handleClear}
            style={{
              height: 44,
              width: 44,
              borderRadius: 12,
              justifyContent: "center",
              alignItems: "center",
            }}
            activeOpacity={0.7}
          >
            <AntDesign
              name="close"
              size={12}
              color={
                theme.dark ? "rgba(242,205,180,0.72)" : "rgba(40,20,10,0.58)"
              }
            />
          </TouchableOpacity>
        )}
        <View style={{
          height: 18,
          width: 1,
          marginLeft: 3,
          backgroundColor: theme.dark ? "rgba(242,205,180,0.15)" : "rgba(93,50,17,0.15)",
        }} />
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Filter and sort sermons"
          accessibilityValue={{ text: viewOptionsSummary }}
          accessibilityState={{ expanded: viewOptionsVisible }}
          onPress={onOpenViewOptions}
          activeOpacity={0.6}
          style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons
            name="options-outline"
            size={22}
            color={theme.dark ? "#efb78f" : "#633b23"}
          />
          {hasActiveViewOptions && (
            <View style={{
              position: "absolute",
              top: 8,
              right: 7,
              width: 5,
              height: 5,
              borderRadius: 3,
              backgroundColor: theme.dark ? "#efb78f" : "#995323",
            }} />
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
});
SearchHeader.displayName = "SearchHeader";

export default SearchHeader;
