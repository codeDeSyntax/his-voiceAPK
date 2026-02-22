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

// ── Animated dot for the search loading indicator ──────────────────────────
const SearchDot = ({ anim, color }) => {
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.15, 1] });
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
const EXPANDED_CONTEXT_LENGTH = 150;
const POPUP_CONTEXT_LENGTH = 3000;

const SermonSearch = () => {
  const { theme, setSelectedSermon } = useAppContext(); // Removed textSermons - we'll query DB directly
  const navigation = useNavigation();

  const [searchText, setSearchText] = useState(""); // Local search state for Search screen
  const [searchPhrase, setSearchPhrase] = useState(""); // Local search phrase
  const [filteredSermons, setFilteredSermons] = useState([]);
  const [expandedResults, setExpandedResults] = useState(new Set()); // Track expanded search results
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
      setFilteredSermons([]);
      return;
    }

    Keyboard.dismiss();

    setLoading(true);
    setFilteredSermons([]); // Clear stale results so the loader is always visible
    setExpandedResults(new Set());

    try {
      // Use FTS5 search - much faster!
      const results = await searchSermonsWithFTS(searchPhrase);

      // Transform results to match expected format
      const filtered = results.map((sermon) => {
        const primaryMatch = sermon.matches[0];
        const regex = new RegExp(`(${searchPhrase})`, "gi");

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

      setFilteredSermons(filtered);
    } catch (error) {
      console.log("Could not search sermons", error);
      setFound(false);
      setFilteredSermons([]);
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
    setExpandedResults((prev) => {
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
    setSearchText("");
    setSearchPhrase("");
    setFilteredSermons([]);
    setExpandedResults(new Set()); // Clear expanded search results
    searchInputRef.current?.focus();
  };

  // Render function for FlatList items — memoized so FlatList does not recreate
  // the callback (and re-render all visible cells) on unrelated state changes.
  const renderSearchResultItem = useCallback(({ item: sermon, index }) => {
    const showExpanded = expandedResults.has(index);
    const isEven = index % 2 === 0;
    const accentColor = theme.dark ? "#d57a3e" : "#5d3211";
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
          // If collapsed, expand it; if already expanded, navigate to first match
          if (!showExpanded) {
            toggleResultExpanded(index);
          } else {
            handleSermonClick(sermon);
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.resultContent}>
          {/* Title and Year */}
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
            <View
              style={[
                styles.resultYearBadge,
                {
                  backgroundColor: theme.dark
                    ? "rgba(213, 122, 62, 0.18)"
                    : "rgba(93, 50, 17, 0.1)",
                },
              ]}
            >
              <Text
                style={[
                  styles.resultYearText,
                  {
                    color: theme.dark ? "#d57a3e" : "#5d3211",
                  },
                ]}
              >
                {sermon.year}
              </Text>
            </View>
          </View>

          {/* Search context with paragraph info */}
          <View style={styles.contextContainer}>
            <View style={styles.paragraphInfo}>
              <Text
                style={[
                  styles.paragraphLabel,
                  {
                    color: theme.colors.text,
                    fontFamily: "ZillaSlab",
                  },
                ]}
              >
                {sermon.totalMatches}{" "}
                {sermon.totalMatches === 1 ? "match" : "matches"} found
              </Text>

              {/* Show more caret - only if multiple matches */}
              {sermon.totalMatches > 1 && (
                <TouchableOpacity
                  style={styles.expandCaret}
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

            {/* Show first match when collapsed, all matches when expanded */}
            {showExpanded && sermon.totalMatches > 1 ? (
              // Show all matches as separate clickable items
              <View style={{ marginTop: 8 }}>
                {sermon.allMatches.map((match, matchIndex) => {
                  // Generate unique context for this specific match
                  const paragraphText = match.fullParagraph || match.context;
                  const searchLower = searchPhrase.toLowerCase();
                  const textLower = paragraphText.toLowerCase();
                  const matchIndex2 = textLower.indexOf(searchLower);

                  let uniqueContext = paragraphText;
                  if (matchIndex2 !== -1) {
                    const start = Math.max(0, matchIndex2 - 50);
                    const end = Math.min(
                      paragraphText.length,
                      matchIndex2 + searchPhrase.length + 100,
                    );
                    uniqueContext = paragraphText.substring(start, end);
                    if (start > 0) uniqueContext = "..." + uniqueContext;
                    if (end < paragraphText.length)
                      uniqueContext = uniqueContext + "...";
                  }

                  const regex = new RegExp(`(${searchPhrase})`, "gi");
                  const highlightedContext = uniqueContext.replace(
                    regex,
                    `<highlight>$1</highlight>`,
                  );

                  return (
                    <TouchableOpacity
                      key={`match-${matchIndex}`}
                      style={[
                        styles.individualMatch,
                        {
                          backgroundColor: theme.dark
                            ? "rgba(213, 122, 62, 0.06)"
                            : "rgba(93, 50, 17, 0.04)",
                          borderLeftColor: theme.dark ? "#d57a3e" : "#5d3211",
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
                          styles.matchLabel,
                          { color: accentColor },
                        ]}
                      >
                        ¶ {match.paragraphIndex + 1}
                      </Text>
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
                        numberOfLines={3}
                      >
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
                                        backgroundColor: theme.dark
                                          ? "#5d3211" + "70"
                                          : "#5d3211" + "30",
                                        color: theme.dark ? "#f8e3d5" : "#5d3211",
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
              // Show only first match when not expanded
              <Text
                style={[
                  styles.resultContext,
                  {
                    color: theme.dark ? "rgba(255,255,255,0.8)" : "#5d3211",
                    fontFamily: "ZillaSlab",
                  },
                ]}
                numberOfLines={2}
              >
                {sermon.sentence
                  .split(/(<highlight>.*?<\/highlight>)/g)
                  .map((part, i) => {
                    const isHighlight =
                      part.startsWith("<highlight>") &&
                      part.endsWith("</highlight>");
                    const text = part.replace(/<\/?highlight>/g, "");

                    return (
                      <Text
                        key={`context-${i}`}
                        style={
                          isHighlight
                            ? {
                                backgroundColor: theme.dark
                                  ? "#5d3211" + "70"
                                  : "#5d3211" + "30",
                                color: theme.dark ? "#f8e3d5" : "#5d3211",
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
  }, [searchPhrase, expandedResults, theme, handleSermonClick, toggleResultExpanded]);

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
        {searchText.trim() !== "" && !found ? (
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
          Found {filteredSermons.length} result
          {filteredSermons.length !== 1 ? "s" : ""}
        </Text>
      </View>
    ),
    [filteredSermons.length, theme.dark],
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
        <Text
          style={[styles.headerTitle, { color: theme.colors.text }]}
        >
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
              setSearchText(e);
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
          {searchText.length > 0 && (
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
        <TouchableOpacity
          style={[
            styles.searchButton,
            {
              backgroundColor: theme.dark ? "#5d3211" : "#5d3211",
            },
          ]}
          onPress={handleSearch}
        >
          <MaterialIcons
            name="search"
            style={styles.searchButtonText}
            size={20}
          />
        </TouchableOpacity>
      </View>

      {/* Main content — loader takes priority over results or empty state */}
      {loading ? (
        <SearchLoader theme={theme} />
      ) : filteredSermons.length > 0 ? (
        <FlatList
          data={filteredSermons}
          renderItem={renderSearchResultItem}
          keyExtractor={keyExtractor}
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 4 }}
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
