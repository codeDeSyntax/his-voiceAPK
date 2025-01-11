import React, { useState, useContext } from "react";
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
  Image
} from "react-native";
import { SermonContext } from "../../Logic/globalState";
import { ActivityIndicator } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import earlySermons from "../../sermons/1964-1969/firstset";
import secondSet from "../../sermons/1970/1970";
import thirdSet from "../../sermons/1971/1971";
import fourthSet from "../../sermons/1972/1972";
import lastSet from "../../sermons/1973/1973";

const sermons = [
  ...earlySermons,
  ...secondSet,
  ...thirdSet,
  ...fourthSet,
  ...lastSet,
];

const CONTEXT_LENGTH = 30;
const EXPANDED_CONTEXT_LENGTH = 150;

const SermonSearch = () => {
  const { setSelectedSermon, theme, searchText, setSearchText } = useContext(SermonContext);
  const [searchPhrase, setSearchPhrase] = useState(searchText);
  const [filteredSermons, setFilteredSermons] = useState([]);
  const [expandedSermons, setExpandedSermons] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [found, setFound] = useState(true);
  const fadeAnim = new Animated.Value(0);

  const navigation = useNavigation();

  const cleanText = (text) => {
    return text
      // Remove multiple spaces
      .replace(/\s+/g, ' ')
      // Remove multiple newlines, replace with single newline
      .replace(/\n{2,}/g, '\n')
      // Remove spaces at the beginning of lines
      .replace(/^\s+/gm, '')
      // Remove spaces at the end of lines
      .replace(/\s+$/gm, '')
      // Replace multiple newlines with single newline
      .replace(/\n+/g, '\n')
      // Remove indentation after newlines
      .replace(/\n\s+/g, '\n')
      // Remove any remaining extra whitespace
      .replace(/\s{2,}/g, ' ')
      // Trim the final result
      .trim();
  };

  const handleSearch = async () => {
    if (searchPhrase.trim() === "") {
      setFilteredSermons([]);
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    setExpandedSermons(new Set());
    setFound(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const filtered = sermons
        .map((sermon) => {
          const regex = new RegExp(`(${searchPhrase})`, "gi");
          const cleanedSermon = cleanText(sermon.sermon);
          const matches = [...cleanedSermon.matchAll(regex)];

          if (matches.length > 0) {
            const match = matches[0]; // Use the first match
            const matchIndexInCleanText = match.index;
            
            const shortContext = cleanedSermon.slice(
              Math.max(0, matchIndexInCleanText - CONTEXT_LENGTH),
              Math.min(cleanedSermon.length, matchIndexInCleanText + match[0].length + CONTEXT_LENGTH)
            );

            const expandedContext = cleanedSermon.slice(
              Math.max(0, matchIndexInCleanText - EXPANDED_CONTEXT_LENGTH),
              Math.min(cleanedSermon.length, matchIndexInCleanText + match[0].length + EXPANDED_CONTEXT_LENGTH)
            );

            const shortContextWithEllipsis = `${matchIndexInCleanText > CONTEXT_LENGTH ? '...' : ''}${shortContext}${
              matchIndexInCleanText + match[0].length + CONTEXT_LENGTH < cleanedSermon.length ? '...' : ''
            }`;

            const expandedContextWithEllipsis = `${matchIndexInCleanText > EXPANDED_CONTEXT_LENGTH ? '...' : ''}${expandedContext}${
              matchIndexInCleanText + match[0].length + EXPANDED_CONTEXT_LENGTH < cleanedSermon.length ? '...' : ''
            }`;

            return {
              title: sermon.title,
              year: sermon.year,
              location: sermon.location,
              sentence: shortContextWithEllipsis.replace(
                regex,
                `<highlight>$1</highlight>`
              ),
              expandedSentence: expandedContextWithEllipsis.replace(
                regex,
                `<highlight>$1</highlight>`
              ),
              sermon: cleanedSermon,
              type: sermon.type,
            };
          }
          return null;
        })
        .filter(Boolean);

      setFilteredSermons(filtered);
      if (filtered.length === 0) {
        setFound(false);
      }
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
    setExpandedSermons(prev => {
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
    setSelectedSermon({
      ...sermon,
      sermon: cleanText(sermon.sermon)
    });
    navigation.navigate("Home");
  };

  const handleClearSearch = () => {
    setSearchText("");
    setSearchPhrase("");
    setFilteredSermons([]);
    setExpandedSermons(new Set());
    setFound(true);
  };

  const renderSermonText = (sermon, index) => {
    const isExpanded = expandedSermons.has(index);
    const textToRender = isExpanded ? sermon.expandedSentence : sermon.sentence;

    return (
      <View style={styles.sermonTextContainer}>
        <Text 
          style={[
            styles.sermonContent, 
            { color: theme.dark ? theme.colors.text : "black" }
          ]}
        >
          {textToRender
            .split(/(<highlight>.*?<\/highlight>)/g)
            .map((part, i) => (
              <Text
                key={i}
                style={[
                  styles.textPart,
                  part.startsWith("<highlight>") && part.endsWith("</highlight>")
                    ? styles.highlightedText
                    : null
                ]}
              >
                {part.replace(/<\/?highlight>/g, "")}
              </Text>
            ))}
        </Text>
        <View style={styles.sermonActionContainer}>
          <TouchableOpacity 
            style={[
              styles.expandButton, 
              {
                borderWidth: 1,
                borderColor: theme.colors.secondary,
                backgroundColor: theme.dark ? theme.colors.primary : "#fafafa",
              }
            ]}
            onPress={() => toggleExpanded(index)}
          >
            <AntDesign
              name={isExpanded ? "upcircle" : "downcircle"}
              size={15}
              color="gray"
            />
            <Text style={[styles.expandButtonText, { color: "gray" }]}>
              {isExpanded ? "Show less" : "Show more"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.sermonDetailButton,
              { backgroundColor: theme.colors.primary }
            ]} 
            onPress={() => handleSermonClick(sermon)}
          >
            <Text style={[styles.sermonDetailButtonText, { color: "gray" }]}>
              Open Sermon
            </Text>
            <AntDesign 
              name="rightcircle"
              size={15}
              color="gray"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.searchContainer}>
        <View style={[
          styles.inputWrapper, 
          {
            borderColor: theme.dark ? "#494d50" : "#494d50",
            backgroundColor: theme.colors.secondary
          }
        ]}>
          <Ionicons
            name="search"
            size={24}
            color={theme.dark ? "#60A5FA" : "gray"}
            style={styles.searchIcon}
          />
          <TextInput
            style={[
              styles.searchInput,
              { 
                color: theme.dark ? theme.colors.text : "black",
                fontFamily: "serif"
              }
            ]}
            placeholder="Search quotes"
            value={searchPhrase}
            onChangeText={(text) => {
              setSearchText(text);
              setSearchPhrase(text.trim());
              setFound(true);
            }}
            placeholderTextColor={theme.dark ? "gray" : "rgba(0,0,0,0.5)"}
            selectionColor="gray"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <AntDesign
                name="closecircle"
                size={24}
                color={theme.dark ? "#494d50" : "gray"}
                style={styles.clearIcon}
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loaderContainer}>
            <View style={styles.loaderWrapper}>
              <ActivityIndicator size="large" color="#60A5FA" />
              <Text style={[styles.loaderText, { color: theme.colors.text }]}>
                Searching through sermons...
              </Text>
            </View>
          </View>
        ) : filteredSermons.length > 0 ? (
          <View style={styles.resultsContainer}>
            {filteredSermons.map((sermon, index) => (
              <Pressable
                key={index}
                style={styles.sermonContainer}
              >
                <View
                  style={[
                    styles.sermonGradient,
                    {
                      borderWidth: 1,
                      borderColor: theme.colors.secondary,
                      backgroundColor: theme.dark 
                        ? theme.colors.primary
                        : "#fafafa",
                    }
                  ]}
                >
                  <View style={styles.sermonHeader}>
                    <View style={styles.sermonTitleContainer}>
                      <Text 
                        style={[
                          styles.sermonTitle, 
                          { color: theme.dark ? theme.colors.text : "black" }
                        ]}
                        numberOfLines={2}
                      >
                        {sermon.title}
                      </Text>
                      <Text style={styles.sermonYear}>
                        {sermon.year}
                      </Text>
                    </View>
                  </View>
                  {sermon.location && (
                    <Text 
                      style={[
                        styles.sermonLocation, 
                        { color: theme.dark ? "#494d50" : "gray" }
                      ]}
                    >
                      {sermon.location}
                    </Text>
                  )}
                  {renderSermonText(sermon, index)}
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.noResultsContainer}>
            <Text style={[
              styles.noResultsText, 
              { color: theme.dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }
            ]}>
              {searchText.trim() !== ""
                ? "No sermons found"
                : "Search quotes from all sermons"}
            </Text>
            {!found && (
              <Image 
                source={require("../../assets/viewnotfound.png")} 
                style={{
                  width: 40,
                  height: 40,
                  overlayColor: "rgba(0,0,0,0.5)",
                }}
              />
            )}
            <Ionicons 
              name="library" 
              size={100} 
              color={theme.dark ? "gray" : "silver"} 
              style={{
                marginTop: 30, 
                display: !found ? "none" : "flex"
              }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 60,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flex: 1,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  clearIcon: {
    marginLeft: 10,
  },
  searchButton: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: "#494d50",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  resultsContainer: {
    paddingHorizontal: 16,
  },
  sermonContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sermonGradient: {
    padding: 16,
    borderRadius: 16,
  },
  sermonHeader: {
    marginBottom: 8,
  },
  sermonTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sermonTitle: {
    fontWeight: "700",
    fontFamily: "serif",
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  sermonYear: {
    fontSize: 14,
    color: '#494d50',
    fontWeight: '600',
  },
  sermonLocation: {
    fontSize: 12,
    // marginBottom: 8,
    fontWeight: '500',
  },
  sermonTextContainer: {
    marginTop: 2,
  },
  sermonContent: {
    fontFamily: "serif",
    fontSize: 12,
    lineHeight: 20,
  },
  highlightedText: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    color: "#10B981",
    // fontFamily: "monospace",
    fontStyle:"italic",
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sermonActionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
  },
  expandButtonText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '500',
  },
  sermonDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
  },
  sermonDetailButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  loaderWrapper: {
    // backgroundColor: 'rgba(96, 165, 250, 0.1)',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 16,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 16,
  },
  noResultsText: {
    fontSize: 16,
    paddingVertical:4,
    fontFamily:"serif",
    textAlign: 'center',
    opacity: 0.6,
  },
});

export default SermonSearch;