import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ToastAndroid,
  Platform,
  Alert,
  Vibration,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { styles } from "../../styles/currentsermon";
import { Ionicons } from "@expo/vector-icons";
import { responsiveFontSize, spacing } from "../../Utils/responsiveUtils";
import { useAppContext } from "../../Logic/globalState";
import HighlightColorPalette from "./HighlightColorPalette";

// Pre-calculate common values to avoid recalculations
const DOUBLE_TAP_DELAY = 300;
const LONG_PRESS_DELAY = 500;
const VIBRATION_DURATION = 50;
const DEBOUNCE_DELAY = 100; // Debounce rapid consecutive actions

// Debounce utility for rapid state changes
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Memoized highlight colors - calculate once
const HIGHLIGHT_COLORS = {
  yellow: { light: "#FEF08A", dark: "#FBBF2499" },
  green: { light: "#BBF7D0", dark: "#34D39999" },
  brown: { light: "#D2B48C", dark: "#8B7355" }, // Changed from blue to brown
  purple: { light: "#DDD6FE", dark: "#C084FC99" },
  pink: { light: "#FBCFE8", dark: "#F472B699" },
  orange: { light: "#FED7AA", dark: "#FB923C99" },
};

// Memoized text highlighting component for search results - using text color instead of background
const HighlightedText = React.memo(
  ({ parts, searchPhrase, theme, settings }) => (
    <>
      {parts.map((part, partIndex) =>
        part.toLowerCase() === searchPhrase.toLowerCase() ? (
          <Text
            key={`highlight-${partIndex}-${part.slice(0, 10)}`}
            style={{
              color: theme.dark ? "#FCD34D" : "#F59E0B", // Use amber color for search highlights
              fontSize: responsiveFontSize(settings.fontSize),
              fontFamily: settings.fontFamily || "ZillaSlab",
              fontWeight: "600", // Make search highlights bold
              // Consistent spacing - no extra padding or margins
              lineHeight: Math.round(
                responsiveFontSize(settings.fontSize) * 1.4
              ),
            }}
          >
            {part}
          </Text>
        ) : (
          <Text
            key={`text-${partIndex}-${part.slice(0, 10)}`}
            style={{
              fontSize: responsiveFontSize(settings.fontSize),
              fontFamily: settings.fontFamily || "ZillaSlab",
              color: theme.colors.text,
              lineHeight: Math.round(
                responsiveFontSize(settings.fontSize) * 1.4
              ),
            }}
          >
            {part}
          </Text>
        )
      )}
    </>
  )
);

// Memoized endnote text component
const EndnoteText = React.memo(({ parts, theme, settings }) => (
  <>
    {parts.map((part, partIndex) => {
      const lowerPart = part.toLowerCase();
      if (lowerPart === "endnote") {
        return (
          <Text
            key={`endnote-${partIndex}-${part.slice(0, 10)}`}
            style={{
              fontSize: responsiveFontSize(settings.fontSize),
              fontFamily: settings.fontFamily || "ZillaSlab",
              color: theme.dark ? theme.colors.hlight : "#5d3211",
              textDecorationLine: "underline",
              fontWeight: "500",
              lineHeight: Math.round(
                responsiveFontSize(settings.fontSize) * 1.4
              ),
            }}
          >
            {part}
          </Text>
        );
      } else if (lowerPart === "reference") {
        return (
          <Text
            key={`reference-${partIndex}-${part.slice(0, 10)}`}
            style={{
              fontSize: responsiveFontSize(settings.fontSize),
              fontFamily: settings.fontFamily || "ZillaSlab",
              color: theme.dark ? theme.colors.hlight : "#5d3211",
              textDecorationLine: "underline",
              fontWeight: "500",
              lineHeight: Math.round(
                responsiveFontSize(settings.fontSize) * 1.4
              ),
            }}
          >
            {part}
          </Text>
        );
      } else {
        return (
          <Text
            key={`text-${partIndex}-${part.slice(0, 10)}`}
            style={{
              fontSize: responsiveFontSize(settings.fontSize),
              fontFamily: settings.fontFamily || "ZillaSlab",
              color: theme.colors.text,
              lineHeight: Math.round(
                responsiveFontSize(settings.fontSize) * 1.4
              ),
            }}
          >
            {part}
          </Text>
        ); // Return styled text for non-endnote parts
      }
    })}
  </>
));

