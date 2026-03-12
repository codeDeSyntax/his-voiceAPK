import React, { useState, useCallback, useRef, useEffect } from "react";
import { View, TextInput, TouchableOpacity, Animated } from "react-native";
import { Feather, AntDesign } from "@expo/vector-icons";

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
      theme.dark ? "rgba(255,255,255,0.07)" : "rgba(93,50,17,0.05)",
      theme.dark ? "rgba(255,255,255,0.11)" : "rgba(93,50,17,0.08)",
    ],
  });

  const animatedBorder = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      theme.dark ? "rgba(255,255,255,0.09)" : "rgba(93,50,17,0.18)",
      theme.dark ? "rgba(242,205,180,0.30)" : "rgba(93,50,17,0.35)",
    ],
  });

  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: theme.colors.background,
      }}
    >
      <Animated.View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: animatedBg,
          borderRadius: 100,
          borderWidth: 1,
          borderColor: animatedBorder,
          paddingHorizontal: 16,
          height: 48,
        }}
      >
        <Feather
          name="search"
          size={18}
          color={
            theme.dark ? "rgba(255,255,255,0.4)" : "rgba(93,50,17,0.45)"
          }
          style={{ marginRight: 6 }}
        />

        <TextInput
          style={{
            flex: 1,
            paddingHorizontal: 8,
            fontSize: 15,
            height: 48,
            color: theme.dark ? theme.colors.text : "#1a0e07",
            fontFamily: "ZillaSlab",
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
          autoCorrect={false}
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
              backgroundColor: "rgba(150,150,150,0.1)",
            }}
            activeOpacity={0.7}
          >
            <AntDesign
              name="close"
              size={14}
              color={
                theme.dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"
              }
            />
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
});

export default SearchHeader;
