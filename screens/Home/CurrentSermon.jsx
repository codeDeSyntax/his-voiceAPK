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
  TouchableOpacity,
} from "react-native";
import { useAppContext } from "../../Logic/globalState";
import { Feather } from "@expo/vector-icons";
import {
  formatSermonIntoParagraphs,
  formatSermonIntoParagraphsAsync,
} from "../../Utils/sermonUtils";
import { responsiveFontSize } from "../../Utils/responsiveUtils";
import ParagraphText from "../../components/currentSermon/ParagraphText";
import CustomBottomSheetController from "../../components/currentSermon/BottomSheetController";
import DraggableFloatingButton from "../../components/FloatButton";
import SearchFeedback from "../../components/currentSermon/SearchFeedback";
import CurrentSermonSearch from "../../components/currentSermon/CurrentSermonSearch";
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
          theme.dark ? "rgba(28, 25, 23, 0.47)" : "#ffffff",
          theme.dark ? "rgba(28, 25, 23, 0.45)" : "#ffffff",
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
    updateLastVisitedScreen,
  } = useAppContext();
  const router = useNavigation();

  // Get navigation parameters
  const initialParagraph = route?.params?.initialParagraph || 0;
  const navigationSource = route?.params?.source; // 'search', etc.
  const scrollToParagraphFromBookmark = route?.params?.scrollToParagraph; // From bookmarks

  const [contentHeight, setContentHeight] = useState(0);
  const [paragraphLayouts, setParagraphLayouts] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [currentVisibleParagraph, setCurrentVisibleParagraph] = useState(0);
  const [hasScrolledToLastPosition, setHasScrolledToLastPosition] =
    useState(false);
  const [showSelectionTip, setShowSelectionTip] = useState(false);
  const [paragraphs, setParagraphs] = useState([]);
  const [isLoadingParagraphs, setIsLoadingParagraphs] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [currentSearchPhrase, setCurrentSearchPhrase] = useState(""); // For highlighting search results

  // Scroll management

  // Scroll priority management
  const [scrollPriority, setScrollPriority] = useState(null); // 'search', 'bookmark', 'lastread', 'bottomsheet'
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

  // Track that user visited CurrentSermon screen
  useEffect(() => {
    updateLastVisitedScreen("CurrentSermon");
  }, [updateLastVisitedScreen]);

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
        // Allow forced navigation scrolls (search, bookmark) to proceed
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
          // Priority order: search > bookmark > bottomsheet > lastread
          const priorityOrder = [
            "search",
            "bookmark",
            "bottomsheet",
            "lastread",
          ];
          const currentPriorityIndex = priorityOrder.indexOf(scrollPriority);

          // Don't scroll if a higher or equal priority operation is in progress
          // bottomsheet can be overridden by search or bookmark
          if (scrollPriority === "search" || scrollPriority === "bookmark") {
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

  // Navigate back to all sermons
  const handleBack = useCallback(() => {
    router?.navigate("AllSermons");
  }, [router]);

  // Handle opening the fullscreen search
  const handleOpenSearch = useCallback(() => {
    setIsSearchVisible(true);
  }, []);

  // Handle closing the fullscreen search
  const handleCloseSearch = useCallback(() => {
    setIsSearchVisible(false);
  }, []);

  // Handle navigating to search result from fullscreen search
  const handleSearchNavigateToResult = useCallback(
    (paragraphIndex, searchPhrase) => {
      scrollToParagraph(paragraphIndex);
      setIsSearchVisible(false);

      // Store the search phrase temporarily for highlighting
      setCurrentSearchPhrase(searchPhrase || "");

      // Clear the search phrase after a delay to remove highlighting
      setTimeout(() => {
        setCurrentSearchPhrase("");
      }, 5000); // Clear after 5 seconds
    },
    [scrollToParagraph]
  );

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
    const BUFFER_SIZE = 400;
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
              theme={theme}
              settings={settings}
              onLayout={(event) => handleParagraphLayout(actualIndex, event)}
              selectedSermon={selectedSermon}
              searchPhrase={currentSearchPhrase}
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
        <DraggableFloatingButton />
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
                      // Don't interfere with navigation priorities (search, bookmark)
                    }}
                    onMomentumScrollBegin={() => {
                      // Momentum scrolling started - user is still considered active
                      isUserScrolling.current = true;
                    }}
                    onMomentumScrollEnd={() => {
                      // Momentum scrolling ended - shorter delay before allowing auto-scroll
                      setTimeout(() => {
                        if (!isUserScrolling.current) return; // Already cleared
                        isUserScrolling.current = false;
                      }, 200); // Reduced from 300ms for better responsiveness
                    }}
                    onScrollEndDrag={() => {
                      // User lifted finger - allow auto-scroll after a brief delay
                      setTimeout(() => {
                        if (!isUserScrolling.current) return; // Already cleared
                        isUserScrolling.current = false;
                      }, 150); // Quick response for direct scrolling
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
                      <View style={{ alignItems: "center", marginBottom: 20 }}>
                        <Text
                          style={[
                            styles.titleText,
                            {
                              color: theme.dark
                                ? theme.colors.hlight + "90"
                                : "#5d3211",
                              fontFamily: "ZillaSlab",
                              fontSize: responsiveFontSize(24),
                              // fontWeight: "900",
                              textAlign: "center",
                              marginBottom: 8,
                              letterSpacing: 1.5,
                              lineHeight: responsiveFontSize(28),
                              textShadowColor: theme.dark
                                ? "#00000080"
                                : "#FFFFFF60",
                              textShadowOffset: { width: 0, height: 2 },
                              textShadowRadius: 4,
                            },
                          ]}
                        >
                          {selectedSermon?.title}
                        </Text>

                        {/* Highly Decorative Underline */}
                        <View style={{ alignItems: "center", width: "90%" }}>
                          {/* Top ornamental border */}
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              width: "100%",
                              marginBottom: 3,
                            }}
                          >
                            {/* Left ornament */}
                            <View
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: theme.dark
                                  ? theme.colors.hlight
                                  : "#5d3211",
                                marginRight: 8,
                              }}
                            />
                            {/* Main decorative line with gradient effect */}
                            <View style={{ flex: 1, alignItems: "center" }}>
                              <View
                                style={{
                                  height: 2,
                                  width: "100%",
                                  backgroundColor: theme.dark
                                    ? theme.colors.hlight + "40"
                                    : "#5d321140",
                                  borderRadius: 1,
                                }}
                              />
                            </View>
                            {/* Right ornament */}
                            <View
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: theme.dark
                                  ? theme.colors.hlight
                                  : "#5d3211",
                                marginLeft: 8,
                              }}
                            />
                          </View>

                          {/* Main thick decorative line with embossed effect */}
                          <View
                            style={{
                              height: 4,
                              width: "85%",
                              backgroundColor: theme.dark
                                ? theme.colors.hlight + "20"
                                : "#5d3211",
                              borderRadius: 3,
                              marginBottom: 3,
                              shadowColor: theme.dark
                                ? theme.colors.hlight + "20"
                                : "#5d3211",
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.6,
                              shadowRadius: 3,
                              elevation: 4,
                              // Embossed effect
                              borderTopWidth: 0.5,
                              borderTopColor: theme.dark
                                ? theme.colors.hlight + "80"
                                : "#5d321180",
                              borderBottomWidth: 0.5,
                              borderBottomColor: theme.dark
                                ? "#00000040"
                                : "#FFFFFF60",
                            }}
                          />

                          {/* Decorative center ornament with surrounding dots */}
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                              marginTop: 2,
                              width: "100%",
                            }}
                          ></View>

                          {/* Bottom ornamental flourish */}
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                              // marginTop: 3,
                              gap: 6,
                            }}
                          >
                            {[1, 2, 3, 4, 5].map((flourish, index) => (
                              <View
                                key={flourish}
                                style={{
                                  width:
                                    index === 2
                                      ? 6
                                      : index === 1 || index === 3
                                      ? 4
                                      : 2,
                                  height:
                                    index === 2
                                      ? 6
                                      : index === 1 || index === 3
                                      ? 4
                                      : 2,
                                  borderRadius:
                                    index === 2
                                      ? 3
                                      : index === 1 || index === 3
                                      ? 2
                                      : 1,
                                  backgroundColor: theme.dark
                                    ? theme.colors.hlight +
                                      (index === 2 ? "" : "80")
                                    : "#5d3211" + (index === 2 ? "" : "80"),
                                }}
                              />
                            ))}
                          </View>
                        </View>
                      </View>

                      <View style={{ width: "100%" }}>{renderSermonText}</View>
                    </View>
                  </ScrollView>

                  <CustomTopCardController
                    theme={theme}
                    selectedSermon={selectedSermon}
                    scrollToTop={scrollToTop}
                    scrollToBottom={scrollToBottom}
                    onBack={handleBack}
                    paragraphs={paragraphs}
                    paragraphLayouts={paragraphLayouts}
                    scrollToParagraph={scrollToParagraph}
                    isCardOpen={isCardOpen}
                    setIsCardOpen={setIsCardOpen}
                  />

                  {/* Search Icon positioned above bottom sheet */}
                  <TouchableOpacity
                    style={[
                      styles.searchIconContainer,
                      {
                        backgroundColor: theme.dark ? "#5d321190" : "#f6d8c1",
                        borderColor: theme.colors.primary + "30",
                      },
                    ]}
                    onPress={handleOpenSearch}
                    activeOpacity={0.8}
                  >
                    <Feather
                      name="search"
                      size={22}
                      color={theme.dark ? "#f8e3d5" : "#5d3211"}
                    />
                  </TouchableOpacity>

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

      {/* Fullscreen Search Modal */}
      <CurrentSermonSearch
        visible={isSearchVisible}
        onClose={handleCloseSearch}
        paragraphs={paragraphs}
        onNavigateToResult={handleSearchNavigateToResult}
        selectedSermon={selectedSermon}
      />
    </View>
  );
});

export default CurrentSermon;
