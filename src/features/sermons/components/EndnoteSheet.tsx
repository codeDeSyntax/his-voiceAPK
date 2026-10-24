/**
 * EndnoteSheet — floating animated bottom sheet
 *
 * Preview card (avatar + datecode · title + "Read more") expands in-place
 * to embed the full EndnoteResults view. Detached from all screen edges.
 */
import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Easing,
  Dimensions,
  Platform,
  ToastAndroid,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { searchEndnoteQuote } from "../../endnotes/api/branham";
import EndnoteResults from "./EndnoteResults";
import type { AppTheme } from "../../../shared/theme/types";
import type {
  BranhamSearchResponse,
  CachedEndnoteResults,
  Endnote,
  EndnotePaletteKey,
  EndnoteSearchType,
} from "../../endnotes/types";
import { errorMessage } from "../../../shared/utils/errors";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const PREVIEW_HEIGHT = 124;
const EXPANDED_HEIGHT = Math.round(SCREEN_HEIGHT * 0.95);
const ENDNOTE_THEME_KEY = "endnoteThemePalette";

const ENDNOTE_PALETTES = {
  blue: {
    key: "blue",
    label: "Blue",
    dark: {
      overlay: "rgba(6, 19, 39, 0.56)",
      surface: "#10243f",
      text: "#e7eefc",
      mutedText: "rgba(220, 233, 255, 0.62)",
      accent: "#7bb2ff",
      accentSoft: "rgba(123, 178, 255, 0.16)",
      highlightBg: "rgba(123, 178, 255, 0.32)",
      highlightFg: "#f2f7ff",
      divider: "rgba(164, 198, 255, 0.22)",
      buttonTextOnAccent: "#0b2447",
    },
    light: {
      overlay: "rgba(8, 33, 61, 0.28)",
      surface: "#edf4ff",
      text: "#163257",
      mutedText: "rgba(22, 50, 87, 0.64)",
      accent: "#3f79c7",
      accentSoft: "rgba(63, 121, 199, 0.16)",
      highlightBg: "rgba(63, 121, 199, 0.26)",
      highlightFg: "#0f2f58",
      divider: "rgba(63, 121, 199, 0.2)",
      buttonTextOnAccent: "#ffffff",
    },
  },
  gold: {
    key: "gold",
    label: "Gold",
    dark: {
      overlay: "rgba(38, 28, 8, 0.54)",
      surface: "#33250e",
      text: "#f5e8cf",
      mutedText: "rgba(245, 232, 207, 0.62)",
      accent: "#e0b95f",
      accentSoft: "rgba(224, 185, 95, 0.2)",
      highlightBg: "rgba(224, 185, 95, 0.34)",
      highlightFg: "#fff4da",
      divider: "rgba(224, 185, 95, 0.22)",
      buttonTextOnAccent: "#3e2b0d",
    },
    light: {
      overlay: "rgba(60, 40, 6, 0.32)",
      surface: "#fff8e8",
      text: "#4f3513",
      mutedText: "rgba(111, 75, 30, 0.66)",
      accent: "#d4a94a",
      accentSoft: "rgba(212, 169, 74, 0.2)",
      highlightBg: "rgba(212, 169, 74, 0.4)",
      highlightFg: "#3c2407",
      divider: "rgba(129, 90, 38, 0.2)",
      buttonTextOnAccent: "#4f3513",
    },
  },
  sage: {
    key: "sage",
    label: "Sage",
    dark: {
      overlay: "rgba(16, 41, 34, 0.56)",
      surface: "#1b3a30",
      text: "#deefe8",
      mutedText: "rgba(222, 239, 232, 0.62)",
      accent: "#7db89e",
      accentSoft: "rgba(125, 184, 158, 0.2)",
      highlightBg: "rgba(125, 184, 158, 0.34)",
      highlightFg: "#edf9f4",
      divider: "rgba(125, 184, 158, 0.22)",
      buttonTextOnAccent: "#1b3a30",
    },
    light: {
      overlay: "rgba(22, 45, 36, 0.3)",
      surface: "#eef6f1",
      text: "#1f4637",
      mutedText: "rgba(31, 70, 55, 0.64)",
      accent: "#5f9f83",
      accentSoft: "rgba(95, 159, 131, 0.2)",
      highlightBg: "rgba(95, 159, 131, 0.34)",
      highlightFg: "#113025",
      divider: "rgba(49, 95, 74, 0.2)",
      buttonTextOnAccent: "#153629",
    },
  },
  indigo: {
    key: "indigo",
    label: "Indigo",
    dark: {
      overlay: "rgba(16, 19, 46, 0.56)",
      surface: "#1c2552",
      text: "#e8eaff",
      mutedText: "rgba(220, 224, 255, 0.62)",
      accent: "#97a9ff",
      accentSoft: "rgba(151, 169, 255, 0.2)",
      highlightBg: "rgba(151, 169, 255, 0.36)",
      highlightFg: "#f5f7ff",
      divider: "rgba(151, 169, 255, 0.24)",
      buttonTextOnAccent: "#18234d",
    },
    light: {
      overlay: "rgba(24, 35, 77, 0.28)",
      surface: "#eef0ff",
      text: "#202f64",
      mutedText: "rgba(32, 47, 100, 0.64)",
      accent: "#5f74d8",
      accentSoft: "rgba(95, 116, 216, 0.18)",
      highlightBg: "rgba(95, 116, 216, 0.3)",
      highlightFg: "#172550",
      divider: "rgba(95, 116, 216, 0.22)",
      buttonTextOnAccent: "#ffffff",
    },
  },
  ruby: {
    key: "ruby",
    label: "Ruby",
    dark: {
      overlay: "rgba(42, 10, 14, 0.56)",
      surface: "#301418",
      text: "#fce8eb",
      mutedText: "rgba(252, 220, 226, 0.62)",
      accent: "#e8707e",
      accentSoft: "rgba(232, 112, 126, 0.18)",
      highlightBg: "rgba(232, 112, 126, 0.32)",
      highlightFg: "#fff0f2",
      divider: "rgba(232, 112, 126, 0.22)",
      buttonTextOnAccent: "#2e0f14",
    },
    light: {
      overlay: "rgba(60, 14, 20, 0.28)",
      surface: "#fff0f1",
      text: "#4a1520",
      mutedText: "rgba(74, 21, 32, 0.64)",
      accent: "#c44d5c",
      accentSoft: "rgba(196, 77, 92, 0.14)",
      highlightBg: "rgba(196, 77, 92, 0.26)",
      highlightFg: "#3a0e16",
      divider: "rgba(196, 77, 92, 0.2)",
      buttonTextOnAccent: "#ffffff",
    },
  },
  metal: {
    key: "metal",
    label: "Metal",
    dark: {
      overlay: "rgba(20, 24, 30, 0.58)",
      surface: "#2a313a",
      text: "#eef2f6",
      mutedText: "rgba(224, 232, 240, 0.62)",
      accent: "#aeb8c4",
      accentSoft: "rgba(174, 184, 196, 0.2)",
      highlightBg: "rgba(174, 184, 196, 0.34)",
      highlightFg: "#f7f9fb",
      divider: "rgba(174, 184, 196, 0.24)",
      buttonTextOnAccent: "#1c242e",
    },
    light: {
      overlay: "rgba(42, 49, 58, 0.28)",
      surface: "#f3f5f8",
      text: "#2b333d",
      mutedText: "rgba(43, 51, 61, 0.64)",
      accent: "#7f8d9d",
      accentSoft: "rgba(127, 141, 157, 0.18)",
      highlightBg: "rgba(127, 141, 157, 0.3)",
      highlightFg: "#1f2731",
      divider: "rgba(127, 141, 157, 0.22)",
      buttonTextOnAccent: "#ffffff",
    },
  },
};

