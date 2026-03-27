import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
  StyleSheet,
} from "react-native";
import { useAppContext } from "../../Logic/globalState";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { responsiveFontSize, spacing } from "../../Utils/responsiveUtils";
import { GlassButton } from "../../styles/glassButton";
import DraggableFloatingButton from "../../components/FloatButton";

const CARD_GAP = 10;

// ── Chunk array into pairs for 2-col grid ─────────────────────────────────
const pairUp = (arr) => {
  const rows = [];
  for (let i = 0; i < arr.length; i += 2) {
    rows.push(arr.slice(i, i + 2));
  }
  return rows;
};

const BookmarksScreen = () => {
  const { theme, bookmarks, removeBookmark, setSelectedSermon } =
    useAppContext();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isDark = theme.dark;

  // ── Pair bookmarks into rows of 2 ──────────────────────────────────────
  const rows = useMemo(() => pairUp(bookmarks), [bookmarks]);

  // ── Handlers (unchanged logic) ──────────────────────────────────────────
  const handleBookmarkPress = useCallback(
    (bookmark) => {
      setSelectedSermon(bookmark.sermon);
      navigation.navigate("currentsermon", {
        source: "bookmark",
        scrollToParagraph: bookmark.paragraphIndex,
      });
    },
    [navigation, setSelectedSermon],
  );

  const handleDeleteBookmark = useCallback(
    (bookmark) => {
      Alert.alert(
        "Delete Bookmark",
        "Are you sure you want to delete this bookmark?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
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
  const cardBg = isDark ? "rgba(33,22,14,0.92)" : "#fae7bcff";
  const cardBorder = isDark
    ? "rgba(242,205,180,0.18)"
    : "rgba(93,50,17,0.12)";
  const subtleText = isDark ? `${theme.colors.text}a0` : "#5d3211a0";
  const faintText = isDark ? `${theme.colors.text}70` : "#5d321180";

  // ── Card component ──────────────────────────────────────────────────────
  const renderCard = useCallback(
    (item) => (
      <Pressable
        key={`${item.sermon?.id}-${item.paragraphIndex}`}
        onPress={() => handleBookmarkPress(item)}
        onLongPress={() => handleDeleteBookmark(item)}
        delayLongPress={500}
        android_ripple={{
          color: isDark
            ? "rgba(242,205,180,0.12)"
            : "rgba(93,50,17,0.08)",
        }}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: cardBg,
            borderColor: cardBorder,
            shadowColor: isDark ? "#000" : "#5d3211",
            shadowOpacity: pressed ? 0.18 : 0.1,
            shadowRadius: pressed ? 3 : 8,
            shadowOffset: { width: 0, height: pressed ? 1 : 4 },
            elevation: pressed ? 2 : 5,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          },
        ]}
      >
        {/* Red bookmark ribbon */}
        <View style={styles.ribbon} />

        <Text
          style={[styles.title, { color: theme.colors.text }]}
          numberOfLines={2}
        >
          {item.sermon?.title}
        </Text>

        <Text style={[styles.preview, { color: subtleText }]} numberOfLines={3}>
          ¶ {item.paragraphIndex + 1} · {item.sermon?.date || "sermon"}
        </Text>

        <Text style={[styles.dateText, { color: faintText }]} numberOfLines={1}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </Pressable>
    ),
    [
      theme,
      isDark,
      cardBg,
      cardBorder,
      subtleText,
      faintText,
      handleBookmarkPress,
      handleDeleteBookmark,
    ],
  );

  // ── Row of 2 cards ──────────────────────────────────────────────────────
  const renderRow = useCallback(
    ({ item: pair }) => (
      <View style={styles.cardRow}>
        {pair.map((bm) => renderCard(bm))}
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
      {/* Background glows */}
      <View
        pointerEvents="none"
        style={[
          styles.bgGlowLarge,
          {
            backgroundColor: isDark
              ? "rgba(242,205,180,0.09)"
              : "rgba(93,50,17,0.06)",
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.bgGlowSmall,
          {
            backgroundColor: isDark
              ? "rgba(213,122,62,0.08)"
              : "rgba(93,50,17,0.04)",
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.bgPatternPill,
          {
            backgroundColor: isDark
              ? "rgba(242,205,180,0.05)"
              : "rgba(93,50,17,0.035)",
          },
        ]}
      />

      <DraggableFloatingButton />

      {/* Header */}
      <View style={styles.header}>
        <GlassButton theme={theme} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </GlassButton>
        <Text
          style={{
            fontSize: responsiveFontSize(22),
            fontFamily: "ZillaSlabsm",
            color: theme.colors.text,
            flex: 1,
          }}
        >
          Bookmarks
        </Text>
        {bookmarks.length > 0 && (
          <Text
            style={{
              fontSize: responsiveFontSize(12),
              fontFamily: "Merriweather",
              color: faintText,
            }}
          >
            {bookmarks.length}
          </Text>
        )}
      </View>

      {bookmarks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="bookmark-outline"
            size={responsiveFontSize(50)}
            color={isDark ? "rgba(242,205,180,0.3)" : "rgba(93,50,17,0.3)"}
          />
          <Text
            style={{
              color: isDark ? theme.colors.text + "80" : "#5d3211",
              fontSize: responsiveFontSize(16),
              fontFamily: "ZillaSlab_smb",
              marginTop: spacing.md,
            }}
          >
            No bookmarks yet
          </Text>
          <Text
            style={{
              color: isDark ? theme.colors.text + "60" : "#5d321190",
              fontSize: responsiveFontSize(13),
              fontFamily: "serif",
              textAlign: "center",
              marginTop: spacing.xs,
            }}
          >
            Save a paragraph and it will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          renderItem={renderRow}
          keyExtractor={(pair, index) =>
            pair.map((b) => `${b.sermon?.id}-${b.paragraphIndex}`).join("|") +
            index
          }
          contentContainerStyle={{
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.lg + insets.bottom,
          }}
          initialNumToRender={10}
          keyboardShouldPersistTaps="handled"
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
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Background glows ──────────────────────────────────────────────────
  bgGlowLarge: {
    position: "absolute",
    top: 90,
    right: -55,
    width: 190,
    height: 190,
    borderRadius: 95,
  },
  bgGlowSmall: {
    position: "absolute",
    top: 330,
    left: -45,
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  bgPatternPill: {
    position: "absolute",
    bottom: 120,
    right: -36,
    width: 190,
    height: 88,
    borderRadius: 44,
    transform: [{ rotate: "-14deg" }],
  },

  // ── Card grid ─────────────────────────────────────────────────────────
  cardRow: {
    flexDirection: "row",
    gap: CARD_GAP,
    paddingVertical: 5,
  },
  card: {
    flex: 1,
    minHeight: 130,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingTop: 28,
    paddingBottom: 10,
    overflow: "hidden",
  },
  cardPlaceholder: {
    flex: 1,
  },
  ribbon: {
    position: "absolute",
    top: -1,
    right: 14,
    width: 14,
    height: 22,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: "#e95a5a",
  },
  title: {
    fontSize: responsiveFontSize(14),
    lineHeight: responsiveFontSize(19),
    fontFamily: "Merriweather",
    marginBottom: 4,
    // fontWeight:"900"
  },
  preview: {
    fontSize: responsiveFontSize(11.5),
    lineHeight: responsiveFontSize(16),
    fontFamily: "Merriweather",
    marginBottom: 6,
  },
  dateText: {
    marginTop: "auto",
    fontSize: responsiveFontSize(10.5),
    fontFamily: "Merriweather",
  },
});

export default BookmarksScreen;
