import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { styles } from "../styles/Allsermons";
import { MaterialIcons } from "@expo/vector-icons";

const SearchHeader = ({ theme, searchText, setSearchText }) => {
  return (
    <View style={styles.searchContainer}>
      <View
        style={[
          styles.searchInputContainer,
          {
            backgroundColor: theme.dark ? "transparent" : "#ffffff95",

            borderColor: theme.dark ? "#636262" : theme.colors.text,
            borderWidth: theme.dark ? 1 : 0,
            borderRadius: 100,
            borderStyle: "dotted",
          },
        ]}
      >
        <TextInput
          style={[
            styles.searchInput,
            {
              borderColor: theme.dark ? theme.colors.primary : "#f3f3f3",
              color: theme.dark === true ? theme.colors.text : "#000000",
              fontFamily: "serif",
              // fontStyle: "italic",
              borderRadius: 100,
            },
          ]}
          placeholder="Search Sermons"
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor={theme.dark ? "gray" : "#00000080"}
          selectionColor={theme.dark === true ? theme.colors.text : "gray"}
          spellCheck={false}
          autoCorrect={false}
          keyboardAppearance={theme.dark ? "dark" : "light"}
          
        />
        <TouchableOpacity
          style={[
            styles.searchButton,
            {
              backgroundColor: theme.dark ? theme.colors.text : "#5d3211",
              borderRadius: 100,
            },
          ]}
          onPress={() => {
            /* Implement search action */
          }}
        >
          <MaterialIcons
            name="search"
            size={20}
            color={theme.dark ? "#5d3211" : "white"}
            style={{
              shadowColor: "black",
              elevation: 3,
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SearchHeader;
