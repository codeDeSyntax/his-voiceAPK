import React, { useState, useRef } from "react";
import { 
  Text, 
  View, 
  TouchableOpacity, 
  ToastAndroid, 
  Platform, 
  Alert, 
  findNodeHandle, 
  UIManager,
  NativeModules
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { styles } from "../../styles/currentsermon";

const ParagraphText = ({
  paragraph,
  index,
  searchPhrase = "",
  theme,
  settings,
  onLayout = () => {},
  selectedSermon,
}) => {
  const [isCopying, setIsCopying] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const textRef = useRef(null);
  const lastTapTime = useRef(0);
  const doubleTapDelay = 300; // milliseconds

  // Function to copy paragraph to clipboard
  const copyToClipboard = async () => {
    try {
      setIsCopying(true);
      
      // Format the text to include sermon details
      const sermonInfo = selectedSermon 
        ? `\n\nFrom: "${selectedSermon.title}" - ${selectedSermon.date || 'No date available'}`
        : '';
      
      const textToCopy = `${paragraph}${sermonInfo}`;
      
      await Clipboard.setStringAsync(textToCopy);
      
      // Show feedback based on platform
      if (Platform.OS === 'android') {
        ToastAndroid.show('Paragraph copied to clipboard', ToastAndroid.SHORT);
      } else {
        // For iOS and other platforms
        Alert.alert('Copied', 'Paragraph copied to clipboard');
      }
    } catch (error) {
      console.error('Failed to copy text: ', error);
      
      // Show error feedback
      if (Platform.OS === 'android') {
        ToastAndroid.show('Failed to copy text', ToastAndroid.SHORT);
      } else {
        Alert.alert('Error', 'Failed to copy text');
      }
    } finally {
      setIsCopying(false);
    }
  };
  
  // Function to handle text selection via double tap
  const handleTextPress = () => {
    const now = Date.now();
    const isDoubleTap = (now - lastTapTime.current) < doubleTapDelay;
    
    lastTapTime.current = now;
    
    if (isDoubleTap && textRef.current) {
      setIsSelecting(true);
      selectTextMethod();
      
      // Reset selection state after a delay
      setTimeout(() => {
        setIsSelecting(false);
      }, 3000);
    }
  };
  
  // Method to select text based on platform
  const selectTextMethod = () => {
    if (textRef.current) {
      // The most reliable approach is to just set the selectable prop to true
      // and let the native selection behavior work
      
      // On Android, we can show a toast to guide the user
      // if (Platform.OS === 'android') {
      //   ToastAndroid.show('Text is now selectable', ToastAndroid.SHORT);
      // }
      
      // For iOS, we can try to use the selection API if available
      if (Platform.OS === 'ios' && NativeModules.RNSelection) {
        try {
          const reactTag = findNodeHandle(textRef.current);
          if (reactTag) {
            NativeModules.RNSelection.select(reactTag);
          }
        } catch (error) {
          console.log('Unable to programmatically select text', error);
        }
      }
    }
  };

  // Check if paragraph contains "Endnote"
  if (paragraph.includes("Endnote")) {
    const parts = paragraph.split(/(Endnote)/gi);
    return (
      <TouchableOpacity
        style={styles.paragraphContainer}
        onLayout={onLayout}
        id={`paragraph-${index}`}
        onLongPress={copyToClipboard}
        onPress={handleTextPress}
        delayLongPress={500} // Standard long press delay
        activeOpacity={0.7} // Visual feedback on press
      >
        <Text style={[styles.paragraphNumber, { color: theme.colors.text }]}>
          {index + 1}
        </Text>
        <Text
          ref={textRef}
          style={[
            styles.paragraphText,
            {
              color: theme.colors.text,
              fontFamily: settings.fontFamily,
              fontSize: settings.fontSize,
            },
          ]}
          selectable={true} // Make the text selectable
        >
          {parts.map((part, partIndex) =>
            part.toLowerCase() === "endnote" ? (
              <Text
                key={`endnote-${partIndex}`}
                style={[styles.endnoteText, { fontSize: settings.fontSize }]}
              >
                {part}
              </Text>
            ) : part.toLowerCase().trim() === "William Marrion Branham" ? (
              <>
                <Text
                  key={`wmb-${partIndex}`}
                  style={[styles.endnoteText, { fontSize: settings.fontSize }]}
                >
                  {part}
                </Text>
              </>
            ) : (
              <Text
                key={`text-${partIndex}`}
                style={{
                  color: theme.colors.text,
                  fontSize: settings.fontSize,
                }}
              >
                {part}
              </Text>
            )
          )}
        </Text>
      </TouchableOpacity>
    );
  }

  // If no search phrase, just render the normal paragraph
  if (!searchPhrase) {
    return (
      <TouchableOpacity
        style={[
          styles.paragraphContainer,
          isCopying && styles.copyingParagraph
        ]}
        onLayout={onLayout}
        id={`paragraph-${index}`}
        onLongPress={copyToClipboard}
        onPress={handleTextPress}
        delayLongPress={500}
        activeOpacity={0.7}
      >
        <Text style={[styles.paragraphNumber, { color: theme.colors.text }]}>
          {index + 1}
        </Text>
        <Text
          ref={textRef}
          style={[
            styles.paragraphText,
            { 
              color: theme.colors.text, 
              fontFamily: settings.fontFamily,
              fontSize: settings.fontSize 
            },
            isSelecting && styles.textSelectable
          ]}
          selectable={true}
        >
          {paragraph}
        </Text>
      </TouchableOpacity>
    );
  }

  // For search results, highlight matching text
  const parts = paragraph.split(new RegExp(`(${searchPhrase})`, "gi"));
  return (
    <TouchableOpacity
      style={[
        styles.paragraphContainer,
        isCopying && styles.copyingParagraph
      ]}
      onLayout={onLayout}
      id={`paragraph-${index}`}
      onLongPress={copyToClipboard}
      onPress={handleTextPress}
      delayLongPress={500}
      activeOpacity={0.7}
    >
      <Text style={[styles.paragraphNumber, { color: theme.colors.text }]}>
        {index + 1}
      </Text>
      <Text
        ref={textRef}
        style={[
          styles.paragraphText,
          { 
            color: theme.colors.text, 
            fontFamily: settings.fontFamily,
            fontSize: settings.fontSize 
          },
        ]}
        selectable={true}
      >
        {parts.map((part, partIndex) =>
          part.toLowerCase() === searchPhrase.toLowerCase() ? (
            <Text
              key={`highlight-${partIndex}`}
              style={[styles.highlightedText, { color: theme.colors.text, fontSize: settings.fontSize }]}
            >
              {part}
            </Text>
          ) : (
            <Text
              key={`text-${partIndex}`}
              style={{ color: theme.colors.text, fontSize: settings.fontSize }}
            >
              {part}
            </Text>
          )
        )}
      </Text>
    </TouchableOpacity>
  );
};

export default ParagraphText;