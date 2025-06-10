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

// Memoized text highlighting component for better performance
const HighlightedText = React.memo(
  ({ parts, searchPhrase, theme, settings }) => 
    
    (
    <>
      {parts.map((part, partIndex) =>
        part.toLowerCase() === searchPhrase.toLowerCase() ? (
          <Text
            key={`highlight-${partIndex}`}
            style={[
              styles.highlightedText,

              {
                color: theme.dark? "black" :"white",
                fontSize: settings.fontSize,
                fontFamily:settings.fontFamily || "ZillaSlab",
                borderRadius:10,
                backgroundColor: theme.dark
                  ? "white"
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
              fontFamily:settings.fontFamily
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
            style={[styles.endnoteText, { fontSize: settings.fontSize,fontFamily:settings.fontFamily,color:theme.dark ? theme.colors.hlight : "#5d3211" }]}
          >
            {part}
          </Text>
        );
      } else if (lowerPart.trim() === "william marrion branham") {
        return (
          <Text
            key={`wmb-${partIndex}`}
            style={[styles.endnoteText, { fontSize: settings.fontSize }]}
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
              fontSize: settings.fontSize,
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

    const [fontsLoaded] = useFonts({
        "ZillaSlab": require("../../assets/fonts/ZillaSlab-Regular.ttf"),
      });
    const [isCopying, setIsCopying] = useState(false);
    const lastTapTime = useRef(0);

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
          fontSize: settings.fontSize,
        },
      ],
      [theme.colors.text, settings.fontFamily, settings.fontSize]
    );

    const paragraphNumberStyle = useMemo(
      () => [styles.paragraphNumber, { color: theme.colors.text }],
      [theme.colors.text]
    );

    const containerStyle = useMemo(
      () => [styles.paragraphContainer, isCopying && styles.copyingParagraph],
      [isCopying]
    );

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

        const textToCopy = `https://hisvoice.tiiny.site/ \n${paragraph}${sermonInfo}`;
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
        onLayout={onLayout}
        onLongPress={copyToClipboard}
        onPress={handleTextPress}
        delayLongPress={LONG_PRESS_DELAY}
        activeOpacity={0.7}
        disabled={isCopying} // Prevent interaction while copying
      >
        <Text style={paragraphNumberStyle}>{index + 1}</Text>
        <Text
          style={textStyle}
          selectable={true}
          allowFontScaling={false} // Prevent accessibility font scaling issues
        >
          {renderTextContent()}
        </Text>
      </TouchableOpacity>
    );
  }
);

// Add display name for debugging
ParagraphText.displayName = "ParagraphText";

export default ParagraphText;
