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
import EndnoteResults from "../../components/currentSermon/EndnoteResults";
import { searchEndnoteQuote } from "../../Logic/branhamApi";
import { styles } from "../../styles/currentsermon";
import { useNavigation } from "@react-navigation/native";
import PlaySermon from "../../components/currentSermon/PlaySermon_SIMPLE";
import CustomTopCardController from "../../components/currentSermon/BottomSheetController";
import LoadingScreen, { SermonSkeletonLoader } from "../../components/Loader";
import { styles as globalStyles } from "../../styles/Allsermons";

const CurrentSermon = React.memo(({ route }) => {
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
      if (!sermonIdFromRoute || navigationSource !== "search") return;
      // Skip if the correct sermon is already selected — avoids a redundant
      // DB round-trip when the user taps the same sermon from search twice or
      // when a re-render causes this effect to re-fire.
      if (selectedSermonRef.current?.id === sermonIdFromRoute) return;
      try {
        const sermon = await getSermonById(sermonIdFromRoute);
        if (sermon) {
          setSelectedSermon(sermon);
        }
      } catch (error) {
        console.error("Error fetching sermon:", error);
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

  // Reset positioning state whenever the sermon or navigation target changes
  // so the unified positioning effect fires fresh for the new target.
  useEffect(() => {
    setIsPositioningComplete(false);
    setScrollPriority(null);
  }, [
    selectedSermon?.id,
    route?.params?.source,
    route?.params?.initialParagraph,
    route?.params?.scrollToParagraph,
  ]);

  // paragraphLayouts is only read inside scroll handlers — storing it as a ref
  // avoids the 200 re-renders that would occur if it were useState and every
  // paragraph fired onLayout on initial render.
  const paragraphLayoutsRef = useRef({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [currentVisibleParagraph, setCurrentVisibleParagraph] = useState(0);
  const [paragraphs, setParagraphs] = useState([]);
  const [isLoadingParagraphs, setIsLoadingParagraphs] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [currentSearchPhrase, setCurrentSearchPhrase] = useState("");
  const [searchNavKey, setSearchNavKey] = useState(0);
  const [pendingScrollTarget, setPendingScrollTarget] = useState(null);

  // Paragraph selection for toolbar
  const [selectedParagraphIndex, setSelectedParagraphIndex] = useState(null);
  const [showToolbarColorPalette, setShowToolbarColorPalette] = useState(false);

  // Endnote search modal
  const [showEndnoteModal, setShowEndnoteModal] = useState(false);
  const [endnoteData, setEndnoteData] = useState(null);
  const [endnoteSearchResults, setEndnoteSearchResults] = useState(null);
  const [isEndnoteLoading, setIsEndnoteLoading] = useState(false);

  // True once the FlatList has been scrolled to its initial target position.
  // The skeleton overlay is shown until this is true, so users never see the
  // list jump/animate to the target paragraph.
  const [isPositioningComplete, setIsPositioningComplete] = useState(false);

  const [scrollPriority, setScrollPriority] = useState(null);

  const flatListRef = useRef(null);
  const scrollTimeout = useRef(null);
  const isUserScrolling = useRef(false); // Track if user is actively scrolling
  const userScrollTimer = useRef(null); // Timer to detect when user stops scrolling

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

      // Use refs to avoid updateLastReadPosition in the deps array —
      // putting it there would cause a cleanup→setState→recreate loop.
      const lastParagraph = currentVisibleParagraphRef.current;
      const updater = updateLastReadPositionRef.current;
      if (currentSermonId && updater && lastParagraph !== undefined) {
        updater(currentSermonId, lastParagraph);
      }
    };
  }, [selectedSermon?.id]); // updateLastReadPosition accessed via ref, not deps

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

  // Track visible items via FlatList's native onViewableItemsChanged.
  // This is more efficient than an onScroll handler firing at 60fps.
  const currentVisibleParagraphRef = useRef(currentVisibleParagraph);

  // Keep refs current so the stable onViewableItemsChanged callback can read
  // them without a stale closure.
  const selectedSermonRef = useRef(selectedSermon);
  const updateLastReadPositionRef = useRef(updateLastReadPosition);
  useEffect(() => {
    selectedSermonRef.current = selectedSermon;
  }, [selectedSermon]);
  useEffect(() => {
    updateLastReadPositionRef.current = updateLastReadPosition;
  }, [updateLastReadPosition]);

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
        setCurrentVisibleParagraph(firstVisibleIndex);
        currentVisibleParagraphRef.current = firstVisibleIndex;

        // Debounce the AsyncStorage save — read current values from refs
        // to avoid stale closures (this callback is created only once).
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }
        scrollTimeout.current = setTimeout(() => {
          const sermon = selectedSermonRef.current;
          const updater = updateLastReadPositionRef.current;
          if (sermon && updater) {
            updater(sermon.id, firstVisibleIndex);
          }
        }, 500);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 20, // Item is visible when 20% is in view (very sensitive)
    minimumViewTime: 0, // No delay - detect immediately
    waitForInteraction: false, // Start tracking immediately
  }).current;

  // Initialize search-result highlight phrase from route params.
  useEffect(() => {
    if (route?.params?.searchPhrase && route?.params?.source === "search") {
      setCurrentSearchPhrase(route.params.searchPhrase);
    } else if (!route?.params?.searchPhrase) {
      setCurrentSearchPhrase("");
    }
  }, [route?.params?.searchPhrase, route?.params?.source]);

  // Unified initial-positioning effect.
  //
  // Runs once per "positioning cycle" (isPositioningComplete resets on sermon
  // or nav-param changes). Determines the target paragraph from route params
  // (search > bookmark > last-read > 0), scrolls the hidden FlatList there
  // instantly with animated:false, then reveals it. Users never see the list
  // animate or jump — they see skeleton → correct paragraph.
  useEffect(() => {
    if (paragraphs.length === 0 || isPositioningComplete) return;

    // For search: wait until the correct sermon is actually in state.
    if (route?.params?.source === "search" && sermonIdFromRoute) {
      if (selectedSermon?.id !== sermonIdFromRoute) return;
    }

    // Determine target index in priority order.
    let targetIndex = 0;
    let toastMessage = null;

    if (
      route?.params?.source === "search" &&
      route?.params?.initialParagraph !== undefined
    ) {
      targetIndex = route.params.initialParagraph;
      toastMessage = `Found in paragraph ${targetIndex + 1}`;
    } else if (
      route?.params?.source === "bookmark" &&
      scrollToParagraphFromBookmark !== undefined &&
      scrollToParagraphFromBookmark >= 0
    ) {
      targetIndex = scrollToParagraphFromBookmark;
      toastMessage = `Jumped to paragraph ${targetIndex + 1}`;
    } else if (selectedSermon?.lastReadParagraph > 2) {
      targetIndex = selectedSermon.lastReadParagraph;
      toastMessage = `You reached paragraph ${targetIndex + 1} the last time`;
    }

    // Clamp to valid range.
    targetIndex = Math.max(0, Math.min(targetIndex, paragraphs.length - 1));

    // Reveal FlatList and optionally show toast.
    const reveal = () => {
      setIsPositioningComplete(true);
      setScrollPriority(null);
      if (toastMessage && targetIndex > 0 && Platform.OS === "android") {
        ToastAndroid.show(toastMessage, ToastAndroid.SHORT);
      }
    };

    if (targetIndex === 0 || !flatListRef.current) {
      reveal();
      return;
    }

    if (targetIndex < 20) {
      // Within the initial render window — direct instant scroll.
      flatListRef.current.scrollToIndex({
        index: targetIndex,
        animated: false,
        viewPosition: 0.1,
      });
      reveal();
    } else {
      // Beyond the initial render window. Step 1: jump via offset to bring
      // items near the target into the render window (uses ~120px estimate).
      flatListRef.current.scrollToOffset({
        offset: 120 * targetIndex,
        animated: false,
      });
      // Step 2: precise scroll once items are rendered (~200 ms is enough).
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: targetIndex,
          animated: false,
          viewPosition: 0.1,
        });
        reveal();
      }, 200);
    }
  }, [
    paragraphs.length,
    isPositioningComplete,
    selectedSermon?.id,
    selectedSermon?.lastReadParagraph,
    sermonIdFromRoute,
    scrollToParagraphFromBookmark,
    route?.params?.source,
    route?.params?.initialParagraph,
  ]);

  // Reset visible-paragraph counter when sermon changes.
  useEffect(() => {
    setCurrentVisibleParagraph(0);
  }, [selectedSermon?.id]);

  // Reset layout cache when sermon changes
  useEffect(() => {
    paragraphLayoutsRef.current = {};
  }, [selectedSermon?.sermon]);

  // Scroll to a specific paragraph index with animation (user-initiated).
  const scrollToParagraph = useCallback(
    (index) => {
      if (flatListRef.current && index >= 0 && index < paragraphs.length) {
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.1,
        });
      }
    },
    [paragraphs.length],
  );

  // Scroll to previous paragraph stop
  const scrollToPrevParagraph = useCallback(() => {
    setScrollPriority(null);
    const target = Math.max(0, currentVisibleParagraph - 1);
    scrollToParagraph(target, true);
  }, [currentVisibleParagraph, scrollToParagraph]);

  // Scroll to next paragraph stop
  const scrollToNextParagraph = useCallback(() => {
    setScrollPriority(null);
    const target = Math.min(paragraphs.length - 1, currentVisibleParagraph + 1);
    scrollToParagraph(target, true);
  }, [currentVisibleParagraph, paragraphs.length, scrollToParagraph]);

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

  // Handle navigating to search result from fullscreen search.
  // State updates (phrase + navKey) are committed first; the actual scroll
  // is deferred to a useEffect so FlatList cells render with the updated
  // searchPhrase before they scroll into view.
  const handleSearchNavigateToResult = useCallback((paragraphIndex, phrase) => {
    setIsSearchVisible(false);
    setCurrentSearchPhrase(phrase || "");
    setSearchNavKey((k) => k + 1);
    setPendingScrollTarget(paragraphIndex);
  }, []);

  // Fire scroll AFTER the new phrase and extraData have been committed.
  useEffect(() => {
    if (pendingScrollTarget !== null) {
      scrollToParagraph(pendingScrollTarget);
      setPendingScrollTarget(null);
    }
  }, [pendingScrollTarget, scrollToParagraph]);

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

  // Handle endnote click — fetch search results from API with fallback
  const handleEndnoteClick = useCallback(
    async (parsedEndnote, paragraphIndex, sermon) => {
      console.log("[Endnote Click] Parsed endnote:", parsedEndnote);

      setShowEndnoteModal(true);
      setEndnoteData(parsedEndnote);
      setIsEndnoteLoading(true);
      setEndnoteSearchResults(null);

      try {
        // Search with automatic fallback: quote → paragraph reference
        const results = await searchEndnoteQuote(parsedEndnote);
        console.log("[Endnote Click] API results:", results);
        console.log(
          "[Endnote Click] Search method used:",
          results.searchMethod,
        );

        if (results.searchMethod === "paragraph_reference") {
          // Show user that we used fallback method
          if (Platform.OS === "android") {
            ToastAndroid.show("Found by sermon reference", ToastAndroid.SHORT);
          }
        }

        setEndnoteSearchResults(results);
      } catch (error) {
        console.error("[Endnote Click] Error searching for endnote:", error);
        if (Platform.OS === "android") {
          ToastAndroid.show("Error searching endnote", ToastAndroid.SHORT);
        }
      } finally {
        setIsEndnoteLoading(false);
      }
    },
    [],
  );

  // Retry endnote search with different search type
  const handleRetryEndnoteSearch = useCallback(
    async (searchType) => {
      if (!endnoteData) return;

      console.log("[Endnote Retry] Searching with type:", searchType);
      setIsEndnoteLoading(true);

      try {
        const results = await searchEndnoteQuote(endnoteData, { searchType });
        console.log("[Endnote Retry] Results:", results);
        setEndnoteSearchResults(results);
      } catch (error) {
        console.error("[Endnote Retry] Error:", error);
        if (Platform.OS === "android") {
          ToastAndroid.show("Error searching endnote", ToastAndroid.SHORT);
        }
      } finally {
        setIsEndnoteLoading(false);
      }
    },
    [endnoteData],
  );

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

  // Stable drag/fail handlers — defined with useCallback so FlatList never
  // receives new function references on unrelated re-renders.
  const handleScrollBeginDrag = useCallback(() => {
    isUserScrolling.current = true;
    if (scrollPriority === "lastread") {
      setScrollPriority(null);
    }
  }, [scrollPriority]);

  const handleScrollEndDrag = useCallback(() => {
    setTimeout(() => {
      isUserScrolling.current = false;
    }, 150);
  }, []);

  const handleScrollToIndexFailed = useCallback((info) => {
    // Safety net for user-initiated prev/next scrolls that land beyond the
    // render window. The initial-positioning path never reaches here (it uses
    // proactive scrollToOffset + scrollToIndex with animated:false while the
    // skeleton is visible). Here animated:true is fine — the user triggered it.
    if (flatListRef.current) {
      const approxOffset = (info.averageItemLength ?? 120) * info.index;
      flatListRef.current.scrollToOffset({
        offset: approxOffset,
        animated: false,
      });
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: info.index,
          animated: true,
          viewPosition: 0.1,
        });
      }, 200);
    }
  }, []);

  // Render individual paragraph — FlatList handles virtualization.
  // handleParagraphLayout removed: paragraphLayouts was only consumed by
  // handleScroll (now removed). onLayout on each paragraph is no longer needed.
  const renderParagraphItem = useCallback(
    ({ item, index }) => {
      return (
        <ParagraphText
          paragraph={item}
          index={index}
          theme={theme}
          settings={settings}
          selectedSermon={selectedSermon}
          searchPhrase={currentSearchPhrase}
          isSelected={selectedParagraphIndex === index}
          onParagraphClick={handleParagraphClick}
          onEndnoteClick={handleEndnoteClick}
        />
      );
    },
    [
      theme,
      settings,
      selectedSermon,
      currentSearchPhrase,
      selectedParagraphIndex,
      handleParagraphClick,
      handleEndnoteClick,
    ],
  );

  // Optimization: Extract item key
  const keyExtractor = useCallback((item, index) => `paragraph-${index}`, []);

  // ─── Book-style chapter header ────────────────────────────────────────────
  const ListHeader = useMemo(() => {
    const accent = theme.dark ? "#ffb780" : "#5d3211";
    const accentM = theme.dark ? theme.colors.hlight + "70" : "#5d321170";
    const titleSize = responsiveFontSize(22);

    return (
      <View style={styles.chapterHeader}>
        {/* ── Sermon title ── */}
        <Text
          style={[
            styles.chapterTitle,
            {
              color: accent,
              fontFamily: "ZillaSlabsm",
              fontSize: titleSize,
              lineHeight: titleSize * 1.3,
            },
          ]}
        >
          {selectedSermon?.title}
        </Text>
        {/* ── Top ornament: thin line ◆ thin line ── */}
        <View style={styles.chapterOrnamentTop}>
          <View
            style={[styles.chapterOrnamentLine, { backgroundColor: accentM }]}
          />
          <View
            style={[styles.chapterOrnamentDiamond, { backgroundColor: accent }]}
          />
          <View
            style={[styles.chapterOrnamentLine, { backgroundColor: accentM }]}
          />
        </View>

        {/* ── Date ── */}
        {selectedSermon?.date ? (
          <Text
            style={[
              styles.chapterMeta,
              {
                color: theme.colors.text,
                fontFamily: settings.fontFamily || "ZillaSlab",
                fontSize: responsiveFontSize(settings.fontSize * 0.72),
                opacity: 0.65,
              },
            ]}
          >
            {selectedSermon.date}
          </Text>
        ) : null}

        {/* ── Location ── */}
        {selectedSermon?.location ? (
          <Text
            style={[
              styles.chapterMetaLocation,
              {
                color: theme.colors.text,
                fontFamily: settings.fontFamily || "ZillaSlab",
                fontSize: responsiveFontSize(settings.fontSize * 0.68),
                opacity: 0.5,
                marginBottom: 0,
              },
            ]}
          >
            {selectedSermon.location}
          </Text>
        ) : null}
      </View>
    );
  }, [
    selectedSermon?.title,
    selectedSermon?.date,
    selectedSermon?.location,
    theme,
    settings.fontSize,
    settings.fontFamily,
  ]);

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
              {/* ── Book page container ── */}
              <View style={[styles.bookPageWrapper, { flex: 1 }]}>
                {/*
                  FlatList is always mounted so the positioning effect can call
                  scrollToIndex on it while it is hidden. The skeleton overlays
                  it until isPositioningComplete is true, so the user never
                  sees the list at index 0 or watches it animate to the target.
                */}
                <FlatList
                  ref={flatListRef}
                  data={paragraphs}
                  renderItem={renderParagraphItem}
                  keyExtractor={keyExtractor}
                  extraData={`${currentSearchPhrase}-${searchNavKey}`}
                  ListHeaderComponent={ListHeader}
                  onViewableItemsChanged={onViewableItemsChanged}
                  viewabilityConfig={viewabilityConfig}
                  initialNumToRender={25}
                  maxToRenderPerBatch={25}
                  windowSize={21}
                  removeClippedSubviews={true}
                  onScrollBeginDrag={handleScrollBeginDrag}
                  onScrollEndDrag={handleScrollEndDrag}
                  onScrollToIndexFailed={handleScrollToIndexFailed}
                  style={{ flex: 1, opacity: isPositioningComplete ? 1 : 0 }}
                  contentContainerStyle={[
                    styles.scrollViewContainer,
                    { flexGrow: 1 },
                  ]}
                />

                {/* Left page-shadow strip */}
                <View
                  pointerEvents="none"
                  style={[
                    styles.pageShadowLeft,
                    {
                      background: undefined,
                      // React Native gradient via inline style not possible;
                      // use a semi-transparent overlay instead
                      backgroundColor: theme.dark
                        ? "rgba(0,0,0,0.18)"
                        : "rgba(93,50,17,0.06)",
                    },
                  ]}
                />
                {/* Right page-shadow strip */}
                <View
                  pointerEvents="none"
                  style={[
                    styles.pageShadowRight,
                    {
                      backgroundColor: theme.dark
                        ? "rgba(0,0,0,0.18)"
                        : "rgba(93,50,17,0.06)",
                    },
                  ]}
                />
              </View>

              {/* Skeleton overlay — visible while loading paragraphs OR while
                  the FlatList is being silently scrolled to the target. */}
              {(isLoadingParagraphs || !isPositioningComplete) && (
                <View style={StyleSheet.absoluteFillObject}>
                  <SermonSkeletonLoader message="getting the message..." />
                </View>
              )}

              <CustomTopCardController
                theme={theme}
                onScrollToPrev={scrollToPrevParagraph}
                onScrollToNext={scrollToNextParagraph}
                onOpenSearch={handleOpenSearch}
                sermonTitle={selectedSermon?.title}
              />

              <SearchFeedback
                isVisible={showFeedback}
                message={feedbackMessage}
                theme={theme}
              />
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

      {/* Endnote Results Modal */}
      <EndnoteResults
        visible={showEndnoteModal}
        onClose={() => setShowEndnoteModal(false)}
        endnoteData={endnoteData}
        searchResults={endnoteSearchResults}
        theme={theme}
        isLoading={isEndnoteLoading}
        onRetrySearch={handleRetryEndnoteSearch}
      />
    </View>
  );
});

export default CurrentSermon;
