import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
  StyleSheet,
} from "react-native";
import { useAppContext } from "../../../providers/SermonProvider";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { responsiveFontSize, spacing } from "../../../shared/utils/responsiveUtils";
import { GlassButton } from "../../../shared/components/GlassButton";
import DraggableFloatingButton from "../../../shared/components/FloatButton";
import type { Bookmark } from "../types";

const CARD_GAP = 12;

// ── Chunk array into pairs for 2-col grid ─────────────────────────────────
const pairUp = (arr: Bookmark[]): Bookmark[][] => {
  const rows: Bookmark[][] = [];
  for (let i = 0; i < arr.length; i += 2) {
    rows.push(arr.slice(i, i + 2));
  }
  return rows;
};

const BookmarksScreen = () => {
  const { theme, bookmarks, removeBookmark, setSelectedSermon } =
    useAppContext();
  const navigation = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = theme.dark;

  // ── Pair bookmarks into rows of 2 ──────────────────────────────────────
  const rows = useMemo(() => pairUp(bookmarks || []), [bookmarks]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleBookmarkPress = useCallback(
    (bookmark: Bookmark) => {
      setSelectedSermon(bookmark.sermon);
      navigation.navigate({ pathname: "/reader", params: {
        source: "bookmark",
        scrollToParagraph: bookmark.paragraphIndex,
      } });
    },
    [navigation, setSelectedSermon],
  );

  const handleDeleteBookmark = useCallback(
    (bookmark: Bookmark) => {
      Alert.alert(
        "Remove Bookmark",
        "Do you want to remove this bookmark from your collection?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () =>
              removeBookmark(bookmark.sermon, bookmark.paragraphIndex),
          },
        ],
      );
    },
    [removeBookmark],
  );

  // ── Colors ──────────────────────────────────────────────────────────────
  const cardBg = isDark
    ? "rgba(38, 29, 23, 0.94)"
    : "rgba(252, 246, 237, 0.98)";
  const cardBorder = isDark
    ? "rgba(242, 205, 180, 0.18)"
    : "rgba(93, 50, 17, 0.12)";
  const accentTagBg = isDark
    ? "rgba(242, 205, 180, 0.14)"
    : "rgba(93, 50, 17, 0.08)";
  const accentTagText = isDark ? "#f2cdb4" : "#5d3211";
  const titleColor = theme.colors.text;
  const snippetColor = isDark
    ? "rgba(242, 205, 180, 0.78)"
    : "rgba(93, 50, 17, 0.75)";
  const faintText = isDark
    ? "rgba(242, 205, 180, 0.45)"
    : "rgba(93, 50, 17, 0.45)";

  // ── Card component ──────────────────────────────────────────────────────
  const renderCard = useCallback(
    (item: Bookmark) => {
      const paragraphNum = (item.paragraphIndex ?? 0) + 1;
      const snippet = item.paragraphText
        ? item.paragraphText.replace(/^[\d\s\u00B6\u00A7.-]+/, "").trim()
        : null;

      return (
        <Pressable
          key={`${item.sermon?.id}-${item.paragraphIndex}`}
          onPress={() => handleBookmarkPress(item)}
          onLongPress={() => handleDeleteBookmark(item)}
          delayLongPress={450}
          android_ripple={{
            color: isDark ? "rgba(242,205,180,0.12)" : "rgba(93,50,17,0.08)",
          }}
          style={({ pressed }) => [
            styles.card,
            {
              backgroundColor: cardBg,
              borderColor: cardBorder,
              shadowColor: isDark ? "#000000" : "#5d3211",
              shadowOpacity: pressed ? 0.22 : 0.1,
              shadowRadius: pressed ? 4 : 12,
              shadowOffset: { width: 0, height: pressed ? 2 : 5 },
              elevation: pressed ? 3 : 6,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
        >
          {/* Header Row: Paragraph Pill & Bookmark Ribbon Tag */}
          <View style={styles.cardHeaderRow}>
            <View style={[styles.paraPill, { backgroundColor: accentTagBg }]}>
              <Text style={[styles.paraPillText, { color: accentTagText }]}>
                ¶ {paragraphNum}
              </Text>
            </View>

            {/* Bookmark Tag Badge */}
            <View style={styles.ribbonBadge}>
              <Ionicons name="bookmark" size={13} color="#d32f2f" />
            </View>
          </View>

          {/* Sermon Title */}
          <Text
            style={[styles.cardTitle, { color: titleColor }]}
            numberOfLines={2}
          >
            {item.sermon?.title || "Untitled Sermon"}
          </Text>

          {/* Paragraph Excerpt Preview (if available) */}
          {snippet ? (
            <Text style={[styles.snippetText, { color: snippetColor }]} numberOfLines={3}>
              &quot;{snippet}&quot;
            </Text>
          ) : (
            <Text style={[styles.dateSub, { color: faintText }]} numberOfLines={1}>
              {item.sermon?.date || "Sermon Bookmark"}
            </Text>
          )}

          {/* Footer Date */}
          <View style={styles.cardFooter}>
            <Feather name="clock" size={10} color={faintText} style={{ marginRight: 4 }} />
            <Text style={[styles.cardDateText, { color: faintText }]} numberOfLines={1}>
              {new Date(item.date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
        </Pressable>
      );
    },
    [
      isDark,
      cardBg,
      cardBorder,
      accentTagBg,
      accentTagText,
      titleColor,
      snippetColor,
      faintText,
      handleBookmarkPress,
      handleDeleteBookmark,
    ],
  );

  // ── Row of 2 cards ──────────────────────────────────────────────────────
  const renderRow = useCallback(
    ({ item: pair }: { item: Bookmark[] }) => (
      <View style={styles.cardRow}>
        {pair.map((bm: Bookmark) => renderCard(bm))}
        {pair.length === 1 && <View style={styles.cardPlaceholder} />}
      </View>
    ),
    [renderCard],
  );

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top + 8,
        },
      ]}
    >
      {/* Background glow accents */}
      <View
        pointerEvents="none"
        style={[
          styles.bgGlowLarge,
          {
            backgroundColor: isDark
              ? "rgba(242,205,180,0.08)"
              : "rgba(93,50,17,0.05)",
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.bgGlowSmall,
          {
            backgroundColor: isDark
              ? "rgba(213,122,62,0.07)"
              : "rgba(93,50,17,0.03)",
          },
        ]}
      />

      <DraggableFloatingButton />

      {/* Header */}
      <View style={styles.header}>
        <GlassButton theme={theme} onPress={() => navigation.back()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </GlassButton>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Bookmarks
        </Text>
        {bookmarks && bookmarks.length > 0 && (
          <View style={[styles.countBadge, { backgroundColor: accentTagBg }]}>
            <Text style={[styles.countText, { color: accentTagText }]}>
              {bookmarks.length}
            </Text>
          </View>
        )}
      </View>

      {/* Empty State vs Bookmark Grid */}
      {!bookmarks || bookmarks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View
            style={[
              styles.emptyIconCircle,
              {
                backgroundColor: isDark
                  ? "rgba(242,205,180,0.08)"
                  : "rgba(93,50,17,0.06)",
                borderColor: cardBorder,
              },
            ]}
          >
            <Ionicons
              name="bookmark-outline"
              size={36}
              color={isDark ? "#f2cdb4" : "#5d3211"}
            />
          </View>
          <Text
            style={[
              styles.emptyTitle,
              { color: isDark ? theme.colors.text : "#5d3211" },
            ]}
          >
            No Bookmarks Saved
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              { color: isDark ? "rgba(242,205,180,0.6)" : "rgba(93,50,17,0.6)" },
            ]}
          >
            Tap or long-press any sermon paragraph while reading to save your favorite passages here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          renderItem={renderRow}
          keyExtractor={(pair: Bookmark[], index: number) =>
            pair.map((b: Bookmark) => `${b.sermon?.id}-${b.paragraphIndex}`).join("|") +
            index
          }
          contentContainerStyle={{
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.lg + insets.bottom + 20,
          }}
          initialNumToRender={10}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  headerTitle: {
    fontSize: responsiveFontSize(26),
    fontFamily: "Philosopher",
    letterSpacing: 0.3,
    flex: 1,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  countText: {
    fontFamily: "Philosopher",
    fontSize: responsiveFontSize(13),
  },

  // ── Background glows ──────────────────────────────────────────────────
  bgGlowLarge: {
    position: "absolute",
    top: 90,
    right: -55,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  bgGlowSmall: {
    position: "absolute",
    top: 340,
    left: -45,
    width: 160,
    height: 160,
    borderRadius: 80,
  },

  // ── Card grid ─────────────────────────────────────────────────────────
  cardRow: {
    flexDirection: "row",
    gap: CARD_GAP,
    paddingVertical: 6,
  },
  card: {
    flex: 1,
    minHeight: 145,
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  cardPlaceholder: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  paraPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  paraPillText: {
    fontFamily: "Philosopher",
    fontSize: responsiveFontSize(11.5),
  },
  ribbonBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(229, 57, 53, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: responsiveFontSize(14.5),
    lineHeight: responsiveFontSize(19),
    fontFamily: "Philosopher",
    marginBottom: 6,
  },
  snippetText: {
    fontSize: responsiveFontSize(11.5),
    lineHeight: responsiveFontSize(16),
    fontFamily: "Merriweather",
    fontStyle: "italic",
    marginBottom: 8,
  },
  dateSub: {
    fontSize: responsiveFontSize(11),
    fontFamily: "Philosopher",
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "auto",
    paddingTop: 4,
  },
  cardDateText: {
    fontSize: responsiveFontSize(10),
    fontFamily: "Philosopher",
  },

  // ── Empty state ───────────────────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: -40,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: responsiveFontSize(20),
    fontFamily: "Philosopher",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: responsiveFontSize(13),
    fontFamily: "Merriweather",
    textAlign: "center",
    lineHeight: responsiveFontSize(19),
  },
});

export default BookmarksScreen;
