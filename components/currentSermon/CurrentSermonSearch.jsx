import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Animated,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useAppContext } from "../../Logic/globalState";
import { searchSermon } from "../../Utils/paragraphSplitter";
import { useFonts } from "expo-font";

// ── Animated dot loader (mirrors the main Search page) ─────────────────────
const SearchDot = ({ anim, color }) => {
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 1],
  });
  return (
    <Animated.View
      style={{
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: color,
        transform: [{ scale }],
        opacity,
        marginHorizontal: 6,
      }}
    />
  );
};

const SearchLoader = ({ theme }) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const make = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 380,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 380,
            useNativeDriver: true,
          }),
          Animated.delay(3 * 200 - delay),
        ]),
      );

    const p1 = make(dot1, 0);
    const p2 = make(dot2, 200);
    const p3 = make(dot3, 400);
    p1.start();
    p2.start();
    p3.start();
    return () => {
      p1.stop();
      p2.stop();
      p3.stop();
    };
  }, []);

  const dotColor = theme.dark ? "#d57a3e" : "#5d3211";
  const labelColor = theme.dark
    ? "rgba(255,255,255,0.28)"
    : "rgba(0,0,0,0.22)";

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: 11,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: labelColor,
          fontFamily: "ZillaSlab",
          marginBottom: 22,
        }}
      >
        Searching
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <SearchDot anim={dot1} color={dotColor} />
        <SearchDot anim={dot2} color={dotColor} />
        <SearchDot anim={dot3} color={dotColor} />
      </View>
    </View>
  );
};

