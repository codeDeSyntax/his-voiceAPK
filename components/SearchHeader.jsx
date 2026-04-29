import React, { useState, useCallback, useRef, useEffect } from "react";
import { View, TextInput, TouchableOpacity, Animated } from "react-native";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";

const DEBOUNCE_MS = 350;

const SearchHeader = React.memo(({ theme, onSearchChange }) => {
  const [value, setValue] = useState("");
  const focusAnim = useRef(new Animated.Value(0)).current;
  const debounceRef = useRef(null);

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
    (text) => {
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
        paddingTop: 5,
        paddingBottom: 7,
        backgroundColor: theme.colors.background,
      }}
    >
      <Animated.View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: animatedBg,
          borderRadius: 100,
          paddingHorizontal: 15,
          height: 46,
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
            paddingHorizontal: 6,
            fontSize: 14.5,
            height: 44,
            color: theme.dark ? theme.colors.text : "#1a0e07",
            fontFamily: "Merriweather",
          }}
          placeholder="Search sermons..."
          value={value}
          onChangeText={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={
            theme.dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)"
          }
          selectionColor={theme.dark ? theme.colors.text : "#5d3211"}
          spellCheck={false}
          autoCorrect={true}
          keyboardAppearance={theme.dark ? "dark" : "light"}
        />

        {value.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            style={{
              height: 24,
              width: 24,
              borderRadius: 12,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: theme.dark
                ? "rgba(242,205,180,0.12)"
                : "rgba(93,50,17,0.11)",
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
      </Animated.View>
    </View>
  );
});

export default SearchHeader;
