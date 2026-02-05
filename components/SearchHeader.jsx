import React from "react";
// import {  TextInput, TouchableOpacity } from "react-native";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import { styles } from "../styles/Allsermons";
// import { MaterialIcons } from "@expo/vector-icons";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { styles } from "../styles/Allsermons";
import { MaterialIcons, Feather } from "@expo/vector-icons";

const SearchHeader = ({ theme, searchText, setSearchText }) => {
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: theme.colors.background,
      }}
    >
      <View
        style={[
          styles.searchInputContainer,
          {
            backgroundColor: theme.dark
              ? "rgba(80, 61, 49, 0.4)"
              : "rgba(93, 50, 17, 0.04)",
            borderColor: theme.dark
              ? "rgba(225, 179, 161, 0.2)"
              : "rgba(93, 50, 17, 0.1)",
            borderWidth: 1,
            borderRadius: 12,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
          },
        ]}
      >
        <Feather
          name="search"
          size={18}
          color={
            theme.dark ? "rgba(255, 255, 255, 0.6)" : "rgba(93, 50, 17, 0.5)"
          }
          style={{ marginRight: 12 }}
        />

        <TextInput
          style={[
            styles.searchInput,
            {
              flex: 1,
              color: theme.dark ? theme.colors.text : "#5d3211",
              fontFamily: "serif",
              fontSize: 16,
              paddingVertical: 12,
              borderWidth: 0,
            },
          ]}
          placeholder="Search sermons..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor={
            theme.dark ? "rgba(255, 255, 255, 0.5)" : "rgba(93, 50, 17, 0.5)"
          }
          selectionColor={theme.dark ? theme.colors.text : "#5d3211"}
          spellCheck={false}
          autoCorrect={false}
          keyboardAppearance={theme.dark ? "dark" : "light"}
        />

        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchText("")}
            style={{
              padding: 4,
              borderRadius: 12,
              backgroundColor: theme.dark
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(93, 50, 17, 0.1)",
            }}
          >
            <Feather
              name="x"
              size={14}
              color={
                theme.dark
                  ? "rgba(255, 255, 255, 0.6)"
                  : "rgba(93, 50, 17, 0.6)"
              }
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={{
            backgroundColor: theme.dark ? theme.colors.text : "#5d3211",
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginLeft: 8,
            shadowColor: theme.dark ? "#000" : "#5d3211",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          }}
          onPress={() => {
            /* Implement search action */
          }}
        >
          <MaterialIcons
            name="search"
            size={18}
            color={theme.dark ? "#5d3211" : "white"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SearchHeader;
