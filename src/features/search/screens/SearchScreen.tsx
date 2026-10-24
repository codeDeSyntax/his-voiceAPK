import React, {
  useState,
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
  TouchableOpacity,
  Animated,
  Pressable,
  Keyboard,
  Image,
  FlatList,
} from "react-native";
import { useAppContext } from "../../../providers/SermonProvider";
import {
  AntDesign,
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import styles from "../styles/search";
import DraggableFloatingButton from "../../../shared/components/FloatButton";
import { searchSermonsWithFTS } from "../../sermons/data/sermonDB";
import type { AppTheme } from "../../../shared/theme/types";
import type { SermonSearchResult } from "../types";

const escapeRegex = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Helper function to extract context and guarantee highlight match is visible
const extractHighlightedContext = (
  fullText: string,
  searchPhrase: string,
  contextBefore = 110,
  contextAfter = 260,
): string => {
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
const SearchDot = ({ anim, color }: { anim: Animated.Value; color: string }) => {
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

const SearchLoader = ({ theme }: { theme: AppTheme }) => {
  const dot1 = useState(() => new Animated.Value(0))[0];
  const dot2 = useState(() => new Animated.Value(0))[0];
  const dot3 = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    const make = (anim: Animated.Value, delay: number) =>
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
  }, [dot1, dot2, dot3]);

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

const SearchActionButton = ({ theme, onPress, label = "Enter" }: { theme: AppTheme; onPress: () => void; label?: string }) => {
  const scaleAnim = useState(() => new Animated.Value(1))[0];

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
const SermonSearch = () => {
  const {
    theme,
    searchPhrase,
    setSearchPhrase,
    searchResults,
    setSearchResults,
    expandedSearchResults,
    setExpandedSearchResults,
  } = useAppContext();
  const navigation = useRouter();

  const [loading, setLoading] = useState(false);
  const [found, setFound] = useState(true);
  // Stable animated value — must NOT be recreated on every render
  const fadeAnim = useState(() => new Animated.Value(0))[0];

  // Refs
  const searchInputRef = useRef<React.ElementRef<typeof TextInput> | null>(null);

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
      const filtered = results
        .map((sermon): SermonSearchResult => {
          const primaryMatch = sermon.matches[0];
          const regex = new RegExp(`(${escapeRegex(searchPhrase)})`, "gi");

          return {
            title: sermon.title,
            year: sermon.year,
            location: sermon.location,
            id: sermon.id,
            sentence: primaryMatch.context.replace(regex, `<highlight>$1</highlight>`),
            paragraphIndex: primaryMatch.paragraphIndex,
            totalMatches: sermon.totalMatches,
            allMatches: sermon.matches,
          };
        })
        .sort((a, b) => a.title.trim().localeCompare(b.title.trim()));

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

  const toggleResultExpanded = useCallback((index: number) => {
    setExpandedSearchResults((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, [setExpandedSearchResults]);

  const handleSermonClick = useCallback((sermon: SermonSearchResult, paragraphIndex: number | null = null) => {
    // Navigate directly to CurrentSermon with only IDs - let CurrentSermon fetch the sermon
    if (sermon) {
      const targetParagraph =
        paragraphIndex !== null ? paragraphIndex : sermon.paragraphIndex;

      const navParams = {
        source: "search",
        searchPhrase: searchPhrase,
        initialParagraph: String(targetParagraph),
        sermonId: String(sermon.id),
      };

      console.log("Search navigation:", {
        title: sermon.title,
        sermonId: sermon.id,
        paragraphIndex: targetParagraph,
        searchPhrase: searchPhrase,
      });

      // Navigate - CurrentSermon will fetch the sermon by ID
      navigation.navigate({ pathname: "/reader", params: navParams });
    }
  }, [navigation, searchPhrase]);

  const handleClearSearch = () => {
    setSearchPhrase("");
    setSearchResults([]);
    setExpandedSearchResults(new Set()); // Clear expanded search results
    searchInputRef.current?.focus();
  };

  // Render function for FlatList items — memoized so FlatList does not recreate
  // the callback (and re-render all visible cells) on unrelated state changes.
  const renderSearchResultItem = useCallback(
    ({ item: sermon, index }: { item: SermonSearchResult; index: number }) => {
      const showExpanded = expandedSearchResults.has(index);
      const isEven = index % 2 === 0;
      const accentColor = theme.dark ? "rgba(230,195,184,0.92)" : "#5d3211";
      const highlightBg = theme.dark
        ? "rgba(230,195,184,0.2)"
        : "rgba(93,50,17,0.16)";
      const highlightFg = theme.dark ? "#f8e3d5" : "#5d3211";
      const backgroundColor = theme.dark
        ? isEven
          ? "rgba(242, 205, 180, 0.02)"
          : "transparent"
        : isEven
          ? "rgba(93, 50, 17, 0.02)"
          : "transparent";
      const metaLabel = [
        sermon.year || "Unknown year",
        sermon.location,
        `${sermon.totalMatches} ${sermon.totalMatches === 1 ? "match" : "matches"}`,
      ]
        .filter(Boolean)
        .join(" - ");

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
            <View style={styles.resultHeader}>
              <View
                style={[
                  styles.resultIconCircle,
                  {
                    backgroundColor: theme.dark
                      ? "rgba(60, 50, 44, 0.85)"
                      : "rgba(250, 238, 209, 0.85)",
                  },
                ]}
              >
                <MaterialIcons
                  name="article"
                  size={22}
                  color={theme.dark ? "#fdcfad" : "#5d3211"}
                />
              </View>

              <View style={styles.resultTextContainer}>
                <Text
                  style={[
                    styles.resultTitle,
                    {
                      color: theme.dark ? "#fae7da" : theme.colors.text,
                      fontFamily: "Merriweather",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {sermon.title.trim()}
                </Text>

                <View style={styles.resultMetaRow}>
                  <Text
                    style={[
                      styles.resultMetaText,
                      {
                        color: theme.dark
                          ? theme.colors.text + "70"
                          : "#5d321180",
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {sermon.year || "Unknown year"}
                  </Text>

                  {sermon.location ? (
                    <Text
                      style={[
                        styles.resultMetaText,
                        {
                          color: theme.dark
                            ? theme.colors.text + "62"
                            : "#5d321168",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {sermon.location}
                    </Text>
                  ) : null}

                  <View
                    style={[
                      styles.resultMatchPill,
                      {
                        backgroundColor: theme.dark
                          ? "rgba(242,205,180,0.08)"
                          : "rgba(93,50,17,0.08)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.resultMatchPillText,
                        { color: theme.dark ? "#f2cdb4" : "#5d3211" },
                      ]}
                    >
                      {sermon.totalMatches}{" "}
                      {sermon.totalMatches === 1 ? "match" : "matches"}
                    </Text>
                  </View>
                </View>
              </View>

              <MaterialIcons
                name={showExpanded ? "expand-less" : "expand-more"}
                size={22}
                color={theme.colors.text}
                style={styles.resultExpandIcon}
              />
            </View>

            {/* Inline metadata + preview to conserve vertical space */}
            <View style={styles.contextContainer}>
              {/* Show first match when collapsed, all matches when expanded */}
              {showExpanded ? (
                // Show all matches as separate clickable items
                <View style={{ marginTop: 2 }}>
                  <View style={styles.expandedMetaRow}>
                    <View style={styles.treeMetaRow}>
                      <View
                        style={[
                          styles.treeRootDot,
                          {
                            backgroundColor: theme.dark
                              ? "rgba(242,205,180,0.70)"
                              : "rgba(93,50,17,0.55)",
                          },
                        ]}
                      />
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
                        {metaLabel}
                      </Text>
                    </View>
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
                      <View
                        key={`match-${matchIndex}`}
                        style={styles.treeMatchRow}
                      >
                        <View style={styles.treeRailWrap}>
                          {matchIndex < sermon.allMatches.length - 1 && (
                            <View
                              style={[
                                styles.treeRail,
                                {
                                  backgroundColor: theme.dark
                                    ? "rgba(242,205,180,0.15)"
                                    : "rgba(93,50,17,0.13)",
                                },
                              ]}
                            />
                          )}
                          <View
                            style={[
                              styles.treeJoint,
                              {
                                borderColor: theme.dark
                                  ? "rgba(242,205,180,0.20)"
                                  : "rgba(93,50,17,0.18)",
                              },
                            ]}
                          />
                        </View>
                        <TouchableOpacity
                          style={[
                            styles.individualMatch,
                            {
                              backgroundColor: theme.dark
                                ? "rgba(230, 195, 184, 0.07)"
                                : "rgba(93, 50, 17, 0.04)",
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
                              P{match.paragraphIndex + 1} -{" "}
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
                      </View>
                    );
                  })}
                </View>
              ) : null}
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
    (item: SermonSearchResult, index: number) => `search-result-${item.id}-${index}`,
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
              source={require("../../../../assets/viewnotfound.png")}
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
              No sermons found for &quot;{searchPhrase}&quot;
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

      {/* Main content — loader takes priority over results or empty state */}
      {loading ? (
        <SearchLoader theme={theme} />
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResultItem}
          keyExtractor={keyExtractor}
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 10, paddingHorizontal: 0 }}
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
