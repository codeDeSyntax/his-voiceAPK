import React, { useCallback } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Sermon, SermonListViewProps, SermonRowProps } from "../types";

const SermonRow = React.memo(({ item, theme, lastRead, onPress }: SermonRowProps) => {
  const ink = theme.dark ? "#fae7da" : theme.colors.text;
  const muted = theme.dark ? "#bba99b" : "#85684e";
  const accent = theme.dark ? "#efb78f" : "#995323";
  const tint = theme.dark ? "rgba(239,183,143,0.09)" : "rgba(153,83,35,0.065)";
  const audio = item.type === "mp3";
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${item.title}, ${audio ? "audio" : "text"}, ${item.date || "unknown date"}${item.location ? `, ${item.location}` : ""}${lastRead ? ", last read" : ""}`}
      onPress={() => onPress(item)}
      style={({ pressed }) => [styles.row, { backgroundColor: pressed || lastRead ? tint : "transparent" }]}>
      <View style={[styles.icon, { backgroundColor: tint }]}>
        <Ionicons name={audio ? "headset-outline" : "document-text-outline"} size={19} color={accent} />
      </View>
      <View style={styles.body}>
        <Text numberOfLines={1} style={[styles.title, { color: ink }]}>{item.title}</Text>
        <View style={styles.metadata}>
          <Text numberOfLines={1} style={[styles.date, { color: muted }]}>{item.date || "Unknown date"}</Text>
          {lastRead ? (
            <View style={styles.lastRead}>
              <View style={[styles.dot, { backgroundColor: accent }]} />
              <Text numberOfLines={1} style={[styles.meta, { color: accent }]}>Last read</Text>
            </View>
          ) : item.location ? (
            <Text numberOfLines={1} style={[styles.location, styles.meta, { color: muted }]}>· {item.location}</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.trailing}>
        <Text style={[styles.type, { color: muted }]}>{audio ? "AUDIO" : "TEXT"}</Text>
        <Ionicons name="chevron-forward" size={13} color={muted} />
      </View>
    </Pressable>
  );
});
SermonRow.displayName = "SermonRow";

const SermonListView = React.memo(({ theme, filteredSermons, handleSermonClick, listHeaderComponent, lastReadId }: SermonListViewProps) => {
  const renderItem = useCallback(({ item }: { item: Sermon }) => (
    <SermonRow item={item} theme={theme} lastRead={item.id === lastReadId} onPress={handleSermonClick} />
  ), [theme, lastReadId, handleSermonClick]);
  const separator = useCallback(() => (
    <View style={[styles.separator, { backgroundColor: theme.dark ? "rgba(242,205,180,0.10)" : "rgba(93,50,17,0.10)" }]} />
  ), [theme.dark]);
  return (
    <FlatList
      style={styles.list}
      data={filteredSermons}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      ItemSeparatorComponent={separator}
      ListHeaderComponent={listHeaderComponent ?? undefined}
      contentContainerStyle={styles.content}
      initialNumToRender={15}
      maxToRenderPerBatch={10}
      windowSize={21}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={30} color={theme.dark ? "#bba99b" : "#85684e"} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No sermons found</Text>
          <Text style={[styles.emptyHint, { color: theme.dark ? "#bba99b" : "#85684e" }]}>Try another title, date, or filter.</Text>
        </View>
      }
    />
  );
});
SermonListView.displayName = "SermonListView";
const styles = StyleSheet.create({
  list: { flex: 1 },
  content: { paddingTop: 2, paddingBottom: 100 },
  row: { flexDirection: "row", alignItems: "center", minHeight: 56, paddingVertical: 7, paddingHorizontal: 16, gap: 9 },
  icon: { width: 30, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  body: { flex: 1, minWidth: 0 },
  title: { fontFamily: "Merriweather", fontSize: 13.5, lineHeight: 18, letterSpacing: -0.15 },
  metadata: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  meta: { fontFamily: "ZillaSlab", fontSize: 11 },
  date: { fontFamily: "ZillaSlab", fontSize: 11, flexShrink: 1 },
  location: { flexShrink: 1 },
  lastRead: { flexDirection: "row", alignItems: "center", gap: 3, flexShrink: 1 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  trailing: { alignItems: "flex-end", gap: 3 },
  type: { fontFamily: "ZillaSlab-SemiBold", fontSize: 8, letterSpacing: 0.7 },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 55, marginRight: 16 },
  empty: { paddingHorizontal: 24, paddingVertical: 48, alignItems: "center", gap: 9 },
  emptyTitle: { fontFamily: "ZillaSlab-SemiBold", fontSize: 19 },
  emptyHint: { fontFamily: "ZillaSlab", fontSize: 14, textAlign: "center" },
});
export default SermonListView;
