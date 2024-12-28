import React, { useState, useRef, useEffect, useCallback, useContext, Suspense } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Text } from "react-native-paper";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from "react-native";
import { SermonContext } from "../../Logic/globalState";
import { useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import PlaySermon from "../PlaySermon";

export default function Home() {
  const { selectedSermon, settings, theme } = useContext(SermonContext);
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
        if (selectedSermon && selectedSermon.sermon && searchResults.length > 0) {
          const { height: windowHeight } = Dimensions.get("window");
          const matchIndex = searchResults[currentResultIndex].index;
          const position = (matchIndex / selectedSermon.sermon.length) * contentHeight;
          const offset = Math.max(position - windowHeight / 2, 0);
          scrollViewRef.current?.scrollTo({ y: offset, animated: true });
        }
      };

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
    if (!selectedSermon || !selectedSermon.sermon) return null;

    // Clean up the sermon text by properly handling paragraphs
    const cleanSermonText = selectedSermon.sermon
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .replace(/\n{3,}/g, '\n\n')  // Replace multiple newlines with double newline
      .trim();  // Remove leading/trailing whitespace

    if (searchResults.length === 0) {
      // Split text into proper paragraphs (separated by double newlines)
      const paragraphs = cleanSermonText.split(/\n\n+/);
      
      return (
        <View style={styles.sermonContainer}>
          {paragraphs.map((paragraph, index) => (
            <View key={index} style={styles.paragraphContainer}>
              <Text
                selectable={true}
                style={[
                  styles.paragraphText,
                  {
                    color: theme.colors.text,
                    fontFamily: settings.fontFamily,
                    fontSize: settings.fontSize,
                  },
                ]}
              >
                {/* Replace single newlines with spaces within paragraphs */}
                {paragraph.replace(/\n/g, ' ').trim()}
              </Text>
            </View>
          ))}
        </View>
      );
    }

    // Handle search highlighting with cleaned text
    const parts = cleanSermonText.split(new RegExp(`(${searchPhrase})`, "gi"));
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
        {parts.map((part, index) => (
          <Text key={index} style={{color: theme.colors.text,fontFamily:settings.fontFamily}}>
            {part.toLowerCase() === searchPhrase.toLowerCase() ? (
              <Text style={[styles.highlightedText]}>{part}</Text>
            ) : (
              part
            )}
          </Text>
        ))}
      </Text>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      {selectedSermon.type === "mp3" ? (
        <PlaySermon sermon={selectedSermon} />
      ) : (
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollViewContainer,
            { backgroundColor: theme.colors.primary },
          ]}
          onContentSizeChange={(width, height) => setContentHeight(height)}
        >
          <View>
            <Text style={[styles.titleText, { color: theme.colors.text, textAlign: "left" }]}>
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
            style={[styles.topButton, {backgroundColor:theme.colors.background,elevation:5}]}
            onPress={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}
          >
            <Feather name="arrow-up" size={24}  color={theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bottomButton,{backgroundColor:theme.colors.background,elevation:5}]}
            onPress={() =>
              scrollViewRef.current?.scrollTo({
                y: contentHeight,
                animated: true,
              })
            }
          >
            <Feather name="arrow-down" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          {searchResults.length > 0 && (
            <View style={styles.navigationContainer}>
              <TouchableOpacity
                style={styles.prevButton}
                onPress={() => setCurrentResultIndex((current) => Math.max(0, current - 1))}
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
  
  sermonContainer: {
    flex: 1,
    paddingVertical: 10,
  },
  
  paragraphContainer: {
    marginBottom: 20,  // Space between paragraphs
    paddingVertical: 10,  // Internal padding for each paragraph
  },
  
  paragraphText: {
    lineHeight: 25,
    textAlign: "left",
  },
  
  sermonText: {
    lineHeight: 25,
    marginBottom: 15,
    textAlign: "left",
  },
  
  highlightedText: {
    backgroundColor: "green",
    color: "#14f39d",
    fontWeight: "bold",
  },
  
  titleText: {
    color: "#cdc4d6",
    fontFamily: "serif",
    fontWeight: "900",
    textAlign: "center",
    textDecorationLine: "underline",
    fontSize: 15,
  },
  
  locationText: {
    color: "#cdc4d6",
    fontFamily: "monospace",
    fontWeight: "500",
    textAlign: "left",
    fontStyle: "italic",
    paddingTop: 10,
    paddingBottom: 10,
  },
  
  topButton: {
    position: "absolute",
    right: 20,
    bottom: 160,
    backgroundColor: "#2d2d2d",
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
   
  },
  
  bottomButton: {
    position: "absolute",
    right: 20,
    bottom: 100,
    backgroundColor: "#2d2d2d",
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  
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