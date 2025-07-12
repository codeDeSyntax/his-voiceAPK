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
  ToastAndroid,
  Alert,
} from "react-native";
import { useAppContext } from "../../Logic/globalState";
import {
  formatSermonIntoParagraphs,
  formatSermonIntoParagraphsAsync,
  searchSermon,
} from "../../Utils/sermonUtils";
import ParagraphText from "../../components/currentSermon/ParagraphText";
import CustomBottomSheetController from "../../components/currentSermon/BottomSheetController";
import DraggableFloatingBackButton from "../../components/FloatButton";
import SearchFeedback from "../../components/currentSermon/SearchFeedback";
import { styles } from "../../styles/currentsermon";
import { useNavigation } from "@react-navigation/native";
import DownloadSermon from "../../components/currentSermon/PlaySermon";
import CustomTopCardController from "../../components/currentSermon/BottomSheetController";
import LoadingScreen from "../../components/Loader";

const CurrentSermon = React.memo(() => {
  const {
    selectedSermon,
    settings,
    theme,
    searchText,
    updateLastReadPosition,
  } = useAppContext();
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
  const [currentVisibleParagraph, setCurrentVisibleParagraph] = useState(0);
  const [hasScrolledToLastPosition, setHasScrolledToLastPosition] =
    useState(false);
  const [showSelectionTip, setShowSelectionTip] = useState(false);
  const [paragraphs, setParagraphs] = useState([]);
  const [isLoadingParagraphs, setIsLoadingParagraphs] = useState(false);

  const scrollViewRef = useRef(null);
  const scrollTimeout = useRef(null);

  // Show selection tip on first load
  useEffect(() => {
    const tipTimer = setTimeout(() => {
      setShowSelectionTip(true);
      // Hide tip after 4 seconds
      setTimeout(() => setShowSelectionTip(false), 4000);
    }, 2000);

    return () => clearTimeout(tipTimer);
  }, [selectedSermon?.id]);

  // Format sermon into paragraphs asynchronously
  useEffect(() => {
    const loadParagraphs = async () => {
      if (!selectedSermon?.sermon) {
        setParagraphs([]);
        return;
      }

      setIsLoadingParagraphs(true);
      try {
        // Use async formatting for better performance
        const formattedParagraphs = await formatSermonIntoParagraphsAsync(
          selectedSermon.sermon
        );
        setParagraphs(formattedParagraphs);
      } catch (error) {
        console.error("Error formatting paragraphs:", error);
        // Fallback to sync formatting
        const formattedParagraphs = formatSermonIntoParagraphs(
          selectedSermon?.sermon || ""
        );
        setParagraphs(formattedParagraphs);
      } finally {
        setIsLoadingParagraphs(false);
      }
    };

    loadParagraphs();
  }, [selectedSermon?.sermon]);

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

  // Track scroll position and update current visible paragraph
  const handleScroll = useCallback(
    (event) => {
      const scrollY = event.nativeEvent.contentOffset.y;

      // Clear existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Set a new timeout to update position after user stops scrolling
      scrollTimeout.current = setTimeout(() => {
        // Find the paragraph that's currently visible
        let visibleParagraph = 0;
        for (const [index, layout] of Object.entries(paragraphLayouts)) {
          const paragraphIndex = parseInt(index);
          if (
            layout.y <= scrollY + 200 &&
            layout.y + layout.height > scrollY + 200
          ) {
            visibleParagraph = paragraphIndex;
            break;
          }
        }

        setCurrentVisibleParagraph(visibleParagraph);

        // Update the last read position
        if (selectedSermon && updateLastReadPosition) {
          updateLastReadPosition(selectedSermon.id, visibleParagraph);
        }
      }, 500); // Update position 500ms after user stops scrolling
    },
    [paragraphLayouts, selectedSermon, updateLastReadPosition]
  );

  // Scroll to last read position when sermon loads
  useEffect(() => {
    if (
      selectedSermon?.lastReadParagraph !== undefined &&
      paragraphLayouts[selectedSermon.lastReadParagraph] &&
      !hasScrolledToLastPosition
    ) {
      setTimeout(() => {
        scrollToParagraph(selectedSermon.lastReadParagraph);

        // Show toast message
        const message = `You reached paragraph ${
          selectedSermon.lastReadParagraph + 1
        } the last time`;
        if (Platform.OS === "android") {
          ToastAndroid.show(message, ToastAndroid.LONG);
        } else {
          Alert.alert("Last Position", message);
        }

        setHasScrolledToLastPosition(true);
      }, 1000); // Delay to ensure layouts are ready
    }
  }, [
    selectedSermon,
    paragraphLayouts,
    hasScrolledToLastPosition,
    scrollToParagraph,
  ]);

  // Reset scroll state when sermon changes
  useEffect(() => {
    setHasScrolledToLastPosition(false);
    setCurrentVisibleParagraph(0);
  }, [selectedSermon?.id]);

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  // Render paragraphs with numbering
  const renderSermonText = useMemo(() => {
    if (isLoadingParagraphs) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading sermon content...
          </Text>
        </View>
      );
    }

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
    isLoadingParagraphs,
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
            <DownloadSermon />
          ) : (
            <>
              {/* Show loading screen while paragraphs are being processed */}
              {isLoadingParagraphs ? (
                <LoadingScreen message="getting the message..." />
              ) : (
                <>
                  <ScrollView
                    ref={scrollViewRef}
                    scrollEventThrottle={16}
                    onScroll={handleScroll}
                    contentContainerStyle={[
                      styles.scrollViewContainer,
                      { flexGrow: 1 },
                    ]}
                    onContentSizeChange={(width, height) => {
                      setContentHeight(height);
                    }}
                  >
                    <View>
                      <Text
                        style={[
                          styles.titleText,
                          { color: theme.dark ? "#854412" : "#5d3211" },
                        ]}
                      >
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
                    setSearching={setSearching}
                    isCardOpen={isCardOpen}
                    setIsCardOpen={setIsCardOpen}
                  />

                  <SearchFeedback
                    isVisible={showFeedback}
                    message={feedbackMessage}
                    theme={theme}
                  />

                  {/* Selection Tip */}
                  {showSelectionTip && (
                    <View
                      style={[
                        styles.selectionTipContainer,
                        { backgroundColor: theme.colors.background },
                      ]}
                    >
                      <Text
                        style={[
                          styles.selectionTipText,
                          { color: theme.colors.text },
                        ]}
                      >
                        💡 Tip: Double-tap paragraph numbers to enable text
                        selection, then long-press text to select words or
                        phrases
                      </Text>
                    </View>
                  )}
                </>
              )}
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
});

export default CurrentSermon;
