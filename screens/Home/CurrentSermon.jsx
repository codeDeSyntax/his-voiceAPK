import React, { useState, useRef, useEffect, useCallback,useContext, Suspense } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Text } from "react-native-paper";
import {
  View,
  StyleSheet,
  ScrollView,
  // Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from "react-native";
import { SermonContext } from "../../Logic/globalState";
import { useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import PlaySermon from "../PlaySermon";



export default function Home() {
  
  const { selectedSermon, settings,theme } =useContext(SermonContext);
  const route = useRoute();
  const searchPhrase = route.params?.searchPhrase || "";

  const [searchResults, setSearchResults] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (selectedSermon && searchPhrase) {
      const regex = new RegExp(`(${searchPhrase})`, "gi");
      const matches = [];
      let match;

      while ((match = regex.exec(selectedSermon.sermon)) !== null) {
        matches.push({
          match: match[0],
          index: match.index,
        });
      }

      setSearchResults(matches);
    }
  }, [selectedSermon, searchPhrase]);

  useFocusEffect(
    useCallback(() => {
      const scrollToMatch = () => {
        if (
          selectedSermon &&
          selectedSermon.sermon &&
          searchResults.length > 0
        ) {
          const { height: windowHeight } = Dimensions.get("window");
          const matchIndex = searchResults[currentResultIndex].index;
          const position =
            (matchIndex / selectedSermon.sermon.length) * contentHeight;
          const offset = Math.max(position - windowHeight / 2, 0);
          scrollViewRef.current?.scrollTo({ y: offset, animated: true });
        }
      };

      // Delay scrolling to ensure layout is updated
      setTimeout(scrollToMatch, 100);
    }, [searchResults, currentResultIndex, contentHeight, selectedSermon])
  );

  const scrollToMatch = (index) => {
    const { height: windowHeight } = Dimensions.get("window");
    const position = (index / selectedSermon.sermon.length) * contentHeight;
    const offset = Math.max(position - windowHeight / 2, 0);
    scrollViewRef.current?.scrollTo({ y: offset, animated: true });
  };

  const renderSermonText = () => {
    if (searchResults.length === 0) {
      return (
        <Text
        // variant="bodyLarge"
        selectable={true}
          style={[
            styles.sermonText,
            {
              // textAlign:'left',
              color: theme.colors.text,
              fontFamily: settings.fontFamily,
              fontSize: settings.fontSize,
             
              // lineHeight: 30,
              // includeFontPadding:false,
              // writingDirection: "rtl",
              textAlignVertical: "left",
            },
          ]}
        >
          {selectedSermon.sermon}
        </Text>
      );
    }

    const parts = selectedSermon.sermon.split(
      new RegExp(`(${searchPhrase})`, "gi")
    );
    return (
      <Text
        style={[
          styles.sermonText,
          {
            color: theme.colors.text,
            fontFamily: settings.fontFamily,
            fontSize: settings.fontSize,
            lineHeight: 30,
          },
        ]}
      >
        {parts.map((part, index) =>
          part.toLowerCase() === searchPhrase.toLowerCase() ? (
            <Text key={index} style={styles.highlightedText}>
              {part}
            </Text>
          ) : (
            part
          )
        )}
      </Text>
    );
  };

  return (
    // <ImageBackground
    // source={require('../../assets/pic11.jpeg')} // Make sure to add your background image
    //   style={styles.backgroundImage}
    // >
    // <LinearGradient
    //  colors={['rgba(0,0,0,0.1)', '#2f2f2f', '#2f2f2f']}
    //  locations={[0, 0.7, 1]}
    //  style={styles.gradient}
    // >
    
      <View style={[styles.container, { backgroundColor:theme.colors.primary}]}>
      {selectedSermon.type === "mp3" ? (
        <PlaySermon sermon={selectedSermon} />
      ) : (
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollViewContainer,
            { backgroundColor: theme.colors.primary },
          ]}
          onContentSizeChange={(width, height) => setContentHeight(height)}
        >
          <View>
            <Text style={[styles.titleText, { color: theme.colors.text }]}>
              {selectedSermon.title}
            </Text>
            <Text style={[styles.locationText, { color: theme.colors.text }]}>
              {selectedSermon.location}
            </Text>
            {renderSermonText()}
          </View>
        </ScrollView>
      )}

      {selectedSermon.type === "text" && (
        <>
          <TouchableOpacity
            style={styles.topButton}
            onPress={() =>
              scrollViewRef.current?.scrollTo({ y: 0, animated: true })
            }
          >
            <Feather name="arrow-up" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomButton}
            onPress={() =>
              scrollViewRef.current?.scrollTo({
                y: contentHeight,
                animated: true,
              })
            }
          >
            <Feather name="arrow-down" size={24} color="white" />
          </TouchableOpacity>

          {searchResults.length > 0 && (
            <View style={styles.navigationContainer}>
              <TouchableOpacity
                style={styles.prevButton}
                onPress={() =>
                  setCurrentResultIndex((current) => Math.max(0, current - 1))
                }
              >
                <Text style={styles.prevButtonText}>Previous</Text>
              </TouchableOpacity>

              <Text style={styles.matchesText}>
                {currentResultIndex + 1} / {searchResults.length}
              </Text>

              <TouchableOpacity
                style={styles.nextButton}
                onPress={() =>
                  setCurrentResultIndex((current) =>
                    Math.min(searchResults.length - 1, current + 1)
                  )
                }
              >
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
    
    // </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  gradient: {
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
    // marginLeft: 0,
    // paddingLeft: 0,
    textAlign: "left",
  },
  highlightedText: {
    backgroundColor: "green",
    color: "#14f39d", // Match text color with the border
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
    paddingBottom: 10,
  },
  topButton: {
    position: "absolute",
    right: 20,
    bottom: 150,
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
  navigationContainer: {
    position: "absolute",
    bottom: 30,
    left: 15,
    right: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  matchesText: {
    fontSize: 14,
    color: "#555",
  },
  prevButtonText: {
    fontSize: 18,
    color: "#2d2d2d",
  },
  nextButtonText: {
    fontSize: 18,
    color: "#2d2d2d",
  },
});

// export default Home;
