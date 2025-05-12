import React, { useState, useContext, useRef, useEffect } from "react";
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
} from "react-native";
import { SermonContext, useAppContext } from "../../Logic/globalState";
import { ActivityIndicator } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AntDesign, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import styles from "../../styles/Search";

import earlySermons from "../../sermons/1964-1969/firstset";
import secondSet from "../../sermons/1970/1970";
import thirdSet from "../../sermons/1971/1971";
import fourthSet from "../../sermons/1972/1972";
import lastSet from "../../sermons/1973/1973";
import DraggableFloatingBackButton from "../../components/FloatButton";

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
  const { theme, searchText, setSearchText } = useAppContext();
  const [searchPhrase, setSearchPhrase] = useState(searchText);
  const [filteredSermons, setFilteredSermons] = useState([]);
  const [expandedSermons, setExpandedSermons] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [found, setFound] = useState(true);
  const fadeAnim = new Animated.Value(0);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSermonContent, setSelectedSermonContent] = useState(null);
  const [modalContentReady, setModalContentReady] = useState(false);

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

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const filtered = sermons
        .map((sermon) => {
          const regex = new RegExp(`(${searchPhrase})`, "i");
          const match = sermon.sermon.match(regex);
          if (match) {
            const brief = sermon.sermon.slice(
              Math.max(0, match.index - CONTEXT_LENGTH),
              Math.min(
                sermon.sermon.length,
                match.index + match[0].length + CONTEXT_LENGTH
              )
            );

            const shortContext = cleanText(brief);

            const entire = sermon.sermon.slice(
              Math.max(0, match.index - EXPANDED_CONTEXT_LENGTH),
              Math.min(
                sermon.sermon.length,
                match.index + match[0].length + EXPANDED_CONTEXT_LENGTH
              )
            );

            const expandedContext = cleanText(entire);

            // Add extended context for popup
            const fullContext = sermon.sermon.slice(
              Math.max(0, match.index - POPUP_CONTEXT_LENGTH),
              Math.min(
                sermon.sermon.length,
                match.index + match[0].length + POPUP_CONTEXT_LENGTH
              )
            );

            const popupContext = cleanText(fullContext);

            return {
              title: sermon.title,
              year: sermon.year,
              location: sermon.location,
              sentence: shortContext.replace(
                regex,
                `<highlight>${match[0]}</highlight>`
              ),
              expandedSentence: expandedContext.replace(
                regex,
                `<highlight>${match[0]}</highlight>`
              ),
              popupContent: popupContext.replace(
                regex,
                `<highlight>${match[0]}</highlight>`
              ),
              sermon: sermon.sermon,
              type: sermon.type,
              matchIndex: match.index,
            };
          } else {
            return null;
          }
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

  const handleSermonClick = (sermon) => {
    // Make sure we clear previous content and reset scroll before showing new content
    setSelectedSermonContent(sermon);
    setModalVisible(true);
  };

  const handleClearSearch = () => {
    setSearchText("");
    setSearchPhrase("");
    setFilteredSermons([]);
    setExpandedSermons(new Set());
    searchInputRef.current?.focus();
  };

  const renderSermonText = (sermon, index) => {
    const isExpanded = expandedSermons.has(index);
    const textToRender = isExpanded ? sermon.expandedSentence : sermon.sentence;

    return (
      <View style={styles.sermonTextContainer}>
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
                style={
                  part.startsWith("<highlight>") &&
                  part.endsWith("</highlight>")
                    ? styles.highlightedText
                    : undefined
                }
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
              Open Sermon
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
              },
            ]}
          >
            Sermon Extract
          </Text>
          <View style={styles.divider} />
        </View>

        <Text
          style={[
            styles.sermonFullContent,
            {
              color: theme.dark ? theme.colors.text : "black",
              fontSize: 16,
              lineHeight: 24,
              marginBottom: 20,
            },
          ]}
        >
          {selectedSermonContent.popupContent
            .split(/(<highlight>.*?<\/highlight>)/g)
            .map((part, i) => {
              const isHighlight =
                part.startsWith("<highlight>") && part.endsWith("</highlight>");
              const text = part.replace(/<\/?highlight>/g, "");

              return (
                <Text
                  key={i}
                  style={
                    isHighlight
                      ? {
                          backgroundColor: "#FFD700",
                          color: "#000000",
                          fontWeight: "bold",
                        }
                      : undefined
                  }
                >
                  {text}
                </Text>
              );
            })}
        </Text>

        <View
          style={[
            styles.sermonAttribution,
            {
              borderTopColor: theme.dark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.1)",
              paddingTop: 15,
              marginTop: 10,
            },
          ]}
        >
          <Text
            style={{
              fontStyle: "italic",
              fontSize: 12,
              color: theme.dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
            }}
          >
            From "{selectedSermonContent.title}" ({selectedSermonContent.year})
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <DraggableFloatingBackButton />
      <View style={styles.header}>
        <Text
          style={[
            styles.headerTitle,
            { color: theme.dark ? theme.colors.text : "#333" },
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
              backgroundColor: theme.dark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.03)",
              borderColor: theme.dark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.1)",
            },
          ]}
        >
          <Feather
            name="search"
            size={20}
            color={theme.dark ? "#44c2ef" : "#494d50"}
            style={styles.searchIcon}
          />
          <TextInput
            ref={searchInputRef}
            style={[
              styles.searchInput,
              {
                color: theme.dark ? theme.colors.text : "black",
                fontFamily: "serif",
              },
            ]}
            placeholder="Search sermons..."
            value={searchPhrase}
            onChangeText={(e) => {
              setSearchText(e);
              setSearchPhrase(e.trim());
              setFound(true);
            }}
            placeholderTextColor={
              theme.dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"
            }
            selectionColor={theme.dark ? "#44c2ef" : "#44c2ef"}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
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
              backgroundColor: theme.dark ? "#44c2ef" : "#44c2ef",
            },
          ]}
          onPress={handleSearch}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {loading ? (
          <View style={styles.loaderContainer}>
            <View
              style={[
                styles.loaderWrapper,
                {
                  backgroundColor: theme.dark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.02)",
                },
              ]}
            >
              <ActivityIndicator size="large" color="#44c2ef" />
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
        ) : filteredSermons.length > 0 ? (
          <View style={styles.resultsContainer}>
            <Text
              style={[
                styles.resultsCount,
                {
                  color: theme.dark
                    ? "rgba(255,255,255,0.6)"
                    : "rgba(0,0,0,0.6)",
                },
              ]}
            >
              Found {filteredSermons.length} result
              {filteredSermons.length !== 1 ? "s" : ""}
            </Text>

            {filteredSermons.map((sermon, index) => (
              <Pressable
                key={index}
                style={[styles.sermonContainer]}
                android_ripple={{
                  color: theme.dark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.05)",
                }}
              >
                <View
                  style={[
                    styles.sermonCard,
                    {
                      backgroundColor: theme.dark
                        ? "rgba(255,255,255,0.05)"
                        : "white",
                      borderColor: theme.dark
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.05)",
                    },
                  ]}
                >
                  <View style={styles.sermonHeader}>
                    <View style={styles.sermonTitleContainer}>
                      <Text
                        style={[
                          styles.sermonTitle,
                          { color: theme.dark ? theme.colors.text : "black" },
                        ]}
                        numberOfLines={2}
                      >
                        {sermon.title}
                      </Text>
                      <View
                        style={[
                          styles.yearBadge,
                          { backgroundColor: theme.colors.primary },
                        ]}
                      >
                        <Text style={styles.sermonYear}>{sermon.year}</Text>
                      </View>
                    </View>
                  </View>

                  {sermon.location && (
                    <View style={styles.locationContainer}>
                      <Feather
                        name="map-pin"
                        size={12}
                        color={
                          theme.dark
                            ? "rgba(255,255,255,0.4)"
                            : "rgba(0,0,0,0.4)"
                        }
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.sermonLocation,
                          {
                            color: theme.dark
                              ? "rgba(255,255,255,0.4)"
                              : "rgba(0,0,0,0.4)",
                          },
                        ]}
                      >
                        {sermon.location}
                      </Text>
                    </View>
                  )}

                  {renderSermonText(sermon, index)}
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
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
                      color: theme.dark ? "#44c2ef" : "#44c2ef",
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
                  color={
                    theme.dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"
                  }
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
        )}
      </ScrollView>

      {/* Sermon Content Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.dark
                ? "rgba(0,0,0,0.95)"
                : "rgba(255,255,255,0.95)",
            },
          ]}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.dark ? theme.colors.primary : "#fff",
                borderColor: theme.dark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)",
                maxHeight: windowHeight * 0.9, // Set maximum height to prevent overflow
              },
            ]}
          >
            <View style={styles.modalScrollIndicator} />
            <View style={styles.modalHeader}>
              <View style={styles.headerContent}>
                <Text
                  style={[
                    styles.modalTitle,
                    {
                      color: theme.dark ? theme.colors.text : "black",
                    },
                  ]}
                >
                  {selectedSermonContent?.title}
                </Text>
                <View style={styles.modalMetaContainer}>
                  <View style={[styles.yearBadge, { marginRight: 8 }]}>
                    <Text style={styles.sermonYear}>
                      {selectedSermonContent?.year}
                    </Text>
                  </View>

                  {selectedSermonContent?.location && (
                    <View style={styles.locationContainer}>
                      <Feather
                        name="map-pin"
                        size={12}
                        color={
                          theme.dark
                            ? "rgba(255,255,255,0.4)"
                            : "rgba(0,0,0,0.4)"
                        }
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.modalLocation,
                          {
                            color: theme.dark
                              ? "rgba(255,255,255,0.4)"
                              : "rgba(0,0,0,0.4)",
                          },
                        ]}
                      >
                        {selectedSermonContent?.location}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <AntDesign
                  name="close"
                  size={20}
                  color={
                    theme.dark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)"
                  }
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={modalScrollViewRef}
              style={[
                styles.modalScrollView,
                { maxHeight: windowHeight * 0.7 }, // Limit scroll view height
              ]}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 30 }}
            >
              {selectedSermonContent && renderModalContent()}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default SermonSearch;
