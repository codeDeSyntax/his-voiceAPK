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
  ImageBackground,
  StyleSheet,
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
import LoadingScreen, { SermonSkeletonLoader } from "../../components/Loader";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { styles as globalStyles } from "../../styles/Allsermons";

const AnimatedBackground = React.memo(({ theme }) => (
  <View style={globalStyles.backgroundContainer}>
    <ImageBackground
      source={require("../../assets/gradbg.png")}
      style={globalStyles.backgroundImage}
      blurRadius={4}
      resizeMode="cover"
    >
      <LinearGradient
        colors={[
          theme.dark ? "rgba(28, 25, 23, 0.47)" : "rgba(250, 250, 250, 0.87)",
          theme.dark ? "rgba(28, 25, 23, 0.45)" : "rgba(250, 250, 250, 0.95)",
        ]}
        style={StyleSheet.absoluteFill}
      />
    </ImageBackground>
  </View>
));

const CurrentSermon = React.memo(({ route }) => {
  const {
    selectedSermon,
    settings,
    theme,
    searchText,
    updateLastReadPosition,
  } = useAppContext();
  const router = useNavigation();

  // Get navigation parameters
  const initialParagraph = route?.params?.initialParagraph || 0;
  const searchPhraseFromNav = route?.params?.searchPhrase || "";
  const navigationSource = route?.params?.source; // 'recent', 'search', etc.
  const resumeToParagraph = route?.params?.resumeToParagraph;
  const scrollToParagraphFromBookmark = route?.params?.scrollToParagraph; // From bookmarks

  const [searchPhrase, setSearchPhrase] = useState(
    searchPhraseFromNav || searchText || ""
  );
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

  // Scroll priority management
  const [scrollPriority, setScrollPriority] = useState(null); // 'search', 'lastread', 'bottomsheet'
  const [hasHandledInitialScroll, setHasHandledInitialScroll] = useState(false);

  const scrollViewRef = useRef(null);
  const scrollTimeout = useRef(null);
  const isUserScrolling = useRef(false); // Track if user is actively scrolling
  const userScrollTimer = useRef(null); // Timer to detect when user stops scrolling

  // Load fonts to ensure ZillaSlab is available
  const [fontsLoaded] = useFonts({
    ZillaSlab: require("../../assets/fonts/ZillaSlab-Regular.ttf"),
    ZillaSlabSemiBold: require("../../assets/fonts/ZillaSlab-SemiBold.ttf"),
  });

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

      // Mark that user is actively scrolling
      isUserScrolling.current = true;

      // Clear existing timers
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      if (userScrollTimer.current) {
        clearTimeout(userScrollTimer.current);
      }

      // Reset user scrolling flag after user stops - moderate delay for safety
      userScrollTimer.current = setTimeout(() => {
        isUserScrolling.current = false;
      }, 500); // Reduced from 1000ms to 500ms for better responsiveness

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

  // Scroll to initial paragraph from search navigation (HIGHEST PRIORITY)
  useEffect(() => {
    if (
      initialParagraph > 0 &&
      paragraphLayouts[initialParagraph] &&
      route?.params?.initialParagraph !== undefined &&
      !hasHandledInitialScroll &&
      (navigationSource === "search" || route?.params?.source === "search") // Ensure this is search navigation
    ) {
      setScrollPriority("search");
      setTimeout(() => {
        scrollToParagraph(initialParagraph, true); // Force this scroll - highest priority

        // Show toast message
        const message = `Found in paragraph ${initialParagraph + 1}`;
        if (Platform.OS === "android") {
          ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
          Alert.alert("Search Result", message);
        }

        setHasHandledInitialScroll(true);
        // Clear priority after successful scroll
        setTimeout(() => setScrollPriority(null), 2000);
      }, 1200); // Delay to ensure layouts are ready
    }
  }, [
    initialParagraph,
    paragraphLayouts,
    scrollToParagraph,
    route?.params,
    hasHandledInitialScroll,
    navigationSource,
  ]);

  // Scroll to resume paragraph from recent navigation (HIGH-MEDIUM PRIORITY)
  useEffect(() => {
    if (
      navigationSource === "recent" &&
      resumeToParagraph !== undefined &&
      resumeToParagraph > 0 &&
      paragraphLayouts[resumeToParagraph] &&
      !hasHandledInitialScroll && // Don't interfere with search navigation
      scrollPriority === null // Don't interfere with higher priority operations
    ) {
      setScrollPriority("recent");
      setTimeout(() => {
        scrollToParagraph(resumeToParagraph, true); // Force this scroll - user chose to resume

        // Show toast message
        const message = `Resuming from paragraph ${resumeToParagraph + 1}`;
        if (Platform.OS === "android") {
          ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
          Alert.alert("Resuming", message);
        }

        setHasScrolledToLastPosition(true); // Mark as handled to prevent default scroll
        // Clear priority after successful scroll
        setTimeout(() => setScrollPriority(null), 2000);
      }, 1000); // Delay to ensure layouts are ready
    }
  }, [
    navigationSource,
    resumeToParagraph,
    paragraphLayouts,
    hasHandledInitialScroll,
    scrollPriority,
    scrollToParagraph,
  ]);

  // Scroll to bookmark paragraph (HIGH-MEDIUM PRIORITY)
  useEffect(() => {
    if (
      scrollToParagraphFromBookmark !== undefined &&
      scrollToParagraphFromBookmark >= 0 &&
      paragraphLayouts[scrollToParagraphFromBookmark] &&
      !hasHandledInitialScroll && // Don't interfere with search navigation
      scrollPriority === null && // Don't interfere with higher priority operations
      (navigationSource === "bookmark" || route?.params?.source === "bookmark") // Ensure this is bookmark navigation
    ) {
      setScrollPriority("bookmark");
      setTimeout(() => {
        scrollToParagraph(scrollToParagraphFromBookmark, true); // Force this scroll - user chose bookmark

        // Show toast message
        const message = `Jumped to bookmarked paragraph ${
          scrollToParagraphFromBookmark + 1
        }`;
        if (Platform.OS === "android") {
          ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
          Alert.alert("Bookmark", message);
        }

        setHasScrolledToLastPosition(true); // Mark as handled to prevent default scroll
        // Clear priority after successful scroll
        setTimeout(() => setScrollPriority(null), 2000);
      }, 1000); // Delay to ensure layouts are ready
    }
  }, [
    scrollToParagraphFromBookmark,
    paragraphLayouts,
    hasHandledInitialScroll,
    scrollPriority,
    scrollToParagraph,
    navigationSource,
    route?.params?.source,
  ]);

  // Scroll to last read position when sermon loads (LOWEST PRIORITY)
  useEffect(() => {
    if (
      selectedSermon?.lastReadParagraph !== undefined &&
      paragraphLayouts[selectedSermon.lastReadParagraph] &&
      !hasScrolledToLastPosition &&
      !hasHandledInitialScroll && // Don't interfere with search navigation
      navigationSource !== "recent" && // Don't interfere with recent navigation
      scrollToParagraphFromBookmark === undefined && // Don't interfere with bookmark navigation
      scrollPriority === null && // Don't interfere with other scroll operations
      route?.params?.initialParagraph === undefined && // Don't auto-scroll if coming from search
      !isUserScrolling.current // CRITICAL: Don't interfere with user scrolling
    ) {
      setScrollPriority("lastread");
      setTimeout(() => {
        // Double-check user isn't scrolling before executing
        if (!isUserScrolling.current) {
          scrollToParagraph(selectedSermon.lastReadParagraph, true); // Force this scroll

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
          // Clear priority after successful scroll
          setTimeout(() => setScrollPriority(null), 2000);
        }
      }, 1500); // Increased delay to ensure user has settled
    }
  }, [
    selectedSermon,
    paragraphLayouts,
    hasScrolledToLastPosition,
    hasHandledInitialScroll,
    navigationSource,
    scrollToParagraphFromBookmark,
    scrollPriority,
    scrollToParagraph,
    route?.params,
  ]);

  // Reset scroll state when sermon changes
  useEffect(() => {
    setHasScrolledToLastPosition(false);
    setCurrentVisibleParagraph(0);
    setHasHandledInitialScroll(false);
    setScrollPriority(null);
  }, [selectedSermon?.id]);

  // Update search results when search phrase changes (MEDIUM PRIORITY)
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchPhrase) {
        try {
          setSearching(true);
          const results = searchSermon(paragraphs, searchPhrase);
          setSearchResults(results);
          setSearching(false);
          setCurrentResultIndex(0);

          // Only auto-scroll if not interfering with higher priority operations
          if (
            results.length > 0 &&
            paragraphLayouts[results[0]] &&
            scrollPriority !== "search" && // Don't interfere with external search navigation
            !hasHandledInitialScroll // Don't interfere with initial search scroll
          ) {
            setScrollPriority("bottomsheet");
            scrollToParagraph(results[0]);
            // Clear priority after scroll
            setTimeout(() => setScrollPriority(null), 1500);
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
  }, [
    searchPhrase,
    paragraphs,
    paragraphLayouts,
    scrollToParagraph,
    scrollPriority,
    hasHandledInitialScroll,
  ]);

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
    (index, forcePriority = false) => {
      if (paragraphLayouts[index] && scrollViewRef.current) {
        // CRITICAL: Only block auto-scroll for low-priority operations when user is scrolling
        // Allow forced navigation scrolls (search, bookmark, recent) to proceed
        if (
          !forcePriority &&
          isUserScrolling.current &&
          scrollPriority === "lastread"
        ) {
          console.log(
            "User is actively scrolling, cancelling low-priority auto-scroll"
          );
          return;
        }

        // Check if we should respect priority system (unless forced)
        if (!forcePriority && scrollPriority) {
          // Priority order: search > recent/bookmark > bottomsheet > lastread
          const priorityOrder = [
            "search",
            "recent",
            "bookmark",
            "bottomsheet",
            "lastread",
          ];
          const currentPriorityIndex = priorityOrder.indexOf(scrollPriority);

          // Don't scroll if a higher or equal priority operation is in progress
          // bottomsheet can be overridden by search, recent, or bookmark
          if (
            scrollPriority === "search" ||
            scrollPriority === "recent" ||
            scrollPriority === "bookmark"
          ) {
            return;
          }
        }

        // Calculate position to scroll to, with some padding to see context
        const scrollPosition = Math.max(0, paragraphLayouts[index].y - 100);

        scrollViewRef.current.scrollTo({
          y: scrollPosition,
          animated: true,
        });
      }
    },
    [paragraphLayouts, scrollPriority]
  );

  // Scroll to top of sermon
  const scrollToTop = useCallback(() => {
    // Clear any ongoing priority operations for manual navigation
    setScrollPriority(null);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  // Scroll to bottom of sermon
  const scrollToBottom = useCallback(() => {
    // Clear any ongoing priority operations for manual navigation
    setScrollPriority(null);
    scrollViewRef.current?.scrollTo({ y: contentHeight, animated: true });
  }, [contentHeight]);

  // Navigate to a search result
  const navigateToResult = useCallback(
    (paragraphIndex) => {
      // Only allow navigation if user isn't actively scrolling
      if (isUserScrolling.current) {
        console.log("User is scrolling, deferring navigation");
        return;
      }

      // Clear any low priority operations and set medium priority for manual navigation
      if (scrollPriority === "lastread") {
        setScrollPriority("bottomsheet");
      }

      // Add a small delay to prevent conflicts with user gestures
      setTimeout(() => {
        scrollToParagraph(paragraphIndex, true); // Force this scroll - user-initiated action

        // Show feedback
        setFeedbackMessage(`Navigated to paragraph ${paragraphIndex + 1}`);
        setShowFeedback(true);

        // Hide feedback after delay
        setTimeout(() => {
          setShowFeedback(false);
        }, 2000);
      }, 100); // Small delay to ensure smooth interaction
    },
    [scrollToParagraph, scrollPriority]
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
      if (userScrollTimer.current) {
        clearTimeout(userScrollTimer.current);
      }
    };
  }, []);

  // Render paragraphs with numbering - Optimized with partial virtualization
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

    // Only render visible paragraphs + buffer for performance
    const BUFFER_SIZE = 8;
    const visibleStart = Math.max(0, currentVisibleParagraph - BUFFER_SIZE);
    const visibleEnd = Math.min(
      paragraphs.length,
      currentVisibleParagraph + BUFFER_SIZE + 15
    );

    const elements = [];

    // Add spacer for skipped paragraphs at the start
    if (visibleStart > 0) {
      elements.push(
        <View
          key="spacer-start"
          style={{ height: visibleStart * 80 }} // Approximate paragraph height
        />
      );
    }

    // Render visible paragraphs
    elements.push(
      ...paragraphs
        .slice(visibleStart, visibleEnd)
        .map((paragraph, relativeIndex) => {
          const actualIndex = visibleStart + relativeIndex;
          return (
            <ParagraphText
              key={`paragraph-${actualIndex}`}
              paragraph={paragraph}
              index={actualIndex}
              searchPhrase={searchPhrase}
              theme={theme}
              settings={settings}
              onLayout={(event) => handleParagraphLayout(actualIndex, event)}
              selectedSermon={selectedSermon}
            />
          );
        })
    );

    // Add spacer for skipped paragraphs at the end
    if (visibleEnd < paragraphs.length) {
      elements.push(
        <View
          key="spacer-end"
          style={{ height: (paragraphs.length - visibleEnd) * 80 }}
        />
      );
    }

    return elements;
  }, [
    paragraphs,
    isLoadingParagraphs,
    searchPhrase,
    theme,
    settings,
    handleParagraphLayout,
    selectedSermon,
    currentVisibleParagraph,
  ]);

  return (
    <View style={[globalStyles.container, { flex: 1 }]}>
      <AnimatedBackground theme={theme} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 50}
        enabled={keyboardVisible}
      >
        <DraggableFloatingBackButton />
        <View style={[styles.container, { backgroundColor: "transparent" }]}>
          {selectedSermon?.type === "mp3" ? (
            <DownloadSermon />
          ) : (
            <>
              {/* Show skeleton loader while paragraphs are being processed or fonts are loading */}
              {isLoadingParagraphs || !fontsLoaded ? (
                <SermonSkeletonLoader
                  message={
                    !fontsLoaded ? "Loading fonts..." : "getting the message..."
                  }
                />
              ) : (
                <>
                  <ScrollView
                    ref={scrollViewRef}
                    scrollEventThrottle={16}
                    onScroll={handleScroll}
                    onScrollBeginDrag={() => {
                      // User started scrolling - set flag but be selective about clearing priorities
                      isUserScrolling.current = true;
                      // Only clear low-priority auto-scroll operations
                      if (scrollPriority === "lastread") {
                        setScrollPriority(null);
                      }
                      // Don't interfere with navigation priorities (search, recent, bookmark)
                    }}
                    onMomentumScrollBegin={() => {
                      // Momentum scrolling started - user is still considered active
                      isUserScrolling.current = true;
                    }}
                    onMomentumScrollEnd={() => {
                      // Momentum scrolling ended - shorter delay before allowing auto-scroll
                      setTimeout(() => {
                        isUserScrolling.current = false;
                      }, 300); // Reduced from 500ms to 300ms
                    }}
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
                          {
                            color: theme.dark ? "#854412" : "#5d3211",
                            fontFamily: settings.fontFamily || "ZillaSlab",
                          },
                        ]}
                      >
                        {selectedSermon?.title}
                      </Text>
                      {selectedSermon?.location && (
                        <Text
                          style={[
                            styles.locationText,
                            {
                              color: theme.colors.text,
                              fontFamily: settings.fontFamily || "ZillaSlab",
                            },
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
