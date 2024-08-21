import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Modal,
  Pressable,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import earlySermons from "../../sermons/1964-1969/firstset";
import secondSet from "../../sermons/1970/1970";
import thirdSet from "../../sermons/1971/1971";
import fourthSet from "../../sermons/1972/1972";
import lastSet from "../../sermons/1973/1973";
import audioSermons from "../../sermons/audio";

const allSermons = [
  ...earlySermons,
  ...secondSet,
  ...thirdSet,
  ...fourthSet,
  ...lastSet,
  ...audioSermons,
];

const years = Array.from({ length: 10 }, (_, i) => (1973 - i).toString());
const alphabet = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);

function SermonList() {
  const [searchText, setSearchText] = useState("");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedLetter, setSelectedLetter] = useState("A-Z");
  const [isYearModalVisible, setIsYearModalVisible] = useState(false);
  const [isLetterModalVisible, setIsLetterModalVisible] = useState(false);

  const filteredSermons = allSermons.filter(
    (sermon) =>
      sermon.title.toLowerCase().includes(searchText.toLowerCase()) &&
      (selectedYear === "All Years" || sermon.year === selectedYear) &&
      (selectedLetter === "A-Z" || sermon.title.startsWith(selectedLetter))
  );
  const locationNotFound = (
    <Text style={{ fontSize: 9, color: "gray" }}>Location not found</Text>
  );
  const renderSermonItem = ({ item }) => (
    <View style={styles.sermonItem}>
      <Text style={styles.sermonTitle}>{item.title}</Text>
      <Text style={{ fontSize: 9, color: "gray" }}>
        {item.location ? item.location : locationNotFound}
      </Text>
      <Text
        style={{
          padding: 5,
          backgroundColor: "#2bc7ee",
          fontSize: 12,
          width: 150,
          borderRadius: 10,
          color: "white",
        }}
      >
        {item.date}
      </Text>
    </View>
  );

  const closeDropdown = () => {
    setIsYearModalVisible(false);
    setIsLetterModalVisible(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Sermons"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.searchButton} onPress={() => {/* Implement search action */}}>
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity
          onPress={() => setIsLetterModalVisible(true)}
          style={styles.filterButton}
        >
          <Text style={styles.filterText}>{selectedLetter}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsYearModalVisible(true)}
          style={styles.filterButton}
        >
          <Text style={styles.filterText}>{selectedYear}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredSermons}
        renderItem={renderSermonItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />

      {/* Year Modal */}
      <Modal
        transparent={true}
        visible={isYearModalVisible}
        onRequestClose={closeDropdown}
      >
        <Pressable style={styles.modalOverlay} onPress={closeDropdown}>
          <View style={styles.modalContent}>
            <FlatList
              data={years}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.gridItem}
                  onPress={() => {
                    setSelectedYear(item);
                    closeDropdown();
                  }}
                >
                  <Text style={styles.gridItemText}>{item}</Text>
                </Pressable>
              )}
              numColumns={3} // Grid style with 3 columns
              keyExtractor={(item) => item}
              contentContainerStyle={styles.gridContainer}
            />
            <Pressable
              style={[styles.gridItem, styles.allYearsOption]}
              onPress={() => {
                setSelectedYear("All Years");
                closeDropdown();
              }}
            >
              <Text style={styles.gridItemText}>All Years</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Letter Modal */}
      <Modal
        transparent={true}
        visible={isLetterModalVisible}
        onRequestClose={closeDropdown}
      >
        <Pressable style={styles.modalOverlay} onPress={closeDropdown}>
          <View style={styles.modalContent}>
            <FlatList
              data={alphabet}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.gridItem}
                  onPress={() => {
                    setSelectedLetter(item);
                    closeDropdown();
                  }}
                >
                  <Text style={styles.gridItemText}>{item}</Text>
                </Pressable>
              )}
              numColumns={5} // Grid style with 5 columns
              keyExtractor={(item) => item}
              contentContainerStyle={styles.gridContainer}
            />
            <Pressable
              style={[styles.gridItem, styles.allLettersOption]}
              onPress={() => {
                setSelectedLetter("All Letters");
                closeDropdown();
              }}
            >
              <Text style={styles.gridItemText}>All Letters</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecf6fe",
    paddingTop: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#333",
  },
  searchButton: {
    height: 40,
    width: 40,
    backgroundColor: "#2bc7ee",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  filtersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    // backgroundColor: "gray",
    borderRadius: 10,
    borderColor:'gray',
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  filterText: {
    fontSize: 16,
    color: "black",
  },
  listContent: {
    padding: 16,
  },
  sermonItem: {
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
  },
  sermonTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
  },
  gridContainer: {
    padding: 4,
  },
  gridItem: {
    flex: 1,
    padding: 10,
    margin: 4,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    alignItems: "center",
  },
  gridItemText: {
    fontSize: 16,
    color: "#333",
  },
  allYearsOption: {
    borderColor: "#ccc",
  },
  allLettersOption: {
    borderColor: "#ccc",
  },
});

export default SermonList;
