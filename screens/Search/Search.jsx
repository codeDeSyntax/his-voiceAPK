import React, {
  useState,
  useContext,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  TextInput,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Pressable,
  Keyboard,
  Image,
  Dimensions,
  FlatList,
  Easing,
} from "react-native";
import { useAppContext } from "../../Logic/globalState";
import {
  AntDesign,
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import styles from "../../styles/Search";
import DraggableFloatingButton from "../../components/FloatButton";
import { useFonts } from "expo-font";
import { searchSermonsWithFTS } from "../../database/sermonDB";

const CONTEXT_LENGTH = 30;

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Helper function to extract context and guarantee highlight match is visible
const extractHighlightedContext = (
  fullText,
  searchPhrase,
  contextBefore = 110,
  contextAfter = 260,
) => {
  if (!fullText || !searchPhrase) return fullText;

  const searchLower = searchPhrase.toLowerCase();
  const textLower = fullText.toLowerCase();
  const matchPos = textLower.indexOf(searchLower);

  if (matchPos === -1) {
    // Fallback: return first part of text if match not found
    return fullText.substring(0, 400);
  }

  // Calculate context window to ensure match is included and visible
  const start = Math.max(0, matchPos - contextBefore);
  const end = Math.min(
    fullText.length,
    matchPos + searchPhrase.length + contextAfter,
  );

  let context = fullText.substring(start, end);
  if (start > 0) context = "..." + context;
  if (end < fullText.length) context = context + "...";

  // Now highlight the match in the extracted context
  // Need to recalculate match position in the new context string
  const contextLower = context.toLowerCase();
  const matchInContext = contextLower.indexOf(searchLower);

  if (matchInContext !== -1) {
    // Extract the actual matched text from the original (preserving case)
    const actualMatch = fullText.substring(
      matchPos,
      matchPos + searchPhrase.length,
    );

    // Rebuild context with explicit highlight tags around the actual matched text
    const beforeMatch = context.substring(0, matchInContext);
    const afterMatch = context.substring(matchInContext + searchPhrase.length);

    return beforeMatch + `<highlight>${actualMatch}</highlight>` + afterMatch;
  }

  // Fallback: apply regex as before if position-based approach fails
  const regex = new RegExp(`(${escapeRegex(searchPhrase)})`, "gi");
  return context.replace(regex, `<highlight>$1</highlight>`);
};

// ── Animated dot for the search loading indicator ──────────────────────────
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
        marginTop: 40,
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
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [glowAnim]);

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: theme.dark
      ? ["rgba(230,195,184,0.22)", "rgba(230,195,184,0.45)"]
      : ["rgba(93,50,17,0.20)", "rgba(93,50,17,0.42)"],
  });

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
    <Animated.View style={{ transform: [{ scale: scaleAnim }], width: "100%" }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[
            styles.searchButtonOuter,
            {
              borderColor,
            },
          ]}
        >
          <View
            style={[
              styles.searchButtonCore,
              {
                backgroundColor: theme.dark
                  ? "rgba(40,30,24,0.94)"
                  : "rgba(93,50,17,0.88)",
                shadowColor: theme.dark ? "#e6c3b8" : "#5d3211",
              },
            ]}
          >
            <View
              style={[
                styles.searchButtonSheen,
                {
                  backgroundColor: theme.dark
                    ? "rgba(230,195,184,0.08)"
                    : "rgba(255,255,255,0.15)",
                },
              ]}
            />
            <View style={styles.searchButtonContentRow}>
              <MaterialIcons
                name="search"
                size={18}
                color={theme.dark ? "#e6c3b8" : "#ffffff"}
                style={styles.searchButtonIconWrap}
              />
              <Text
                style={[
                  styles.searchButtonLabel,
                  { color: theme.dark ? "#e6c3b8" : "#ffffff" },
                ]}
              >
                {label}
              </Text>
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};
const EXPANDED_CONTEXT_LENGTH = 150;
const POPUP_CONTEXT_LENGTH = 3000;

