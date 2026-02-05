import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { View, Platform, Text, Alert, ToastAndroid } from "react-native";
import { useAppContext } from "../../Logic/globalState";

// Component imports
import SearchHeader from "../../components/SearchHeader";
import SermonListView from "../../components/SermonListView";
import YearModal from "../../components/YearModal";
import LetterModal from "../../components/LetterModal";
import SkeletonLoader from "../../components/SkeletonLoader";
import { StyleSheet } from "react-native";
import ListAppBar from "../../components/AppBar";
import { useNavigation } from "@react-navigation/native";
import DraggableFloatingButton from "../../components/FloatButton";

const years = Array.from({ length: 10 }, (_, i) => (1973 - i).toString());
const alphabet = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i),
);

const SermonList = React.memo(() => {
  const navigation = useNavigation();
  const { setSelectedSermon, allSermons, theme, loading } = useAppContext();

  const [searchText, setSearchText] = useState("");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedLetter, setSelectedLetter] = useState("All Letters");
  const [isYearModalVisible, setIsYearModalVisible] = useState(false);
  const [isLetterModalVisible, setIsLetterModalVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [filteredSermons, setFilteredSermons] = useState(allSermons);
  const [originalSermons, setOriginalSermons] = useState(allSermons);
  const [isOriginalOrder, setIsOriginalOrder] = useState(true);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [viewMode, setViewMode] = useState("compact"); // "table", "compact"

  // Store original order when sermons are loaded
  useEffect(() => {
    if (allSermons.length > 0) {
      setOriginalSermons(allSermons);
    }
  }, [allSermons]);

  // Memoized filter function for better performance
  const applyFilters = useCallback(() => {
    const hasFilters =
      searchText ||
      selectedYear !== "All Years" ||
      selectedLetter !== "All Letters";
    setHasActiveFilters(hasFilters);

    // If no filters and original order, show all original sermons
    if (!hasFilters && isOriginalOrder) {
      setFilteredSermons(originalSermons);
      return;
    }

    const filtered = allSermons.filter((sermon) => {
      const titleLower = sermon.title.toLowerCase();
      const searchLower = searchText.toLowerCase();

      const matchesSearch = !searchText || titleLower.includes(searchLower);
      const matchesYear =
        selectedYear === "All Years" || sermon.year === selectedYear;
      const matchesLetter =
        selectedLetter === "All Letters" ||
        titleLower.startsWith(selectedLetter.toLowerCase());

      return matchesSearch && matchesYear && matchesLetter;
    });

    let sorted;
    if (isOriginalOrder) {
      // Maintain original order by filtering the original array
      sorted = originalSermons.filter((sermon) =>
        filtered.some((f) => f.id === sermon.id),
      );
    } else {
      sorted = [...filtered].sort((a, b) => {
        const comparison = a.title.trim().localeCompare(b.title.trim());
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    setFilteredSermons(sorted);
  }, [
    allSermons,
    searchText,
    selectedYear,
    selectedLetter,
    sortOrder,
    isOriginalOrder,
    originalSermons,
  ]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Memoized filter functions
  const filterOnlyText = useCallback(() => {
    const textSermons = allSermons.filter((sermon) => sermon.type === "text");
    setFilteredSermons(textSermons);
    setHasActiveFilters(true);
    setIsOriginalOrder(false);
    // Clear other filters
    setSearchText("");
    setSelectedYear("All Years");
    setSelectedLetter("All Letters");
  }, [allSermons]);

  const filterOnlyAudio = useCallback(() => {
    const audioSermons = allSermons.filter((sermon) => sermon.type === "mp3");
    setFilteredSermons(audioSermons);
    setHasActiveFilters(true);
    setIsOriginalOrder(false);
    // Clear other filters
    setSearchText("");
    setSelectedYear("All Years");
    setSelectedLetter("All Letters");
  }, [allSermons]);

  const handleSermonClick = useCallback(
    async (sermon) => {
      try {
        // Show loading state immediately
        setSelectedSermon(sermon);

        // Navigate immediately to show loading screen
        if (navigation) {
          navigation.navigate("currentsermon");
        } else {
          console.error("Navigation object is undefined");
        }
      } catch (error) {
        console.error("Error in sermon navigation:", error);
        const message = "Error occurred";
        Platform.OS === "android"
          ? ToastAndroid.show(message, ToastAndroid.SHORT)
          : Alert.alert("Error", message);
      }
    },
    [setSelectedSermon, navigation],
  );

  const closeDropdown = useCallback(() => {
    setIsYearModalVisible(false);
    setIsLetterModalVisible(false);
  }, []);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    setIsOriginalOrder(false);
    // Clear search and other filters when sorting
    setSearchText("");
    setSelectedYear("All Years");
    setSelectedLetter("All Letters");
    setHasActiveFilters(false);
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => {
      if (prev === "table") return "compact";
      return "table";
    });
  }, []);

  const restoreOriginalOrder = useCallback(() => {
    setIsOriginalOrder(true);
    setSearchText("");
    setSelectedYear("All Years");
    setSelectedLetter("All Letters");
    setHasActiveFilters(false);
    setSortOrder("asc"); // Reset sort order to default
    // Reset to original sermons list
    setFilteredSermons(originalSermons);
  }, [originalSermons]);

  // Memoized components
  const listHeaderComponent = useMemo(
    () => (
      <View style={styles.headerContainer}>
        <Text style={[styles.headerText, { color: theme.colors.text }]}>
          Sermon list contains both audio and transcribed versions. Audio
          versions are indicated with a microphone and are not available within
          the app now.
        </Text>
        <Text style={styles.warningText}>
          Rather, links of the sermons are available. They take you to the
          download page
        </Text>
      </View>
    ),
    [theme.colors.text],
  );

  // Gradient colors removed - using simple background instead

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <DraggableFloatingButton />

      <ListAppBar
        theme={theme}
        viewMode={viewMode}
        toggleViewMode={toggleViewMode}
        setIsLetterModalVisible={setIsLetterModalVisible}
        setIsYearModalVisible={setIsYearModalVisible}
        filterOnlyText={filterOnlyText}
        filterOnlyAudio={filterOnlyAudio}
        toggleSortOrder={toggleSortOrder}
        restoreOriginalOrder={restoreOriginalOrder}
        isOriginalOrder={isOriginalOrder}
        hasActiveFilters={hasActiveFilters}
      />

      <SearchHeader
        theme={theme}
        searchText={searchText}
        setSearchText={setSearchText}
      />

      {loading ? (
        <SkeletonLoader theme={theme} count={10} />
      ) : (
        <SermonListView
          theme={theme}
          filteredSermons={filteredSermons}
          handleSermonClick={handleSermonClick}
          listHeaderComponent={listHeaderComponent}
          setSearchText={setSearchText}
          allSermons={allSermons}
          setFilteredSermons={setFilteredSermons}
          viewMode={viewMode}
        />
      )}

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
    </View>
  );
});

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingVertical: 10,
  },
  headerText: {
    fontStyle: "italic",
    fontWeight: "100",
    fontSize: 10,
  },
  warningText: {
    color: "red",
    fontStyle: "italic",
    fontWeight: "100",
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 16,
    paddingTop: 10,
  },
});

export default SermonList;
