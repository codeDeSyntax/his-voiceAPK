/**
 * ParagraphPickerSheet
 *
 * Compact floating sheet with a horizontal paragraph-number scroller.
 * Tap a number to bookmark or pick a highlight colour.
 *
 * Performance notes
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * â€¢ `bookmarkedSet` and `hlHexMap` are pre-computed by parent useMemo so
 *   each `CircleItem` receives only primitive/stable props and can be wrapped
 *   in React.memo â€” only the touched circle re-renders when state changes.
 * â€¢ `getItemLayout` gives FlatList exact metrics; no layout measurement needed.
 * â€¢ `scrollToOffset` is used instead of `scrollToIndex` to avoid the async
 *   measurement cycle that can cause a visible delay.
 * â€¢ `maxToRenderPerBatch` and `windowSize` are tuned for a horizontal strip
 *   where items are small and the viewport shows ~7â€“8 at once.
 */
import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  memo,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useAppContext } from "../../Logic/globalState";

const CIRCLE = 52;
const CIRCLE_GAP = 8;
const ITEM_W = CIRCLE + CIRCLE_GAP;

const COLORS = [
  { name: "yellow", light: "#F59E0B", dark: "#FCD34D" },
  { name: "green", light: "#059669", dark: "#34D399" },
  { name: "brown", light: "#8B4513", dark: "#D2B48C" },
  { name: "purple", light: "#7C3AED", dark: "#C084FC" },
  { name: "pink", light: "#DB2777", dark: "#F472B6" },
  { name: "orange", light: "#EA580C", dark: "#FB923C" },
];

