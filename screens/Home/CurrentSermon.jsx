import React, { useState, useRef, useEffect } from "react";
import { Text, View, ScrollView, StatusBar, Platform } from "react-native";
import { useAppContext } from "../Logic/globalState";
import { useRouter } from "expo-router";
import { formatSermonIntoParagraphs, searchSermon } from "../utils/SermonUtils";
import ParagraphText from "../components/ParagraphText";
import BottomSheetManager from "../components/BottomSheetManager";
import PlaySermon from "./PlaySermon";
import { styles } from "../styles/sermon";

const CurrentSermon = () => {
  const { selectedSermon, settings, theme, searchText } = useAppContext();
  const router = useRouter();
  const [searchPhrase, setSearchPhrase] = useState(searchText || "");
  const [searchResults, setSearchResults] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [paragraphLayouts, setParagraphLayouts] = useState({});
  
  const scrollViewRef = useRef(null);

  // Format sermon into paragraphs
  const paragraphs = formatSermonIntoParagraphs(selectedSermon?.sermon || "");

  // Update search results when search phrase changes
  useEffect(() => {
    if (searchPhrase) {
      const results = searchSermon(paragraphs, searchPhrase);
      setSearchResults(results);
      setCurrentResultIndex(0);
      
      // Scroll to first result if exists
      if (results.length > 0 && paragraphLayouts[results[0]]) {
        scrollToParagraph(results[0]);
      }
    } else {
      setSearchResults([]);
    }
  }, [searchPhrase]);

  // Store paragraph layout information for scrolling
  const handleParagraphLayout = (index, event) => {
    const layout = event.nativeEvent.layout;
    setParagraphLayouts(prev => ({
      ...prev,
      [index]: {
        y: layout.y,
        height: layout.height
      }
    }));
  };

  // Scroll to specific paragraph by index
  const scrollToParagraph = (index) => {
    if (paragraphLayouts[index] && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: paragraphLayouts[index].y,
        animated: true
      });
    }
  };

  // Scroll to top of sermon
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Scroll to bottom of sermon
  const scrollToBottom = () => {
    scrollViewRef.current?.scrollTo({ y: contentHeight, animated: true });
  };

  // Navigate to a search result
  const navigateToResult = (paragraphIndex) => {
    scrollToParagraph(paragraphIndex);
  };

  // Navigate back to all sermons
  const handleBack = () => {
    router.push("screens/AllSermons");
  };

  // Render paragraphs with numbering
  const renderSermonText = () => {
    return paragraphs.map((paragraph, index) => (
      <ParagraphText
        key={`paragraph-${index}`}
        paragraph={paragraph}
        index={index}
        searchPhrase={searchPhrase}
        theme={theme}
        settings={settings}
        onLayout={(event) => handleParagraphLayout(index, event)}
      />
    ));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      {selectedSermon?.type === "mp3" ? (
        <PlaySermon sermon={selectedSermon} />
      ) : (
        <>
          <ScrollView
            ref={scrollViewRef}
            scrollEventThrottle={16}
            contentContainerStyle={styles.scrollViewContainer}
            onContentSizeChange={(width, height) => {
              setContentHeight(height);
            }}
          >
            <View>
              <Text style={[styles.titleText, { color: theme.colors.text }]}>
                {selectedSermon?.title}
              </Text>
              {selectedSermon?.location && (
                <Text style={[styles.locationText, { color: theme.colors.text }]}>
                  {selectedSermon?.location}
                </Text>
              )}

              <View style={{ width: "100%" }}>{renderSermonText()}</View>
            </View>
          </ScrollView>

          <BottomSheetManager
            theme={theme}
            selectedSermon={selectedSermon}
            searchPhrase={searchPhrase}
            setSearchPhrase={setSearchPhrase}
            searchResults={searchResults}
            currentResultIndex={currentResultIndex}
            setCurrentResultIndex={setCurrentResultIndex}
            scrollToTop={scrollToTop}
            scrollToBottom={scrollToBottom}
            navigateToResult={navigateToResult}
            onBack={handleBack}
          />
        </>
      )}
    </View>
  );
};

export default CurrentSermon;