// Memoized endnote with title component - handles title text between Endnote and William Marrion Branham
const EndnoteWithTitleText = React.memo(({ parts, theme, settings }) => {
  let isTitle = false; // Track if we're in the title section

  return (
    <>
      {parts.map((part, partIndex) => {
        const lowerPart = part.toLowerCase();

        if (lowerPart === "endnote") {
          isTitle = true; // Start title section after Endnote
          return (
            <Text
              key={`endnote-${partIndex}-${part.slice(0, 10)}`}
              style={{
                fontSize: responsiveFontSize(settings.fontSize),
                fontFamily: settings.fontFamily || "ZillaSlab",
                color: theme.dark ? theme.colors.hlight : "#5d3211",
                textDecorationLine: "underline",
                fontWeight: "500",
                lineHeight: Math.round(
                  responsiveFontSize(settings.fontSize) * 1.4
                ),
              }}
            >
              {part}
            </Text>
          );
        } else if (lowerPart === "william marrion branham") {
          const titleText = (
            <Text
              key={`title-${partIndex}-${part.slice(0, 10)}`}
              style={{
                fontSize: responsiveFontSize(settings.fontSize),
                fontFamily: settings.fontFamily || "ZillaSlab",
                color: theme.dark ? theme.colors.hlight : "#5d3211",
                textDecorationLine: "underline",
                fontWeight: "500",
                fontStyle: "italic", // Add italics for the title including the name
                lineHeight: Math.round(
                  responsiveFontSize(settings.fontSize) * 1.4
                ),
              }}
            >
              {part}
            </Text>
          );
          isTitle = false; // End title section
          return titleText;
        } else if (isTitle && part.trim()) {
          // This is title text between Endnote and William Marrion Branham
          return (
            <Text
              key={`title-${partIndex}-${part.slice(0, 10)}`}
              style={{
                fontSize: responsiveFontSize(settings.fontSize),
                fontFamily: settings.fontFamily || "ZillaSlab",
                color: theme.dark ? theme.colors.hlight : "#5d3211",
                textDecorationLine: "underline",
                fontWeight: "500",
                fontStyle: "italic", // Add italics for title text
                lineHeight: Math.round(
                  responsiveFontSize(settings.fontSize) * 1.4
                ),
              }}
            >
              {part}
            </Text>
          );
        } else {
          // Regular text (before Endnote or after William Marrion Branham)
          return (
            <Text
              key={`text-${partIndex}-${part.slice(0, 10)}`}
              style={{
                fontSize: responsiveFontSize(settings.fontSize),
                fontFamily: settings.fontFamily || "ZillaSlab",
                color: theme.colors.text,
                lineHeight: Math.round(
                  responsiveFontSize(settings.fontSize) * 1.4
                ),
              }}
            >
              {part}
            </Text>
          );
        }
      })}
    </>
  );
});

