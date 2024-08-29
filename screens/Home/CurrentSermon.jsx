import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from "react-native";
import { SermonContext } from "../../Logic/globalState";
import { Feather } from "@expo/vector-icons";
import PlaySermon from "../PlaySermon";

function Home() {
  const { selectedSermon, settings } = React.useContext(SermonContext);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (searchResults.length > 0) {
      scrollToMatch(searchResults[currentResultIndex].index);
    }
  }, [currentResultIndex, searchResults]);

  if (!selectedSermon) {
    return (
      <View style={styles.container}>
        <Text style={{color:'red'}}>No sermon content available</Text>
      </View>
    );
  }

  

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
              lineHeight: 30,
            },
          ]}
        >
          {selectedSermon.sermon}
        </Text>
      );
    }

  

    return (
      <Text
        style={[
          styles.sermonText,
          {
            color: settings.textColor,
            fontFamily: settings.fontFamily,
            fontSize: settings.fontSize,
            lineHeight: 30,
          },
        ]}
      >
        {parts}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {selectedSermon.type === "mp3" ? (
        <PlaySermon sermon={selectedSermon} />
      ) : (
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollViewContainer,
            { backgroundColor: settings.backgroundColor },
          ]}
          onContentSizeChange={(width, height) => setContentHeight(height)}
        >
          <View>
            <Text style={styles.titleText}>{selectedSermon.title}</Text>
            <Text style={styles.locationText}>{selectedSermon.location}</Text>
            {renderSermonText()}
          </View>
        </ScrollView>
      )}

      {selectedSermon.type === "text" && (
        <>

          <TouchableOpacity 
            style={styles.topButton} 
            onPress={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}
          >
            <Feather name="arrow-up" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.bottomButton} 
            onPress={() => scrollViewRef.current?.scrollTo({ y: contentHeight, animated: true })}
          >
            <Feather name="arrow-down" size={24} color="white" />
          </TouchableOpacity>
        </>
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
    paddingBottom: 100,
  },
  sermonText: {
    lineHeight: 25,
    marginBottom: 15,
    marginLeft: 0,
    paddingLeft: 0,
    textAlign: "center",
  },
  highlightedText: {
    backgroundColor: "yellow",
    fontWeight: "bold",
  },
  titleText: {
    color: "#cdc4d6",
    fontFamily: "monospace",
    fontWeight: "900",
    textAlign: "center",
    textDecorationLine: "underline",
    fontSize: 15,
  },
  locationText: {
    color: "#cdc4d6",
    fontFamily: "monospace",
    fontWeight: "500",
    textAlign: "center",
    fontStyle: "italic",
    paddingTop: 10,
    paddingBottom: 20,
  },
  searchIcon: {
    position: "absolute",
    right: 20,
    bottom: 140,
    backgroundColor: "#2d2d2d",
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#fafafa",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  topButton: {
    position: "absolute",
    right: 20,
    bottom: 200,
    backgroundColor: "#2d2d2d",
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#fafafa",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  bottomButton: {
    position: "absolute",
    right: 20,
    bottom: 80,
    backgroundColor: "#2d2d2d",
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#fafafa",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  searchContainer: {
    position: "absolute",
    top: 60,
    left: 10,
    right: 10,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  searchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  searchInput: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    height: 40,
  },
  searchButton: {
    backgroundColor: "#2d2d2d",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  searchButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  navigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  matchesText: {
    fontSize: 14,
    color: "#555",
  },
  prevButton: {
    marginRight: 20,
  },
  prevButtonText: {
    fontSize: 18,
    color: "#2d2d2d",
  },
  nextButton: {},
  nextButtonText: {
    fontSize: 18,
    color: "#2d2d2d",
  },
});

export default Home;