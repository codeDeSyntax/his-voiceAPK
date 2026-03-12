import React, {
  useState,
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
  const [searchResetKey, setSearchResetKey] = useState(0);
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedLetter, setSelectedLetter] = useState("All Letters");
  const [isYearModalVisible, setIsYearModalVisible] = useState(false);
  const [isLetterModalVisible, setIsLetterModalVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [isOriginalOrder, setIsOriginalOrder] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all"); // "all", "text", "mp3"
  const [viewMode, setViewMode] = useState("compact"); // "table", "compact"

  // Derive filtered sermons synchronously — no useState/useEffect double-render.
  const { filteredSermons, hasActiveFilters } = useMemo(() => {
    const hasFilters =
      searchText ||
      selectedYear !== "All Years" ||
      selectedLetter !== "All Letters" ||
      typeFilter !== "all";

    if (!hasFilters && isOriginalOrder) {
      return { filteredSermons: allSermons, hasActiveFilters: false };
    }

    const searchLower = searchText.toLowerCase();
    const filtered = allSermons.filter((sermon) => {
      const titleLower = sermon.title.toLowerCase();
      const matchesSearch = !searchText || titleLower.includes(searchLower);
      const matchesYear =
        selectedYear === "All Years" || sermon.year === selectedYear;
      const matchesLetter =
        selectedLetter === "All Letters" ||
        titleLower.startsWith(selectedLetter.toLowerCase());
      const matchesType = typeFilter === "all" || sermon.type === typeFilter;
      return matchesSearch && matchesYear && matchesLetter && matchesType;
    });

    let sorted;
    if (isOriginalOrder) {
      sorted = allSermons.filter((s) => filtered.some((f) => f.id === s.id));
    } else {
      sorted = [...filtered].sort((a, b) => {
        const comparison = a.title.trim().localeCompare(b.title.trim());
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    return { filteredSermons: sorted, hasActiveFilters: !!hasFilters };
  }, [allSermons, searchText, selectedYear, selectedLetter, typeFilter, sortOrder, isOriginalOrder]);

  // Type filter buttons — set typeFilter state and let applyFilters do the work.
  const filterOnlyText = useCallback(() => {
    setTypeFilter("text");
    setIsOriginalOrder(false);
    setSearchText("");
    setSearchResetKey((k) => k + 1);
    setSelectedYear("All Years");
    setSelectedLetter("All Letters");
  }, []);

  const filterOnlyAudio = useCallback(() => {
    setTypeFilter("mp3");
    setIsOriginalOrder(false);
    setSearchText("");
    setSearchResetKey((k) => k + 1);
    setSelectedYear("All Years");
    setSelectedLetter("All Letters");
  }, []);

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
    setTypeFilter("all");
    setSearchText("");
    setSearchResetKey((k) => k + 1);
    setSelectedYear("All Years");
    setSelectedLetter("All Letters");
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => {
      if (prev === "table") return "compact";
      return "table";
    });
  }, []);

  const restoreOriginalOrder = useCallback(() => {
    setIsOriginalOrder(true);
    setTypeFilter("all");
    setSearchText("");
    setSearchResetKey((k) => k + 1);
    setSelectedYear("All Years");
    setSelectedLetter("All Letters");
    setSortOrder("asc");
  }, []);

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
        key={searchResetKey}
        theme={theme}
        onSearchChange={setSearchText}
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
