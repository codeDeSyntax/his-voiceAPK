import { useLocalSearchParams } from "expo-router";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
  type ComponentProps,
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
  Modal,
  Animated,
  Easing,
} from "react-native";

import { useAppContext } from "../../../providers/SermonProvider";
import { Feather } from "@expo/vector-icons";
import {
  formatSermonIntoParagraphs,
  formatSermonIntoParagraphsAsync,
} from "../utils/paragraphSplitter";
import { getSermonById, getSermonParagraphs } from "../data/sermonDB";
import { responsiveFontSize } from "../../../shared/utils/responsiveUtils";
import ParagraphText from "../components/ParagraphText";
import ParagraphPickerSheet from "../components/ParagraphPickerSheet";
import CustomBottomSheetController from "../components/BottomSheetController";
import DraggableFloatingButton from "../../../shared/components/FloatButton";
import SearchFeedback from "../components/SearchFeedback";
import CurrentSermonSearch from "../components/CurrentSermonSearch";
import EndnoteSheet from "../components/EndnoteSheet";
import { styles } from "../styles/reader";
import { useRouter } from "expo-router";
import PlaySermon from "../components/PlaySermon_SIMPLE";
import TextSermonPlaylist from "../components/TextSermonPlaylist";
import CustomTopCardController from "../components/BottomSheetController";
import LoadingScreen, { SermonSkeletonLoader } from "../../../shared/components/Loader";
import { styles as globalStyles } from "../styles/library";
import type { Endnote } from "../../endnotes/types";
import type { Sermon } from "../types";

