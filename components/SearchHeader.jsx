import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { styles } from "../styles/Allsermons";

const SearchHeader = ({ theme, searchText, setSearchText }) => {
  return (
    <View style={styles.searchContainer}>
     
      <View
        style={[
          styles.searchInputContainer,
          {
            backgroundColor: theme.colors.secondary,
            borderWidth: theme.dark ? 1 : 0,
            borderColor: theme.colors.secondary,
          },
        ]}
      >
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.colors.secondary,
              color: theme.dark === true ? theme.colors.text : "gray",
              fontFamily: "serif",
              fontStyle: "italic",
            },
          ]}
          placeholder="Search Sermons"
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor={theme.dark === true ? "gray" : "gray"}
          selectionColor={theme.dark === true ? theme.colors.text : "gray"}
        />
        <TouchableOpacity
          style={[
            styles.searchButton,
            { backgroundColor: theme.colors.secondary },
          ]}
          onPress={() => {
            /* Implement search action */
          }}
        >
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SearchHeader;