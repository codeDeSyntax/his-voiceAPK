import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAppContext } from "../../../providers/SermonProvider";
import { getSermonsByType } from "../data/sermonDB";
import type { Sermon, TextSermonPlaylistProps } from "../types";

const TextSermonPlaylist = ({
  visible,
  onClose,
  currentSermon,
  onSermonSelect,
}: TextSermonPlaylistProps) => {
  const { theme } = useAppContext();
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<React.ElementRef<typeof TextInput> | null>(null);

  const isDark = theme.dark;
  const textColor = theme.colors.text;
  const accentColor = isDark ? "#efb78f" : "#995323";

  useEffect(() => {
    if (!visible) return;
    let active = true;
    Promise.resolve().then(() => {
      if (active) setLoading(true);
    });
    getSermonsByType("text")
      .then((items) => {
        if (!active) return;
        setSermons(items);
      })
      .catch((error) => console.error("Error loading text sermons:", error))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [visible]);

  const filteredSermons = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return sermons;
    return sermons.filter((sermon) =>
        [sermon.title, sermon.location, sermon.date, sermon.year]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalized)),
    );
  }, [query, sermons]);

  const handleSelect = useCallback(
    (sermon: Sermon) => {
      onSermonSelect(sermon);
      onClose();
    },
    [onClose, onSermonSelect],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Sermon; index: number }) => {
      const selected = item.id === currentSermon?.id;
      return (
        <Pressable
          onPress={() => handleSelect(item)}
          style={({ pressed }) => [
            styles.row,
            {
              backgroundColor: pressed
                ? isDark
                  ? "rgba(242,205,180,0.12)"
                  : "rgba(93,50,17,0.10)"
                : selected
                  ? isDark
                    ? "rgba(242,205,180,0.07)"
                    : "rgba(93,50,17,0.06)"
                  : index % 2 === 0
                    ? isDark
                      ? "rgba(242,205,180,0.025)"
                      : "rgba(93,50,17,0.025)"
                    : "transparent",
              borderLeftColor: selected ? accentColor : "transparent",
            },
          ]}
        >
          <View style={[styles.icon, { backgroundColor: isDark ? "rgba(242,205,180,0.10)" : "rgba(93,50,17,0.08)" }]}>
            <Ionicons name="document-text-outline" size={20} color={accentColor} />
          </View>
          <View style={styles.body}>
            <Text numberOfLines={1} style={[styles.title, { color: textColor }]}>
              {item.title}
            </Text>
            <Text numberOfLines={1} style={[styles.meta, { color: isDark ? `${textColor}70` : "#5d321180" }]}>
              {item.date || item.year || "Unknown date"}
              {item.location ? `  •  ${item.location}` : ""}
            </Text>
          </View>
          <Ionicons
            name={selected ? "checkmark-circle" : "chevron-forward"}
            size={selected ? 22 : 16}
            color={selected ? accentColor : isDark ? `${textColor}45` : "#5d321155"}
          />
        </Pressable>
      );
    },
    [accentColor, currentSermon?.id, handleSelect, isDark, textColor],
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton} hitSlop={12}>
            <Ionicons name="close" size={27} color={textColor} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: textColor }]}>Text Sermons</Text>
            <Text style={[styles.headerSubtitle, { color: isDark ? `${textColor}80` : "#5d3211" }]}>
              Choose a message to read
            </Text>
          </View>
          <View style={styles.closeButton} />
        </View>
        <View style={[styles.search, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(93,50,17,0.06)" }]}>
          <MaterialIcons name="search" size={19} color={isDark ? `${textColor}70` : "#5d321180"} />
          <TextInput
            ref={searchRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search sermons..."
            placeholderTextColor={isDark ? `${textColor}55` : "#5d321166"}
            style={[styles.searchInput, { color: textColor }]}
            autoCorrect={false}
          />
          {query ? <Pressable onPress={() => setQuery("")}><Ionicons name="close-circle" size={18} color={isDark ? `${textColor}70` : "#5d321180"} /></Pressable> : null}
        </View>
        {loading ? (
          <View style={styles.loading}><ActivityIndicator color={accentColor} /></View>
        ) : (
          <FlatList
            data={filteredSermons}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={[styles.empty, { color: isDark ? `${textColor}70` : "#5d321180" }]}>No text sermons found</Text>}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  closeButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontFamily: "Philosopher", fontSize: 18, letterSpacing: 0.3 },
  headerSubtitle: { fontFamily: "Philosopher", fontSize: 11, letterSpacing: 0.5, marginTop: 2 },
  search: { flexDirection: "row", alignItems: "center", height: 46, borderRadius: 24, marginHorizontal: 16, marginBottom: 10, paddingHorizontal: 14, gap: 8 },
  searchInput: { flex: 1, fontFamily: "ZillaSlab", fontSize: 14 },
  list: { paddingBottom: 24 },
  row: { flexDirection: "row", alignItems: "center", minHeight: 58, paddingVertical: 8, paddingHorizontal: 16, gap: 10, borderLeftWidth: 2 },
  icon: { width: 32, height: 34, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  body: { flex: 1, minWidth: 0 },
  title: { fontFamily: "Merriweather", fontSize: 13.5, lineHeight: 18 },
  meta: { fontFamily: "ZillaSlab", fontSize: 11, marginTop: 2 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { textAlign: "center", fontFamily: "ZillaSlab", fontSize: 15, paddingTop: 60 },
});

export default TextSermonPlaylist;
