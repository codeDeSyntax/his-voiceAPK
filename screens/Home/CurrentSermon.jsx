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
  FlatList,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  ToastAndroid,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useAppContext } from "../../Logic/globalState";
import { Feather } from "@expo/vector-icons";
import {
  formatSermonIntoParagraphs,
  formatSermonIntoParagraphsAsync,
} from "../../Utils/paragraphSplitter";
import { getSermonById, getSermonParagraphs } from "../../database/sermonDB";
import { responsiveFontSize } from "../../Utils/responsiveUtils";
import ParagraphText from "../../components/currentSermon/ParagraphText";
import ParagraphToolbar from "../../components/currentSermon/ParagraphToolbar";
import CustomBottomSheetController from "../../components/currentSermon/BottomSheetController";
import DraggableFloatingButton from "../../components/FloatButton";
import SearchFeedback from "../../components/currentSermon/SearchFeedback";
import CurrentSermonSearch from "../../components/currentSermon/CurrentSermonSearch";
import { styles } from "../../styles/currentsermon";
import { useNavigation } from "@react-navigation/native";
import PlaySermon from "../../components/currentSermon/PlaySermon_SIMPLE";
import CustomTopCardController from "../../components/currentSermon/BottomSheetController";
import LoadingScreen, { SermonSkeletonLoader } from "../../components/Loader";
import { useFonts } from "expo-font";
import { styles as globalStyles } from "../../styles/Allsermons";