// â”€â”€â”€ Memoized circle â€” only re-renders when its own props change â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CircleItem = memo(
  ({
    index,
    isCurrent,
    isSelected,
    bookmarked,
    hlHex,
    accent,
    subtle,
    isDark,
    onPress,
    mode,
  }) => {
    const ringColor = isSelected
      ? accent
      : hlHex
        ? hlHex
        : bookmarked
          ? accent
          : isCurrent
            ? accent
            : null;

    const bgColor = isSelected
      ? isDark
        ? "rgba(240,179,139,0.2)"
        : "rgba(122,59,16,0.12)"
      : isCurrent
        ? isDark
          ? "rgba(240,179,139,0.1)"
          : "rgba(122,59,16,0.07)"
        : isDark
          ? "rgba(242,205,180,0.05)"
          : "rgba(93,50,17,0.04)";

    const numColor =
      isSelected || isCurrent || bookmarked || hlHex ? accent : subtle;

    return (
      <TouchableOpacity
        onPress={() => onPress(index)}
        activeOpacity={0.6}
        style={[
          s.circle,
          {
            backgroundColor: bgColor,
            borderColor: ringColor ?? "transparent",
            borderWidth: ringColor ? 2 : 1,
          },
        ]}
      >
        <Text style={[s.circleNum, { color: numColor }]}>{index + 1}</Text>

        {mode === "bookmark" && bookmarked && (
          <View style={[s.badge, { backgroundColor: accent }]} />
        )}
        {mode === "highlight" && hlHex && (
          <View style={[s.badge, { backgroundColor: hlHex }]} />
        )}
      </TouchableOpacity>
    );
  },
);
CircleItem.displayName = "CircleItem";

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ParagraphPickerSheet = ({
  visible,
  mode,
  paragraphs,
  currentParagraphIndex,
  selectedSermon,
  theme,
  onClose,
}) => {
  const {
    addBookmark,
    removeBookmark,
    bookmarks,
    addHighlight,
    removeHighlight,
    highlights,
  } = useAppContext();

  // Ref mirrors state so color-select callbacks never capture a stale index
  const selectedIndexRef = useRef(null);
  const [selectedIndex, _setSelectedIndex] = useState(null);
  const setSelectedIndex = useCallback((v) => {
    selectedIndexRef.current = v;
    _setSelectedIndex(v);
  }, []);

  const [showColors, setShowColors] = useState(false);
  const flatListRef = useRef(null);

  const isDark = theme?.dark || false;
  const accent = isDark ? "#f0b38b" : "#7a3b10";
  const subtle = isDark ? "rgba(242,205,180,0.35)" : "rgba(93,50,17,0.35)";
  const cardBg = isDark ? "#1b1310" : "#fdfaf7";
  const divColor = isDark ? "rgba(242,205,180,0.10)" : "rgba(93,50,17,0.08)";

  // Reset on open
  useEffect(() => {
    if (visible) {
      setSelectedIndex(null);
      setShowColors(false);
    }
  }, [visible, setSelectedIndex]);

  // â”€â”€ Pre-compute lookup structures â€” O(n) once, not O(n) per circle render â”€â”€
  const bookmarkedSet = useMemo(() => {
    const set = new Set();
    const id = selectedSermon?.id;
    if (!id || !bookmarks) return set;
    for (const b of bookmarks) {
      if (String(b.sermon?.id) === String(id)) set.add(b.paragraphIndex);
    }
    return set;
  }, [bookmarks, selectedSermon?.id]);

  const hlHexMap = useMemo(() => {
    const map = new Map();
    const id = selectedSermon?.id;
    if (!id || !highlights) return map;
    const prefix = `${id}-`;
    for (const [key, colorName] of Object.entries(highlights)) {
      if (!key.startsWith(prefix)) continue;
      const idx = Number(key.slice(prefix.length));
      const c = COLORS.find((x) => x.name === colorName);
      if (c) map.set(idx, isDark ? c.dark : c.light);
    }
    return map;
  }, [highlights, selectedSermon?.id, isDark]);

  const hlNameMap = useMemo(() => {
    const map = new Map();
    const id = selectedSermon?.id;
    if (!id || !highlights) return map;
    const prefix = `${id}-`;
    for (const [key, colorName] of Object.entries(highlights)) {
      if (!key.startsWith(prefix)) continue;
      map.set(Number(key.slice(prefix.length)), colorName);
    }
    return map;
  }, [highlights, selectedSermon?.id]);

  // Flat index array â€” stable shape, no text
  const items = useMemo(
    () => Array.from({ length: paragraphs?.length ?? 0 }, (_, i) => i),
    [paragraphs?.length],
  );

  // Scroll to current paragraph on open using exact pixel offset (no layout cycle)
  useEffect(() => {
    if (visible && flatListRef.current && items.length > 0) {
      const target = Math.max(0, currentParagraphIndex - 3);
      // Tiny delay to let the Modal finish its slide animation
      const t = setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: target * ITEM_W,
          animated: false,
        });
      }, 80);
      return () => clearTimeout(t);
    }
  }, [visible, currentParagraphIndex, items.length]);

  // â”€â”€ Action handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleCirclePress = useCallback(
    (i) => {
      if (mode === "bookmark") {
        if (bookmarkedSet.has(i)) {
          removeBookmark(selectedSermon, i);
        } else {
          addBookmark(selectedSermon, i, paragraphs[i]);
        }
      } else {
        setSelectedIndex(i);
        setShowColors(true);
      }
    },
    [
      mode,
      bookmarkedSet,
      addBookmark,
      removeBookmark,
      selectedSermon,
      paragraphs,
      setSelectedIndex,
    ],
  );

  const handleColorSelect = useCallback(
    (colorName) => {
      const idx = selectedIndexRef.current;
      if (idx === null) return;
      if (colorName) {
        addHighlight(selectedSermon.id, idx, colorName);
      } else {
        removeHighlight(selectedSermon.id, idx);
      }
      setShowColors(false);
      setSelectedIndex(null);
    },
    [addHighlight, removeHighlight, selectedSermon?.id, setSelectedIndex],
  );

  const dismissColors = useCallback(() => {
    setShowColors(false);
    setSelectedIndex(null);
  }, [setSelectedIndex]);

  // â”€â”€ Circle renderer â€” delegates all heavy logic to memoized CircleItem â”€â”€â”€â”€â”€
  const renderCircle = useCallback(
    ({ item: i }) => (
      <CircleItem
        index={i}
        isCurrent={i === currentParagraphIndex}
        isSelected={i === selectedIndex}
        bookmarked={mode === "bookmark" && bookmarkedSet.has(i)}
        hlHex={mode === "highlight" ? (hlHexMap.get(i) ?? null) : null}
        accent={accent}
        subtle={subtle}
        isDark={isDark}
        onPress={handleCirclePress}
        mode={mode}
      />
    ),
    [
      currentParagraphIndex,
      selectedIndex,
      mode,
      bookmarkedSet,
      hlHexMap,
      accent,
      subtle,
      isDark,
      handleCirclePress,
    ],
  );

  const keyExtractor = useCallback((item) => `${item}`, []);
  const getItemLayout = useCallback(
    (_, index) => ({ length: ITEM_W, offset: ITEM_W * index, index }),
    [],
  );

  const isBookmarkMode = mode === "bookmark";
  const headerLabel = isBookmarkMode
    ? "Bookmark a paragraph"
    : "Highlight a paragraph";
  const headerIcon = isBookmarkMode
    ? "bookmark-outline"
    : "color-palette-outline";

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={[
            s.sheet,
            {
              backgroundColor: cardBg,
              shadowColor: isDark ? "#000" : "#5d3211",
            },
          ]}
        >
          {/* Drag handle */}
          <View
            style={[
              s.dragHandle,
              {
                backgroundColor: isDark
                  ? "rgba(230,195,184,0.22)"
                  : "rgba(93,50,17,0.18)",
              },
            ]}
          />

          {/* Header */}
          <View style={[s.header, { borderBottomColor: divColor }]}>
            <Ionicons name={headerIcon} size={17} color={accent} />
            <Text style={[s.headerLabel, { color: accent }]}>
              {headerLabel}
            </Text>
            <Text style={[s.headerCount, { color: subtle }]}>
              {items.length}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              style={s.closeBtn}
            >
              <Feather
                name="x"
                size={16}
                color={isDark ? "rgba(230,195,184,0.7)" : "rgba(93,50,17,0.6)"}
              />
            </TouchableOpacity>
          </View>

          {/* Horizontal number scroller */}
          <FlatList
            ref={flatListRef}
            data={items}
            keyExtractor={keyExtractor}
            renderItem={renderCircle}
            getItemLayout={getItemLayout}
            horizontal
            showsHorizontalScrollIndicator={false}
            removeClippedSubviews
            initialNumToRender={12}
            maxToRenderPerBatch={20}
            windowSize={5}
            contentContainerStyle={s.listContent}
            style={s.list}
          />

          {/* Color palette â€” highlight mode only */}
          {!isBookmarkMode && showColors && selectedIndex !== null && (
            <View style={[s.palette, { borderTopColor: divColor }]}>
              <View style={s.paletteHeader}>
                <Text style={[s.paletteLabel, { color: subtle }]}>
                  Â¶{selectedIndex + 1} â€” pick a colour
                </Text>
                <TouchableOpacity onPress={dismissColors} activeOpacity={0.7}>
                  <Feather name="x" size={13} color={subtle} />
                </TouchableOpacity>
              </View>

              <View style={s.swatchRow}>
                {COLORS.map((c) => {
                  const bg = isDark ? c.dark : c.light;
                  const active = hlNameMap.get(selectedIndex) === c.name;
                  return (
                    <TouchableOpacity
                      key={c.name}
                      onPress={() => handleColorSelect(c.name)}
                      activeOpacity={0.75}
                      style={[
                        s.swatch,
                        {
                          backgroundColor: bg,
                          borderColor: active
                            ? isDark
                              ? "#fff"
                              : "#222"
                            : "rgba(0,0,0,0.15)",
                          borderWidth: active ? 2.5 : 1,
                          transform: [{ scale: active ? 1.18 : 1 }],
                        },
                      ]}
                    >
                      {active && (
                        <Ionicons
                          name="checkmark"
                          size={15}
                          color={isDark ? "#1b1310" : "#fff"}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}

                <TouchableOpacity
                  onPress={() => handleColorSelect(null)}
                  activeOpacity={0.75}
                  style={[s.swatch, s.swatchRemove, { borderColor: subtle }]}
                >
                  <Ionicons name="close" size={15} color={subtle} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.52)",
    justifyContent: "flex-end",
    paddingHorizontal: 10,
    paddingBottom: 18,
  },
  sheet: {
    borderRadius: 22,
    overflow: "hidden",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 16,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLabel: {
    flex: 1,
    fontFamily: "ZillaSlabsm",
    fontSize: 14,
    letterSpacing: 0.3,
  },
  headerCount: {
    fontFamily: "ZillaSlabsm",
    fontSize: 11,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: CIRCLE_GAP,
  },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  circleNum: {
    fontFamily: "ZillaSlabsm",
    fontSize: 13,
    letterSpacing: 0.2,
  },
  badge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  palette: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
    gap: 12,
  },
  paletteHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paletteLabel: {
    fontFamily: "ZillaSlabsm",
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  swatchRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  swatchRemove: {
    backgroundColor: "transparent",
    borderStyle: "dashed",
  },
});

export default ParagraphPickerSheet;
