import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Platform,
  Text,
  Alert,
  ToastAndroid,
  Pressable,
} from "react-native";
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
  const {
    setSelectedSermon,
    allSermons,
    theme,
    loading,
    settings,
    updateSettings,
  } = useAppContext();

  const [searchText, setSearchText] = useState("");
  const [searchResetKey, setSearchResetKey] = useState(0);
  const [sortOrder, setSortOrder] = useState("asc");
  const [isOriginalOrder, setIsOriginalOrder] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all"); // "all", "text", "mp3"

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

  const sermonCounts = useMemo(
    () => ({
      total: allSermons.length,
      text: allSermons.filter((sermon) => sermon.type === "text").length,
      audio: allSermons.filter((sermon) => sermon.type === "mp3").length,
    }),
    [allSermons],
  );
  const hasViewChanges = hasActiveFilters || !isOriginalOrder;

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

  const handleToggleTheme = useCallback(() => {
    updateSettings({ darkMode: !settings.darkMode });
  }, [settings.darkMode, updateSettings]);

  const restoreOriginalOrder = useCallback(() => {
    setIsOriginalOrder(false);
    setTypeFilter("all");
    setSearchText("");
    setSearchResetKey((k) => k + 1);
    setSortOrder("asc");
  }, []);

  const removeTypeFilter = useCallback(() => {
    setTypeFilter("all");
  }, []);

  const removeSearchFilter = useCallback(() => {
    setSearchText("");
    setSearchResetKey((k) => k + 1);
  }, []);

  // Memoized components
  const listHeaderComponent = useMemo(() => {
    const activeTypeLabel =
      typeFilter === "text"
        ? "Text only"
        : typeFilter === "mp3"
          ? "Audio only"
          : null;
    const sortLabel = isOriginalOrder
      ? "Newest first"
      : sortOrder === "asc"
        ? "A-Z"
        : "Z-A";

    return (
      <View
        style={[
          styles.headerContainer,
          {
            borderBottomColor: theme.dark
              ? "rgba(242,205,180,0.10)"
              : "rgba(93,50,17,0.12)",
          },
        ]}
      >
        <View style={styles.summaryRow} />

       
      </View>
    );
  }, [
    filteredSermons.length,
    sermonCounts,
    typeFilter,
    searchText,
    isOriginalOrder,
    sortOrder,
    hasViewChanges,
    theme,
    restoreOriginalOrder,
    removeTypeFilter,
    removeSearchFilter,
  ]);

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
        hasActiveFilters={hasViewChanges}
        onToggleTheme={handleToggleTheme}
        sermonCounts={sermonCounts}
      />

      <SearchHeader
        key={searchResetKey}
        theme={theme}
        onSearchChange={setSearchText}
      />

      {loading ? (
        <SkeletonLoader theme={theme} count={30} />
      ) : (
        <SermonListView
          theme={theme}
          filteredSermons={filteredSermons}
          handleSermonClick={handleSermonClick}
          listHeaderComponent={listHeaderComponent}
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
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 12,
  },
  summaryLabel: {
    fontFamily: "ZillaSlab-SemiBold",
    fontSize: 15,
  },
  summaryMeta: {
        fontFamily: "ZillaSlab-SemiBold",
    fontSize: 13,
    // fontWeight:"700",
    marginTop: 3,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
    maxWidth: "100%",
  },
  filterChipText: {
    fontFamily: "ZillaSlab",
    fontSize: 12.5,
  },
  resetChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resetChipText: {
    fontFamily: "ZillaSlab-SemiBold",
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 16,
    paddingTop: 10,
  },
});

export default SermonList;