const SermonSearch = () => {
  const {
    theme,
    setSelectedSermon,
    searchPhrase,
    setSearchPhrase,
    searchResults,
    setSearchResults,
    expandedSearchResults,
    setExpandedSearchResults,
  } = useAppContext();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [found, setFound] = useState(true);
  // Stable animated value — must NOT be recreated on every render
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    ZillaSlab: require("../../assets/fonts/ZillaSlab-Regular.ttf"),
    ZillaSlabsm: require("../../assets/fonts/ZillaSlab-SemiBold.ttf"),
  });
  // Refs
  const scrollViewRef = useRef(null);
  const searchInputRef = useRef(null);

  // Window dimensions for responsive sizing
  const windowHeight = Dimensions.get("window").height;

  const cleanText = (text) => {
    return (
      text
        // Remove multiple spaces
        .replace(/\s+/g, " ")
        // Remove multiple newlines, replace with single newline
        .replace(/\n{2,}/g, "\n")
        // Remove spaces at the beginning of lines
        .replace(/^\s+/gm, "")
        // Remove spaces at the end of lines
        .replace(/\s+$/gm, "")
        // Replace multiple newlines with single newline
        .replace(/\n+/g, "\n")
        // Remove indentation after newlines
        .replace(/\n\s+/g, "\n")
        // Remove any remaining extra whitespace
        .replace(/\s{2,}/g, " ")
        // Preserve paragraph breaks for better readability
        .replace(/\.\s+([A-Z])/g, ".\n\n$1")
        // Trim the final result
        .trim()
    );
  };

  const handleSearch = async () => {
    if (searchPhrase.trim() === "") {
      setSearchResults([]);
      return;
    }

    Keyboard.dismiss();

    setLoading(true);
    setSearchResults([]); // Clear stale results so the loader is always visible
    setExpandedSearchResults(new Set());

    try {
      // Use FTS5 search - much faster!
      const results = await searchSermonsWithFTS(searchPhrase);

      // Transform results to match expected format
      const filtered = results.map((sermon) => {
        const primaryMatch = sermon.matches[0];
        const regex = new RegExp(`(${escapeRegex(searchPhrase)})`, "gi");

        return {
          title: sermon.title,
          year: sermon.year,
          location: sermon.location,
          id: sermon.id,
          sentence: primaryMatch.context.replace(
            regex,
            `<highlight>$1</highlight>`,
          ),
          paragraphIndex: primaryMatch.paragraphIndex,
          totalMatches: sermon.totalMatches,
          allMatches: sermon.matches,
        };
      });

      if (filtered.length === 0) {
        setFound(false);
      } else {
        setFound(true);
      }

      setSearchResults(filtered);
    } catch (error) {
      console.log("Could not search sermons", error);
      setFound(false);
      setSearchResults([]);
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };

  const toggleResultExpanded = useCallback((index) => {
    setExpandedSearchResults((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const handleSermonClick = (sermon, paragraphIndex = null) => {
    // Navigate directly to CurrentSermon with only IDs - let CurrentSermon fetch the sermon
    if (sermon) {
      const targetParagraph =
        paragraphIndex !== null ? paragraphIndex : sermon.paragraphIndex;

      const navParams = {
        source: "search",
        searchPhrase: searchPhrase,
        initialParagraph: targetParagraph,
        sermonId: sermon.id, // Pass only the ID
      };

      console.log("Search navigation:", {
        title: sermon.title,
        sermonId: sermon.id,
        paragraphIndex: targetParagraph,
        searchPhrase: searchPhrase,
      });

      // Navigate - CurrentSermon will fetch the sermon by ID
      navigation.navigate("currentsermon", navParams);
    }
  };

  const handleClearSearch = () => {
    setSearchPhrase("");
    setSearchResults([]);
    setExpandedSearchResults(new Set()); // Clear expanded search results
    searchInputRef.current?.focus();
  };

  // Render function for FlatList items — memoized so FlatList does not recreate
  // the callback (and re-render all visible cells) on unrelated state changes.
  const renderSearchResultItem = useCallback(
    ({ item: sermon, index }) => {
      const showExpanded = expandedSearchResults.has(index);
      const isEven = index % 2 === 0;
      const accentColor = theme.dark ? "rgba(230,195,184,0.92)" : "#5d3211";
      const highlightBg = theme.dark
        ? "rgba(230,195,184,0.2)"
        : "rgba(93,50,17,0.16)";
      const highlightFg = theme.dark ? "#f8e3d5" : "#5d3211";
      const metaPrefix = `${sermon.year || "Unknown year"}${sermon.location ? ` • ${sermon.location}` : ""} • ${sermon.totalMatches} ${sermon.totalMatches === 1 ? "match" : "matches"}`;
      const backgroundColor = theme.dark
        ? isEven
          ? theme.colors.primary
          : theme.colors.background
        : isEven
          ? "rgba(93, 50, 17, 0.04)"
          : "rgba(93, 50, 17, 0.02)";

      return (
        <TouchableOpacity
          key={`search-result-${index}`}
          style={[styles.searchResultItem, { backgroundColor }]}
          onPress={() => {
            // Toggle card expansion/collapse; navigation stays on individual match taps.
            toggleResultExpanded(index);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.resultContent}>
            {/* Sermon title */}
            <View style={styles.resultHeader}>
              <Text
                style={[
                  styles.resultTitle,
                  {
                    color: theme.colors.text,
                    fontFamily: "ZillaSlabsm",
                  },
                ]}
                numberOfLines={1}
              >
                {sermon.title.trim()}
              </Text>
            </View>

            {/* Inline metadata + preview to conserve vertical space */}
            <View style={styles.contextContainer}>
              {/* Show first match when collapsed, all matches when expanded */}
              {showExpanded && sermon.totalMatches > 1 ? (
                // Show all matches as separate clickable items
                <View style={{ marginTop: 2 }}>
                  <View style={styles.expandedMetaRow}>
                    <Text
                      style={[
                        styles.paragraphLabel,
                        {
                          color: theme.dark
                            ? "rgba(255,255,255,0.62)"
                            : "rgba(93,50,17,0.78)",
                          fontFamily: "ZillaSlab",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {metaPrefix}
                    </Text>
                    <TouchableOpacity
                      style={styles.expandCaretExpanded}
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleResultExpanded(index);
                      }}
                    >
                      <MaterialIcons
                        name="expand-less"
                        size={24}
                        color={theme.colors.text}
                        style={{ opacity: 0.7 }}
                      />
                    </TouchableOpacity>
                  </View>
                  {sermon.allMatches.map((match, matchIndex) => {
                    // Generate unique context for this specific match
                    const paragraphText = match.fullParagraph || match.context;
                    // Use the helper function to guarantee match is highlighted
                    const highlightedContext = extractHighlightedContext(
                      paragraphText,
                      searchPhrase,
                      90,
                      220,
                    );

                    return (
                      <TouchableOpacity
                        key={`match-${matchIndex}`}
                        style={[
                          styles.individualMatch,
                          {
                            backgroundColor: theme.dark
                              ? "rgba(230, 195, 184, 0.07)"
                              : "rgba(93, 50, 17, 0.04)",
                            borderLeftColor: theme.dark
                              ? "rgba(230,195,184,0.45)"
                              : "#5d3211",
                          },
                        ]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleSermonClick(sermon, match.paragraphIndex);
                        }}
                        activeOpacity={0.6}
                      >
                        <Text
                          style={[
                            styles.matchContext,
                            {
                              color: theme.dark
                                ? "rgba(255,255,255,0.8)"
                                : "#5d3211",
                              fontFamily: "ZillaSlab",
                            },
                          ]}
                          numberOfLines={4}
                        >
                          <Text
                            style={[
                              styles.matchLabelInline,
                              { color: accentColor },
                            ]}
                          >
                            ¶ {match.paragraphIndex + 1} •{" "}
                          </Text>
                          {highlightedContext
                            .split(/(<highlight>.*?<\/highlight>)/g)
                            .map((part, i) => {
                              const isHighlight =
                                part.startsWith("<highlight>") &&
                                part.endsWith("</highlight>");
                              const text = part.replace(/<\/?highlight>/g, "");

                              return (
                                <Text
                                  key={`match-${matchIndex}-${i}`}
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
                                  {text}
                                </Text>
                              );
                            })}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                // Show compact highlighted snippets for all matches when not expanded
                <View style={styles.inlinePreviewRow}>
                  <Text
                    style={[
                      styles.inlineMetaText,
                      {
                        color: theme.dark
                          ? "rgba(255,255,255,0.62)"
                          : "rgba(93,50,17,0.78)",
                        fontFamily: "ZillaSlabsm",
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {metaPrefix}
                  </Text>

                  <View style={styles.previewMatchesStack}>
                    {sermon.allMatches.map((match, matchIndex) => {
                      const paragraphText =
                        match.fullParagraph || match.context;
                      // Use the helper function to guarantee match is highlighted
                      const highlightedContext = extractHighlightedContext(
                        paragraphText,
                        searchPhrase,
                        110,
                        260,
                      );

                      return (
                        <TouchableOpacity
                          key={`preview-match-${matchIndex}`}
                          style={styles.previewMatchItem}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleSermonClick(sermon, match.paragraphIndex);
                          }}
                          activeOpacity={0.75}
                        >
                          <Text
                            style={[
                              styles.previewMatchText,
                              {
                                color: theme.dark
                                  ? "rgba(255,255,255,0.82)"
                                  : "#5d3211",
                                fontFamily: "ZillaSlab",
                              },
                            ]}
                            numberOfLines={2}
                          >
                            <Text
                              style={[
                                styles.matchLabelInline,
                                { color: accentColor },
                              ]}
                            >
                              ¶ {match.paragraphIndex + 1} •{" "}
                            </Text>
                            {highlightedContext
                              .split(/(<highlight>.*?<\/highlight>)/g)
                              .map((part, i) => {
                                const isHighlight =
                                  part.startsWith("<highlight>") &&
                                  part.endsWith("</highlight>");
                                const text = part.replace(
                                  /<\/?highlight>/g,
                                  "",
                                );

                                return (
                                  <Text
                                    key={`preview-context-${matchIndex}-${i}`}
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
                                    {text}
                                  </Text>
                                );
                              })}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {sermon.totalMatches > 1 && (
                    <TouchableOpacity
                      style={styles.expandCaretInline}
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleResultExpanded(index);
                      }}
                    >
                      <MaterialIcons
                        name={showExpanded ? "expand-less" : "expand-more"}
                        size={24}
                        color={theme.colors.text}
                        style={{ opacity: 0.7 }}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Bottom separator line */}
          <View
            style={[
              styles.resultSeparator,
              {
                backgroundColor: theme.dark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.1)",
              },
            ]}
          />
        </TouchableOpacity>
      );
    },
    [
      searchPhrase,
      expandedSearchResults,
      theme,
      handleSermonClick,
      toggleResultExpanded,
    ],
  );

  // Key extractor for FlatList — stable, no closure deps needed
  const keyExtractor = useCallback(
    (item, index) => `search-result-${item.id}-${index}`,
    [],
  );

  // Render function for empty / no-results state
  const renderMainContent = () => {
    // No results content
    return (
      <View style={styles.noResultsContainer}>
        {searchPhrase.trim() !== "" && !found ? (
          <>
            <Image
              source={require("../../assets/viewnotfound.png")}
              style={{
                width: 140,
                height: 170,
                marginBottom: 20,
              }}
            />
            <Text
              style={[
                styles.noResultsText,
                {
                  color: theme.dark
                    ? "rgba(255,255,255,0.6)"
                    : "rgba(0,0,0,0.6)",
                },
              ]}
            >
              No sermons found for "{searchText}"
            </Text>
            <TouchableOpacity
              style={[
                styles.tryAgainButton,
                {
                  backgroundColor: theme.dark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.05)",
                },
              ]}
              onPress={() => {
                handleClearSearch();
              }}
            >
              <Text
                style={{
                  color: theme.dark ? theme.colors.hlight : "#1c1917",
                  fontWeight: "500",
                }}
              >
                Try another search
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <MaterialCommunityIcons
              name="text-search"
              size={80}
              color={theme.dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}
              style={{ marginBottom: 20 }}
            />
            <Text
              style={[
                styles.noResultsText,
                {
                  color: theme.dark
                    ? "rgba(255,255,255,0.6)"
                    : "rgba(0,0,0,0.6)",
                },
              ]}
            >
              Search quotes from all sermons
            </Text>
            <Text
              style={[
                styles.noResultsSubtext,
                {
                  color: theme.dark
                    ? "rgba(255,255,255,0.4)"
                    : "rgba(0,0,0,0.4)",
                },
              ]}
            >
              Enter keywords to find specific passages
            </Text>
          </>
        )}
      </View>
    );
  };

  // Header element for FlatList — useMemo produces a stable element (not a
  // new component type) so FlatList never unmounts/remounts the header.
  const ListHeaderComponent = useMemo(
    () => (
      <View style={styles.resultsContainer}>
        <Text
          style={[
            styles.resultsCount,
            {
              color: theme.dark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
              fontFamily: "ZillaSlab",
            },
          ]}
        >
          Found {searchResults.length} result
          {searchResults.length !== 1 ? "s" : ""}
        </Text>
      </View>
    ),
    [searchResults.length, theme.dark],
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <DraggableFloatingButton />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Search
        </Text>
        <Text
          style={[
            styles.headerSubtitle,
            {
              color: theme.dark
                ? "rgba(255,255,255,0.28)"
                : "rgba(93, 50, 17, 0.45)",
            },
          ]}
        >
          All Sermons
        </Text>
      </View>

      <View style={styles.searchContainer}>
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
            color={theme.dark ? "rgba(255,255,255,0.4)" : "rgba(93,50,17,0.45)"}
            style={styles.searchIcon}
          />
          <TextInput
            ref={searchInputRef}
            style={[
              styles.searchInput,
              {
                color: theme.dark ? theme.colors.text : "#1a0e07",
                fontFamily: "ZillaSlab",
                fontSize: 15,
              },
            ]}
            placeholder="Search sermons..."
            value={searchPhrase}
            onChangeText={(e) => {
              setSearchPhrase(e);
              setFound(true);
            }}
            placeholderTextColor={
              theme.dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"
            }
            selectionColor={theme.dark ? theme.colors.text : "#5d3211"}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            keyboardAppearance={theme.dark ? "dark" : "light"}
          />
          {searchPhrase.length > 0 && (
            <TouchableOpacity
              onPress={handleClearSearch}
              style={styles.clearButton}
            >
              <AntDesign
                name="close"
                size={16}
                color={theme.dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"}
              />
            </TouchableOpacity>
          )}
        </View>
        <SearchActionButton
          theme={theme}
          onPress={handleSearch}
          label="Enter"
        />
      </View>

      {/* Main content — loader takes priority over results or empty state */}
      {loading ? (
        <SearchLoader theme={theme} />
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResultItem}
          keyExtractor={keyExtractor}
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 10, paddingHorizontal: 4 }}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
          ListHeaderComponent={ListHeaderComponent}
        />
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          {renderMainContent()}
        </ScrollView>
      )}
    </View>
  );
};

export default SermonSearch;
