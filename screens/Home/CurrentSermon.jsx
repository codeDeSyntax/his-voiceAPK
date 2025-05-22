import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
} from "react";
import {
  Text,
  View,
  ScrollView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import { useAppContext } from "../../Logic/globalState";
import {
  formatSermonIntoParagraphs,
  searchSermon,
} from "../../Utils/sermonUtils";
import ParagraphText from "../../components/currentSermon/ParagraphText";
import CustomBottomSheetController from "../../components/currentSermon/BottomSheetController";
import DraggableFloatingBackButton from "../../components/FloatButton";
import SearchFeedback from "../../components/currentSermon/SearchFeedback";
import { styles } from "../../styles/currentsermon";
import { useNavigation } from "@react-navigation/native";
import DownloadSermon from "../PlaySermon";
import CustomTopCardController from "../../components/currentSermon/BottomSheetController";

const CurrentSermon = React.memo(() => {
  const { selectedSermon, settings, theme, searchText } = useAppContext();
  const router = useNavigation();
  const [searchPhrase, setSearchPhrase] = useState(searchText || "");
  const [searchResults, setSearchResults] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [paragraphLayouts, setParagraphLayouts] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [searching, setSearching] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);

  const scrollViewRef = useRef(null);

  // Format sermon into paragraphs
  const paragraphs = useMemo(
    () => formatSermonIntoParagraphs(selectedSermon?.sermon || ""),
    [selectedSermon?.sermon]
  );

  // Add keyboard listeners to track keyboard state
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Update search results when search phrase changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchPhrase) {
        try {
          setSearching(true);
          const results = searchSermon(paragraphs, searchPhrase);
          setSearchResults(results);
          setSearching(false);
          setCurrentResultIndex(0);

          if (results.length > 0 && paragraphLayouts[results[0]]) {
            scrollToParagraph(results[0]);
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        setSearchResults([]);
      }
    };

    const timeout = setTimeout(fetchSearchResults, 300); // Debounce delay

    return () => clearTimeout(timeout);
  }, [searchPhrase, paragraphs, paragraphLayouts, scrollToParagraph]);

  // Store paragraph layout information for scrolling
  const handleParagraphLayout = useCallback((index, event) => {
    const layout = event.nativeEvent.layout;
    setParagraphLayouts((prev) => ({
      ...prev,
      [index]: {
        y: layout.y,
        height: layout.height,
      },
    }));
  }, []);

  // Effect to collect all paragraph layouts and their positions
  useEffect(() => {
    // Reset layouts when sermon changes
    setParagraphLayouts({});
  }, [selectedSermon?.sermon]);

  // Scroll to specific paragraph by index
  const scrollToParagraph = useCallback(
    (index) => {
      if (paragraphLayouts[index] && scrollViewRef.current) {
        // Calculate position to scroll to, with some padding to see context
        const scrollPosition = Math.max(0, paragraphLayouts[index].y - 100);

        scrollViewRef.current.scrollTo({
          y: scrollPosition,
          animated: true,
        });
      }
    },
    [paragraphLayouts]
  );

  // Scroll to top of sermon
  const scrollToTop = useCallback(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  // Scroll to bottom of sermon
  const scrollToBottom = useCallback(() => {
    scrollViewRef.current?.scrollTo({ y: contentHeight, animated: true });
  }, [contentHeight]);

  // Navigate to a search result
  const navigateToResult = useCallback(
    (paragraphIndex) => {
      scrollToParagraph(paragraphIndex);

      // Show feedback
      setFeedbackMessage(`Navigated to paragraph ${paragraphIndex + 1}`);
      setShowFeedback(true);

      // Hide feedback after delay
      setTimeout(() => {
        setShowFeedback(false);
      }, 2000);
    },
    [scrollToParagraph]
  );

  // Navigate back to all sermons
  const handleBack = useCallback(() => {
    router?.navigate("AllSermons");
  }, [router]);

  // Render paragraphs with numbering
  const renderSermonText = useMemo(() => {
    return paragraphs.map((paragraph, index) => (
      <ParagraphText
        key={`paragraph-${index}`}
        paragraph={paragraph}
        index={index}
        searchPhrase={searchPhrase}
        theme={theme}
        settings={settings}
        onLayout={(event) => handleParagraphLayout(index, event)}
        selectedSermon={selectedSermon}
      />
    ));
  }, [
    paragraphs,
    searchPhrase,
    theme,
    settings,
    handleParagraphLayout,
    selectedSermon,
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.primary }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 50}
        enabled={keyboardVisible}
      >
        <DraggableFloatingBackButton />
        <View
          style={[styles.container, { backgroundColor: theme.colors.primary }]}
        >
          {selectedSermon?.type === "mp3" ? (
            <DownloadSermon sermon={selectedSermon} />
          ) : (
            <>
              <ScrollView
                ref={scrollViewRef}
                scrollEventThrottle={16}
                contentContainerStyle={[
                  styles.scrollViewContainer,
                  { flexGrow: 1 },
                ]}
                onContentSizeChange={(width, height) => {
                  setContentHeight(height);
                }}
              >
                <View>
                  <Text style={[styles.titleText, { color: "#044667" }]}>
                    {selectedSermon?.title}
                  </Text>
                  {selectedSermon?.location && (
                    <Text
                      style={[
                        styles.locationText,
                        { color: theme.colors.text },
                      ]}
                    >
                      {selectedSermon?.location}
                    </Text>
                  )}

                  <View style={{ width: "100%" }}>{renderSermonText}</View>
                </View>
              </ScrollView>

              {/* <Suspense fallback={<Text>Loading...</Text>}> */}
              <CustomTopCardController
                theme={theme}
                selectedSermon={selectedSermon}
                searchPhrase={searchPhrase}
                setSearchPhrase={setSearchPhrase}
                searchResults={searchResults}
                setSearchResults={setSearchResults}
                currentResultIndex={currentResultIndex}
                setCurrentResultIndex={setCurrentResultIndex}
                scrollToTop={scrollToTop}
                scrollToBottom={scrollToBottom}
                navigateToResult={navigateToResult}
                onBack={handleBack}
                searchSermon={searchSermon}
                paragraphs={paragraphs}
                paragraphLayouts={paragraphLayouts}
                scrollToParagraph={scrollToParagraph}
                searching={searching}
                isCardOpen={isCardOpen}
                setIsCardOpen={setIsCardOpen}
              />
              {/* </Suspense> */}

              <SearchFeedback
                isVisible={showFeedback}
                message={feedbackMessage}
                theme={theme}
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
});

export default CurrentSermon;
