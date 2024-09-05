import React, { useState, useContext, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Animated,
} from "react-native";
import { SermonContext } from "../../Logic/globalState";
import { useAppTheme } from "../../Logic/theme";
import { ActivityIndicator } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AntDesign } from "@expo/vector-icons";

import earlySermons from "../../sermons/1964-1969/firstset";
import secondSet from "../../sermons/1970/1970";
import thirdSet from "../../sermons/1971/1971";
import fourthSet from "../../sermons/1972/1972";
import lastSet from "../../sermons/1973/1973";
import audioSermons from "../../sermons/audio";

const sermons = [
  ...earlySermons,
  ...secondSet,
  ...thirdSet,
  ...fourthSet,
  ...lastSet,
];

const SermonSearch = ({ navigation }) => {
  const [searchText, setSearchText] = useState("");
  const [filteredSermons, setFilteredSermons] = useState([]);
  const { setSelectedSermon } = useContext(SermonContext);
  const { theme } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const fadeAnim = new Animated.Value(0);

  // Debounce search input
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchText.trim() === "") {
        setFilteredSermons([]);
        setLoading(false);
      } else {
        handleSearch(searchText);
      }
    }, 300); // 300ms debounce time

    return () => clearTimeout(delayDebounce);
  }, [searchText]);

  const handleSearch = async (text) => {
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 100)); // Simulating API delay

      const filtered = sermons
        .map((sermon) => {
          const regex = new RegExp(`(${text})`, "i");
          const match = sermon.sermon.match(regex);
          if (match) {
            const sentence = sermon.sermon.slice(
              Math.max(0, match.index - 30),
              match.index + match[0].length + 30
            );
            return {
              title: sermon.title,
              year: sermon.year,
              location: sermon.location,
              sentence: sentence.replace(
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

  const handleSermonClick = (sermon) => {
    const searchPhrase = searchText;
    setSelectedSermon(sermon);
    navigation.navigate("Home", { sermon, searchPhrase });
  };

  const handleClearSearch = () => {
    setSearchText("");
    setFilteredSermons([]);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.searchContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="search"
            size={24}
            color="gray"
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search qoutes from sermons..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor={theme.colors.text}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <AntDesign
                name="closecircle"
                size={24}
                color="gray"
                style={styles.clearIcon}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="blue" />
            <Text style={[styles.loaderText, { color: theme.colors.text }]}>
              Searching sermons...
            </Text>
          </View>
        ) : filteredSermons.length > 0 ? (
          filteredSermons.map((sermon, index) => (
            <TouchableOpacity
              key={index}
              style={styles.sermonContainer}
              onPress={() => handleSermonClick(sermon)}
            >
              <Text style={[styles.sermonTitle, { color: theme.colors.text }]}>
                {sermon.title}
              </Text>
              <Text
                style={[styles.sermonContent, { color: theme.colors.text }]}
              >
                {sermon.sentence
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
                      {part.replace(/<\/?highlight>/g, "")}
                    </Text>
                  ))}
              </Text>
              {/* <Text
                style={{
                  color: theme.colors.text,
                  padding: 2,
                  borderRadius: 10,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  width: "70%",
                  paddingHorzontal: 4,
                  marginTop: 2,
                }}
              >
                {sermon.location ? sermon.location : "not found"}
              </Text> */}
            </TouchableOpacity>
          ))
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={[styles.noResultsText, { color: theme.colors.text }]}>
              {searchText.trim() !== ""
                ? "No sermons found"
                : "Search quotes from all sermons"}
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    paddingHorizontal: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
    padding: 10,
    width: "90%",
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  clearIcon: {
    marginLeft: 10,
  },
  sermonContainer: {
    padding: 10,
    borderBottomColor: "lightgray",
    borderBottomWidth: 1,
  },
  sermonTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  sermonContent: {
    fontFamily: "monospace",
    fontSize: 12,
  },
  highlightedText: {
    backgroundColor: "green",
    color: "#14f39d",
    fontFamily: "monospace",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "green",
    padding: 5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
  },
  noResultsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});

export default SermonSearch;