const ParagraphText = React.memo(
  ({
    paragraph,
    index,
    searchPhrase = "",
    theme,
    settings,
    onLayout,
    selectedSermon,
  }) => {
    const {
      addBookmark,
      removeBookmark,
      bookmarks,
      addHighlight,
      removeHighlight,
      getHighlight,
    } = useAppContext();

    const [isCopying, setIsCopying] = useState(false);
    const [showColorPalette, setShowColorPalette] = useState(false);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const lastTapTime = useRef(0);

    // Check if this paragraph is bookmarked - optimized with unique key
    const isBookmarked = useMemo(() => {
      const bookmarkKey = `${selectedSermon.id}-${index}`;
      return bookmarks.some(
        (b) => `${b.sermon.id}-${b.paragraphIndex}` === bookmarkKey
      );
    }, [bookmarks, selectedSermon.id, index]); // More specific dependencies

    // Check if this paragraph is highlighted - optimized
    const currentHighlight = useMemo(() => {
      const highlightKey = `${selectedSermon.id}-${index}`;
      return getHighlight(selectedSermon.id, index);
    }, [selectedSermon.id, index, getHighlight]); // Keep getHighlight for reactivity

    // Simplified and optimized text style with highlight color support
    const textStyle = useMemo(() => {
      const baseSize = responsiveFontSize(settings?.fontSize || 22);
      const fontFamily = settings?.fontFamily || "ZillaSlab";

      // Determine text color - use highlight color if paragraph is highlighted
      let textColor = theme.colors.text;
      if (currentHighlight) {
        const highlightColorData = HIGHLIGHT_COLORS[currentHighlight];
        if (highlightColorData) {
          // Use vibrant highlight colors for text
          const highlightColors = {
            yellow: theme.dark ? "#FCD34D" : "#F59E0B", // Amber
            green: theme.dark ? "#34D399" : "#059669", // Emerald
            brown: theme.dark ? "#D2B48C" : "#8B4513", // Brown instead of blue
            purple: theme.dark ? "#C084FC" : "#7C3AED", // Violet
            pink: theme.dark ? "#F472B6" : "#DB2777", // Pink
            orange: theme.dark ? "#FB923C" : "#EA580C", // Orange
          };
          textColor = highlightColors[currentHighlight] || theme.colors.text;
        }
      }

      return [
        styles.paragraphText,
        {
          color: textColor,
          fontFamily: fontFamily,
          fontSize: baseSize,
          lineHeight: Math.round(baseSize * 1.4), // Consistent line height calculation
        },
      ];
    }, [
      theme.colors.text,
      theme.dark,
      currentHighlight,
      settings?.fontFamily,
      settings?.fontSize,
    ]);

    const paragraphNumberStyle = useMemo(
      () => [styles.paragraphNumber, { color: theme.colors.text }],
      [theme.colors.text]
    );

    // Enhanced container style with selection mode - text color highlighting instead of background
    const containerStyle = useMemo(() => {
      const baseStyle = [styles.paragraphContainer];

      // Note: Highlight color is now applied to text, not background

      // Add visual indicator if this is the last read paragraph
      if (selectedSermon?.lastReadParagraph === index) {
        baseStyle.push({
          borderLeftWidth: 2,
          paddingLeft: 2,
          borderLeftColor: theme.dark ? theme.colors.hlight : "#5d3211",
          backgroundColor: theme.dark
            ? theme.colors.hlight + "20"
            : "#5d321120",
        });
      }

      if (isCopying) {
        baseStyle.push(styles.copyingParagraph);
      }

      // Add selection mode styling
      if (isSelectionMode) {
        baseStyle.push({
          backgroundColor: theme.dark
            ? theme.colors.hlight + "20"
            : "#5d321120",
          borderWidth: 1,
          borderColor: theme.dark ? theme.colors.hlight + "50" : "#5d321150",
          borderRadius: 8,
          paddingHorizontal: 4,
        });
      }

      return baseStyle;
    }, [
      currentHighlight,
      theme.dark,
      theme.colors.hlight,
      selectedSermon?.lastReadParagraph,
      index,
      isCopying,
      isSelectionMode,
    ]);

    // Memoize text processing for search, endnotes, and titles
    const processedText = useMemo(() => {
      const hasEndnote = paragraph.includes("Endnote");
      const hasWilliamBranham = paragraph.includes("William Marrion Branham");
      const hasSearch = searchPhrase && searchPhrase.length > 0;

      if (hasEndnote && hasWilliamBranham) {
        // Split by Endnote and William Marrion Branham to identify title
        return {
          type: "endnote_with_title",
          parts: paragraph.split(/(Endnote|William Marrion Branham)/gi),
        };
      } else if (hasEndnote) {
        return {
          type: "endnote",
          parts: paragraph.split(/(Endnote)/gi),
        };
      } else if (hasSearch) {
        return {
          type: "search",
          parts: paragraph.split(new RegExp(`(${searchPhrase})`, "gi")),
        };
      } else {
        return {
          type: "normal",
          text: paragraph,
        };
      }
    }, [paragraph, searchPhrase]);

    // Enhanced layout handler to also track paragraph positioning
    const handleLayout = useCallback(
      (event) => {
        // Call the original onLayout handler
        if (onLayout) {
          onLayout(event);
        }

        // Additional layout handling can be added here if needed
        // For example, tracking when paragraphs become visible
      },
      [onLayout]
    );

    // Optimized clipboard function with better error handling
    const copyToClipboard = useCallback(async () => {
      if (isCopying) return; // Prevent multiple simultaneous copies

      try {
        setIsCopying(true);

        // Provide haptic feedback
        if (Platform.OS === "ios") {
          Vibration.vibrate(VIBRATION_DURATION);
        }

        const sermonInfo = selectedSermon
          ? `\n\nFrom: "${selectedSermon.title}" - ${
              selectedSermon.date || "No date available"
            }`
          : "";

        const textToCopy = `https://hisvoice.vercel.app/ \n${paragraph}${sermonInfo}`;
        await Clipboard.setStringAsync(textToCopy);

        // Platform-specific feedback
        const message = "Paragraph copied to clipboard";
        if (Platform.OS === "android") {
          ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
          Alert.alert("Copied", message);
        }
      } catch (error) {
        console.error("Copy failed:", error);

        const errorMessage = "Failed to copy text";
        if (Platform.OS === "android") {
          ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
        } else {
          Alert.alert("Error", errorMessage);
        }
      } finally {
        setIsCopying(false);
      }
    }, [isCopying, paragraph, selectedSermon]);

    // Optimized text selection handler
    const handleTextPress = useCallback(() => {
      const now = Date.now();
      const timeDiff = now - lastTapTime.current;
      lastTapTime.current = now;

      if (timeDiff < DOUBLE_TAP_DELAY) {
        // Double tap detected - enable selection mode
        if (Platform.OS === "ios") {
          Vibration.vibrate(30);
        }
        setIsSelectionMode(true);

        // Show selection tip
        const message = "📝 Selection enabled! Long press text to select";
        if (Platform.OS === "android") {
          ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
          Alert.alert("Selection Mode", message);
        }
      } else {
        // Single tap - show hint for selection
        const message =
          "💡 Double-tap paragraph number to enable text selection";
        if (Platform.OS === "android") {
          ToastAndroid.show(message, ToastAndroid.SHORT);
        }
      }
    }, []);

    // Reset selection mode after a delay
    useEffect(() => {
      if (isSelectionMode) {
        const timeout = setTimeout(() => {
          setIsSelectionMode(false);
        }, 5000); // 5 seconds selection mode
        return () => clearTimeout(timeout);
      }
    }, [isSelectionMode]);

    // Debounced bookmark handlers to prevent rapid consecutive calls
    const debouncedAddBookmark = useMemo(
      () => debounce(addBookmark, DEBOUNCE_DELAY),
      [addBookmark]
    );

    const debouncedRemoveBookmark = useMemo(
      () => debounce(removeBookmark, DEBOUNCE_DELAY),
      [removeBookmark]
    );

    const handleBookmarkPress = useCallback(() => {
      // Provide immediate haptic feedback
      if (Platform.OS === "ios") {
        Vibration.vibrate(VIBRATION_DURATION);
      }

      if (isBookmarked) {
        // Remove bookmark if already bookmarked
        debouncedRemoveBookmark(selectedSermon, index);
      } else {
        // Add bookmark if not bookmarked
        debouncedAddBookmark(selectedSermon, index, paragraph);
      }
    }, [
      debouncedAddBookmark,
      debouncedRemoveBookmark,
      selectedSermon,
      index,
      paragraph,
      isBookmarked,
    ]);

    const handleHighlightPress = useCallback(() => {
      // Toggle color palette with immediate response
      setShowColorPalette((prev) => !prev);

      // Provide immediate haptic feedback
      if (Platform.OS === "ios") {
        Vibration.vibrate(VIBRATION_DURATION);
      }
    }, []);

    const handleColorSelect = useCallback(
      (color) => {
        // Debounced highlight operations to prevent rapid calls
        const debouncedHighlightAction = debounce(() => {
          if (color) {
            addHighlight(selectedSermon.id, index, color);
          } else {
            removeHighlight(selectedSermon.id, index);
          }
        }, DEBOUNCE_DELAY);

        // Execute debounced action
        debouncedHighlightAction();

        // Close palette immediately for responsive UI
        setShowColorPalette(false);

        // Provide immediate haptic feedback
        if (Platform.OS === "ios") {
          Vibration.vibrate(VIBRATION_DURATION);
        }
      },
      [addHighlight, removeHighlight, selectedSermon.id, index]
    );

    // Render text content based on type
    const renderTextContent = useCallback(() => {
      switch (processedText.type) {
        case "endnote_with_title":
          return (
            <EndnoteWithTitleText
              parts={processedText.parts}
              theme={theme}
              settings={settings}
            />
          );
        case "endnote":
          return (
            <EndnoteText
              parts={processedText.parts}
              theme={theme}
              settings={settings}
            />
          );
        case "search":
          return (
            <HighlightedText
              parts={processedText.parts}
              searchPhrase={searchPhrase}
              theme={theme}
              settings={settings}
            />
          );
        default:
          return processedText.text;
      }
    }, [processedText, theme, settings, searchPhrase]);

    return (
      <View style={containerStyle} onLayout={handleLayout}>
        <View style={styles.paragraphHeader}>
          <View style={styles.paragraphNumberContainer}>
            <TouchableOpacity
              onPress={handleTextPress}
              style={[
                styles.paragraphNumberButton,
                {
                  backgroundColor: isSelectionMode
                    ? theme.dark
                      ? theme.colors.hlight
                      : "#5d3211"
                    : "transparent",
                },
              ]}
            >
              <Text
                style={[
                  paragraphNumberStyle,
                  {
                    color: isSelectionMode ? "#fff" : theme.colors.text,
                  },
                ]}
              >
                {index + 1}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleBookmarkPress}
              style={[
                styles.bookmarkButton,
                isBookmarked && styles.bookmarkButtonActive,
              ]}
            >
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={responsiveFontSize(20)}
                color={theme.dark ? theme.colors.hlight : "#5d3211"}
              />
            </TouchableOpacity>
            <View style={{ position: "relative" }}>
              <TouchableOpacity
                onPress={handleHighlightPress}
                style={[
                  styles.highlightButton,
                  currentHighlight && styles.highlightButtonActive,
                ]}
              >
                <Ionicons
                  name="chevron-forward"
                  size={responsiveFontSize(18)}
                  color={
                    currentHighlight
                      ? theme.dark
                        ? theme.colors.hlight
                        : "#5d3211"
                      : theme.dark
                      ? theme.colors.text + "60"
                      : "#666"
                  }
                />
              </TouchableOpacity>

              {/* Highlight Color Palette */}
              {showColorPalette && (
                <>
                  <TouchableOpacity
                    style={styles.paletteOverlay}
                    onPress={() => setShowColorPalette(false)}
                    activeOpacity={1}
                  />
                  <HighlightColorPalette
                    isVisible={showColorPalette}
                    onColorSelect={handleColorSelect}
                    onClose={() => setShowColorPalette(false)}
                    theme={theme}
                    currentColor={currentHighlight}
                  />
                </>
              )}
            </View>
          </View>

          {/* Selectable Text Container */}
          <View style={styles.selectableTextContainer}>
            <Text
              style={textStyle} // Use pre-calculated style
              selectable={true}
              selectTextOnFocus={false}
              selectionColor={
                theme.dark ? theme.colors.hlight + "60" : "#5d321160"
              }
              onLongPress={copyToClipboard}
              dataDetectorType="none"
              allowFontScaling={false}
              onSelectionChange={(event) => {
                // Optional: Handle selection changes
                if (
                  event.nativeEvent.selection.start !==
                  event.nativeEvent.selection.end
                ) {
                  // Text is selected
                  if (Platform.OS === "android") {
                    ToastAndroid.show(
                      "Text selected! Copy available in context menu",
                      ToastAndroid.SHORT
                    );
                  }
                }
              }}
            >
              {processedText.type === "endnote_with_title"
                ? processedText.parts.map((part, partIndex) => {
                    const lowerPart = part.toLowerCase();
                    let isTitle = false;

                    // Check if this part is in title position (after endnote, before or including William Marrion Branham)
                    if (partIndex > 0) {
                      const prevParts = processedText.parts.slice(0, partIndex);
                      const endnoteIndex = prevParts.findIndex(
                        (p) => p.toLowerCase() === "endnote"
                      );
                      const branhamIndex = processedText.parts.findIndex(
                        (p) => p.toLowerCase() === "william marrion branham"
                      );
                      isTitle =
                        endnoteIndex !== -1 &&
                        (branhamIndex === -1 || partIndex <= branhamIndex);
                    }

                    if (lowerPart === "endnote") {
                      return (
                        <Text
                          key={`endnote-${partIndex}-${part.slice(0, 10)}`}
                          style={{
                            color: theme.dark ? theme.colors.hlight : "#5d3211",
                            textDecorationLine: "underline",
                            fontWeight: "500",
                            fontFamily: settings?.fontFamily || "ZillaSlab",
                            fontSize: responsiveFontSize(
                              settings?.fontSize || 22
                            ),
                          }}
                        >
                          {part}
                        </Text>
                      );
                    } else if (lowerPart === "william marrion branham") {
                      return (
                        <Text
                          key={`branham-${partIndex}-${part.slice(0, 10)}`}
                          style={{
                            color: theme.dark ? theme.colors.hlight : "#5d3211",
                            textDecorationLine: "underline",
                            fontWeight: "500",
                            fontStyle: "italic",
                            fontFamily: settings?.fontFamily || "ZillaSlab",
                            fontSize: responsiveFontSize(
                              settings?.fontSize || 22
                            ),
                          }}
                        >
                          {part}
                        </Text>
                      );
                    } else if (isTitle && part.trim()) {
                      return (
                        <Text
                          key={`title-${partIndex}-${part.slice(0, 10)}`}
                          style={{
                            color: theme.dark ? theme.colors.hlight : "#5d3211",
                            textDecorationLine: "underline",
                            fontWeight: "500",
                            fontStyle: "italic",
                            fontFamily: settings?.fontFamily || "ZillaSlab",
                            fontSize: responsiveFontSize(
                              settings?.fontSize || 22
                            ),
                          }}
                        >
                          {part}
                        </Text>
                      );
                    } else {
                      return part;
                    }
                  })
                : processedText.type === "endnote"
                ? processedText.parts.map((part, partIndex) => {
                    const lowerPart = part.toLowerCase();
                    if (lowerPart === "endnote" || lowerPart === "reference") {
                      return (
                        <Text
                          key={`${lowerPart}-${partIndex}-${part.slice(0, 10)}`}
                          style={{
                            color: theme.dark ? theme.colors.hlight : "#5d3211",
                            textDecorationLine: "underline",
                            fontWeight: "500",
                            fontFamily: settings?.fontFamily || "ZillaSlab",
                            fontSize: responsiveFontSize(
                              settings?.fontSize || 22
                            ),
                            // Inherit lineHeight from parent to maintain consistent spacing
                          }}
                        >
                          {part}
                        </Text>
                      );
                    } else {
                      return part;
                    }
                  })
                : processedText.type === "search"
                ? processedText.parts.map((part, partIndex) =>
                    part.toLowerCase() === searchPhrase.toLowerCase() ? (
                      <Text
                        key={`highlight-${partIndex}-${part.slice(0, 10)}`}
                        style={{
                          color: theme.dark ? "#FCD34D" : "#F59E0B", // Use amber color for search highlights
                          fontWeight: "600", // Make search highlights bold
                          fontFamily: settings?.fontFamily || "ZillaSlab",
                          fontSize: responsiveFontSize(
                            settings?.fontSize || 22
                          ),
                          // Inherit lineHeight from parent to maintain consistent spacing
                        }}
                      >
                        {part}
                      </Text>
                    ) : (
                      part
                    )
                  )
                : processedText.text}
            </Text>
          </View>
        </View>

        {/* Selection Mode Indicator */}
        {isSelectionMode && (
          <View
            style={[
              styles.selectionModeIndicator,
              {
                backgroundColor: theme.dark
                  ? theme.colors.hlight + "E0"
                  : "#5d3211E0",
              },
            ]}
          >
            <Text style={styles.selectionModeText}>
              📝 Selection Mode Active
            </Text>
          </View>
        )}
      </View>
    );
  }
);

// Add display name for debugging
ParagraphText.displayName = "ParagraphText";

export default ParagraphText;
