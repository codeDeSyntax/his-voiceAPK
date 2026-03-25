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
import SkeletonLoader from "../../components/SkeletonLoader";
import { StyleSheet } from "react-native";
import ListAppBar from "../../components/AppBar";
import { useNavigation } from "@react-navigation/native";
import DraggableFloatingButton from "../../components/FloatButton";

const SermonList = React.memo(() => {
  const navigation = useNavigation();
  const { setSelectedSermon, allSermons, theme, loading, settings, updateSettings } = useAppContext();

  const [searchText, setSearchText] = useState("");
  const [searchResetKey, setSearchResetKey] = useState(0);
  const [sortOrder, setSortOrder] = useState("asc");
  const [isOriginalOrder, setIsOriginalOrder] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all"); // "all", "text", "mp3"
  const [viewMode, setViewMode] = useState("compact"); // "table", "compact"

  // Derive filtered sermons synchronously — no useState/useEffect double-render.
  const { filteredSermons, hasActiveFilters } = useMemo(() => {
    const hasFilters = searchText || typeFilter !== "all";

    if (!hasFilters && isOriginalOrder) {
      return { filteredSermons: allSermons, hasActiveFilters: false };
    }

    const searchLower = searchText.toLowerCase();
    const filtered = allSermons.filter((sermon) => {
      const titleLower = sermon.title.toLowerCase();
      const matchesSearch =
        !searchText ||
        titleLower.includes(searchLower) ||
        (sermon.date && sermon.date.toLowerCase().includes(searchLower)) ||
        (sermon.year && sermon.year.includes(searchText));
      const matchesType = typeFilter === "all" || sermon.type === typeFilter;
      return matchesSearch && matchesType;
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
  }, [allSermons, searchText, typeFilter, sortOrder, isOriginalOrder]);

  // Type filter buttons — set typeFilter state and let applyFilters do the work.
  const filterOnlyText = useCallback(() => {
    setTypeFilter("text");
    setIsOriginalOrder(false);
    setSearchText("");
    setSearchResetKey((k) => k + 1);
  }, []);

  const filterOnlyAudio = useCallback(() => {
    setTypeFilter("mp3");
    setIsOriginalOrder(false);
    setSearchText("");
    setSearchResetKey((k) => k + 1);
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

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    setIsOriginalOrder(false);
    setTypeFilter("all");
    setSearchText("");
    setSearchResetKey((k) => k + 1);
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => {
      if (prev === "table") return "compact";
      return "table";
    });
  }, []);

  const handleToggleTheme = useCallback(() => {
    updateSettings({ darkMode: !settings.darkMode });
  }, [settings.darkMode, updateSettings]);

  const restoreOriginalOrder = useCallback(() => {
    setIsOriginalOrder(true);
    setTypeFilter("all");
    setSearchText("");
    setSearchResetKey((k) => k + 1);
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
        filterOnlyText={filterOnlyText}
        filterOnlyAudio={filterOnlyAudio}
        toggleSortOrder={toggleSortOrder}
        restoreOriginalOrder={restoreOriginalOrder}
        isOriginalOrder={isOriginalOrder}
        hasActiveFilters={hasActiveFilters}
        onToggleTheme={handleToggleTheme}
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
