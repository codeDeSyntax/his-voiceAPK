import React, { useState, useRef, useEffect, useCallback, useContext } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Text } from "react-native-paper";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { SermonContext } from "../../Logic/globalState";
import { useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import PlaySermon from "../PlaySermon";

 function Home() {
  const { selectedSermon, settings, theme,handleRandomSermons } = useContext(SermonContext);
  const route = useRoute();
  const searchPhrase = route.params?.searchPhrase || "";

  const [searchResults, setSearchResults] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [showFloatingCard, setShowFloatingCard] = useState(false);
  
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
    handleRandomSermons();

  }, []);

  const validateTextContent = (content) => {
    if (content == null) return "no sermon text content";
    if (typeof content === "number") return content.toString();
    if (typeof content !== "string") {
      try {
        return String(content);
      } catch (e) {
        console.error("Error converting content to string:", e);
        return "";
      }
    }
    return content;
  };


  useEffect(() => {
    if (selectedSermon && searchPhrase) {
      const regex = new RegExp(`(${searchPhrase})`, "gi");
      const matches = [];
      let match;

      while ((match = regex.exec(selectedSermon?.sermon)) !== null) {
        matches.push({
          match: match[0],
          index: match.index,
        });
      }

      setSearchResults(matches);
    }
  }, [selectedSermon, searchPhrase]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: showFloatingCard ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showFloatingCard, fadeAnim]);

  useFocusEffect(
    useCallback(() => {
      const scrollToMatch = () => {
        if (
          selectedSermon?.sermon?.length && 
          searchResults.length > 0 && 
          contentHeight > 0
        ) {
          const { height: windowHeight } = Dimensions.get("window");
          const matchIndex = searchResults[currentResultIndex].index;
          const position = Math.floor((matchIndex / selectedSermon?.sermon?.length) * contentHeight);
          const offset = Math.max(position - windowHeight / 2, 0);
          scrollViewRef.current?.scrollTo({ y: offset, animated: true });
        }
      };

      setTimeout(scrollToMatch, 100);
    }, [searchResults, currentResultIndex, contentHeight, selectedSermon])
  );

  const renderSermonText = () => {
    const cleanSermonText = selectedSermon?.sermon?.replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  
    if (searchResults.length === 0) {
      const parts = cleanSermonText?.split(/(Endnote)/gi);
      return (
        <Text
          selectable={true}
          style={[styles.sermonText, {
            color: theme.colors.text,
            fontFamily: settings.fontFamily,
            fontSize: settings.fontSize,
            textAlignVertical: "left",
          }]}
        >
          🔊🔊
          {parts?.map((part, index) => {
            const validatedPart = validateTextContent(part);
            return part.toLowerCase() === "endnote" ? (
              <Text key={index} style={[styles.endnoteText]}>
                {validatedPart}
              </Text>
            ) : validatedPart;
          })}
          <Feather name="key" size={24} color={theme.colors.text} />
        </Text>
      );
    }
  
    const parts = cleanSermonText?.split(new RegExp(`(${searchPhrase}|Endnote)`, "gi"));
    return (
      <Text
        style={[styles.sermonText, {
          color: theme.colors.text,
          fontFamily: settings.fontFamily,
          fontSize: settings.fontSize,
          lineHeight: 30,
        }]}
      >
        {parts.map((part, index) => {
          const validatedPart = validateTextContent(part);
          if (part.toLowerCase() === searchPhrase.toLowerCase()) {
            return (
              <Text key={index} style={styles.highlightedText}>
                {validatedPart}
              </Text>
            );
          } else if (part.toLowerCase() === "endnote") {
            return (
              <Text key={index} style={styles.endnoteText}>
                {validatedPart}
              </Text>
            );
          }
          return validatedPart;
        })}
      </Text>
    );
  };

  const FloatingCard = () => (
    <Animated.View
      style={[
        styles.floatingCard,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={[styles.floatingCardTitle,{fontFamily:"serif"}]}>{selectedSermon?.title}</Text>
      {selectedSermon.date && (
        <Text style={[styles.floatingCardText,{fontStyle:"italic"}]}>{selectedSermon?.date}</Text>
      )}
      {selectedSermon?.location && (
        <Text style={styles.floatingCardText}>{selectedSermon?.location}</Text>
      )}
      {selectedSermon?.year && (
        <Text style={styles.floatingCardText}>{selectedSermon?.year}</Text>
      )}
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      {selectedSermon?.type === "mp3" ? (
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
                  {selectedSermon?.title}
                </Text>
                <Text style={[styles.locationText, { color: theme.colors.text }]}>
                  {selectedSermon?.location}
                </Text>
                {renderSermonText()}
              </View>
        </ScrollView>
      )}

      {selectedSermon?.type === "text" && (
        <>
          <TouchableOpacity
            style={[styles.floatingButton, { bottom: 220,backgroundColor:theme.colors.background,elevation:5  }]}
            onPress={() => setShowFloatingCard(!showFloatingCard)}
          >
            <Feather name="info" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.floatingButton, { bottom: 150,backgroundColor:theme.colors.background,elevation:5 }]}
            onPress={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}
          >
            <Feather name="arrow-up" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.floatingButton, { bottom: 80,backgroundColor:theme.colors.background,elevation:5 }]}
            onPress={() =>
              scrollViewRef.current?.scrollTo({
                y: contentHeight,
                animated: true,
              })
            }
          >
            <Feather name="arrow-down" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          {showFloatingCard && <FloatingCard />}

          {searchResults.length > 0 && (
            <View style={styles.navigationContainer}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => setCurrentResultIndex((current) => Math.max(0, current - 1))}
              >
                <Text style={styles.navButtonText}>Previous</Text>
              </TouchableOpacity>

              <Text style={styles.matchesText}>
                {currentResultIndex + 1} / {searchResults.length}
              </Text>

              <TouchableOpacity
                style={styles.navButton}
                onPress={() =>
                  setCurrentResultIndex((current) =>
                    Math.min(searchResults.length - 1, current + 1)
                  )
                }
              >
                <Text style={styles.navButtonText}>Next</Text>
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
  scrollViewContainer: {
    paddingHorizontal: 15,
    paddingTop: 60,
    paddingBottom: 100,
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
  endnoteText: {
    textDecorationLine: 'underline',
    color: '#4a90e2',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  titleText: {
    fontFamily: "serif",
    fontWeight: "900",
    fontSize: 24,
    textAlign: "left",
    marginBottom: 8,
  },
  locationText: {
    fontFamily: "serif",
    fontWeight: "500",
    fontSize: 16,
    fontStyle: "italic",
    marginBottom: 24,
  },
  floatingButton: {
    position: "absolute",
    right: 20,
    backgroundColor: "#2d2d2d",
    borderRadius: 30,
    marginBottom:15,
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 10,
  },
  matchesText: {
    fontSize: 14,
    color: "#555",
  },
  navButton: {
    padding: 8,
    backgroundColor: '#2d2d2d',
    borderRadius: 15,
  },
  navButtonText: {
    fontSize: 16,
    color: 'white',
  },
  floatingCard: {
    position: 'absolute',
    right: 20,
    bottom: 300,
    backgroundColor: 'rgba(45, 45, 45, 0.95)',
    borderRadius: 15,
    padding: 15,
    width: 250,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  floatingCardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  floatingCardText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 4,
  },
});

export default Home