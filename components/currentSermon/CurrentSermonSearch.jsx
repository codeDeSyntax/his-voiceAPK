import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
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

  const dotColor = theme.dark ? "#e6c3b8" : "#5d3211";
  const labelColor = theme.dark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.22)";

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

const SearchActionButton = ({ theme, onPress, label = "Enter" }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      damping: 16,
      stiffness: 280,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      damping: 13,
      stiffness: 220,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.searchButtonOuter}>
          <View
            style={[
              styles.searchButtonCore,
              {
                backgroundColor: theme.dark
                  ? "rgba(242,205,180,0.13)"
                  : "rgba(93,50,17,0.82)",
              },
            ]}
          >
            <View style={styles.searchButtonContentRow}>
              <MaterialIcons
                name="search"
                size={18}
                color={theme.dark ? "#e6c3b8" : "#ffffff"}
              />
              {label ? (
                <Text
                  style={[
                    styles.searchButtonLabel,
                    { color: theme.dark ? "#e6c3b8" : "#ffffff" },
                  ]}
                >
                  {label}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
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

  const highlightText = (extractedContext, searchTerm) => {
    if (!searchTerm || !extractedContext) return extractedContext;

    // The context is already extracted and should contain the match
    // Now we need to reliably highlight it
    const searchLower = searchTerm.toLowerCase();
    const contextLower = extractedContext.toLowerCase();
    const matchPos = contextLower.indexOf(searchLower);

    if (matchPos === -1) {
      // Fallback: try regex highlighting
      const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${escaped})`, "gi");
      return extractedContext.replace(regex, "**$1**");
    }

    // Positional highlighting: preserve the original case of the match
    const actualMatch = extractedContext.substring(
      matchPos,
      matchPos + searchTerm.length,
    );
    const beforeMatch = extractedContext.substring(0, matchPos);
    const afterMatch = extractedContext.substring(matchPos + searchTerm.length);

    return beforeMatch + `**${actualMatch}**` + afterMatch;
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

  const accentColor = theme.dark ? "rgba(230,195,184,0.92)" : "#5d3211";
  const highlightBg = theme.dark
    ? "rgba(230,195,184,0.2)"
    : "rgba(93,50,17,0.16)";
  const highlightFg = theme.dark ? "#f8e3d5" : "#5d3211";
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

          <View style={styles.headerSpacer} />
        </View>

        {/* Search Input Row */}
        <View style={styles.searchRow}>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: theme.dark
                  ? "rgba(255,255,255,0.085)"
                  : "rgba(93, 50, 17, 0.070)",
              },
            ]}
          >
            <Feather
              name="search"
              size={19}
              color={
                theme.dark ? "rgba(242,205,180,0.58)" : "rgba(93,50,17,0.52)"
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
            {searchPhrase.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                style={[
                  styles.inlineClearButton,
                  {
                    backgroundColor: theme.dark
                      ? "rgba(242,205,180,0.12)"
                      : "rgba(93,50,17,0.11)",
                  },
                ]}
                activeOpacity={0.72}
              >
                <Feather
                  name="x"
                  size={14}
                  color={
                    theme.dark
                      ? "rgba(242,205,180,0.70)"
                      : "rgba(40,20,10,0.58)"
                  }
                />
              </TouchableOpacity>
            )}
            <SearchActionButton theme={theme} onPress={handleSearch} label="" />
          </View>
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
                style={[
                  styles.resultItem,
                  {
                    backgroundColor: theme.dark
                      ? index % 2 === 0
                        ? "rgba(242,205,180,0.052)"
                        : "rgba(242,205,180,0.033)"
                      : index % 2 === 0
                        ? "rgba(93,50,17,0.055)"
                        : "rgba(93,50,17,0.032)",
                  },
                ]}
                onPress={() => handleResultPress(result)}
                activeOpacity={0.7}
              >
                <View style={styles.resultContent}>
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
                    <Text
                      style={[
                        styles.paragraphInlineTag,
                        {
                          color: accentColor,
                          backgroundColor: theme.dark
                            ? index % 2 === 0
                              ? "rgba(230,195,184,0.16)"
                              : "rgba(230,195,184,0.11)"
                            : index % 2 === 0
                              ? "rgba(93,50,17,0.15)"
                              : "rgba(93,50,17,0.1)",
                          borderColor: theme.dark
                            ? "rgba(230,195,184,0.34)"
                            : "rgba(93,50,17,0.25)",
                        },
                      ]}
                    >
                      P{result.index + 1}
                    </Text>
                    <Text>{"  "}</Text>
                    {result.context.split("**").map((part, partIndex) => {
                      const isHighlight = partIndex % 2 === 1;
                      return (
                        <Text
                          key={partIndex}
                          style={
                            isHighlight
                              ? {
                                  backgroundColor: highlightBg,
                                  color: highlightFg,
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
              </TouchableOpacity>
            ))}

            {/* No Results */}
            {hasSearched && searchResults.length === 0 && (
              <View style={styles.emptyStateContainer}>
                <Feather
                  name="search"
                  size={40}
                  color={
                    theme.dark ? "rgba(255,255,255,0.15)" : "rgba(93,50,17,0.2)"
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
                <Text style={[styles.emptyStateMessage, { color: subtleText }]}>
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
                <Text style={[styles.emptyStateMessage, { color: subtleText }]}>
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
  headerSpacer: {
    width: 38,
  },
  searchRow: {
    flexDirection: "column",
    alignItems: "stretch",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 100,
    paddingLeft: 15,
    paddingRight: 6,
    height: 46,
    width: "100%",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  inlineClearButton: {
    height: 24,
    width: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  searchButtonOuter: {
    width: 34,
    height: 34,
    marginLeft: 6,
    borderRadius: 100,
    padding: 0,
  },
  searchButtonCore: {
    width: 34,
    height: 34,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    shadowOpacity: 0,
    elevation: 0,
  },
  searchButtonContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonIconWrap: {
    marginTop: 0.5,
    marginRight: 6,
  },
  searchButtonLabel: {
    fontFamily: "ZillaSlab",
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "uppercase",
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
    paddingHorizontal: 12,
  },
  resultItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 7,
    borderRadius: 12,
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
    fontSize: 16,
    lineHeight: 22,
  },
  paragraphInlineTag: {
    fontSize: 14,
    fontFamily: "ZillaSlabsm",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 7,
    paddingVertical: 1,
    overflow: "hidden",
  },
  resultSeparator: {
    height: StyleSheet.hairlineWidth,
    marginTop: 6,
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
