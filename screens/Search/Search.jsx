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
  Modal,
  SafeAreaView,
  Dimensions,
  ImageBackground,
  FlatList,
} from "react-native";
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

import earlySermons from "../../sermons/1964-1969/firstset";
import secondSet from "../../sermons/1970/1970";
import thirdSet from "../../sermons/1971/1971";
import fourthSet from "../../sermons/1972/1972";
import lastSet from "../../sermons/1973/1973";
import DraggableFloatingBackButton from "../../components/FloatButton";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";

const sermons = [
  ...earlySermons,
  ...secondSet,
  ...thirdSet,
  ...fourthSet,
  ...lastSet,
];

const CONTEXT_LENGTH = 30;
const EXPANDED_CONTEXT_LENGTH = 150;
const POPUP_CONTEXT_LENGTH = 3000;

const SermonSearch = () => {
  const { theme, setSelectedSermon, updateLastVisitedScreen } = useAppContext(); // Removed searchText and setSearchText
  const navigation = useNavigation();

  // Track that user visited Search screen
  useEffect(() => {
    updateLastVisitedScreen("Search");
  }, [updateLastVisitedScreen]);

  const [searchText, setSearchText] = useState(""); // Local search state for Search screen
  const [searchPhrase, setSearchPhrase] = useState(""); // Local search phrase
  const [filteredSermons, setFilteredSermons] = useState([]);
  const [expandedSermons, setExpandedSermons] = useState(new Set());
  const [expandedResults, setExpandedResults] = useState(new Set()); // Track expanded search results
  const [loading, setLoading] = useState(false);
  const [found, setFound] = useState(true);
  const fadeAnim = new Animated.Value(0);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSermonContent, setSelectedSermonContent] = useState(null);
  const [modalContentReady, setModalContentReady] = useState(false);

  const [fontsLoaded] = useFonts({
    ZillaSlab: require("../../assets/fonts/ZillaSlab-Regular.ttf"),
    ZillaSlabSemiBold: require("../../assets/fonts/ZillaSlab-SemiBold.ttf"),
  });
  // Refs
  const scrollViewRef = useRef(null);
  const searchInputRef = useRef(null);
  const modalScrollViewRef = useRef(null);

  // Window dimensions for responsive sizing
  const windowHeight = Dimensions.get("window").height;

  // Effect to handle modal content readiness
  useEffect(() => {
    if (modalVisible && selectedSermonContent) {
      // Ensure content is ready before rendering
      setModalContentReady(true);

      // Reset scroll position after a slight delay to ensure content is rendered
      setTimeout(() => {
        if (modalScrollViewRef.current) {
          modalScrollViewRef.current.scrollTo({ y: 0, animated: false });
        }
      }, 100);
    } else {
      setModalContentReady(false);
    }
  }, [modalVisible, selectedSermonContent]);

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
    setExpandedSermons(new Set());
    setExpandedResults(new Set()); // Clear expanded search results

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const filtered = sermons
        .map((sermon) => {
          const regex = new RegExp(`(${searchPhrase})`, "i");
          // Split by newlines but keep the original paragraph structure
          const paragraphs = sermon.sermon.split("\n");

          // Find all matches with paragraph numbers
          const matches = [];
          paragraphs.forEach((paragraph, paragraphIndex) => {
            if (paragraph.trim()) {
              // Only process non-empty paragraphs
              const match = paragraph.match(regex);
              if (match) {
                const brief = paragraph.slice(
                  Math.max(0, match.index - CONTEXT_LENGTH),
                  Math.min(
                    paragraph.length,
                    match.index + match[0].length + CONTEXT_LENGTH
                  )
                );

                const shortContext = cleanText(brief);

                matches.push({
                  paragraphIndex: paragraphIndex + 1, // 1-based indexing
                  context: shortContext.replace(
                    regex,
                    `<highlight>${match[0]}</highlight>`
                  ),
                  fullParagraph: paragraph,
                });
              }
            }
          });

          if (matches.length > 0) {
            // Use the first match as the primary context
            const primaryMatch = matches[0];

            return {
              title: sermon.title,
              year: sermon.year,
              location: sermon.location,
              id: sermon.id,
              sermon: sermon.sermon, // Keep full sermon for navigation
              sentence: primaryMatch.context,
              paragraphIndex: primaryMatch.paragraphIndex,
              totalMatches: matches.length,
              allMatches: matches, // Store all matches for potential use
            };
          }
          return null;
        })
        .filter(Boolean);

      if (filtered.length === 0) {
        setFound(false);
      } else {
        setFound(true);
      }

      setFilteredSermons(filtered);
    } catch (error) {
      console.log("Could not fetch sermons", error);
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };

  const toggleExpanded = (index) => {
    setExpandedSermons((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
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

  const handleSermonClick = (sermon) => {
    // Instead of navigating, prepare and show modal content
    const regex = new RegExp(`(${searchPhrase})`, "i");
    // Use the same paragraph splitting method as search
    const paragraphs = sermon.sermon.split("\n");

    // Find the specific paragraph and create expanded content around it
    let modalContent = "";
    const targetParagraphIndex = sermon.paragraphIndex - 1; // Convert to 0-based

    // Get context around the found paragraph (more context for modal)
    const contextStart = Math.max(0, targetParagraphIndex - 10);
    const contextEnd = Math.min(paragraphs.length, targetParagraphIndex + 15);

    // Build the modal content with extended context - join as one continuous paragraph
    for (let i = contextStart; i < contextEnd; i++) {
      const paragraph = paragraphs[i];
      if (paragraph.trim()) {
        // Highlight search terms in all paragraphs
        const highlightedParagraph = paragraph.replace(
          regex,
          `<highlight>$1</highlight>`
        );
        // Join paragraphs with single space to create continuous text
        modalContent += highlightedParagraph.trim() + " ";
      }
    }

    // Set up modal content
    setSelectedSermonContent({
      title: sermon.title,
      year: sermon.year,
      location: sermon.location,
      paragraphIndex: sermon.paragraphIndex, // Include paragraph index for navigation
      popupContent: modalContent.trim(),
    });

    // Show modal
    setModalVisible(true);
  };

  const handleClearSearch = () => {
    setSearchText("");
    setSearchPhrase("");
    setFilteredSermons([]);
    setExpandedSermons(new Set());
    setExpandedResults(new Set()); // Clear expanded search results
    searchInputRef.current?.focus();
  };

  // Render function for FlatList items
  const renderSearchResultItem = ({ item: sermon, index }) => {
    const showExpanded = expandedResults.has(index);

    return (
      <TouchableOpacity
        key={`search-result-${index}`}
        style={styles.searchResultItem}
        onPress={() => handleSermonClick(sermon)}
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
              <Text style={[styles.resultYearText, { color: "#fff" }]}>
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
                📍Match {sermon.paragraphIndex}
                {sermon.totalMatches > 1 && (
                  <Text style={{ opacity: 0.7, fontSize: 12 }}>
                    (+{sermon.totalMatches - 1} more)
                  </Text>
                )}
              </Text>

              {/* Show more caret */}
              <TouchableOpacity
                style={styles.expandCaret}
                onPress={(e) => {
                  e.stopPropagation();
                  toggleResultExpanded(index);
                }}
              >
                <Text style={[styles.caretIcon, { color: theme.colors.text }]}>
                  {showExpanded ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={[
                styles.resultContext,
                {
                  color: theme.dark ? "rgba(255,255,255,0.8)" : "#5d3211",
                  fontFamily: "ZillaSlab",
                },
              ]}
              numberOfLines={showExpanded ? undefined : 2}
            >
              {/* Show first match or all matches if expanded */}
              {showExpanded && sermon.totalMatches > 1
                ? // Show all matches when expanded as continuous text
                  sermon.allMatches
                    .map((match, matchIndex) => {
                      // Create paragraph label and content
                      const paragraphLabel = `Para ${match.paragraphIndex}: `;
                      return paragraphLabel + match.context;
                    })
                    .join(" ... ")
                    .split(/(<highlight>.*?<\/highlight>)/g)
                    .map((part, i) => {
                      const isHighlight =
                        part.startsWith("<highlight>") &&
                        part.endsWith("</highlight>");
                      const text = part.replace(/<\/?highlight>/g, "");

                      return (
                        <Text
                          key={`expanded-${i}`}
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
                    })
                : // Show only first match when not expanded
                  sermon.sentence
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

  const gradientColors = useMemo(
    () =>
      theme.dark
        ? [
            "#1c191730",
            "#1c191790",
            "#1c191790",
            "#1c1917",
            "#1c1917",
            "#1c1917",
            "#1c1917",
            "#1c1917",
            "#1c1917",
            "#1c1917",
          ]
        : [
            "rgba(255,255,255,0.33)",
            "rgba(255,255,255,0.3)",
            "rgba(255,255,255,0.8)",
            "rgba(255,255,255,255)",
            "rgba(255,255,255,2)",
            "rgba(255,255,255,2)",
            "rgba(255,255,255,2)",
            "rgba(255,255,255,2)",
            "rgba(255,255,255,2)",
            "rgba(255,255,255,2)",
            "rgba(255,255,255,2)",
            "rgba(255,255,255,2)",
          ],
    [theme.dark]
  );

  const renderSermonText = (sermon, index) => {
    const isExpanded = expandedSermons.has(index);
    const textToRender = isExpanded ? sermon.expandedSentence : sermon.sentence;

    return (
      <View
        style={[
          styles.sermonTextContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text
          style={[
            styles.sermonContent,
            { color: theme.dark === true ? theme.colors.text : "black" },
          ]}
        >
          {textToRender
            .split(/(<highlight>.*?<\/highlight>)/g)
            .map((part, i) => (
              <Text
                key={i}
                style={[
                  { color: theme.dark ? "#cdc8c8" : "black", fontSize: 14 },
                  part.startsWith("<highlight>") &&
                  part.endsWith("</highlight>")
                    ? {
                        backgroundColor: theme.dark ? "#522c12" : "transparent",
                        ...styles.highlightedText,
                        color: theme.dark
                          ? theme.colors.text
                          : theme.colors.hlight,
                        textDecorationLine: "underline",
                      }
                    : undefined,
                ]}
              >
                {" " + part.trim().replace(/<\/?highlight>/g, "") + " ".trim()}
              </Text>
            ))}
        </Text>
        <View style={styles.sermonActionContainer}>
          <TouchableOpacity
            style={[
              styles.expandButton,
              {
                backgroundColor: theme.colors.secondary,
              },
            ]}
            onPress={() => toggleExpanded(index)}
          >
            <AntDesign
              name={isExpanded ? "up" : "down"}
              size={14}
              color={theme.dark === true ? "#494d50" : "#494d50"}
            />
            <Text
              style={[styles.expandButtonText, { color: theme.colors.text }]}
            >
              {isExpanded ? "Show less" : "Show more"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sermonDetailButton,
              {
                backgroundColor: theme.colors.secondary,
              },
            ]}
            onPress={() => handleSermonClick(sermon)}
          >
            <Text
              style={[
                styles.sermonDetailButtonText,
                { color: theme.colors.text },
              ]}
            >
              View Extract
            </Text>
            <AntDesign
              name="right"
              size={14}
              color={theme.dark === true ? "#494d50" : "#494d50"}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render the modal content
  const renderModalContent = () => {
    if (!selectedSermonContent) return null;

    return (
      <View style={{ flex: 1 }}>
        <View style={styles.sermonContentHeader}>
          <Text
            style={[
              styles.sermonSectionTitle,
              {
                color: theme.dark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
                fontFamily: "ZillaSlabSemiBold",
                fontSize: 14,
                marginBottom: 4,
              },
            ]}
          >
            Sermon Extract
          </Text>
        </View>

        <Text
          style={[
            styles.sermonFullContent,
            {
              color: theme.dark ? theme.colors.text : "black",
              fontFamily: "ZillaSlab",
              fontSize: 16,
              lineHeight: 24,
              marginBottom: 16,
              textAlign: "justify",
            },
          ]}
          selectable={true}
          selectionColor={"#8b320c"}
        >
          {selectedSermonContent.popupContent
            .split(/(<highlight>.*?<\/highlight>)/g)
            .map((part, i) => {
              const isHighlight =
                part.startsWith("<highlight>") && part.endsWith("</highlight>");
              const text = part.replace(/<\/?highlight>/g, "");

              if (isHighlight) {
                return (
                  <Text
                    key={i}
                    style={{
                      fontFamily: "ZillaSlab",
                      backgroundColor: theme.dark
                        ? "#5d3211" + "70"
                        : "#5d3211" + "30",
                      color: theme.dark ? "#fff" : "#5d3211",
                      fontWeight: "600",
                      paddingHorizontal: 4,
                      paddingVertical: 2,
                      borderRadius: 6,
                    }}
                  >
                    {text}
                  </Text>
                );
              } else {
                return text; // Return plain text, not wrapped in Text component
              }
            })}
        </Text>

        {/* View Full Sermon Button */}
        <TouchableOpacity
          style={[
            {
              backgroundColor: theme.colors.primary,
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
              marginTop: 20,
              marginHorizontal: 20,
            },
          ]}
          onPress={() => {
            // Close modal first
            setModalVisible(false);

            // Find the sermon data from the selectedSermonContent
            const fullSermon = sermons.find(
              (s) =>
                s.title === selectedSermonContent.title &&
                s.year === selectedSermonContent.year
            );

            if (fullSermon) {
              setSelectedSermon(fullSermon);

              // Navigate to full sermon with search context
              navigation.navigate("currentsermon", {
                source: "search",
                sermon: fullSermon,
                searchPhrase: searchPhrase,
                initialParagraph: selectedSermonContent.paragraphIndex - 1,
              });
            }
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "600",
              fontFamily: "ZillaSlab",
              fontSize: 16,
              marginRight: 10,
            }}
          >
            View Full Sermon
          </Text>
          <AntDesign name="arrowright" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };
  const AnimatedBackground = React.memo(({ theme }) => {
    return (
      <View style={[styles.backgroundContainer]}>
        <ImageBackground
          source={require("../../assets/lib2.jpg")}
          style={styles.backgroundImage}
          blurRadius={4} // Slightly reduced blur for better performance
          resizeMode="repeat"
          fadeDuration={0} // Disable default fade for our custom animation
        >
          <View style={styles.backgroundOverlay} />
        </ImageBackground>
      </View>
    );
  });

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          // width: "100%",
          // height: "100%",
        },
      ]}
    >
      <AnimatedBackground theme={theme} />
      <DraggableFloatingBackButton />
      <LinearGradient colors={gradientColors} style={styles.gradientContainer}>
        <View style={styles.header}>
          <Text
            style={[
              styles.headerTitle,
              {
                color: theme.dark ? theme.colors.text : "white",
                fontWeight: "bold",
                textDecorationLine: "underline",
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
                  color={
                    theme.dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"
                  }
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
            contentContainerStyle={{ paddingBottom: 30,paddingHorizontal :4 }}
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

        {/* Sermon Content Modal */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
          statusBarTranslucent={true}
          presentationStyle="fullScreen"
        >
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100%",
              height: "100%",
              flex: 1,
              backgroundColor: theme.dark ? theme.colors.primary : "#fff",
              zIndex: 99999, // Much higher than current sermon search (1000)
            }}
          >
            {/* Modal Header with close button - with top padding for status bar */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                paddingHorizontal: 20,
                paddingVertical: 15,
                paddingTop: 50, // Extra padding for status bar
                borderBottomWidth: 1,
                borderBottomColor: theme.dark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.1)",
              }}
            >
              <View style={{ flex: 1, marginRight: 15 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "600",
                    color: theme.dark ? theme.colors.text : "black",
                    fontFamily: "ZillaSlabSemiBold",
                    marginBottom: 5,
                  }}
                >
                  {selectedSermonContent?.title}
                </Text>
                <Text
                  style={{
                    fontStyle: "italic",
                    fontSize: 14,
                    color: theme.dark
                      ? "rgba(255,255,255,0.6)"
                      : "rgba(0,0,0,0.6)",
                    fontFamily: "ZillaSlab",
                  }}
                >
                  {selectedSermonContent?.year} •{" "}
                  {selectedSermonContent?.location}
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  padding: 8,
                  borderRadius: 20,
                  backgroundColor: theme.dark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.05)",
                }}
                onPress={() => setModalVisible(false)}
              >
                <AntDesign
                  name="close"
                  size={20}
                  color={
                    theme.dark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.6)"
                  }
                />
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <ScrollView
              ref={modalScrollViewRef}
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{
                padding: 20,
                paddingBottom: 40,
              }}
            >
              {selectedSermonContent && renderModalContent()}
            </ScrollView>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
};

export default SermonSearch;
