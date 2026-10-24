import React, { useState, useMemo, useCallback } from "react";
import { Keyboard, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAppContext } from "../../../providers/SermonProvider";
import SearchHeader from "../components/SearchHeader";
import SermonListView from "../components/SermonListView";
import SermonViewOptions from "../components/SermonViewOptions";
import SkeletonLoader from "../../../shared/components/SkeletonLoader";
import ListAppBar from "../components/AppBar";
import DraggableFloatingButton from "../../../shared/components/FloatButton";
import type { Sermon, SermonSortOrder, SermonTypeFilter } from "../types";

const SermonList = React.memo(() => {
  const router = useRouter();
  const { setSelectedSermon, allSermons, theme, loading, settings, updateSettings, recentSermons } = useAppContext();
  const [searchText, setSearchText] = useState("");
  const [searchResetKey, setSearchResetKey] = useState(0);
  const [sortOrder, setSortOrder] = useState<SermonSortOrder>("asc");
  const [typeFilter, setTypeFilter] = useState<SermonTypeFilter>("all");
  const [viewOptionsVisible, setViewOptionsVisible] = useState(false);
  const lastReadId = recentSermons[0]?.id ?? null;
  const filteredSermons = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    const result = allSermons.filter((sermon) =>
      (typeFilter === "all" || sermon.type === typeFilter) &&
      (!query || sermon.title.toLowerCase().includes(query) ||
        sermon.date?.toLowerCase().includes(query) || sermon.year?.toLowerCase().includes(query)),
    ).sort((a, b) => {
      const comparison = a.title.trim().localeCompare(b.title.trim());
      return sortOrder === "asc" ? comparison : -comparison;
    });
    const pinnedIndex = result.findIndex((sermon) => sermon.id === lastReadId);
    if (pinnedIndex > 0) result.unshift(...result.splice(pinnedIndex, 1));
    return result;
  }, [allSermons, searchText, typeFilter, sortOrder, lastReadId]);
  const handleSermonClick = useCallback((sermon: Sermon) => {
    setSelectedSermon(sermon);
    router.navigate("/reader");
  }, [setSelectedSermon, router]);
  const toggleTheme = useCallback(() => {
    updateSettings({ darkMode: !settings.darkMode });
  }, [settings.darkMode, updateSettings]);
  const resetView = () => {
    setSearchText("");
    setSearchResetKey((key) => key + 1);
    setTypeFilter("all");
    setSortOrder("asc");
  };
  const changed = Boolean(searchText) || typeFilter !== "all" || sortOrder !== "asc";
  const openViewOptions = useCallback(() => {
    Keyboard.dismiss();
    setViewOptionsVisible(true);
  }, []);
  const typeSummary = typeFilter === "all" ? "All types" : typeFilter === "text" ? "Text only" : "Audio only";

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <DraggableFloatingButton />
      <ListAppBar theme={theme} onToggleTheme={toggleTheme} totalCount={allSermons.length} visibleCount={filteredSermons.length} loading={loading} />
      <SearchHeader
        key={searchResetKey}
        theme={theme}
        onSearchChange={setSearchText}
        onOpenViewOptions={openViewOptions}
        hasActiveViewOptions={typeFilter !== "all" || sortOrder !== "asc"}
        viewOptionsVisible={viewOptionsVisible}
        viewOptionsSummary={`${typeSummary}, ${sortOrder === "asc" ? "A to Z" : "Z to A"}`}
      />
      <SermonViewOptions
        theme={theme}
        visible={viewOptionsVisible}
        onClose={() => setViewOptionsVisible(false)}
        typeFilter={typeFilter}
        sortOrder={sortOrder}
        onTypeFilterChange={setTypeFilter}
        onSortOrderChange={setSortOrder}
        onReset={resetView}
        hasChanges={changed}
      />
      {loading ? <SkeletonLoader theme={theme} count={12} /> : (
        <SermonListView theme={theme} filteredSermons={filteredSermons} handleSermonClick={handleSermonClick} lastReadId={lastReadId} />
      )}
    </View>
  );
});
SermonList.displayName = "SermonList";
const styles = StyleSheet.create({
  container: { flex: 1 },
});
export default SermonList;