const getEndnotePalette = (paletteKey: EndnotePaletteKey, isDarkMode: boolean) => {
  const family = ENDNOTE_PALETTES[paletteKey] || ENDNOTE_PALETTES.blue;
  const modePalette = isDarkMode ? family.dark : family.light;
  return {
    key: family.key,
    label: family.label,
    isDark: isDarkMode,
    ...modePalette,
  };
};

const getEndnoteCacheKey = (endnoteData: Endnote | null) => {
  if (!endnoteData) return "";
  return [
    endnoteData.datecode || "",
    endnoteData.title || "",
    endnoteData.paragraph || "",
    endnoteData.longQuote || "",
    endnoteData.keywords || "",
    endnoteData.quote || "",
    endnoteData.fullEndnote || "",
  ].join("|");
};

const EndnoteSheet = ({ visible, endnoteData, theme, onClose }: { visible: boolean; endnoteData: Endnote | null; theme: AppTheme; onClose: () => void }) => {
  const [expanded, setExpanded] = useState(false);
  const [searchResults, setSearchResults] = useState<BranhamSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSource, setLoadingSource] = useState<'cache' | 'network' | null>(null);
  const [networkError, setNetworkError] = useState(false);
  const [searchType, setSearchType] = useState<EndnoteSearchType>("ExactPhrase");
  const [paletteKey, setPaletteKey] = useState<EndnotePaletteKey>("blue");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const searchCacheRef = useRef<Map<string, CachedEndnoteResults>>(new Map());

  const heightAnim = useState(() => new Animated.Value(PREVIEW_HEIGHT))[0];
  const sheetAnim = useState(() => new Animated.Value(0))[0];

  const isDark = theme?.dark || false;
  const palette = getEndnotePalette(paletteKey, isDark);
  const accent = palette.accent;
  const endnoteCacheKey = useMemo(
    () => getEndnoteCacheKey(endnoteData),
    [endnoteData],
  );

  const getCachedByType = useCallback((cachedEntry: CachedEndnoteResults | null | undefined): Partial<Record<EndnoteSearchType, BranhamSearchResponse>> => {
    if (!cachedEntry) return {};
    if (cachedEntry.byType && typeof cachedEntry.byType === "object") {
      return cachedEntry.byType;
    }
    // Backward compatibility for legacy cache shape.
    if (cachedEntry.results) {
      const legacyType = cachedEntry.searchType || "ExactPhrase";
      return { [legacyType]: cachedEntry.results };
    }
    return {};
  }, []);

  const getEffectiveSearchType = useCallback((requestedType: EndnoteSearchType, results: BranhamSearchResponse): EndnoteSearchType => {
    if (results?.searchMethod === "quote_fallback_all_words") {
      return "AllWords";
    }
    return requestedType || "ExactPhrase";
  }, []);

  const persistCachedResults = useCallback(
  (requestedType: EndnoteSearchType, effectiveType: EndnoteSearchType, results: BranhamSearchResponse) => {
      if (!endnoteCacheKey) return;

      const existing = searchCacheRef.current.get(endnoteCacheKey);
      const byType = getCachedByType(existing) as Partial<Record<EndnoteSearchType, BranhamSearchResponse>>;
      byType[effectiveType] = results;

      // Keep alias for requested tab so users don't re-hit network when API
      // internally falls back but they revisit the requested mode.
      if (!byType[requestedType]) {
        byType[requestedType] = results;
      }

      searchCacheRef.current.set(endnoteCacheKey, {
        byType,
        lastSearchType: effectiveType,
      });
    },
    [endnoteCacheKey, getCachedByType],
  );

  // Load persisted palette once
  useEffect(() => {
    let mounted = true;
    const loadPalette = async () => {
      try {
        const stored = await AsyncStorage.getItem(ENDNOTE_THEME_KEY);
        if (mounted && stored && stored in ENDNOTE_PALETTES) {
          setPaletteKey(stored as EndnotePaletteKey);
        }
      } catch (error) {
        if (__DEV__) console.warn("Failed to load endnote palette:", error);
      }
    };
    loadPalette();
    return () => {
      mounted = false;
    };
  }, []);

  // Persist palette whenever it changes
  useEffect(() => {
    AsyncStorage.setItem(ENDNOTE_THEME_KEY, paletteKey).catch((error) => {
      if (__DEV__) console.warn("Failed to save endnote palette:", error);
    });
  }, [paletteKey]);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      sheetAnim.setValue(0);
      Animated.timing(sheetAnim, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else if (modalVisible) {
      Animated.timing(sheetAnim, {
        toValue: 0,
        duration: 240,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }).start(() => {
        setModalVisible(false);
      });
    }
  }, [visible, modalVisible, sheetAnim]);

  // Reset whenever the sheet is re-opened for a new endnote
  useEffect(() => {
    if (visible) {
      const cached = endnoteCacheKey
        ? searchCacheRef.current.get(endnoteCacheKey)
        : null;
      const byType = getCachedByType(cached);
      const initialType: EndnoteSearchType = cached?.lastSearchType || "ExactPhrase";

      setExpanded(false);
      setSearchResults(byType[initialType] || null);
      setIsLoading(false);
      setLoadingSource(null);
      setNetworkError(false);
      setSearchType(initialType);
      setPaletteOpen(false);
      heightAnim.setValue(PREVIEW_HEIGHT);
    }
  }, [visible, endnoteCacheKey, heightAnim, getCachedByType]);

  useEffect(() => {
    if (!expanded) {
      setPaletteOpen(false);
    }
  }, [expanded]);

  const handleClose = useCallback(() => {
    setPaletteOpen(false);
    onClose?.();
  }, [onClose]);

  const handleReadMore = useCallback(async () => {
    if (!endnoteData) return;

    setExpanded(true);
    setNetworkError(false);

    Animated.spring(heightAnim, {
      toValue: EXPANDED_HEIGHT,
      useNativeDriver: false,
      bounciness: 2,
      speed: 16,
    }).start();

    // Re-use previous results for the same endnote to avoid repeated fetches.
    const requestedType = searchType || "ExactPhrase";

    const cached = endnoteCacheKey
      ? searchCacheRef.current.get(endnoteCacheKey)
      : null;
    const byType = getCachedByType(cached);
    if (byType[requestedType]) {
      setLoadingSource("cache");
      setIsLoading(true);
      setTimeout(() => {
        setSearchType(requestedType);
        setSearchResults(byType[requestedType] || null);
        setIsLoading(false);
        setLoadingSource(null);
      }, 320);
      return;
    }

    setLoadingSource("network");
    setIsLoading(true);
    setSearchResults(null);

    try {
      const results = await searchEndnoteQuote(endnoteData, {
        searchType: requestedType,
      });
      const effectiveType = getEffectiveSearchType(requestedType, results);

      if (
        results.searchMethod === "paragraph_reference" &&
        Platform.OS === "android"
      ) {
        ToastAndroid.show("Found by sermon reference", ToastAndroid.SHORT);
      }

      setSearchType(effectiveType);
      setSearchResults(results);
      persistCachedResults(requestedType, effectiveType, results);
    } catch (err) {
      const message = errorMessage(err).toLowerCase();
      const isNetwork =
        err instanceof TypeError ||
        message.includes("network") ||
        message.includes("failed to fetch") ||
        message.includes("network request failed");
      if (isNetwork) {
        setNetworkError(true);
      } else if (Platform.OS === "android") {
        ToastAndroid.show("Error searching endnote", ToastAndroid.SHORT);
      }
    } finally {
      setIsLoading(false);
      setLoadingSource(null);
    }
  }, [
    endnoteData,
    heightAnim,
    endnoteCacheKey,
    searchType,
    getCachedByType,
    getEffectiveSearchType,
    persistCachedResults,
  ]);

  const handleRetry = useCallback(
    async (type: EndnoteSearchType) => {
      if (!endnoteData) return;
      const requestedType: EndnoteSearchType = type || "ExactPhrase";

      const cached = endnoteCacheKey
        ? searchCacheRef.current.get(endnoteCacheKey)
        : null;
      const byType = getCachedByType(cached);
      if (byType[requestedType]) {
        setSearchType(requestedType);
        setSearchResults(byType[requestedType]);
        setNetworkError(false);
        return;
      }

      setLoadingSource("network");
      setIsLoading(true);
      setNetworkError(false);
      setSearchType(requestedType);
      try {
        const results = await searchEndnoteQuote(endnoteData, {
          searchType: requestedType,
        });
        const effectiveType = getEffectiveSearchType(requestedType, results);
        setSearchType(effectiveType);
        setSearchResults(results);
        persistCachedResults(requestedType, effectiveType, results);
      } catch (err) {
        const message = errorMessage(err).toLowerCase();
        const isNetwork =
          err instanceof TypeError ||
          message.includes("network") ||
          message.includes("failed to fetch");
        if (isNetwork) setNetworkError(true);
      } finally {
        setIsLoading(false);
        setLoadingSource(null);
      }
    },
    [
      endnoteData,
      endnoteCacheKey,
      getCachedByType,
      getEffectiveSearchType,
      persistCachedResults,
    ],
  );

  const previewTitle = endnoteData?.datecode
    ? `${endnoteData.datecode}  ·  ${endnoteData.title || ""}`.trim()
    : endnoteData?.title || "Endnote reference";

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={[s.overlay, !expanded && s.overlayDetached]}>
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: expanded
                ? palette.overlay
                : isDark
                  ? "rgba(0,0,0,0.44)"
                  : "rgba(0,0,0,0.26)",
              opacity: sheetAnim,
            },
          ]}
        />
        {/* Backdrop */}
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        {/* Sheet */}
        <Animated.View
          style={[
            s.sheet,
            {
              height: heightAnim,
              backgroundColor: palette.surface,
              shadowColor: isDark ? "#000" : palette.accent,
              borderRadius: expanded ? 0 : 22,
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              transform: [
                {
                  translateY: sheetAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [56, 0],
                  }),
                },
                {
                  scale: sheetAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.985, 1],
                  }),
                },
              ],
              opacity: sheetAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.92, 1],
              }),
            },
          ]}
        >
          

          {/* Compact preview row */}
          <View style={s.previewRow}>
            <Image
              source={{
                uri: "https://www.livingwordbroadcast.org/LWBImages/Pictures/Picture%202.jpg",
              }}
              style={s.avatar}
              resizeMode="cover"
            />

            <View style={s.previewText}>
              <View style={s.previewHeaderRow}>
                <Text
                  style={[
                    s.label,
                    {
                      color: palette.mutedText,
                    },
                  ]}
                >
                  WMB QUOTE
                </Text>

                {/* Close */}
                <TouchableOpacity
                  onPress={handleClose}
                  activeOpacity={0.7}
                  style={[
                    s.closeBtn,
                    {
                      backgroundColor: palette.accentSoft,
                    },
                  ]}
                >
                  <Feather name="x" size={14} color={palette.mutedText} />
                </TouchableOpacity>
              </View>

              <Text
                style={[s.title, { color: palette.text }]}
                numberOfLines={2}
              >
                {previewTitle}
              </Text>

              {!expanded && (
                <View style={s.previewActionRow}>
                  <Text style={[s.previewHint, { color: palette.mutedText }]}>
                    Tap to read the full quote 
                  </Text>
                  <View
                    style={[
                      s.readMoreBtnOuter,
                      {
                        borderColor: isDark
                          ? "rgba(255,255,255,0.16)"
                          : "rgba(20,34,60,0.14)",
                      },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={handleReadMore}
                      activeOpacity={0.8}
                      style={[
                        s.readMoreBtnCore,
                        {
                          backgroundColor: palette.accentSoft,
                          borderTopColor: isDark
                            ? "rgba(255,255,255,0.18)"
                            : "rgba(255,255,255,0.44)",
                          borderBottomColor: isDark
                            ? "rgba(0,0,0,0.26)"
                            : "rgba(0,0,0,0.08)",
                          shadowColor: accent,
                        },
                      ]}
                    >
                      <View
                        style={[
                          s.readMoreBtnSheen,
                          {
                            backgroundColor: isDark
                              ? "rgba(255,255,255,0.08)"
                              : "rgba(255,255,255,0.32)",
                          },
                        ]}
                      />
                      <View style={s.readMoreBtnRow}>
                        <Text style={[s.readMoreText, { color: accent }]}>
                          Open Quote
                        </Text>
                        <Feather name="chevron-up" size={11} color={accent} />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Divider + embedded results */}
          {expanded && (
            <>
              <EndnoteResults
                embedded
                visible={true}
                onClose={handleClose}
                endnoteData={endnoteData}
                searchResults={searchResults}
                activeSearchType={searchType}
                theme={theme}
                endnotePalette={palette}
                isLoading={isLoading}
                loadingSource={loadingSource}
                onRetrySearch={handleRetry}
                networkError={networkError}
              />
            </>
          )}

          {expanded && (
            <View style={s.paletteWrap} pointerEvents="box-none">
              {paletteOpen && (
                <View style={s.paletteGrid}>
                  {Object.values(ENDNOTE_PALETTES).map((item) => {
                    const itemPalette = getEndnotePalette(item.key as EndnotePaletteKey, isDark);
                    const active = item.key === paletteKey;
                    return (
                      <TouchableOpacity
                        key={item.key}
                        activeOpacity={0.75}
                        onPress={() => {
                          setPaletteKey(item.key as EndnotePaletteKey);
                          setPaletteOpen(false);
                        }}
                        style={[
                          s.paletteCircle,
                          {
                            backgroundColor: itemPalette.accent,
                            borderColor: active
                              ? palette.text
                              : "rgba(255,255,255,0.15)",
                            shadowColor: itemPalette.accent,
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              )}

              {/* FAB toggle */}
              <TouchableOpacity
                style={[
                  s.paletteFab,
                  {
                    backgroundColor: palette.accentSoft,
                    borderColor: palette.divider,
                    borderTopColor: isDark
                      ? "rgba(255,255,255,0.12)"
                      : "rgba(255,255,255,0.5)",
                    borderBottomColor: isDark
                      ? "rgba(0,0,0,0.2)"
                      : "rgba(0,0,0,0.06)",
                    shadowColor: isDark ? "#000" : palette.accent,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => setPaletteOpen((v) => !v)}
              >
                {/* Top sheen */}
                <View
                  pointerEvents="none"
                  style={[
                    s.fabSheen,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(255,255,255,0.35)",
                    },
                  ]}
                />
                <View style={[s.fabDot, { backgroundColor: palette.accent }]} />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.52)",
    justifyContent: "flex-end",
  },
  overlayDetached: {
    paddingHorizontal: 10,
    paddingBottom: 18,
  },
  sheet: {
    borderRadius: 22,
    overflow: "hidden",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 16,
  },
  dragHandle: {
    width: 28,
    height: 3,
    borderRadius: 1.5,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 0,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#3a2010",
  },
  previewText: {
    flex: 1,
    gap: 6,
  },
  previewHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontFamily: "ZillaSlabsm",
    fontSize: 9,
    letterSpacing: 2.5,
  },
  title: {
    fontFamily: "ZillaSlab",
    fontSize: 15.5,
    fontWeight: "400",
    lineHeight: 18,
  },
  previewActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 2,
  },
  previewHint: {
    flex: 1,
    fontFamily: "Merriweather",
    fontSize: 10.5,
    lineHeight: 14,
    opacity: 0.86,
  },
  readMoreBtnOuter: {
    borderRadius: 100,
    borderWidth: 1.2,
    padding: 1.8,
  },
  readMoreBtnCore: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 100,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
  },
  readMoreBtnSheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "52%",
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
  readMoreBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  readMoreText: {
    fontFamily: "Merriweather",
    fontSize: 12,
    fontWeight: "600",
  },
  closeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 14,
  },
  paletteWrap: {
    position: "absolute",
    right: 14,
    bottom: 16,
    alignItems: "flex-end",
  },
  paletteFab: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    overflow: "hidden",
  },
  fabSheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "48%",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  fabDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  paletteGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 62,
    gap: 8,
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  paletteCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default EndnoteSheet;
