import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

const SearchHeader = ({ theme, searchText, setSearchText }) => {
  const [focused, setFocused] = React.useState(false);

  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: theme.colors.background,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.dark
            ? focused
              ? "rgba(242, 205, 180, 0.08)"
              : "rgba(80, 61, 49, 0.35)"
            : focused
              ? "rgba(93, 50, 17, 0.07)"
              : "rgba(93, 50, 17, 0.04)",
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: focused
            ? theme.dark
              ? "rgba(242, 205, 180, 0.35)"
              : "rgba(93, 50, 17, 0.35)"
            : theme.dark
              ? "rgba(242, 205, 180, 0.1)"
              : "rgba(93, 50, 17, 0.08)",
          paddingHorizontal: 14,
          height: 48,
          shadowColor: focused
            ? theme.dark
              ? "rgba(242, 205, 180, 0.3)"
              : "#5d3211"
            : "transparent",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: focused ? 0.12 : 0,
          shadowRadius: 8,
          elevation: focused ? 2 : 0,
        }}
      >
        <Feather
          name="search"
          size={17}
          color={
            focused
              ? theme.dark
                ? "rgba(242, 205, 180, 0.8)"
                : "rgba(93, 50, 17, 0.8)"
              : theme.dark
                ? "rgba(255, 255, 255, 0.4)"
                : "rgba(93, 50, 17, 0.4)"
          }
          style={{ marginRight: 10 }}
        />

        <TextInput
          style={{
            flex: 1,
            color: theme.dark ? theme.colors.text : "#5d3211",
            fontFamily: "Merriweather",
            fontSize: 14.5,
            paddingVertical: 0,
          }}
          placeholder="Search sermons..."
          value={searchText}
          onChangeText={setSearchText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={
            theme.dark ? "rgba(255, 255, 255, 0.35)" : "rgba(93, 50, 17, 0.4)"
          }
          selectionColor={theme.dark ? "rgba(242, 205, 180, 0.6)" : "#5d3211"}
          spellCheck={false}
          autoCorrect={false}
          keyboardAppearance={theme.dark ? "dark" : "light"}
        />

        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchText("")}
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: theme.dark
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(93, 50, 17, 0.1)",
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.7}
          >
            <Feather
              name="x"
              size={13}
              color={
                theme.dark
                  ? "rgba(255, 255, 255, 0.6)"
                  : "rgba(93, 50, 17, 0.6)"
              }
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SearchHeader;
