import React from "react";
import { Text, View } from "react-native";
import { styles } from "../../styles/currentsermon";

const ParagraphText = ({
  paragraph,
  index,
  searchPhrase = "",
  theme,
  settings,
  onLayout = () => {},
}) => {
  // Check if paragraph contains "Endnote"
  if (paragraph.includes("Endnote")) {
    const parts = paragraph.split(/(Endnote)/gi);
    return (
      <View
        style={styles.paragraphContainer}
        onLayout={onLayout}
        id={`paragraph-${index}`}
      >
        <Text style={[styles.paragraphNumber, { color: theme.colors.text }]}>
          {index + 1}
        </Text>
        <Text
          style={[
            styles.paragraphText,
            {
              color: theme.colors.text,
              fontFamily: settings.fontFamily,
              fontSize: settings.fontSize,
            },
          ]}
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
      </View>
    );
  }

  // If no search phrase, just render the normal paragraph
  if (!searchPhrase) {
    return (
      <View
        style={styles.paragraphContainer}
        onLayout={onLayout}
        id={`paragraph-${index}`}
      >
        <Text style={[styles.paragraphNumber, { color: theme.colors.text }]}>
          {index + 1}
        </Text>
        <Text
          style={[
            styles.paragraphText,
            { color: theme.colors.text, fontFamily: settings.fontFamily,fontSize: settings.fontSize },
          ]}
        >
          {paragraph}
        </Text>
      </View>
    );
  }

  // For search results, highlight matching text
  const parts = paragraph.split(new RegExp(`(${searchPhrase})`, "gi"));
  return (
    <View
      style={styles.paragraphContainer}
      onLayout={onLayout}
      id={`paragraph-${index}`}
    >
      <Text style={[styles.paragraphNumber, { color: theme.colors.text }]}>
        {index + 1}
      </Text>
      <Text
        style={[
          styles.paragraphText,
          { color: theme.colors.text, fontFamily: settings.fontFamily },
        ]}
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
              style={{ color: theme.colors.text,fontSize: settings.fontSize }}
            >
              {part}
            </Text>
          )
        )}
      </Text>
    </View>
  );
};

export default ParagraphText;
