import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Dimensions,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useAppContext } from "../../Logic/globalState";
import { searchSermon } from "../../Utils/sermonUtils";
import { useFonts } from "expo-font";

// Debounce utility for search performance
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

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
  const [searching, setSearching] = useState(false);
  const searchInputRef = useRef(null);

  const [fontsLoaded] = useFonts({
    ZillaSlab: require("../../assets/fonts/ZillaSlab-Regular.ttf"),
    ZillaSlabsm: require("../../assets/fonts/ZillaSlab-SemiBold.ttf"),
  });

  // Debounce search for better performance
  const debouncedSearchPhrase = useDebounce(searchPhrase, 300);

  // Enhanced search effect with context extraction
  useEffect(() => {
    if (debouncedSearchPhrase.trim()) {
      setSearching(true);
      try {
        const indices = searchSermon(paragraphs, debouncedSearchPhrase);

        // Extract context for each result
        const resultsWithContext = indices.map((index) => {
          const paragraph = paragraphs[index];
          const lowerPhrase = debouncedSearchPhrase.toLowerCase();
          const lowerParagraph = paragraph.toLowerCase();

          // Find the match position
          const matchIndex = lowerParagraph.indexOf(lowerPhrase);

          // Extract context around the match (100 characters before and after)
          const contextStart = Math.max(0, matchIndex - 100);
          const contextEnd = Math.min(
            paragraph.length,
            matchIndex + debouncedSearchPhrase.length + 100
          );

          let context = paragraph.substring(contextStart, contextEnd);

          // Add ellipsis if we're not at the beginning/end
          if (contextStart > 0) context = "..." + context;
          if (contextEnd < paragraph.length) context = context + "...";

          // Highlight the match in the context
          const highlightedContext = highlightText(
            context,
            debouncedSearchPhrase
          );

          return {
            index,
            paragraph: paragraph,
            context: highlightedContext,
            matchPosition: matchIndex,
          };
        });

        setSearchResults(resultsWithContext);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchPhrase, paragraphs]);

  // Function to highlight search terms in text
  const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.replace(regex, "**$1**"); // Using markdown-style highlighting
  };

  // Focus input when component becomes visible
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
    [onNavigateToResult, onClose, searchPhrase]
  );

  const clearSearch = useCallback(() => {
    setSearchPhrase("");
    setSearchResults([]);
  }, []);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    clearSearch();
    onClose();
  }, [onClose, clearSearch]);

  if (!visible) return null;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* <StatusBar
        barStyle={theme.dark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      /> */}

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
                ? "rgba(80, 61, 49, 0.975)"
                : "rgba(93, 50, 17, 0.2)",
            },
          ]}
        >
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Feather name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <Text
            style={[
              styles.headerTitle,
              {
                color: theme.colors.text,
                fontFamily: fontsLoaded ? "ZillaSlabsm" : "System",
              },
            ]}
          >
            Search in Sermon
          </Text>

          {searchPhrase.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Feather
                name="x"
                size={20}
                color={
                  theme.dark ? "rgba(255,255,255,0.8)" : "rgba(93, 50, 17, 0.8)"
                }
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Input */}
        <View
          style={[
            styles.searchContainer,
            {
              borderColor: theme.dark
                ? "rgba(62, 45, 32, 0.932)"
                : "rgba(208, 203, 199, 0.932)",
            },
          ]}
        >
          <Feather
            name="search"
            size={20}
            color={
              theme.dark ? "rgba(255,255,255,0.6)" : "rgba(93, 50, 17, 0.6)"
            }
            style={styles.searchIcon}
          />
          <TextInput
            ref={searchInputRef}
            style={[
              styles.searchInput,
              {
                color: theme.colors.text,
                fontFamily: fontsLoaded ? "ZillaSlab" : "System",
              },
            ]}
            placeholder="Search for words or phrases..."
            placeholderTextColor={
              theme.dark ? theme.colors.text : "rgba(93, 50, 17, 0.6)"
            }
            value={searchPhrase}
            onChangeText={setSearchPhrase}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            keyboardAppearance={theme.dark ? "dark" : "light"}
          />
          {searching && (
            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
              style={styles.loadingIndicator}
            />
          )}
        </View>

        {/* Results Count */}
        {searchPhrase.trim() && (
          <View style={styles.resultsHeader}>
            <Text
              style={[
                styles.resultsCount,
                {
                  color: theme.dark
                    ? "rgba(255,255,255,0.7)"
                    : "rgba(93, 50, 17, 0.7)",
                  fontFamily: fontsLoaded ? "ZillaSlab" : "System",
                },
              ]}
            >
              {searching
                ? "Searching..."
                : `${searchResults.length} result${
                    searchResults.length !== 1 ? "s" : ""
                  } found`}
            </Text>
          </View>
        )}

        {/* Results List */}
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
                {/* Paragraph Info Header */}
                <View style={styles.paragraphInfo}>
                  <Text
                    style={[
                      styles.paragraphLabel,
                      {
                        color: theme.colors.text,
                        fontFamily: fontsLoaded ? "ZillaSlab" : "System",
                      },
                    ]}
                  >
                    📍 Paragraph {result.index + 1}
                  </Text>
                  <MaterialIcons
                    name="keyboard-arrow-right"
                    size={16}
                    color={
                      theme.dark
                        ? "rgba(255,255,255,0.6)"
                        : "rgba(93, 50, 17, 0.6)"
                    }
                  />
                </View>

                {/* Context Text */}
                <Text
                  style={[
                    styles.resultContext,
                    {
                      color: theme.dark ? "rgba(255,255,255,0.8)" : "#5d3211",
                      fontFamily: fontsLoaded ? "ZillaSlab" : "System",
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
                            ? [
                                styles.highlightText,
                                {
                                  backgroundColor: theme.dark
                                    ? "#5d3211" + "70"
                                    : "#5d3211" + "30",
                                  color: theme.dark ? "#f8e3d5" : "#5d3211",
                                  fontWeight: "600",
                                },
                              ]
                            : { color: theme.dark ? "#f8e3d5" : "#5d3211" }
                        }
                      >
                        {part}
                      </Text>
                    );
                  })}
                </Text>
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
          ))}

          {/* No Results Message */}
          {searchPhrase.trim() && searchResults.length === 0 && !searching && (
            <View style={styles.noResultsContainer}>
              <Feather
                name="search"
                size={48}
                color={
                  theme.dark ? "rgba(255,255,255,0.3)" : "rgba(93, 50, 17, 0.3)"
                }
                style={styles.noResultsIcon}
              />
              <Text
                style={[
                  styles.noResultsTitle,
                  {
                    color: theme.dark
                      ? "rgba(255,255,255,0.7)"
                      : "rgba(93, 50, 17, 0.7)",
                    fontFamily: fontsLoaded ? "ZillaSlabsm" : "System",
                  },
                ]}
              >
                No matches found
              </Text>
              <Text
                style={[
                  styles.noResultsMessage,
                  {
                    color: theme.dark
                      ? "rgba(255,255,255,0.5)"
                      : "rgba(93, 50, 17, 0.5)",
                    fontFamily: fontsLoaded ? "ZillaSlab" : "System",
                  },
                ]}
              >
                Try searching for different words or phrases
              </Text>
            </View>
          )}

          {/* Empty State */}
          {!searchPhrase.trim() && (
            <View style={styles.emptyStateContainer}>
              <Feather
                name="search"
                size={64}
                color={
                  theme.dark ? "rgba(255,255,255,0.2)" : "rgba(93, 50, 17, 0.2)"
                }
                style={styles.emptyStateIcon}
              />
              <Text
                style={[
                  styles.emptyStateTitle,
                  {
                    color: theme.dark
                      ? "rgba(255,255,255,0.6)"
                      : "rgba(93, 50, 17, 0.6)",
                    fontFamily: fontsLoaded ? "ZillaSlabsm" : "System",
                  },
                ]}
              >
                Search within this sermon
              </Text>
              <Text
                style={[
                  styles.emptyStateMessage,
                  {
                    color: theme.dark
                      ? theme.colors.text
                      : "rgba(93, 50, 17, 0.4)",
                    fontFamily: fontsLoaded ? "ZillaSlab" : "System",
                  },
                ]}
              >
                Enter words or phrases to find them in the sermon text
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = {
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: -50, // Extend beyond bottom to ensure full coverage
    width: "100%",
    height: "110%", // Slightly larger than 100% to ensure complete coverage
    borderRadius: 0, // Remove border radius for full screen
    backgroundColor: "white",
    borderWidth: 0,
    shadowColor: "transparent", // Remove shadow for full screen
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0, // Remove elevation for full screen
    zIndex: 1000, // Higher than bottom sheet (95)
  },
  keyboardAvoidingView: {
    flex: 1,
    paddingTop:
      Platform.OS === "ios" ? 44 + 20 : (StatusBar.currentHeight || 0) + 20, // Add top padding for status bar
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
  },
  clearButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: "500",
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resultContent: {
    flex: 1,
  },
  paragraphInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  paragraphLabel: {
    fontSize: 11,
    fontWeight: "600",
    opacity: 0.7,
  },
  resultContext: {
    fontSize: 15,
    lineHeight: 18,
    paddingRight: 25,
  },
  highlightText: {
    fontWeight: "600",
  },
  resultSeparator: {
    height: 1,
    marginTop: 12,
    marginHorizontal: -16,
  },
  noResultsContainer: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  noResultsIcon: {
    marginBottom: 16,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  noResultsMessage: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyStateContainer: {
    alignItems: "center",
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateMessage: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
};

export default CurrentSermonSearch;
