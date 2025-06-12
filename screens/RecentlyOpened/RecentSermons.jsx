import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";

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
  ToastAndroid,
  Alert,
} from "react-native";
import { FontAwesome, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useAppContext } from "../../Logic/globalState";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import DraggableFloatingBackButton from "../../components/FloatButton";

const years = Array.from({ length: 10 }, (_, i) => (1973 - i).toString());
const alphabet = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);

const RecentlyOpenedSermons = () => {
  const {
    setSelectedSermon,
    recentlyOpened,
    setRecentlyOpened,
    theme,
    allSermons,
    getLastReadPosition, // Added this from context
  } = useAppContext();

  const [searchText, setSearchText] = useState("");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedLetter, setSelectedLetter] = useState("All Letters");
  const [isYearModalVisible, setIsYearModalVisible] = useState(false);
  const [isLetterModalVisible, setIsLetterModalVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const navigation = useNavigation();

  const filteredSermons = recentlyOpened.filter((sermon) => {
    const matchesSearch = sermon?.title
      ?.toLowerCase()
      .includes(searchText?.toLowerCase());
    const matchesYear =
      selectedYear === "All Years" || sermon.year === selectedYear;
    const matchesLetter =
      selectedLetter === "All Letters" ||
      sermon.title.toLowerCase().startsWith(selectedLetter?.toLowerCase());
    return matchesSearch && matchesYear && matchesLetter;
  });

  const sortedSermons = [...filteredSermons].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.title.trim().localeCompare(b.title.trim());
    } else {
      return b.title.trim().localeCompare(a.title.trim());
    }
  });

  const borderStyle = {
    backgroundColor: "transparent",
    shadowColor: theme.colors.text,
    borderColor: theme.dark ? "white" : "#121212",
    borderWidth: 2,
  };

  const handleSermonClick = useCallback(
    (sermon) => {
      // Look for sermon from allSermons by title and type before setting selectedSermon
      const sermonToSet = allSermons.find(
        (s) => s.title === sermon.title && s.type === sermon.type
      );

      if (sermonToSet) {
        // Get the current last read position for this sermon
        const lastReadParagraph = getLastReadPosition(sermonToSet.id);

        // Create sermon object with last read position
        const sermonWithPosition = {
          ...sermonToSet,
          lastReadParagraph: lastReadParagraph,
        };

        // Set the selected sermon with position
        setSelectedSermon(sermonWithPosition);

        // Navigate to current sermon
        navigation?.navigate("currentsermon");

        // Optional: Show toast with last position info
        if (lastReadParagraph > 0) {
          const message = `Continuing from paragraph ${lastReadParagraph + 1}`;
          if (Platform.OS === "android") {
            ToastAndroid.show(message, ToastAndroid.SHORT);
          } else {
            Alert.alert("Resuming", message);
          }
        }
      } else {
        const errorMessage = "Sermon not found ⛈️";
        if (Platform.OS === "android") {
          ToastAndroid.show(errorMessage, ToastAndroid.LONG);
        } else {
          Alert.alert("Error", "Sermon not found");
        }
      }
    },
    [allSermons, getLastReadPosition, setSelectedSermon, navigation]
  );

  const removeFromRecents = async (item) => {
    const updatedRecents = recentlyOpened.filter(
      (sermon) => item.id !== sermon.id
    );
    setRecentlyOpened(updatedRecents);

    try {
      // Use updatedRecents to update AsyncStorage with the correct value
      await AsyncStorage.setItem(
        "recentlyOpenedSermons",
        JSON.stringify(updatedRecents)
      );
      console.log(
        "Sermon removed from recents. Total recents:",
        updatedRecents.length
      );
    } catch (error) {
      console.error("Failed to update recents in AsyncStorage", error);
    }
  };

  const clearAll = () => {
    setRecentlyOpened([]);
    AsyncStorage.removeItem("recentlyOpenedSermons")
      .then(() => {
        console.log("All recents cleared");
      })
      .catch((error) => {
        console.error("Failed to clear recents", error);
      });
  };

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

  const LocationNotFound = useCallback(
    () => (
      <Text
        style={{
          fontSize: 9,
          color: theme.colors.ltext,
          fontFamily: "monospace",
        }}
      >
        Location not found
      </Text>
    ),
    [theme.colors.ltext]
  );

  const renderSermonItem = ({ item, index }) => {
    // Get the last read position for this sermon
    const lastReadPosition = getLastReadPosition(item.id);

    return (
      <Pressable
        key={item.id}
        style={[
          styles.sermonItem,
          {
            borderWidth: 1,
            borderColor: theme.dark ? theme.colors.primary : "#dcdcdd",
            backgroundColor: theme.dark ? "transparent" : "transparent",
            gap: 10,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleSermonClick(item)}
          style={{ width: "90%" }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 5,
              fontSize: 12,
              width: 200,
              borderRadius: 5,
              backgroundColor: theme.colors.background,
              marginBottom: 2,
              paddingHorizontal: 10,
            }}
          >
            <Text
              style={{
                color: theme.colors.text + "90",
                fontSize: 12,
              }}
            >
              {item.date}
            </Text>
            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
              {item.type === "mp3" ? (
                <Text style={styles.animatedMicrophone}>
                  {item.type === "mp3" && (
                    <FontAwesome5
                      name="microphone"
                      color={theme.dark === true ? theme.colors.text : "gray"}
                    />
                  )}
                </Text>
              ) : (
                <MaterialIcons name="text-format" color={theme.colors.text} />
              )}
            </Animated.View>
          </View>
          <Text style={[styles.sermonTitle, { color: theme.colors.text }]}>
            {item.title}
          </Text>
          <Text
            style={{
              fontSize: 9,
              color: theme.colors.text + "60",
              paddingBottom: 4,
              fontFamily: "monospace",
            }}
          >
            {item.location ? item.location : <LocationNotFound />}
          </Text>

          {/* Show last read position if available */}
          {lastReadPosition > 0 && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
                paddingHorizontal: 8,
                paddingVertical: 2,
                backgroundColor: theme.dark
                  ? theme.colors.hlight + "20"
                  : "#f0f0f0",
                borderRadius: 10,
                alignSelf: "flex-start",
              }}
            >
              <MaterialIcons
                name="bookmark"
                size={12}
                color={theme.dark ? theme.colors.hlight : "#666"}
              />
              <Text
                style={{
                  fontSize: 10,
                  color: theme.dark ? theme.colors.hlight : "#666",
                  marginLeft: 4,
                  fontFamily: "monospace",
                }}
              >
                Paragraph {lastReadPosition + 1}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={{ opacity: 4 }}
          onPress={() => removeFromRecents(item)}
        >
          <FontAwesome
            name="trash"
            size={25}
            color={theme.dark === true ? theme.colors.hlight : "#4c3423"}
          />
        </TouchableOpacity>
      </Pressable>
    );
  };

  const closeDropdown = useCallback(() => {
    setIsYearModalVisible(false);
    setIsLetterModalVisible(false);
  }, []);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  }, []);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <DraggableFloatingBackButton />
      <View style={styles.searchContainer}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Recents
          </Text>
        </View>
        {recentlyOpened.length > 0 && (
          <View
            style={[
              styles.searchInputContainer,
              {
                backgroundColor: theme.dark ? "#212121" : "#f9fafb",
                borderColor: "silver",
              },
            ]}
          >
            <TextInput
              style={[
                styles.searchInput,
                {
                  color: "gray",
                  backgroundColor: theme.dark
                    ? theme.colors.primary
                    : "#f1f1f1",
                  fontStyle: "italic",
                },
              ]}
              placeholder="Search Sermons"
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor={theme.colors.text}
              selectionColor={theme.dark === true ? theme.colors.text : "gray"}
            />
            <Pressable
              style={[
                styles.searchButton,
                {
                  backgroundColor: theme.dark ? theme.colors.hlight : "#492f24",
                },
              ]}
              android_ripple={{
                color: theme.dark
                  ? "rgba(255,255,255,0.1)"
                  : "rgb(73, 40, 9)",
              }}
              onPress={() => {
                /* Implement search action */
              }}
            >
              <MaterialIcons name="search" size={20} color="#fff" />
            </Pressable>
          </View>
        )}
      </View>

      {recentlyOpened.length > 0 && (
        <View style={styles.filtersContainer}>
          <Pressable
            onPress={() => setIsLetterModalVisible(true)}
            style={[
              styles.filterButton,
              {
                borderColor: theme.colors.text,
                backgroundColor: "transparent",
              },
              borderStyle,
            ]}
            android_ripple={{
              color: theme.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
            }}
          >
            <MaterialIcons
              name="text-format"
              size={24}
              color={theme.colors.text}
              style={styles.dropdownIcon}
            />
          </Pressable>
          <Pressable
            onPress={() => setIsYearModalVisible(true)}
            style={[
              styles.filterButton,
              {
                borderColor: theme.colors.text,
                backgroundColor: "transparent",
              },
              borderStyle,
            ]}
            android_ripple={{
              color: theme.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
            }}
          >
            <FontAwesome5
              name="calendar-alt"
              color={theme.colors.text}
              size={24}
            />
          </Pressable>
          <Pressable
            style={[
              styles.filterButton,
              {
                borderColor: theme.colors.text,
                backgroundColor: "transparent",
              },
              borderStyle,
            ]}
            onPress={toggleSortOrder}
            android_ripple={{
              color: theme.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
            }}
          >
            <FontAwesome name="sort" size={20} color={theme.colors.text} />
          </Pressable>

          <Pressable
            onPress={clearAll}
            style={[
              styles.filterButton,
              {
                borderColor: theme.colors.text,
                backgroundColor: "transparent",
              },
              borderStyle,
            ]}
            android_ripple={{
              color: theme.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
            }}
          >
            <MaterialIcons
              name="format-clear"
              size={20}
              color={theme.colors.text}
            />
          </Pressable>
        </View>
      )}

      {recentlyOpened.length > 0 ? (
        <FlatList
          data={sortedSermons}
          renderItem={renderSermonItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View
          style={{
            padding: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{ color: theme.dark === true ? theme.colors.text : "gray" }}
          >
            No sermons in recents
          </Text>
        </View>
      )}

      {/* Year Modal */}
      <Modal
        transparent={true}
        visible={isYearModalVisible}
        onRequestClose={closeDropdown}
      >
        <Pressable style={styles.modalOverlay} onPress={closeDropdown}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.secondary,
              },
            ]}
          >
            <FlatList
              data={years}
              renderItem={({ item, index }) => (
                <Pressable
                  style={[
                    styles.gridItem,
                    {
                      elevation: 3,
                      backgroundColor: theme.dark
                        ? parseInt(index) % 2 === 0
                          ? theme.colors.primary
                          : theme.colors.primary
                        : "#fafafa",
                    },
                  ]}
                  onPress={() => {
                    setSelectedYear(item);
                    closeDropdown();
                  }}
                >
                  <Text
                    style={[
                      styles.gridItemText,
                      {
                        color: theme.dark === true ? theme.colors.text : "gray",
                      },
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              )}
              numColumns={3}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.gridContainer}
            />
            <Pressable
              style={[
                styles.allYearsOption,
                {
                  backgroundColor: theme.colors.primary,
                },
              ]}
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
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.secondary,
              },
            ]}
          >
            <FlatList
              data={alphabet}
              renderItem={({ item, index }) => (
                <Pressable
                  style={[
                    styles.gridItem,
                    {
                      elevation: 3,
                      backgroundColor: theme.dark
                        ? parseInt(index) % 2 === 0
                          ? theme.colors.primary
                          : theme.colors.primary
                        : "#fafafa",
                    },
                  ]}
                  onPress={() => {
                    setSelectedLetter(item);
                    closeDropdown();
                  }}
                >
                  <Text
                    style={[
                      styles.gridItemText,
                      {
                        color: theme.dark === true ? theme.colors.text : "gray",
                      },
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              )}
              numColumns={5}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.gridContainer}
            />
            <Pressable
              style={[
                styles.allLettersOption,
                {
                  backgroundColor: theme.colors.primary,
                },
              ]}
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2d2d2d",
    paddingTop: 40,
  },
  searchContainer: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  label: {
    fontSize: 24,
    fontFamily: "serif",
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 10,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 100,
    backgroundColor: "white",
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#fafafa",
    borderTopLeftRadius: 100,
    borderBottomLeftRadius: 100,
  },
  searchButton: {
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    borderTopRightRadius: 100,
    borderBottomRightRadius: 100,
  },
  filtersContainer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
  },
  filterButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    height: 50,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderStyle: "dotted",
  },
  filterText: {
    marginRight: 8,
    fontSize: 16,
    color: "#333",
  },
  sortButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 100,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 120,
    paddingTop: 10,
  },
  sermonItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "center",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sermonTitle: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "serif",
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
    paddingVertical: 3,
    paddingHorizontal: 4,
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

export default RecentlyOpenedSermons;
