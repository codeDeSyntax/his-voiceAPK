import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, Modal, Pressable, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Sample data
const sermons = [
  {
    id: 1,
    title: "Hedged In With God",
    location: 'Am. Durham, Connecticut',
    year: "1970",
    date: "February-1-1970",
    sermon: "Sermon content goes here..."
  },
  // Add more sample sermons as needed
];

const years = Array.from({ length: 10 }, (_, i) => (1973 - i).toString());
const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

function SermonList() {
  const [searchText, setSearchText] = useState('');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [selectedLetter, setSelectedLetter] = useState('A-Z');
  const [isYearModalVisible, setIsYearModalVisible] = useState(false);
  const [isLetterModalVisible, setIsLetterModalVisible] = useState(false);

  const filteredSermons = sermons.filter(sermon =>
    sermon.title.toLowerCase().includes(searchText.toLowerCase()) &&
    (selectedYear === 'All Years' || sermon.year === selectedYear) &&
    (selectedLetter === 'A-Z' || sermon.title.startsWith(selectedLetter))
  );

  const renderSermonItem = ({ item }) => (
    <View style={styles.sermonItem}>
      <Text style={styles.sermonTitle}>{item.title}</Text>
      <Text>{item.location}</Text>
      <Text>{item.date}</Text>
      <Text>{item.sermon}</Text>
    </View>
  );

  const closeDropdown = () => {
    setIsYearModalVisible(false);
    setIsLetterModalVisible(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Sermons"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity onPress={() => setIsLetterModalVisible(true)} style={styles.filterButton}>
          <Text style={styles.filterText}>{selectedLetter}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsYearModalVisible(true)} style={styles.filterButton}>
          <Text style={styles.filterText}>{selectedYear}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredSermons}
        renderItem={renderSermonItem}
        keyExtractor={item => item.id.toString()}
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
              keyExtractor={item => item}
              contentContainerStyle={styles.gridContainer}
            />
            <Pressable
              style={[styles.gridItem, styles.allYearsOption]}
              onPress={() => {
                setSelectedYear('All Years');
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
              keyExtractor={item => item}
              contentContainerStyle={styles.gridContainer}
            />
            <Pressable
              style={[styles.gridItem, styles.allLettersOption]}
              onPress={() => {
                setSelectedLetter('All Letters');
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
    backgroundColor: '#fff',
    paddingTop:40
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  filterButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    flex: 1,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 16,
    color: '#333',
  },
  listContent: {
    padding: 16,
  },
  sermonItem: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
  sermonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
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
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    alignItems: 'center',
  },
  gridItemText: {
    fontSize: 16,
    color: '#333',
  },
  allYearsOption: {
    borderColor: '#ccc',
  },
  allLettersOption: {
    borderColor: '#ccc',
  },
});

export default SermonList;
