import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SermonContext } from "../../Logic/globalState";
import { Feather } from "@expo/vector-icons";
import PlaySermon from "../PlaySermon";

function Home() {
  const { selectedSermon, settings, setSettings } =
    React.useContext(SermonContext);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const scrollViewRef = useRef(null);

  if (!selectedSermon) {
    return (
      <View style={styles.container}>
        <Text>No sermon content available</Text>
      </View>
    );
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    const regex = new RegExp(searchQuery, "gi");
    const matches = [];
    let match;
    while ((match = regex.exec(selectedSermon.sermon)) !== null) {
      matches.push({
        index: match.index,
        text: match[0],
      });
    }
    setSearchResults(matches);
    setCurrentResultIndex(0);
    if (matches.length > 0) {
      scrollToMatch(matches[0].index);
    }
  };

  const scrollToMatch = (index) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: index * 20 - 200, // Scroll position to bring the match to the middle
        animated: true,
      });
    }
  };

  const handleNextResult = () => {
    if (currentResultIndex < searchResults.length - 1) {
      setCurrentResultIndex(currentResultIndex + 1);
      scrollToMatch(searchResults[currentResultIndex + 1].index);
    }
  };

  const handlePreviousResult = () => {
    if (currentResultIndex > 0) {
      setCurrentResultIndex(currentResultIndex - 1);
      scrollToMatch(searchResults[currentResultIndex - 1].index);
    }
  };

  const renderSermonText = () => {
    if (searchResults.length === 0) {
      return (
        <Text
          style={[
            styles.sermonText,
            {
              color: settings.textColor,
              fontFamily: settings.fontFamily,
              fontSize: settings.fontSize,
            },
          ]}
        >
          {selectedSermon.sermon}
        </Text>
      );
    }

    const parts = [];
    let lastIndex = 0;

    searchResults.forEach((result, index) => {
      parts.push(
        <Text key={`text-${index}`} style={styles.sermonText}>
          {selectedSermon.sermon.slice(lastIndex, result.index)}
        </Text>
      );
      parts.push(
        <Text key={`highlight-${index}`} style={styles.highlightedText}>
          {result.text}
        </Text>
      );
      lastIndex = result.index + result.text.length;
    });

    parts.push(
      <Text key="text-last" style={styles.sermonText}>
        {selectedSermon.sermon.slice(lastIndex)}
      </Text>
    );

    return parts;
  };

  return (
    <View style={styles.container}>
      {selectedSermon.type === "mp3" ? (
        <PlaySermon sermon={selectedSermon} />
      ) : (
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[styles.scrollViewContainer, {backgroundColor:settings.backgroundColor}]}
        >
          <View>
            <View>
              <Text
                style={{
                  color: "#cdc4d6",
                  fontFamily: "monospace",
                  fontWeight: "900",
                  textAlign: "center",
                  textDecorationLine: "underline",
                  fontSize: 15,
                }}
              >
                {" "}
                {selectedSermon.title}
              </Text>
              <Text
                style={{
                  color: "#cdc4d6",
                  fontFamily: "monospace",
                  fontWeight: "500",
                  textAlign: "center",
                  fontStyle: "italic",
                  paddingTop: 10,
                  paddingBottom:20
                }}
              >
                {" "}
                {selectedSermon.location}
              </Text>
            </View>
            {renderSermonText()}
          </View>
        </ScrollView>
      )}

      {selectedSermon.type === "text" && (
        <TouchableOpacity
          style={styles.searchIcon}
          onPress={() => setShowSearch(!showSearch)}
        >
          <Feather name="search" size={24} color="white" />
        </TouchableOpacity>
      )}

      {showSearch && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search sermon..."
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
          {searchResults.length > 0 && (
            <View style={styles.navigationContainer}>
              <Text style={styles.matchesText}>
                Found {searchResults.length} matches
              </Text>
              <TouchableOpacity
                style={styles.prevButton}
                onPress={handlePreviousResult}
              >
                <Text style={styles.prevButtonText}>{"<"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNextResult}
              >
                <Text style={styles.nextButtonText}>{">"}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContainer: {
    paddingHorizontal: 15,
    paddingTop: 60,
  },
  sermonText: {
    lineHeight: 25,
    marginBottom: 15, // Add spacing after paragraphs instead of indentation
    marginLeft: 0, // Remove any left margin that might cause indentation
    paddingLeft: 0, // Remove padding that could create indentations
   textAlign:'left'
  },
  highlightedText: {
    fontSize: 18,
    fontFamily: "monospace",
    backgroundColor: "yellow",
    fontWeight: "bold", // make highlighted text bold
  },
  searchIcon: {
    position: "absolute",
    right: 20,
    bottom: 80,
    backgroundColor: "#007AFF",
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    position: "absolute",
    bottom: 90,
    left: 20,
    right: 20,
    flexDirection: "column",
    backgroundColor: "white",
    borderRadius: 5,
    padding: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  searchButton: {
    marginTop: 10,
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
  },
  searchButtonText: {
    color: "white",
    textAlign: "center",
  },
  navigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  matchesText: {
    flex: 1,
    fontSize: 16,
  },
  prevButton: {
    marginLeft: 10,
    backgroundColor: "#34C759",
    padding: 10,
    borderRadius: 5,
  },
  prevButtonText: {
    color: "white",
    textAlign: "center",
  },
  nextButton: {
    marginLeft: 10,
    backgroundColor: "#34C759",
    padding: 10,
    borderRadius: 5,
  },
  nextButtonText: {
    color: "white",
    textAlign: "center",
  },
});

export default Home;
