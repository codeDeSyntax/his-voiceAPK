import React, { useState, useRef, useMemo, useCallback } from "react";
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
import { responsiveFontSize, spacing } from '../../Utils/responsiveUtils';
import { useAppContext } from "../../Logic/globalState";

// Memoized text highlighting component for better performance
const HighlightedText = React.memo(
  ({ parts, searchPhrase, theme, settings }) => (
    <>
      {parts.map((part, partIndex) =>
        part.toLowerCase() === searchPhrase.toLowerCase() ? (
          <Text
            key={`highlight-${partIndex}`}
            style={[
              styles.highlightedText,
              {
                color: theme.dark ? "white" : "black",
                fontSize: settings.fontSize,
                fontFamily: settings.fontFamily || "ZillaSlab",
                borderRadius: 10,
                letterSpacing:1,
                paddingHorizontal:5,
                backgroundColor: theme.dark
                  ? "#5d3211" + "50"
                  : "rgba(59, 130, 246, 0.1)",
              },
            ]}
          >
            {part}
          </Text>
        ) : (
          <Text
            key={`text-${partIndex}`}
            style={{
              color: theme.colors.text,
              fontSize: settings.fontSize,
              fontFamily: settings.fontFamily,
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
            key={`endnote-${partIndex}`}
            style={[
              styles.endnoteText,
              {
                fontSize: responsiveFontSize(settings.fontSize),
                fontFamily: settings.fontFamily,
                color: theme.dark ? theme.colors.hlight : "#5d3211",
                // lineHeight: 32,
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
              styles.endnoteText,
              {
                fontSize: responsiveFontSize(settings.fontSize),
                fontFamily: settings.fontFamily,
                color: theme.dark ? theme.colors.hlight : "#5d3211",
                // lineHeight: 32,
              },
            ]}
          >
            {part}
          </Text>
        );
      } else {
        return (
          <Text
            key={`text-${partIndex}`}
            style={{
              color: theme.colors.text,
              fontSize: responsiveFontSize(settings.fontSize),
              fontFamily: settings.fontFamily,
              // lineHeight: 32,
            }}
          >
            {part}
          </Text>
        );
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
    const { addBookmark, bookmarks } = useAppContext();
    const [fontsLoaded] = useFonts({
      ZillaSlab: require("../../assets/fonts/ZillaSlab-Regular.ttf"),
    });

    const [isCopying, setIsCopying] = useState(false);
    const lastTapTime = useRef(0);

    // Check if this paragraph is bookmarked
    const isBookmarked = useMemo(() => {
      return bookmarks.some(
        b => b.sermon.id === selectedSermon.id && b.paragraphIndex === index
      );
    }, [bookmarks, selectedSermon.id, index]);

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
        },
      ],
      [theme.colors.text, settings.fontFamily, settings.fontSize]
    );

    const paragraphNumberStyle = useMemo(
      () => [styles.paragraphNumber, { color: theme.colors.text }],
      [theme.colors.text]
    );

    // Enhanced container style to show current reading position
    const containerStyle = useMemo(() => {
      const baseStyle = [styles.paragraphContainer];

      // Add visual indicator if this is the last read paragraph
      if (selectedSermon?.lastReadParagraph === index) {
        baseStyle.push({
          borderLeftWidth: 2,
          paddingLeft: 2,
          borderLeftColor: theme.dark ? theme.colors.hlight : "#5d3211",
          backgroundColor: theme.dark
            ? theme.colors.hlight + "10"
            : "rgba(251, 114, 16, 0.05)",
        });
      }

      if (isCopying) {
        baseStyle.push(styles.copyingParagraph);
      }

      return baseStyle;
    }, [isCopying, selectedSermon?.lastReadParagraph, index, theme]);

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

    // Optimized double-tap handler
    const handleTextPress = useCallback(() => {
      const now = Date.now();
      const timeDiff = now - lastTapTime.current;
      lastTapTime.current = now;

      if (timeDiff < DOUBLE_TAP_DELAY) {
        // Double tap detected - provide visual feedback
        if (Platform.OS === "ios") {
          Vibration.vibrate(30); // Lighter vibration for double tap
        }
        // The text is already selectable, so native selection will handle it
      }
    }, []);

    const handleBookmarkPress = useCallback(() => {
      if (!isBookmarked) {
        addBookmark(selectedSermon, index, paragraph);
        Vibration.vibrate(VIBRATION_DURATION);
      }
    }, [addBookmark, selectedSermon, index, paragraph, isBookmarked]);

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
      <TouchableOpacity
        style={containerStyle}
        onLayout={handleLayout}
        onLongPress={copyToClipboard}
        onPress={handleTextPress}
        delayLongPress={LONG_PRESS_DELAY}
        activeOpacity={0.7}
        disabled={isCopying} // Prevent interaction while copying
      >
        <View style={styles.paragraphHeader}>
          <View style={styles.paragraphNumberContainer}>
            <Text style={paragraphNumberStyle}>{index + 1}</Text>
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
          </View>
         <Text style={[textStyle,{fontSize:responsiveFontSize(settings.fontSize),fontFamily:settings.fontFamily}]}>
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
            <Text style={[textStyle,{fontSize:responsiveFontSize(settings.fontSize),fontFamily:settings.fontFamily}]}
            
            >{processedText.text}</Text>
          )}
         </Text>
        </View>
      </TouchableOpacity>
    );
  }
);

// Add display name for debugging
ParagraphText.displayName = "ParagraphText";

export default ParagraphText;
