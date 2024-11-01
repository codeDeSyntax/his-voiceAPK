import React, { useState, useContext } from "react";
import {
  View,
  TextInput,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { SermonContext } from "../../Logic/globalState";
import { useAppTheme } from "../../Logic/theme";
import { ActivityIndicator } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
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

const CONTEXT_LENGTH = 30; // Default context length
const EXPANDED_CONTEXT_LENGTH = 150; // Expanded context length

const SermonSearch = () => {
  const [searchText, setSearchText] = useState("");
  const [filteredSermons, setFilteredSermons] = useState([]);
  const [expandedSermons, setExpandedSermons] = useState(new Set());
  const { setSelectedSermon,theme } = useContext(SermonContext);
  // const { theme } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const fadeAnim = new Animated.Value(0);

  const navigation = useNavigation();

  const handleSearch = async () => {
    if (searchText.trim() === "") {
      setFilteredSermons([]);
      return;
    }

    setLoading(true);
    setExpandedSermons(new Set()); // Reset expanded states on new search

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const filtered = sermons
        .map((sermon) => {
          const regex = new RegExp(`(${searchText})`, "i");
          const match = sermon.sermon.match(regex);
          if (match) {
            // Store both short and expanded context
            const shortContext = sermon.sermon.slice(
              Math.max(0, match.index - CONTEXT_LENGTH),
              Math.min(sermon.sermon.length, match.index + match[0].length + CONTEXT_LENGTH)
            );
            const expandedContext = sermon.sermon.slice(
              Math.max(0, match.index - EXPANDED_CONTEXT_LENGTH),
              Math.min(sermon.sermon.length, match.index + match[0].length + EXPANDED_CONTEXT_LENGTH)
            );
            
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
              sermon: sermon.sermon,
              type: sermon.type,
            };
          }
          return null;
        })
        .filter(Boolean);

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
    const searchPhrase = searchText;
    setSelectedSermon(sermon);
    navigation.navigate("Home", { sermon, searchPhrase });
  };

  const handleClearSearch = () => {
    setSearchText("");
    setFilteredSermons([]);
    setExpandedSermons(new Set());
  };

  const renderSermonText = (sermon, index) => {
    const isExpanded = expandedSermons.has(index);
    const textToRender = isExpanded ? sermon.expandedSentence : sermon.sentence;

    return (
      <View style={styles.sermonTextContainer}>
        <Text style={[styles.sermonContent, { color: theme.dark === true ? theme.colors.text : "black" }]}>
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
                
                {" " + part.trim().replace(/<\/?highlight>/g, "").trim() + " "}
              </Text>
            ))}
        </Text>
        <TouchableOpacity 
          onPress={() => toggleExpanded(index)}
          style={styles.expandButton}
        >
          <AntDesign
            name={isExpanded ? "upcircle" : "downcircle"}
            size={20}
            color={theme.dark === true? "#60A5FA" : "gray"}
          />
          <Text style={[styles.expandButtonText,{color:theme.dark === true? "#60A5FA" : "gray"}]}>
            {isExpanded ? "Show less" : "Show more"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.searchContainer}>
        <View style={[styles.inputWrapper, {borderColor: theme.dark === true? "#494d50" : "gray",}]}>
          <Ionicons
            name="search"
            size={24}
            color={theme.dark === true? "#60A5FA" : "gray"}
            style={styles.searchIcon}
          />
          <TextInput
            style={[
              styles.searchInput,
              { color: theme.dark === true ? theme.colors.text : "black",
                
               }
            ]}
            placeholder="Search quotes"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor={theme.dark === true ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
            selectionColor={theme.dark === true ? "#60A5FA" : "gray"}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <AntDesign
                name="closecircle"
                size={24}
                color={theme.dark === true? "#494d50" : "gray"}
                style={styles.clearIcon}
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <View style={styles.gradientButton}>
            <Text style={styles.searchButtonText}>Search</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#60A5FA" />
            <Text style={[styles.loaderText, { color: theme.colors.text }]}>
              Searching sermons...
            </Text>
          </View>
        ) : filteredSermons.length > 0 ? (
          <View style={styles.resultsContainer}>
            {filteredSermons.map((sermon, index) => (
              <TouchableOpacity
                key={index}
                style={styles.sermonContainer}
                onPress={() => handleSermonClick(sermon)}
              >
                <LinearGradient
                  colors={theme.dark ? 
                    ['#202425', '#202425'] : 
                    ["#fafafa", '#fafafa']}
                  style={styles.sermonGradient}
                >
                  <View style={styles.sermonHeader}>
                    <Text style={[styles.sermonTitle, { color: theme.dark === true ? theme.colors.text : "black" }]}>
                      {sermon.title}
                    </Text>
                    <View>
                      <Text style={styles.sermonYear}>{sermon.year}</Text>
                    </View>
                  </View>
                  <Text style={[styles.sermonLrgbaocation, { color:theme.dark === true? "#494d50" : "gray"}]}>
                    {sermon.location}
                  </Text>
                  {renderSermonText(sermon, index)}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.noResultsContainer}>
            <Text style={[styles.noResultsText, { color: 'silver' }]}>
              {searchText.trim() !== ""
                ? "No sermons found"
                : "Search quotes from all sermons"}
            </Text>
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
    borderColor: "rgba(96, 165, 250, 0.3)",
    borderRadius: 16,
    padding: 12,
    flex: 1,
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    overflow: 'hidden',
    backgroundColor: "#494d50"
  },
  gradientButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
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
    backgroundColor:"silver",
    elevation:5
  },
  sermonGradient: {
    padding: 16,
    borderRadius: 16,
    elevation:5
  },
  sermonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sermonTitle: {
    fontWeight: "700",
    fontSize: 16,
    flex: 1,
  },
  sermonYear: {
    fontSize: 14,
    color: '#494d50',
    fontWeight: '600',
  },
  sermonLocation: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '500',
  },
  sermonTextContainer: {
    position: 'relative',
  },
  sermonContent: {
    fontFamily: "serif",
    fontSize: 14,
    lineHeight: 20,
  },
  highlightedText: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    color: "#10B981",
    fontFamily: "monospace",
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 4,
  },
  expandButtonText: {
    color: '#60A5FA',
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '500',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  noResultsText: {
    fontSize: 16,
    opacity: 0.8,
  },
});

export default SermonSearch;