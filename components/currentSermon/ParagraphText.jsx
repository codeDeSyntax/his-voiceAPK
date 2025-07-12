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
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import { responsiveFontSize, spacing } from "../../Utils/responsiveUtils";
import { useAppContext } from "../../Logic/globalState";
import HighlightColorPalette from "./HighlightColorPalette";

// Memoized text highlighting component for better performance
const HighlightedText = React.memo(
  ({ parts, searchPhrase, theme, settings }) => (
    <>
      {parts.map((part, partIndex) =>
        part.toLowerCase() === searchPhrase.toLowerCase() ? (
          <Text
            key={`highlight-${partIndex}`}
            style={[
              {
                color: theme.dark ? "white" : "black",
                fontSize: settings.fontSize,
                fontFamily: settings.fontFamily || "ZillaSlab",
                borderRadius: 10,
                letterSpacing: 1,
                paddingHorizontal: 5,
                backgroundColor: theme.dark
                  ? "#5d3211" + "50"
                  : "rgba(59, 130, 246, 0.1)",
              },
            ]}
          >
            {part}
          </Text>
        ) : (
          part // Return plain text for non-highlighted parts
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
            key={`endnote-${partIndex}`}
            style={[
              {
                fontSize: responsiveFontSize(settings.fontSize),
                fontFamily: settings.fontFamily,
                color: theme.dark ? theme.colors.hlight : "#5d3211",
                textDecorationLine: "underline",
                fontWeight: "500",
              },
            ]}
          >
            {part}
          </Text>
        );
      } else if (lowerPart === "reference") {
        return (
          <Text
            key={`reference-${partIndex}`}
            style={[
              {
                fontSize: responsiveFontSize(settings.fontSize),
                fontFamily: settings.fontFamily,
                color: theme.dark ? theme.colors.hlight : "#5d3211",
                textDecorationLine: "underline",
                fontWeight: "500",
              },
            ]}
          >
            {part}
          </Text>
        );
      } else {
        return part; // Return plain text for non-endnote parts
      }
    })}
  </>
));

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
      bookmarks,
      addHighlight,
      removeHighlight,
      getHighlight,
    } = useAppContext();
    const [fontsLoaded] = useFonts({
      ZillaSlab: require("../../assets/fonts/ZillaSlab-Regular.ttf"),
    });

    const [isCopying, setIsCopying] = useState(false);
    const [showColorPalette, setShowColorPalette] = useState(false);
    const lastTapTime = useRef(0);

    // Check if this paragraph is bookmarked
    const isBookmarked = useMemo(() => {
      return bookmarks.some(
        (b) => b.sermon.id === selectedSermon.id && b.paragraphIndex === index
      );
    }, [bookmarks, selectedSermon.id, index]);

    // Check if this paragraph is highlighted
    const currentHighlight = useMemo(() => {
      return getHighlight(selectedSermon.id, index);
    }, [getHighlight, selectedSermon.id, index]);

    // Constants
    const DOUBLE_TAP_DELAY = 300;
    const LONG_PRESS_DELAY = 500;
    const VIBRATION_DURATION = 50;

    // Memoize expensive computations
    const textStyle = useMemo(
      () => [
        styles.paragraphText,
        {
          color: theme.colors.text,
          fontFamily: settings.fontFamily || "ZillaSlab",
          fontSize: responsiveFontSize(settings.fontSize),
          // Ensure text remains readable on highlighted backgrounds
          textShadowColor:
            currentHighlight && theme.dark ? "rgba(0,0,0,0.3)" : "transparent",
          textShadowOffset:
            currentHighlight && theme.dark
              ? { width: 0, height: 1 }
              : { width: 0, height: 0 },
          textShadowRadius: currentHighlight && theme.dark ? 1 : 0,
        },
      ],
      [
        theme.colors.text,
        settings.fontFamily,
        settings.fontSize,
        currentHighlight,
        theme.dark,
      ]
    );

    const paragraphNumberStyle = useMemo(
      () => [styles.paragraphNumber, { color: theme.colors.text }],
      [theme.colors.text]
    );

    // Enhanced container style with selection mode and highlight
    const containerStyle = useMemo(() => {
      const baseStyle = [styles.paragraphContainer];

      // Add highlight background if paragraph is highlighted
      if (currentHighlight) {
        const highlightColors = {
          yellow: { light: "#FEF08A", dark: "#FBBF2499" }, // 60% opacity
          green: { light: "#BBF7D0", dark: "#34D39999" },
          blue: { light: "#BFDBFE", dark: "#60A5FA99" },
          purple: { light: "#DDD6FE", dark: "#C084FC99" },
          pink: { light: "#FBCFE8", dark: "#F472B699" },
          orange: { light: "#FED7AA", dark: "#FB923C99" },
        };

        const highlightColor = highlightColors[currentHighlight];
        if (highlightColor) {
          baseStyle.push({
            backgroundColor: theme.dark
              ? highlightColor.dark
              : highlightColor.light,
            borderRadius: 8,
            padding: spacing.xs,
            marginVertical: spacing.xs / 2,
          });
        }
      }

      // Add visual indicator if this is the last read paragraph
      if (selectedSermon?.lastReadParagraph === index) {
        baseStyle.push({
          borderLeftWidth: 2,
          paddingLeft: 2,
          borderLeftColor: theme.dark ? theme.colors.hlight : "#5d3211",
          backgroundColor: currentHighlight
            ? undefined
            : theme.dark
            ? theme.colors.hlight + "10"
            : "rgba(251, 114, 16, 0.05)",
        });
      }

      if (isCopying) {
        baseStyle.push(styles.copyingParagraph);
      }

      // Add selection mode styling
      if (isSelectionMode) {
        baseStyle.push({
          backgroundColor: theme.dark
            ? "rgba(59, 130, 246, 0.1)"
            : "rgba(59, 130, 246, 0.05)",
          borderWidth: 1,
          borderColor: theme.dark
            ? "rgba(59, 130, 246, 0.3)"
            : "rgba(59, 130, 246, 0.2)",
          borderRadius: 8,
          paddingHorizontal: 4,
        });
      }

      return baseStyle;
    }, [
      isCopying,
      selectedSermon?.lastReadParagraph,
      index,
      theme,
      isSelectionMode,
      currentHighlight,
    ]);

    // Memoize text processing for search and endnotes
    const processedText = useMemo(() => {
      const hasEndnote = paragraph.includes("Endnote");
      const hasSearch = searchPhrase && searchPhrase.length > 0;

      if (hasEndnote) {
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

    const [isSelectionMode, setIsSelectionMode] = useState(false);

    // Reset selection mode after a delay
    useEffect(() => {
      if (isSelectionMode) {
        const timeout = setTimeout(() => {
          setIsSelectionMode(false);
        }, 5000); // 5 seconds selection mode
        return () => clearTimeout(timeout);
      }
    }, [isSelectionMode]);

    const handleBookmarkPress = useCallback(() => {
      if (!isBookmarked) {
        addBookmark(selectedSermon, index, paragraph);
        Vibration.vibrate(VIBRATION_DURATION);
      }
    }, [addBookmark, selectedSermon, index, paragraph, isBookmarked]);

    const handleHighlightPress = useCallback(() => {
      setShowColorPalette(!showColorPalette);
      Vibration.vibrate(VIBRATION_DURATION);
    }, [showColorPalette]);

    const handleColorSelect = useCallback(
      (color) => {
        if (color) {
          addHighlight(selectedSermon.id, index, color);
        } else {
          removeHighlight(selectedSermon.id, index);
        }
        setShowColorPalette(false);
        Vibration.vibrate(VIBRATION_DURATION);
      },
      [addHighlight, removeHighlight, selectedSermon.id, index]
    );

    // Render text content based on type
    const renderTextContent = useCallback(() => {
      switch (processedText.type) {
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
              style={[
                textStyle,
                {
                  fontSize: responsiveFontSize(settings.fontSize),
                  fontFamily: settings.fontFamily,
                  // lineHeight:2
                },
              ]}
              selectable={true}
              selectTextOnFocus={false}
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
              {processedText.type === "endnote" ? (
                <EndnoteText
                  parts={processedText.parts}
                  theme={theme}
                  settings={settings}
                />
              ) : processedText.type === "search" ? (
                <HighlightedText
                  parts={processedText.parts}
                  searchPhrase={searchPhrase}
                  theme={theme}
                  settings={settings}
                />
              ) : (
                processedText.text
              )}
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
                  ? "rgba(59, 130, 246, 0.9)"
                  : "rgba(59, 130, 246, 0.8)",
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