// ───────────────────────────────────────────────────────────────────────────
const CurrentSermonSearch = ({
  visible,
  onClose,
  paragraphs,
  onNavigateToResult,
  selectedSermon,
}) => {
  const { theme } = useAppContext();
  const [searchPhrase, setSearchPhrase] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchInputRef = useRef(null);

  const [fontsLoaded] = useFonts({
    ZillaSlab: require("../../assets/fonts/ZillaSlab-Regular.ttf"),
    ZillaSlabsm: require("../../assets/fonts/ZillaSlab-SemiBold.ttf"),
  });

  const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text;
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    return text.replace(regex, "**$1**");
  };

  const handleSearch = useCallback(() => {
    if (!searchPhrase.trim()) return;
    Keyboard.dismiss();

    // Show loader first — defer the sync search so the UI has time to render
    setLoading(true);
    setSearchResults([]);

    setTimeout(() => {
      try {
        const indices = searchSermon(paragraphs, searchPhrase);

        const resultsWithContext = indices.map((index) => {
          const paragraph = paragraphs[index];
          const lowerPhrase = searchPhrase.toLowerCase();
          const lowerParagraph = paragraph.toLowerCase();
          const matchIndex = lowerParagraph.indexOf(lowerPhrase);
          const contextStart = Math.max(0, matchIndex - 100);
          const contextEnd = Math.min(
            paragraph.length,
            matchIndex + searchPhrase.length + 100,
          );

          let context = paragraph.substring(contextStart, contextEnd);
          if (contextStart > 0) context = "..." + context;
          if (contextEnd < paragraph.length) context = context + "...";

          return {
            index,
            paragraph,
            context: highlightText(context, searchPhrase),
            matchPosition: matchIndex,
          };
        });

        setSearchResults(resultsWithContext);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
        setHasSearched(true);
      }
    }, 50);
  }, [searchPhrase, paragraphs]);

  useEffect(() => {
    if (visible && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
    }
  }, [visible]);

  const handleResultPress = useCallback(
    (result) => {
      onNavigateToResult(result.index, searchPhrase);
      onClose();
    },
    [onNavigateToResult, onClose, searchPhrase],
  );

  const clearSearch = useCallback(() => {
    setSearchPhrase("");
    setSearchResults([]);
    setHasSearched(false);
    setLoading(false);
  }, []);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    clearSearch();
    onClose();
  }, [onClose, clearSearch]);

  if (!visible) return null;

  const accentColor = theme.dark ? "#d57a3e" : "#5d3211";
  const subtleText = theme.dark
    ? "rgba(255,255,255,0.28)"
    : "rgba(93,50,17,0.4)";

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              borderBottomColor: theme.dark
                ? "rgba(80, 61, 49, 0.6)"
                : "rgba(93, 50, 17, 0.1)",
            },
          ]}
        >
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Feather name="arrow-left" size={22} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Search
            </Text>
            <Text style={[styles.headerSubtitle, { color: subtleText }]}>
              This Sermon
            </Text>
          </View>

          {searchPhrase.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Feather name="x" size={18} color={subtleText} />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Input Row */}
        <View style={styles.searchRow}>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: theme.dark
                  ? "rgba(255,255,255,0.07)"
                  : "rgba(93, 50, 17, 0.05)",
                borderColor: theme.dark
                  ? "rgba(255,255,255,0.09)"
                  : "rgba(93, 50, 17, 0.18)",
              },
            ]}
          >
            <Feather
              name="search"
              size={18}
              color={
                theme.dark ? "rgba(255,255,255,0.4)" : "rgba(93,50,17,0.45)"
              }
              style={styles.searchIcon}
            />
            <TextInput
              ref={searchInputRef}
              style={[
                styles.searchInput,
                {
                  color: theme.dark ? theme.colors.text : "#1a0e07",
                  fontFamily: "ZillaSlab",
                },
              ]}
              placeholder="Search paragraphs or phrases..."
              placeholderTextColor={
                theme.dark ? "rgba(255,255,255,0.3)" : "rgba(93,50,17,0.35)"
              }
              value={searchPhrase}
              onChangeText={(text) => {
                setSearchPhrase(text);
                if (!text.trim()) {
                  setSearchResults([]);
                  setHasSearched(false);
                }
              }}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              keyboardAppearance={theme.dark ? "dark" : "light"}
            />
          </View>

          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: "#5d3211" }]}
            onPress={handleSearch}
          >
            <MaterialIcons name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Results Count */}
        {hasSearched && !loading && (
          <View style={styles.resultsHeader}>
            <Text
              style={[
                styles.resultsCount,
                { color: subtleText, fontFamily: "ZillaSlab" },
              ]}
            >
              {searchResults.length} result
              {searchResults.length !== 1 ? "s" : ""} found
            </Text>
          </View>
        )}

        {/* Loader / Results / Empty state */}
        {loading ? (
          <SearchLoader theme={theme} />
        ) : (
          <ScrollView
            style={styles.resultsContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {searchResults.map((result, index) => (
              <TouchableOpacity
                key={`${result.index}-${index}`}
                style={styles.resultItem}
                onPress={() => handleResultPress(result)}
                activeOpacity={0.7}
              >
                <View style={styles.resultContent}>
                  <View style={styles.paragraphInfo}>
                    <Text
                      style={[styles.paragraphLabel, { color: accentColor }]}
                    >
                      ¶ {result.index + 1}
                    </Text>
                    <Feather
                      name="chevron-right"
                      size={14}
                      color={subtleText}
                    />
                  </View>

                  <Text
                    style={[
                      styles.resultContext,
                      {
                        color: theme.dark
                          ? "rgba(255,255,255,0.75)"
                          : "#3a1f08",
                        fontFamily: "ZillaSlab",
                      },
                    ]}
                    numberOfLines={4}
                  >
                    {result.context.split("**").map((part, partIndex) => {
                      const isHighlight = partIndex % 2 === 1;
                      return (
                        <Text
                          key={partIndex}
                          style={
                            isHighlight
                              ? {
                                  backgroundColor: theme.dark
                                    ? "rgba(213,122,62,0.25)"
                                    : "rgba(213,122,62,0.18)",
                                  color: theme.dark ? "#f2a86b" : "#b85a1a",
                                  fontFamily: "ZillaSlabsm",
                                }
                              : undefined
                          }
                        >
                          {part}
                        </Text>
                      );
                    })}
                  </Text>
                </View>

                <View
                  style={[
                    styles.resultSeparator,
                    {
                      backgroundColor: theme.dark
                        ? "rgba(255,255,255,0.07)"
                        : "rgba(93,50,17,0.08)",
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}

            {/* No Results */}
            {hasSearched && searchResults.length === 0 && (
              <View style={styles.emptyStateContainer}>
                <Feather
                  name="search"
                  size={40}
                  color={
                    theme.dark
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(93,50,17,0.2)"
                  }
                  style={{ marginBottom: 16 }}
                />
                <Text
                  style={[
                    styles.emptyStateTitle,
                    {
                      color: theme.dark
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(93,50,17,0.6)",
                    },
                  ]}
                >
                  No matches found
                </Text>
                <Text
                  style={[styles.emptyStateMessage, { color: subtleText }]}
                >
                  Try different words or phrases
                </Text>
              </View>
            )}

            {/* Empty State */}
            {!hasSearched && (
              <View style={styles.emptyStateContainer}>
                <Feather
                  name="search"
                  size={40}
                  color={
                    theme.dark
                      ? "rgba(255,255,255,0.12)"
                      : "rgba(93,50,17,0.15)"
                  }
                  style={{ marginBottom: 16 }}
                />
                <Text
                  style={[
                    styles.emptyStateTitle,
                    {
                      color: theme.dark
                        ? "rgba(255,255,255,0.45)"
                        : "rgba(93,50,17,0.55)",
                    },
                  ]}
                >
                  Search within this sermon
                </Text>
                <Text
                  style={[styles.emptyStateMessage, { color: subtleText }]}
                >
                  Enter words or phrases, then press Search
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: -50,
    width: "100%",
    height: "110%",
    zIndex: 1000,
  },
  keyboardAvoidingView: {
    flex: 1,
    paddingTop:
      Platform.OS === "ios" ? 44 + 20 : (StatusBar.currentHeight || 0) + 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "ZillaSlabsm",
    fontWeight: "300",
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 10,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginTop: 2,
    fontFamily: "ZillaSlab",
  },
  clearButton: {
    padding: 8,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3d1f08",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  resultsHeader: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  resultsCount: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  resultsContainer: {
    flex: 1,
  },
  resultItem: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  resultContent: {
    flex: 1,
  },
  paragraphInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  paragraphLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  resultContext: {
    fontSize: 14,
    lineHeight: 21,
  },
  resultSeparator: {
    height: StyleSheet.hairlineWidth,
    marginTop: 12,
  },
  emptyStateContainer: {
    alignItems: "center",
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 17,
    fontFamily: "ZillaSlab",
    fontWeight: "400",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateMessage: {
    fontSize: 13,
    fontFamily: "ZillaSlab",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default CurrentSermonSearch;