const CurrentSermon = React.memo(() => {
  const params = useLocalSearchParams();
  const route = useMemo(() => {
    const one = (value: string | string[] | undefined): string | undefined =>
      Array.isArray(value) ? value[0] : value;
    return {
      params: {
        source: one(params.source),
        searchPhrase: one(params.searchPhrase),
        sermonId: one(params.sermonId),
        initialParagraph: params.initialParagraph === undefined ? undefined : Number(one(params.initialParagraph)),
        scrollToParagraph: params.scrollToParagraph === undefined ? undefined : Number(one(params.scrollToParagraph)),
      },
    };
  }, [params.source, params.searchPhrase, params.sermonId, params.initialParagraph, params.scrollToParagraph]);
  const {
    selectedSermon,
    setSelectedSermon,
    settings,
    theme,
    searchText,
    updateLastReadPosition,
  } = useAppContext();
  const router = useRouter();

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
          setSelectedSermon(sermon as Sermon);
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
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [isLoadingParagraphs, setIsLoadingParagraphs] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [currentSearchPhrase, setCurrentSearchPhrase] = useState("");
  const [searchNavKey, setSearchNavKey] = useState(0);
  const [pendingScrollTarget, setPendingScrollTarget] = useState<number | null>(null);

  // Paragraph picker sheets (bookmark / highlight)
  const [showBookmarkSheet, setShowBookmarkSheet] = useState(false);
  const [showHighlightSheet, setShowHighlightSheet] = useState(false);
  const [showTextSermons, setShowTextSermons] = useState(false);

  // Endnote bottom sheet
  const [showEndnoteSheet, setShowEndnoteSheet] = useState(false);
  const [endnoteData, setEndnoteData] = useState<Endnote | null>(null);

  // True once the FlatList has been scrolled to its initial target position.
  // The skeleton overlay is shown until this is true, so users never see the
  // list jump/animate to the target paragraph.
  const [isPositioningComplete, setIsPositioningComplete] = useState(false);
  const isPositioningCompleteRef = useRef(false);
  const paragraphsLengthRef = useRef(0);

  const [scrollPriority, setScrollPriority] = useState<number | null>(null);
  // Overlay shown on top of the visible sermon text while FlatList silently
  // scrolls to a high paragraph (>= 35). Fades out once scroll has settled.
  const [showScrollOverlay, setShowScrollOverlay] = useState(false);
  const scrollOverlayAnim = useState(() => new Animated.Value(0))[0];

  const flatListRef = useRef<FlatList<string> | null>(null);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUserScrolling = useRef(false); // Track if user is actively scrolling
  const isSearchJumping = useRef(false); // True while a search-result jump is in progress
  const userScrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isPositioningCompleteRef.current = isPositioningComplete;
  }, [isPositioningComplete]);

  useEffect(() => {
    paragraphsLengthRef.current = paragraphs.length;
  }, [paragraphs.length]);

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
      const canPersistPosition =
        isPositioningCompleteRef.current && paragraphsLengthRef.current > 0;

      if (
        currentSermonId &&
        updater &&
        lastParagraph !== undefined &&
        canPersistPosition
      ) {
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

  const targetScrollParagraphRef = useRef<number | null>(null);
  const isAwaitingTargetViewRef = useRef(false);
  const overlayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissScrollOverlay = useCallback(() => {
    if (!isAwaitingTargetViewRef.current) return;
    isAwaitingTargetViewRef.current = false;
    if (overlayTimeoutRef.current) {
      clearTimeout(overlayTimeoutRef.current);
      overlayTimeoutRef.current = null;
    }
    // Brief delay so the layout/paint of the target paragraph settles cleanly before fade
    setTimeout(() => {
      Animated.timing(scrollOverlayAnim, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => setShowScrollOverlay(false));
    }, 150);
  }, [scrollOverlayAnim]);

  const onViewableItemsChanged = useRef<NonNullable<ComponentProps<typeof FlatList<string>>["onViewableItemsChanged"]>>(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      const firstVisibleIndex = viewableItems[0].index;

      // Check if we are waiting for the target paragraph AFTER precise scrollToIndex
      if (
        isAwaitingTargetViewRef.current &&
        targetScrollParagraphRef.current !== null
      ) {
        const target = targetScrollParagraphRef.current;
        const isTargetViewable = viewableItems.some(
          (v) => v.index !== null && v.index !== undefined && Math.abs(v.index - target) <= 1
        );
        if (isTargetViewable) {
          dismissScrollOverlay();
        }
      }

      if (
        firstVisibleIndex !== null &&
        firstVisibleIndex !== undefined &&
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

    // Skip if a search-result jump is driving the skeleton — that flow
    // manages its own scroll + reveal via pendingScrollTarget.
    if (isSearchJumping.current) return;

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
    } else if ((selectedSermon?.lastReadParagraph ?? 0) > 0) {
      targetIndex = selectedSermon?.lastReadParagraph ?? 0;
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
      const isHighParagraph = targetIndex >= 35;

      if (isHighParagraph) {
        targetScrollParagraphRef.current = targetIndex;
        isAwaitingTargetViewRef.current = false; // Do NOT arm during Step 1!

        reveal();
        scrollOverlayAnim.setValue(1);
        setShowScrollOverlay(true);

        // Safety timeout (4s max) in case viewability callback doesn't fire
        if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
        overlayTimeoutRef.current = setTimeout(() => {
          dismissScrollOverlay();
        }, 4000);

        // Step 1: coarse offset jump to force FlatList to render nearby cells
        flatListRef.current.scrollToOffset({
          offset: 120 * targetIndex,
          animated: false,
        });

        // Step 2: precise scroll after cells near target have rendered
        setTimeout(() => {
          // NOW arm detector for final position check
          isAwaitingTargetViewRef.current = true;

          flatListRef.current?.scrollToIndex({
            index: targetIndex,
            animated: false,
            viewPosition: 0.1,
          });

          // Check if target is already viewable right after scrollToIndex
          setTimeout(() => {
            if (
              isAwaitingTargetViewRef.current &&
              Math.abs(currentVisibleParagraphRef.current - targetIndex) <= 1
            ) {
              dismissScrollOverlay();
            }
          }, 150);
        }, 250);
      } else {
        // 20–34: beyond initial render window but not far enough to warrant
        // the overlay. Jump via offset then precise scroll, then reveal.
        flatListRef.current.scrollToOffset({
          offset: 120 * targetIndex,
          animated: false,
        });
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: targetIndex,
            animated: false,
            viewPosition: 0.1,
          });
          reveal();
        }, 200);
      }
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
  // For far-off paragraphs (beyond ~20 items from current position), uses a
  // two-step approach: first scrollToOffset to force FlatList to render cells
  // near the target, then scrollToIndex for precision.
  const scrollToParagraph = useCallback(
    (index: number, animated = true) => {
      if (!flatListRef.current || index < 0 || index >= paragraphs.length)
        return;

      // If target is far from what's likely rendered, do the two-step jump
      // (same strategy the initial-positioning effect uses for index >= 20).
      const estimatedDistance = Math.abs(index - currentVisibleParagraph);

      if (estimatedDistance > 30) {
        // Step 1: jump to approximate offset so FlatList renders nearby cells
        flatListRef.current.scrollToOffset({
          offset: 120 * index,
          animated: false,
        });
        // Step 2: precise scroll once cells near target are rendered
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index,
            animated,
            viewPosition: 0.1,
          });
        }, 250);
      } else {
        flatListRef.current.scrollToIndex({
          index,
          animated,
          viewPosition: 0.1,
        });
      }
    },
    [paragraphs.length, currentVisibleParagraph],
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
    router?.navigate("/sermons");
  }, [router]);

  // Handle opening the fullscreen search
  const handleOpenSearch = useCallback(() => {
    setIsSearchVisible(true);
  }, []);

  const handleOpenTextSermons = useCallback(() => {
    setShowTextSermons(true);
  }, []);

  const handleTextSermonSelect = useCallback(
    async (sermon: Sermon) => {
      await setSelectedSermon(sermon);
      setIsPositioningComplete(false);
      setCurrentSearchPhrase("");
      setPendingScrollTarget(null);
    },
    [setSelectedSermon],
  );

  // Handle closing the fullscreen search
  const handleCloseSearch = useCallback(() => {
    setIsSearchVisible(false);
  }, []);

  // Handle navigating to search result from fullscreen search.
  // For far paragraphs the FlatList is hidden behind the skeleton while
  // the jump happens, so the user never sees scroll jumps.
  const handleSearchNavigateToResult = useCallback(
    (paragraphIndex: number, phrase: string) => {
      const isFarJump = Math.abs(paragraphIndex - currentVisibleParagraph) > 30;

      setIsSearchVisible(false);
      setCurrentSearchPhrase(phrase || "");
      setSearchNavKey((k) => k + 1);

      if (isFarJump) {
        // Hide FlatList behind skeleton while we jump silently
        isSearchJumping.current = true;
        setIsPositioningComplete(false);
      }

      setPendingScrollTarget(paragraphIndex);
    },
    [currentVisibleParagraph],
  );

  // Fire scroll AFTER the new phrase and extraData have been committed.
  // For far jumps the FlatList is hidden (opacity 0) behind the skeleton,
  // so all jumping happens invisibly — the user sees skeleton → result.
  useEffect(() => {
    if (pendingScrollTarget === null) return;

    const target = pendingScrollTarget;
    const isFarJump = Math.abs(target - currentVisibleParagraph) > 30;
    setPendingScrollTarget(null);

    if (isFarJump && flatListRef.current) {
      // Step 1: instant offset jump to force FlatList to render nearby cells
      flatListRef.current.scrollToOffset({
        offset: 120 * target,
        animated: false,
      });
      // Step 2: precise scroll + reveal after cells have rendered
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: target,
          animated: false,
          viewPosition: 0.1,
        });
        // Reveal after the scroll settles
        setTimeout(() => {
          isSearchJumping.current = false;
          setIsPositioningComplete(true);
        }, 100);
      }, 250);
    } else {
      // Close paragraph — direct animated scroll, no hiding needed
      requestAnimationFrame(() => {
        scrollToParagraph(target);
      });
    }
  }, [pendingScrollTarget, scrollToParagraph, currentVisibleParagraph]);

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

  // Handle endnote click — open preview sheet
  const handleEndnoteClick = useCallback((parsedEndnote: Endnote) => {
    setEndnoteData(parsedEndnote);
    setShowEndnoteSheet(true);
  }, []);

  // Open bookmark / highlight picker sheets
  const handleOpenBookmarkSheet = useCallback(() => {
    setShowBookmarkSheet(true);
  }, []);

  const handleOpenHighlightSheet = useCallback(() => {
    setShowHighlightSheet(true);
  }, []);

  // Stable drag/fail handlers — defined with useCallback so FlatList never
  // receives new function references on unrelated re-renders.
  const handleScrollBeginDrag = useCallback(() => {
    isUserScrolling.current = true;
    setScrollPriority(null);
  }, [scrollPriority]);

  const handleScrollEndDrag = useCallback(() => {
    setTimeout(() => {
      isUserScrolling.current = false;
    }, 150);
  }, []);

  const handleScrollToIndexFailed = useCallback((info: { index: number; averageItemLength?: number }) => {
    // Safety net: when scrollToIndex fails because the target cell's layout
    // isn't known yet, jump to an approximate offset to force FlatList to
    // render cells near the target, then retry.
    if (!flatListRef.current) {
      isSearchJumping.current = false;
      setIsPositioningComplete(true); // Always reveal if we can't scroll
      return;
    }

    const approxOffset = (info.averageItemLength ?? 120) * info.index;
    flatListRef.current.scrollToOffset({
      offset: approxOffset,
      animated: false,
    });

    // Retry after cells near the target have rendered
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: false,
        viewPosition: 0.1,
      });
      // Ensure skeleton is always removed even on failure
      setTimeout(() => {
        isSearchJumping.current = false;
        setIsPositioningComplete(true);
      }, 100);
    }, 300);
  }, []);

  // Render individual paragraph — FlatList handles virtualization.
  // handleParagraphLayout removed: paragraphLayouts was only consumed by
  // handleScroll (now removed). onLayout on each paragraph is no longer needed.
  const renderParagraphItem = useCallback(
    ({ item, index }: { item: string; index: number }) => {
      return (
        <ParagraphText
          paragraph={item}
          index={index}
          theme={theme}
          settings={settings}
          selectedSermon={selectedSermon}
          searchPhrase={currentSearchPhrase}
          onEndnoteClick={handleEndnoteClick}
        />
      );
    },
    [theme, settings, selectedSermon, currentSearchPhrase, handleEndnoteClick],
  );

  // Optimization: Extract item key
  const keyExtractor = useCallback((item: string, index: number) => `paragraph-${index}`, []);

  // ─── Book-style chapter header ────────────────────────────────────────────
  const ListHeader = useMemo(() => {
    const isDark = theme.dark;
    const titleColor = isDark ? "#fce5d8ff" : "#1a0e07";
    const metaColor = isDark
      ? "rgba(242, 205, 180, 0.55)"
      : "rgba(93, 50, 17, 0.5)";
    const ruleColor = isDark
      ? "rgba(242, 205, 180, 0.12)"
      : "rgba(93, 50, 17, 0.10)";
    const titleSize = responsiveFontSize(22);

    // Build meta line: "Date  ·  Location"
    const metaParts = [];
    if (selectedSermon?.date) metaParts.push(selectedSermon.date);
    if (selectedSermon?.location) metaParts.push(selectedSermon.location);
    const metaLine = metaParts.join("  \u00B7  ");

    return (
      <View
        style={{
          paddingTop: 10,
          paddingBottom: 20,
          paddingHorizontal: 6,
        }}
      >
        {/* Title — large, left-aligned, bold */}
        <Text
          style={{
            color: titleColor,
            fontFamily: "serif",
            fontWeight: "600",
            // fontStyle:"italic",
            fontSize: titleSize,
            lineHeight: titleSize * 1.2,
            letterSpacing: 0.2,
            textAlign: "left",
          }}
        >
          {selectedSermon?.title}

          {/* Meta line — date · location */}
          {"  "}
          {metaLine ? (
            <Text
              style={{
                color: metaColor,
                fontFamily: "cursive",
              }}
            >
              {metaLine}
            </Text>
          ) : null}
        </Text>

        {/* Clean horizontal rule */}
        <View
          style={{
            height: 1,
            backgroundColor: ruleColor,
          }}
        />
      </View>
    );
  }, [
    selectedSermon?.title,
    selectedSermon?.date,
    selectedSermon?.location,
    theme,
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

        <View
          style={[
            styles.container,
            { backgroundColor: "transparent" },
            selectedSermon?.type === "mp3" && { paddingTop: 0 },
          ]}
        >
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
                  removeClippedSubviews={false}
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

              <CustomTopCardController
                theme={theme}
                onScrollToPrev={scrollToPrevParagraph}
                onScrollToNext={scrollToNextParagraph}
                onOpenSearch={handleOpenSearch}
                onBookmarkPress={handleOpenBookmarkSheet}
                onHighlightPress={handleOpenHighlightSheet}
                isVisible={isPositioningComplete}
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

      {/* Full-screen skeleton — only shown while paragraphs are loading. */}
      <Modal
        visible={
          selectedSermon?.type !== "mp3" &&
          (isLoadingParagraphs || !isPositioningComplete)
        }
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View
          style={[
            styles.sermonLoaderScreen,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <SermonSkeletonLoader />
        </View>
      </Modal>

      <TextSermonPlaylist
        visible={showTextSermons}
        onClose={() => setShowTextSermons(false)}
        currentSermon={selectedSermon}
        onSermonSelect={handleTextSermonSelect}
      />

      {/* Positioning overlay Modal — covers the ENTIRE screen (incl. status bar)
          while the FlatList silently scrolls to the last-read paragraph. */}
      <Modal
        visible={showScrollOverlay}
        transparent
        animationType="none"
        statusBarTranslucent
        hardwareAccelerated
      >
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: theme.dark
                ? "rgba(0,0,0,0.80)"
                : "rgba(12,5,2,0.65)",
              opacity: scrollOverlayAnim,
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <Text
            style={{
              fontFamily: "ZillaSlab-SemiBold",
              fontSize: responsiveFontSize(19),
              color: theme.dark ? "#f2cdb4" : "#fae7da",
              letterSpacing: 0.3,
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            Returning to your place
          </Text>
          <Text
            style={{
              fontFamily: "Merriweather",
              fontSize: responsiveFontSize(12.5),
              color: theme.dark
                ? "rgba(242,205,180,0.55)"
                : "rgba(250,231,218,0.65)",
              letterSpacing: 0.5,
              textAlign: "center",
            }}
          >
            Paragraph {(selectedSermon?.lastReadParagraph ?? 0) + 1}
          </Text>
        </Animated.View>
      </Modal>

      {/* Fullscreen Search Modal */}
      <CurrentSermonSearch
        visible={isSearchVisible}
        onClose={handleCloseSearch}
        paragraphs={paragraphs}
        onNavigateToResult={handleSearchNavigateToResult}
        selectedSermon={selectedSermon}
      />

      {/* Endnote Sheet */}
      <EndnoteSheet
        visible={showEndnoteSheet}
        endnoteData={endnoteData}
        theme={theme}
        onClose={() => setShowEndnoteSheet(false)}
      />

      {/* Bookmark Picker Sheet */}
      <ParagraphPickerSheet
        visible={showBookmarkSheet}
        mode="bookmark"
        paragraphs={paragraphs}
        currentParagraphIndex={currentVisibleParagraph}
        selectedSermon={selectedSermon}
        theme={theme}
        onClose={() => setShowBookmarkSheet(false)}
      />

      {/* Highlight Picker Sheet */}
      <ParagraphPickerSheet
        visible={showHighlightSheet}
        mode="highlight"
        paragraphs={paragraphs}
        currentParagraphIndex={currentVisibleParagraph}
        selectedSermon={selectedSermon}
        theme={theme}
        onClose={() => setShowHighlightSheet(false)}
      />
    </View>
  );
});
CurrentSermon.displayName = "CurrentSermon";

export default CurrentSermon;
