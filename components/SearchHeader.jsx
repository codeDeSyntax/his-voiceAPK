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
            backgroundColor: theme.dark ? theme.colors.primary : "#f3f3f3",
            borderWidth: theme.dark ? 0 : 0,
            borderColor: theme.colors.secondary,
            borderRadius:100
          },
        ]}
      >
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.dark ? theme.colors.primary :"#f3f3f3",
              color: theme.dark === true ? theme.colors.text : "gray",
              fontFamily: "serif",
              fontStyle: "italic",
              borderRadius:100
            },
          ]}
          placeholder="Search Sermons"

          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor={theme.dark === true ? "gray" : "gray"}
        
          selectionColor={theme.dark === true ? theme.colors.text : "gray"}
          spellCheck={false}
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[
            styles.searchButton,
            { backgroundColor: theme.dark ? theme.colors.primary+"80" :"#34aed6" },
          ]}
          onPress={() => {
            /* Implement search action */
          }}
        >
          <Ionicons name="search" size={20} color={"white"} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SearchHeader;