const CurrentSermon = React.memo(({ route }) => {
  // IMMEDIATE DEBUG LOG
  console.log("=== CurrentSermon Rendered ===");
  console.log("Route params:", JSON.stringify(route?.params, null, 2));

  const {
    selectedSermon,
    setSelectedSermon,
    settings,
    theme,
    searchText,
    updateLastReadPosition,
  } = useAppContext();
  const router = useNavigation();

  // Get navigation parameters
  const initialParagraph = route?.params?.initialParagraph || 0;
  const navigationSource = route?.params?.source; // 'search', etc.
  const sermonIdFromRoute = route?.params?.sermonId; // Sermon ID from search
  const scrollToParagraphFromBookmark = route?.params?.scrollToParagraph; // From bookmarks

  // Fetch sermon if coming from search with only sermonId
  useEffect(() => {
    const fetchSermon = async () => {
      if (sermonIdFromRoute && navigationSource === "search") {
        console.log("Fetching sermon from database:", sermonIdFromRoute);
        try {
          const sermon = await getSermonById(sermonIdFromRoute);
          if (sermon) {
            setSelectedSermon(sermon);
            console.log("Sermon fetched successfully:", sermon.title);
          }
        } catch (error) {
          console.error("Error fetching sermon:", error);
        }
      }
    };

    fetchSermon();
  }, [sermonIdFromRoute, navigationSource]);

  // Log navigation params for debugging
  useEffect(() => {
    if (route?.params) {
      console.log("CurrentSermon navigation params:", {
        source: route.params.source,
        initialParagraph: route.params.initialParagraph,
        searchPhrase: route.params.searchPhrase,
        sermonId: route.params.sermonId,
        hasInitialParagraphParam: route.params.initialParagraph !== undefined,
        navigationSource: route.params.source,
      });
    }
  }, [route?.params]);

  // Reset scroll handling when sermon changes or when search params change
  useEffect(() => {
    // Reset when sermon changes OR when coming from search/bookmark with new paragraph
    const shouldReset =
      selectedSermon?.id ||
      (route?.params?.source === "search" &&
        route?.params?.initialParagraph !== undefined) ||
      (route?.params?.source === "bookmark" &&
        route?.params?.scrollToParagraph !== undefined);

    if (shouldReset) {
      console.log("Resetting scroll state for new navigation", {
        source: route?.params?.source,
        scrollToParagraph: route?.params?.scrollToParagraph,
        initialParagraph: route?.params?.initialParagraph,
      });
      setHasHandledInitialScroll(false);
      setHasScrolledToLastPosition(false); // Also reset last position scroll
      setScrollPriority(null);
    }
  }, [
    selectedSermon?.id,
    route?.params?.source,
    route?.params?.initialParagraph, // Reset when target paragraph changes
    route?.params?.scrollToParagraph, // Reset when bookmark paragraph changes
  ]);

  const [contentHeight, setContentHeight] = useState(0);
  const [paragraphLayouts, setParagraphLayouts] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [currentVisibleParagraph, setCurrentVisibleParagraph] = useState(0);
  const [hasScrolledToLastPosition, setHasScrolledToLastPosition] =
    useState(false);
  const [showSelectionTip, setShowSelectionTip] = useState(false);
  const [paragraphs, setParagraphs] = useState([]);
  const [isLoadingParagraphs, setIsLoadingParagraphs] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [currentSearchPhrase, setCurrentSearchPhrase] = useState(""); // For highlighting search results

  // Paragraph selection for toolbar
  const [selectedParagraphIndex, setSelectedParagraphIndex] = useState(null);
  const [showToolbarColorPalette, setShowToolbarColorPalette] = useState(false);

  // Scroll management

  // Scroll priority management
  const [scrollPriority, setScrollPriority] = useState(null); // 'search', 'bookmark', 'lastread', 'bottomsheet'
  const [hasHandledInitialScroll, setHasHandledInitialScroll] = useState(false);

  const flatListRef = useRef(null);
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

  // Cleanup: Save current position immediately when sermon changes or component unmounts
  useEffect(() => {
    // Store sermon ID in a ref so cleanup can access it
    const currentSermonId = selectedSermon?.id;

    return () => {
      // Clear any pending timers
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      if (userScrollTimer.current) {
        clearTimeout(userScrollTimer.current);
      }

      // Save the current visible paragraph immediately using the ref value
      const lastParagraph = currentVisibleParagraphRef.current;
      if (
        currentSermonId &&
        updateLastReadPosition &&
        lastParagraph !== undefined
      ) {
        console.log(
          `Cleanup: Saving last read position paragraph ${lastParagraph} for sermon ${currentSermonId}`,
        );
        updateLastReadPosition(currentSermonId, lastParagraph);
      }
    };
  }, [selectedSermon?.id, updateLastReadPosition]); // Removed currentVisibleParagraph from dependencies

  // Format sermon into paragraphs asynchronously
  useEffect(() => {
    const loadParagraphs = async () => {
      if (!selectedSermon?.sermon) {
        setParagraphs([]);
        return;
      }

      setIsLoadingParagraphs(true);
      try {
        // Try to get pre-computed paragraphs first (from search index)
        if (selectedSermon?.id) {
          const preComputedParagraphs = await getSermonParagraphs(
            selectedSermon.id,
          );
          if (preComputedParagraphs && preComputedParagraphs.length > 0) {
            console.log(
              `Using ${preComputedParagraphs.length} pre-computed paragraphs`,
            );
            setParagraphs(preComputedParagraphs);
            setIsLoadingParagraphs(false);
            return;
          }
        }

        // Fallback to async formatting if no pre-computed paragraphs
        console.log("Formatting paragraphs at runtime...");
        const formattedParagraphs = await formatSermonIntoParagraphsAsync(
          selectedSermon.sermon,
        );
        setParagraphs(formattedParagraphs);
      } catch (error) {
        console.error("Error loading paragraphs:", error);
        // Fallback to sync formatting
        const formattedParagraphs = formatSermonIntoParagraphs(
          selectedSermon?.sermon || "",
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
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      },
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

      // IMMEDIATELY calculate and update visible paragraph (no debounce)
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

      // Update state immediately for UI responsiveness
      if (visibleParagraph !== currentVisibleParagraphRef.current) {
        setCurrentVisibleParagraph(visibleParagraph);
        currentVisibleParagraphRef.current = visibleParagraph;
      }

      // Clear existing timers
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      if (userScrollTimer.current) {
        clearTimeout(userScrollTimer.current);
      }

      // Reset user scrolling flag after user stops
      userScrollTimer.current = setTimeout(() => {
        isUserScrolling.current = false;
      }, 300);

      // Only SAVE is debounced, not the tracking
      scrollTimeout.current = setTimeout(() => {
        if (selectedSermon && updateLastReadPosition) {
          console.log(
            `Saving last read position: paragraph ${visibleParagraph} for sermon ${selectedSermon.id}`,
          );
          updateLastReadPosition(selectedSermon.id, visibleParagraph);
        }
      }, 300);
    },
    [paragraphLayouts, selectedSermon, updateLastReadPosition],
  );

  // Track visible items more efficiently with FlatList
  const currentVisibleParagraphRef = useRef(currentVisibleParagraph);

  useEffect(() => {
    currentVisibleParagraphRef.current = currentVisibleParagraph;
  }, [currentVisibleParagraph]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      const firstVisibleIndex = viewableItems[0].index;
      if (
        firstVisibleIndex !== null &&
        firstVisibleIndex !== currentVisibleParagraphRef.current
      ) {
        // Update the state IMMEDIATELY for UI responsiveness
        setCurrentVisibleParagraph(firstVisibleIndex);

        // Only debounce the SAVE operation, not the tracking
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }
        scrollTimeout.current = setTimeout(() => {
          if (selectedSermon && updateLastReadPosition) {
            console.log(
              `Saving last read position (FlatList): paragraph ${firstVisibleIndex} for sermon ${selectedSermon.id}`,
            );
            updateLastReadPosition(selectedSermon.id, firstVisibleIndex);
          }
        }, 500); // Debounce only the save, not the state update
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 20, // Item is visible when 20% is in view (very sensitive)
    minimumViewTime: 0, // No delay - detect immediately
    waitForInteraction: false, // Start tracking immediately
  }).current;

  // Scroll to initial paragraph from search navigation (HIGHEST PRIORITY)
  useEffect(() => {
    // Only run when paragraphs are loaded AND we have a valid search navigation
    const hasSearchParams =
      route?.params?.initialParagraph !== undefined &&
      route?.params?.source === "search";

    if (paragraphs.length > 0 && hasSearchParams && !hasHandledInitialScroll) {
      const targetParagraph = route.params.initialParagraph;
      console.log(
        `Scrolling to paragraph ${targetParagraph} from search navigation (total paragraphs: ${paragraphs.length})`,
      );

      setScrollPriority("search");

      // Different scroll strategies for ScrollView vs FlatList
      setTimeout(() => {
        if (
          flatListRef.current &&
          targetParagraph >= 0 &&
          targetParagraph < paragraphs.length
        ) {
          console.log(`Attempting to scroll to paragraph ${targetParagraph}`);

          try {
            flatListRef.current.scrollToIndex({
              index: targetParagraph,
              animated: true,
              viewPosition: 0.1,
            });

            const message = `Found in paragraph ${targetParagraph + 1}`;
            if (Platform.OS === "android") {
              ToastAndroid.show(message, ToastAndroid.SHORT);
            } else {
              Alert.alert("Search Result", message);
            }
          } catch (error) {
            console.log(
              "scrollToIndex failed, will retry in onScrollToIndexFailed",
            );
          }
        } else {
          console.log(
            `Cannot scroll: flatListRef=${!!flatListRef.current}, targetParagraph=${targetParagraph}, paragraphs.length=${paragraphs.length}`,
          );
        }

        setHasHandledInitialScroll(true);
        setTimeout(() => setScrollPriority(null), 2000);
      }, 800);
    }
  }, [
    paragraphs.length,
    hasHandledInitialScroll,
    route?.params?.initialParagraph,
    route?.params?.source,
  ]);

  // Initialize search phrase from route params
  useEffect(() => {
    const searchPhraseFromRoute = route?.params?.searchPhrase;
    const sourceFromRoute = route?.params?.source;

    console.log("Search phrase useEffect:", {
      searchPhraseFromRoute,
      sourceFromRoute,
      hasSearchPhrase: !!searchPhraseFromRoute,
      isSearchSource: sourceFromRoute === "search",
    });

    if (searchPhraseFromRoute && sourceFromRoute === "search") {
      console.log(
        `✓ Setting search phrase for highlighting: "${searchPhraseFromRoute}"`,
      );
      setCurrentSearchPhrase(searchPhraseFromRoute);
    } else {
      console.log("✗ Not setting search phrase:", {
        reason: !searchPhraseFromRoute ? "no searchPhrase" : "not from search",
      });
    }
  }, [route?.params?.searchPhrase, route?.params?.source]);

  // Scroll to bookmark paragraph (HIGH-MEDIUM PRIORITY)
  useEffect(() => {
    const hasBookmarkParams =
      scrollToParagraphFromBookmark !== undefined &&
      scrollToParagraphFromBookmark >= 0 &&
      route?.params?.source === "bookmark";

    console.log("Bookmark scroll check:", {
      hasBookmarkParams,
      scrollToParagraphFromBookmark,
      paragraphsLength: paragraphs.length,
      hasHandledInitialScroll,
      scrollPriority,
      source: route?.params?.source,
    });

    if (
      hasBookmarkParams &&
      paragraphs.length > 0 &&
      !hasHandledInitialScroll
    ) {
      console.log(
        `✓ Scrolling to bookmarked paragraph ${scrollToParagraphFromBookmark}`,
      );
      setScrollPriority("bookmark");

      setTimeout(() => {
        if (
          flatListRef.current &&
          scrollToParagraphFromBookmark >= 0 &&
          scrollToParagraphFromBookmark < paragraphs.length
        ) {
          console.log(
            `Executing bookmark scroll to paragraph ${scrollToParagraphFromBookmark}`,
          );

          try {
            flatListRef.current.scrollToIndex({
              index: scrollToParagraphFromBookmark,
              animated: true,
              viewPosition: 0.1,
            });

            // Show toast message
            const message = `Jumped to bookmarked paragraph ${
              scrollToParagraphFromBookmark + 1
            }`;
            if (Platform.OS === "android") {
              ToastAndroid.show(message, ToastAndroid.SHORT);
            } else {
              Alert.alert("Bookmark", message);
            }
          } catch (error) {
            console.log(
              "scrollToIndex failed for bookmark, will retry in onScrollToIndexFailed",
            );
          }

          setHasHandledInitialScroll(true);
          setHasScrolledToLastPosition(true);
          setTimeout(() => setScrollPriority(null), 2000);
        }
      }, 800);
    }
  }, [
    scrollToParagraphFromBookmark,
    paragraphs.length,
    hasHandledInitialScroll,
    route?.params?.source,
  ]);

  // Scroll to last read position when sermon loads (LOWEST PRIORITY)
  useEffect(() => {
    const lastReadParagraph = selectedSermon?.lastReadParagraph;
    const hasValidLastReadPosition =
      lastReadParagraph !== undefined && lastReadParagraph > 0; // Only if user has read past first paragraph

    console.log("Last read position check:", {
      lastReadParagraph,
      hasValidLastReadPosition,
      paragraphsLength: paragraphs.length,
      hasScrolledToLastPosition,
      hasHandledInitialScroll,
      scrollPriority,
      hasSearchParams: route?.params?.initialParagraph !== undefined,
      isUserScrolling: isUserScrolling.current,
    });

    if (
      hasValidLastReadPosition &&
      paragraphs.length > 0 &&
      !hasScrolledToLastPosition &&
      !hasHandledInitialScroll && // Don't interfere with search navigation
      scrollToParagraphFromBookmark === undefined && // Don't interfere with bookmark navigation
      scrollPriority === null && // Don't interfere with other scroll operations
      route?.params?.initialParagraph === undefined && // Don't auto-scroll if coming from search
      !isUserScrolling.current // CRITICAL: Don't interfere with user scrolling
    ) {
      console.log(
        `✓ Scrolling to last read position: paragraph ${lastReadParagraph}`,
      );
      setScrollPriority("lastread");

      setTimeout(() => {
        // Double-check user isn't scrolling before executing
        if (!isUserScrolling.current && flatListRef.current) {
          console.log(`Executing scroll to paragraph ${lastReadParagraph}`);

          try {
            flatListRef.current.scrollToIndex({
              index: lastReadParagraph,
              animated: true,
              viewPosition: 0.1,
            });

            // Show toast message only if we're past the first few paragraphs
            if (lastReadParagraph > 2) {
              const message = `You reached paragraph ${lastReadParagraph + 1} the last time`;
              if (Platform.OS === "android") {
                ToastAndroid.show(message, ToastAndroid.LONG);
              } else {
                Alert.alert("Last Position", message);
              }
            }
          } catch (error) {
            console.log(
              "scrollToIndex failed for last read position, will retry in onScrollToIndexFailed",
            );
          }

          setHasScrolledToLastPosition(true);
          // Clear priority after successful scroll
          setTimeout(() => setScrollPriority(null), 2000);
        }
      }, 1000); // Delay to ensure paragraphs are rendered
    }
  }, [
    selectedSermon,
    paragraphs.length,
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

  // Scroll to specific paragraph by index using FlatList
  const scrollToParagraph = useCallback(
    (index, forcePriority = false) => {
      if (flatListRef.current && index >= 0 && index < paragraphs.length) {
        // CRITICAL: Only block auto-scroll for low-priority operations when user is scrolling
        // Allow forced navigation scrolls (search, bookmark) to proceed
        if (
          !forcePriority &&
          isUserScrolling.current &&
          scrollPriority === "lastread"
        ) {
          console.log(
            "User is actively scrolling, cancelling low-priority auto-scroll",
          );
          return;
        }

        // Check if we should respect priority system (unless forced)
        if (!forcePriority && scrollPriority) {
          // Priority order: search > bookmark > bottomsheet > lastread
          if (scrollPriority === "search" || scrollPriority === "bookmark") {
            return;
          }
        }

        flatListRef.current.scrollToIndex({
          index: index,
          animated: true,
          viewPosition: 0.1, // Position item 10% from top for better visibility
        });
      }
    },
    [paragraphs.length, scrollPriority],
  );

  // Scroll to top of sermon
  const scrollToTop = useCallback(() => {
    // Clear any ongoing priority operations for manual navigation
    setScrollPriority(null);
    if (flatListRef.current && paragraphs.length > 0) {
      flatListRef.current.scrollToIndex({ index: 0, animated: true });
    }
  }, [paragraphs.length]);

  // Scroll to bottom of sermon
  const scrollToBottom = useCallback(() => {
    // Clear any ongoing priority operations for manual navigation
    setScrollPriority(null);
    if (flatListRef.current && paragraphs.length > 0) {
      flatListRef.current.scrollToIndex({
        index: paragraphs.length - 1,
        animated: true,
      });
    }
  }, [paragraphs.length]);

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
    [scrollToParagraph],
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

  // Paragraph selection handlers
  const handleParagraphClick = useCallback((index) => {
    setSelectedParagraphIndex((prev) => (prev === index ? null : index));
    setShowToolbarColorPalette(false);
  }, []);

  const handleToolbarClose = useCallback(() => {
    setSelectedParagraphIndex(null);
    setShowToolbarColorPalette(false);
  }, []);

  // Get toolbar props from context
  const {
    addBookmark,
    removeBookmark,
    bookmarks,
    addHighlight,
    removeHighlight,
    highlights,
  } = useAppContext();

  const isToolbarBookmarked = useMemo(() => {
    if (selectedParagraphIndex === null) return false;
    const bookmarkKey = `${selectedSermon?.id}-${selectedParagraphIndex}`;
    return bookmarks.some(
      (b) => `${b.sermon.id}-${b.paragraphIndex}` === bookmarkKey,
    );
  }, [bookmarks, selectedSermon?.id, selectedParagraphIndex]);

  const toolbarHighlight = useMemo(() => {
    if (selectedParagraphIndex === null) return null;
    return (
      highlights[`${selectedSermon?.id}-${selectedParagraphIndex}`] || null
    );
  }, [highlights, selectedSermon?.id, selectedParagraphIndex]);

  const handleToolbarBookmark = useCallback(() => {
    if (selectedParagraphIndex === null) return;
    if (isToolbarBookmarked) {
      removeBookmark(selectedSermon, selectedParagraphIndex);
    } else {
      addBookmark(
        selectedSermon,
        selectedParagraphIndex,
        paragraphs[selectedParagraphIndex],
      );
    }
  }, [
    selectedParagraphIndex,
    isToolbarBookmarked,
    removeBookmark,
    addBookmark,
    selectedSermon,
    paragraphs,
  ]);

  const handleToolbarHighlightPress = useCallback(() => {
    setShowToolbarColorPalette((prev) => !prev);
  }, []);

  const handleToolbarColorSelect = useCallback(
    (color) => {
      if (selectedParagraphIndex === null) return;
      setShowToolbarColorPalette(false);
      if (color) {
        addHighlight(selectedSermon.id, selectedParagraphIndex, color);
      } else {
        removeHighlight(selectedSermon.id, selectedParagraphIndex);
      }
    },
    [selectedParagraphIndex, addHighlight, removeHighlight, selectedSermon?.id],
  );

  // Render individual paragraph - FlatList handles virtualization
  const renderParagraphItem = useCallback(
    ({ item, index }) => {
      // Debug log for search phrase (only log first paragraph to avoid spam)
      if (index === 0 && currentSearchPhrase) {
        console.log(
          `Rendering paragraphs with searchPhrase: "${currentSearchPhrase}"`,
        );
      }

      return (
        <ParagraphText
          paragraph={item}
          index={index}
          theme={theme}
          settings={settings}
          onLayout={(event) => handleParagraphLayout(index, event)}
          selectedSermon={selectedSermon}
          searchPhrase={currentSearchPhrase}
          isSelected={selectedParagraphIndex === index}
          onParagraphClick={handleParagraphClick}
        />
      );
    },
    [
      theme,
      settings,
      handleParagraphLayout,
      selectedSermon,
      currentSearchPhrase,
      selectedParagraphIndex,
      handleParagraphClick,
    ],
  );

  // Optimization: Extract item key
  const keyExtractor = useCallback((item, index) => `paragraph-${index}`, []);

  // ListHeaderComponent - Decorative title section
  const ListHeader = useMemo(
    () => (
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Text
          style={[
            styles.titleText,
            {
              color: theme.dark ? theme.colors.hlight + "90" : "#5d3211",
              fontFamily: settings.fontFamily || "System",
              fontSize: responsiveFontSize(settings.fontSize * 1.5),
              textAlign: "center",
              marginBottom: 8,
              letterSpacing: 1.5,
              lineHeight: responsiveFontSize(settings.fontSize * 1.75),
              textShadowColor: theme.dark ? "#00000080" : "#FFFFFF60",
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
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.dark ? theme.colors.hlight : "#5d3211",
                marginRight: 8,
              }}
            />
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
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.dark ? theme.colors.hlight : "#5d3211",
                marginLeft: 8,
              }}
            />
          </View>

          {/* Main thick decorative line */}
          <View
            style={{
              height: 4,
              width: "85%",
              backgroundColor: theme.dark
                ? theme.colors.hlight + "20"
                : "#5d3211",
              borderRadius: 3,
              marginBottom: 3,
              shadowColor: theme.dark ? theme.colors.hlight + "20" : "#5d3211",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.6,
              shadowRadius: 3,
              elevation: 4,
              borderTopWidth: 0.5,
              borderTopColor: theme.dark
                ? theme.colors.hlight + "80"
                : "#5d321180",
              borderBottomWidth: 0.5,
              borderBottomColor: theme.dark ? "#00000040" : "#FFFFFF60",
            }}
          />

          {/* Bottom ornamental flourish */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {[1, 2, 3, 4, 5].map((flourish, index) => (
              <View
                key={flourish}
                style={{
                  width: index === 2 ? 6 : index === 1 || index === 3 ? 4 : 2,
                  height: index === 2 ? 6 : index === 1 || index === 3 ? 4 : 2,
                  borderRadius:
                    index === 2 ? 3 : index === 1 || index === 3 ? 2 : 1,
                  backgroundColor: theme.dark
                    ? theme.colors.hlight + (index === 2 ? "" : "80")
                    : "#5d3211" + (index === 2 ? "" : "80"),
                }}
              />
            ))}
          </View>
        </View>
      </View>
    ),
    [selectedSermon?.title, theme, responsiveFontSize],
  );

  return (
    <View
      style={[
        globalStyles.container,
        { flex: 1, backgroundColor: theme.colors.background },
      ]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 50}
        enabled={keyboardVisible}
      >
        <DraggableFloatingButton />

        {/* Paragraph Toolbar */}
        <ParagraphToolbar
          visible={selectedParagraphIndex !== null}
          selectedParagraphIndex={selectedParagraphIndex}
          isBookmarked={isToolbarBookmarked}
          currentHighlight={toolbarHighlight}
          onBookmarkPress={handleToolbarBookmark}
          onHighlightPress={handleToolbarHighlightPress}
          onColorSelect={handleToolbarColorSelect}
          showColorPalette={showToolbarColorPalette}
          onClose={handleToolbarClose}
          theme={theme}
        />

        <View style={[styles.container, { backgroundColor: "transparent" }]}>
          {selectedSermon?.type === "mp3" ? (
            <PlaySermon />
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
                  <FlatList
                    ref={flatListRef}
                    data={paragraphs}
                    renderItem={renderParagraphItem}
                    keyExtractor={keyExtractor}
                    ListHeaderComponent={ListHeader}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    initialNumToRender={Math.max(50, initialParagraph + 10)}
                    maxToRenderPerBatch={20}
                    windowSize={21}
                    removeClippedSubviews={true}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    onScrollBeginDrag={() => {
                      isUserScrolling.current = true;
                      if (scrollPriority === "lastread") {
                        setScrollPriority(null);
                      }
                    }}
                    onScrollEndDrag={() => {
                      setTimeout(() => {
                        if (!isUserScrolling.current) return;
                        isUserScrolling.current = false;
                      }, 150);
                    }}
                    onScrollToIndexFailed={(info) => {
                      console.log(
                        `scrollToIndexFailed: index=${info.index}, highestMeasuredFrameIndex=${info.highestMeasuredFrameIndex}`,
                      );

                      setTimeout(() => {
                        if (flatListRef.current) {
                          try {
                            flatListRef.current.scrollToIndex({
                              index: info.index,
                              animated: false,
                              viewPosition: 0.1,
                            });
                          } catch (e) {
                            console.log(
                              `Single retry failed, giving up on scrollToIndex`,
                            );
                          }
                        }
                      }, 500);
                    }}
                    contentContainerStyle={[
                      styles.scrollViewContainer,
                      { flexGrow: 1 },
                    ]}
                  />

                  <CustomTopCardController
                    theme={theme}
                    scrollToTop={scrollToTop}
                    scrollToBottom={scrollToBottom}
                    onOpenSearch={handleOpenSearch}
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
