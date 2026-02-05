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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "../../Logic/globalState";
import { ActivityIndicator } from "react-native";
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
  const fadeAnim = new Animated.Value(0);

  const [fontsLoaded] = useFonts({
    ZillaSlab: require("../../assets/fonts/ZillaSlab-Regular.ttf"),
    ZillaSlabSemiBold: require("../../assets/fonts/ZillaSlab-SemiBold.ttf"),
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
    setExpandedResults(new Set()); // Clear expanded search results

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

  const toggleResultExpanded = (index) => {
    setExpandedResults((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

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

  // Render function for FlatList items
  const renderSearchResultItem = ({ item: sermon, index }) => {
    const showExpanded = expandedResults.has(index);
    const isEven = index % 2 === 0;
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
                  fontFamily: "ZillaSlab",
                },
              ]}
              numberOfLines={1}
            >
              {sermon.title.trim()}
            </Text>
            <View
              style={[
                styles.resultYearBadge,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text
                style={[styles.resultYearText, { color: theme.colors.text }]}
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
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(0,0,0,0.03)",
                          borderLeftColor: theme.colors.text,
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
                          { color: theme.colors.text, fontFamily: "ZillaSlab" },
                        ]}
                      >
                        📍 Paragraph {match.paragraphIndex + 1}
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
                                style={[
                                  isHighlight
                                    ? {
                                        backgroundColor: theme.dark
                                          ? "#5d3211" + "70"
                                          : "#5d3211" + "30",
                                        color: theme.dark ? "#fff" : "#5d3211",
                                        fontWeight: "600",
                                      }
                                    : undefined,
                                ]}
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
                        style={[
                          isHighlight
                            ? {
                                backgroundColor: theme.dark
                                  ? "#5d3211" + "70"
                                  : "#5d3211" + "30",
                                color: theme.dark ? "#fff" : "#5d3211",
                                fontWeight: "600",
                              }
                            : undefined,
                        ]}
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
  };

  // Key extractor for FlatList
  const keyExtractor = (item, index) => `search-result-${item.id}-${index}`;

  // Render function for the main FlatList (includes header, results, and footer)
  const renderMainContent = () => {
    if (loading) {
      return (
        <View style={styles.loaderContainer}>
          <View
            style={[
              styles.loaderWrapper,
              {
                backgroundColor: theme.dark
                  ? theme.colors.primary
                  : "rgba(0,0,0,0.02)",
              },
            ]}
          >
            <ActivityIndicator size="large" color="#5d3211" />
            <Text
              style={[
                styles.loaderText,
                {
                  color: theme.dark
                    ? "rgba(255,255,255,0.7)"
                    : "rgba(0,0,0,0.6)",
                },
              ]}
            >
              Searching through sermons...
            </Text>
          </View>
        </View>
      );
    }

    if (filteredSermons.length > 0) {
      return null; // Results will be rendered by FlatList data
    }

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

  // Header component for FlatList
  const ListHeaderComponent = () => (
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
          style={[
            styles.headerTitle,
            {
              color: theme.colors.text,
              fontWeight: "bold",
            },
          ]}
        >
          Sermon Search
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View
          style={[
            styles.inputWrapper,
            {
              borderWidth: theme.dark ? 0 : 0,
              backgroundColor: theme.dark
                ? "rgba(255,255,255,0.08)"
                : "#f3f0f090",
              borderColor: theme.dark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.1)",
            },
          ]}
        >
          <Feather
            name="search"
            size={20}
            color={theme.dark ? theme.colors.text : "#494d50"}
            style={styles.searchIcon}
          />
          <TextInput
            ref={searchInputRef}
            style={[
              styles.searchInput,
              {
                color: theme.dark ? theme.colors.text : "black",
                fontFamily: "serif",
                fontSize: 14,
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

      {/* Main content with FlatList - no nested ScrollView */}
      {filteredSermons.length > 0 ? (
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
