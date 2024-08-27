import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { SermonContext } from "../../Logic/globalState";
import {
  Image,
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
  Animated,
  Easing,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import earlySermons from "../../sermons/1964-1969/firstset";
import secondSet from "../../sermons/1970/1970";
import thirdSet from "../../sermons/1971/1971";
import fourthSet from "../../sermons/1972/1972";
import lastSet from "../../sermons/1973/1973";
import audioSermons from "../../sermons/audio";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

function SermonList({ navigation }) {
  const { setSelectedSermon, recentlyOpened, setRecentlyOpened } =
    React.useContext(SermonContext);

  const [searchText, setSearchText] = useState("");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedLetter, setSelectedLetter] = useState("All Letters");
  const [isYearModalVisible, setIsYearModalVisible] = useState(false);
  const [isLetterModalVisible, setIsLetterModalVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");

  const filteredSermons = allSermons.filter((sermon) => {
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

  const sortedSermons = [...filteredSermons].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.title.trim().localeCompare(b.title.trim());
    } else {
      return b.title.trim().localeCompare(a.title.trim());
    }
  });

  const handleSermonClick = async (sermon) => {
    const alreadyInRecents = recentlyOpened.some((item) => item.id === sermon.id)
    setSelectedSermon(sermon);
    
    if (!alreadyInRecents) {
      const updatedRecentlyOpenedSermons = [...recentlyOpened, sermon];
      setRecentlyOpened(updatedRecentlyOpenedSermons);
      
      try {
        await AsyncStorage.setItem("recentlyOpenedSermons", JSON.stringify(updatedRecentlyOpenedSermons));
      } catch (error) {
        console.error("Failed to update recents in AsyncStorage", error);
      }
    }
    
    navigation.navigate("Home");
  };
  
  const LocationNotFound = useCallback(
    () => (
      <Text style={{ fontSize: 9, color: "#427092" }}>Location not found</Text>
    ),
    []
  );

  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.3,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    // Cleanup animation when the component unmounts
    return () => pulseAnimation.stop();
  }, [scaleValue]);

  const renderSermonItem = useCallback(
    ({ item, index }) => (
      <TouchableOpacity
      key={item.id}
        style={[
          styles.sermonItem,
          {
            backgroundColor: parseInt(index) % 2 === 0 ? "#3d4043" : "#303336",
          },
        ]}
        onPress={() => handleSermonClick(item)}
      >
        <Text style={styles.sermonTitle}>{item.title}</Text>
        <Text style={{ fontSize: 9, color: "#427092", paddingBottom: 4 }}>
          {item.location ? item.location : <LocationNotFound />}
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 5,
            backgroundColor: "#22272a",
            fontSize: 12,
            width: 250,
            borderRadius: 10,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 12,
            }}
          >
            {item.date}
          </Text>
          <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            {item.type === "mp3" ? (
              <Text style={styles.animatedMicrophone}>
                {item.type === "mp3" && "🔊"}
              </Text>
            ) : (
             <Ionicons name= 'text' color='#fafafa'/>
            )}
          </Animated.View>
        </View>
      </TouchableOpacity>
    ),
    []
  );

  const closeDropdown = useCallback(() => {
    setIsYearModalVisible(false);
    setIsLetterModalVisible(false);
  }, []);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.searchContainer}>
        <Text style={styles.label}>Sermon List</Text>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Sermons"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#fafafa"
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => {
              /* Implement search action */
            }}
          >
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity
          onPress={() => setIsLetterModalVisible(true)}
          style={styles.filterButton}
        >
          {/* <Text style={styles.filterText}>{selectedLetter}</Text> */}
          <Ionicons
            name="text-outline"
            size={16}
            color="#fff"
            style={styles.dropdownIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsYearModalVisible(true)}
          style={styles.filterButton}
        >
          {/* <Text style={styles.filterText}>{selectedYear}</Text> */}
          <FontAwesome5 name="calendar-alt" color='#fafafa'/>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton} onPress={toggleSortOrder}>
          <FontAwesome
            name='sort'
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedSermons}
        renderItem={renderSermonItem}
        keyExtractor={(item) => item.id}
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
              numColumns={3}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.gridContainer}
            />
            <Pressable
              style={[styles.allYearsOption]}
              onPress={() => {
                setSelectedYear("All Years");
                closeDropdown();
              }}
            >
              <Text style={styles.gridBtnText}>All Years</Text>
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
              numColumns={5}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.gridContainer}
            />
            <Pressable
              style={[styles.allLettersOption]}
              onPress={() => {
                setSelectedLetter("All Letters");
                closeDropdown();
              }}
            >
              <Text style={styles.gridBtnText}>All Letters</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // ... (styles remain unchanged)
  container: {
    flex: 1,
    backgroundColor: "#2d2d2d",
    paddingTop: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  label: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 10,
    color:'#fafafa'
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3d4043",
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
    backgroundColor: "#3d4043",
    fontSize: 16,
    color: "#fafafa",
    borderRadius:8
  },
  searchButton: {
    height: 40,
    width: 40,
    backgroundColor: "#427092",
    justifyContent: "center",
    alignItems: "center",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  filtersContainer: {
    flexDirection: "row",
    gap:10,
    // justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  filterText: {
    marginRight: 8,
    fontSize: 16,
    color: "#333",
  },
  dropdownIcon: {
    marginLeft: 8,
  },
  sortButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#427092",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop:10
  },
  sermonItem: {
    paddingHorizontal: 10,
    paddingVertical:5,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  sermonTitle: {
    fontSize: 13,
    fontWeight: "400",
    // fontFamily:'monospace',
    marginBottom: 4,
    color: "#bfc7ca",
  },
  animatedMicrophone: {},
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
  },
  gridContainer: {
    paddingVertical: 8,
  },
  gridItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    margin: 4,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  selectedGridItem: {
    backgroundColor: "#427092",
  },
  gridItemText: {
    fontSize: 16,
    color: "#333",
  },
  selectedGridItemText: {
    color: "#fff",
  },
  allYearsOption: {
    backgroundColor: "#0a84ff",
    width: "100%",
    padding: 10,
    borderRadius: 8,
  },
  allLettersOption: {
    backgroundColor: "#0a84ff",
    padding: 10,
    borderRadius: 8,
    width: "100%",
  },
  gridBtnText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default SermonList;
