import React, { useState, useEffect } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  Text,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppContext } from "../../Logic/globalState";
// import { styles } from "../../styles/settings";

// Component imports
import SearchHeader from "../../components/SearchHeader";
import ActionsBar from "../../components/ActionsBar";
import SermonListView from "../../components/SermonListView";
import YearModal from "../../components/YearModal";
import LetterModal from "../../components/LetterModal";


const years = Array.from({ length: 10 }, (_, i) => (1973 - i).toString());
const alphabet = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);

function SermonList() {
  const navigation = useNavigation()
  const {
    setSelectedSermon,
    recentlyOpened,
    allSermons,
    addToRecentlyOpened,
    theme,
    numberOfColumns,
  } = useAppContext();

  const [searchText, setSearchText] = useState("");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedLetter, setSelectedLetter] = useState("All Letters");
  const [isYearModalVisible, setIsYearModalVisible] = useState(false);
  const [isLetterModalVisible, setIsLetterModalVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [filteredSermons, setFilteredSermons] = useState(allSermons);



  const applyFilters = () => {
    const newFilteredSermons = allSermons.filter((sermon) => {
      const matchesSearch = sermon.title
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const matchesYear =
        selectedYear === "All Years" || sermon.year === selectedYear;
      const matchesLetter =
        selectedLetter === "All Letters" ||
        sermon.title.toLowerCase().startsWith(selectedLetter.toLowerCase());
      return matchesSearch && matchesYear && matchesLetter;
    });

    const sortedSermons = [...newFilteredSermons].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.title.trim().localeCompare(b.title.trim());
      } else {
        return b.title.trim().localeCompare(a.title.trim());
      }
    });

    setFilteredSermons(sortedSermons);
  };

  useEffect(() => {
    applyFilters();
  }, [searchText, selectedYear, selectedLetter, sortOrder]);

  const filterOnlyText = () => {
    setFilteredSermons((prevSermons) =>
      prevSermons.filter((sermon) => sermon.type === "text")
    );
  };

  const filterOnlyAudio = () => {
    setFilteredSermons((prevSermons) =>
      prevSermons.filter((sermon) => sermon.type === "mp3")
    );
  };

  const handleSermonClick = async (sermon) => {
    try {
      // Set the selected sermon in context
      // setSelectedSermon(sermon);

      // Update recently opened sermons
      // const updatedRecentlyOpenedSermons = [
      //   sermon,
      //   ...recentlyOpened.filter((s) => s.id !== sermon.id),
      // ].slice(0, 10);

      // addToRecentlyOpened(sermon);

      // // Store in AsyncStorage
      // await AsyncStorage.setItem(
      //   "recentlyOpenedSermons",
      //   JSON.stringify(updatedRecentlyOpenedSermons)
      // );

      // Navigate
      if (navigation) {
        navigation.navigate("currentsermon");
      } else {
        console.error("Navigation object is undefined");
      }
    } catch (error) {
      console.error("Error in sermon navigation:", error);
      Alert.alert("Navigation Error", "Could not navigate to the sermon.");
    }
  };

  const closeDropdown = () => {
    setIsYearModalVisible(false);
    setIsLetterModalVisible(false);
  };

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  const listHeaderComponent = (
    <View style={{ paddingVertical: 10 }}>
      <Text
        style={{
          color: theme.colors.text,
          fontStyle: "italic",
          fontWeight: "100",
          fontSize: 10,
        }}
      >
        Sermon list contains both audio and transcribed versions. Audio versions
        are indicated with a microphone and are not available within the app
        now.
      </Text>
      <Text
        style={{
          color: "red",
          fontStyle: "italic",
          fontWeight: "100",
          fontSize: 14,
        }}
      >
        Rather, links of the sermons are available. They take you to the
        download page
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.primary }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ListAppBar theme={theme} />
      <DraggableFloatingBackButton/>

      <ActionsBar
        theme={theme}
        setIsLetterModalVisible={setIsLetterModalVisible}
        setIsYearModalVisible={setIsYearModalVisible}
        filterOnlyText={filterOnlyText}
        filterOnlyAudio={filterOnlyAudio}
        toggleSortOrder={toggleSortOrder}
      />
      <SearchHeader
        theme={theme}
        searchText={searchText}
        setSearchText={setSearchText}
      />

      <SermonListView
        theme={theme}
        filteredSermons={filteredSermons}
        handleSermonClick={handleSermonClick}
        listHeaderComponent={listHeaderComponent}
      />

      <YearModal
        theme={theme}
        isVisible={isYearModalVisible}
        closeDropdown={closeDropdown}
        years={years}
        setSelectedYear={setSelectedYear}
      />

      <LetterModal
        theme={theme}
        isVisible={isLetterModalVisible}
        closeDropdown={closeDropdown}
        alphabet={alphabet}
        setSelectedLetter={setSelectedLetter}
      />
    </KeyboardAvoidingView>
  );
}

import { StyleSheet } from "react-native";
import { Appbar } from "react-native-paper";
import ListAppBar from "../../components/AppBar";
import { useNavigation } from "@react-navigation/native";
import DraggableFloatingBackButton from "../../components/FloatButton";

export const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 16,
    paddingTop: 10,
  },
});

export default SermonList;
