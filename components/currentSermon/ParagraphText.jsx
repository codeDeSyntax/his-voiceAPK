import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { Text, View, Animated } from "react-native";
import * as Clipboard from "expo-clipboard";
import { styles } from "../../styles/currentsermon";
import { responsiveFontSize } from "../../Utils/responsiveUtils";
import { useAppContext } from "../../Logic/globalState";
import { parseEndnote } from "../../Utils/endnoteParser";

// Memoized highlight colors - calculate once
const HIGHLIGHT_COLORS = {
  yellow: { light: "#FEF08A", dark: "#FBBF2499" },
  green: { light: "#BBF7D0", dark: "#34D39999" },
  brown: { light: "#D2B48C", dark: "#8B7355" },
  purple: { light: "#DDD6FE", dark: "#C084FC99" },
  pink: { light: "#FBCFE8", dark: "#F472B699" },
  orange: { light: "#FED7AA", dark: "#FB923C99" },
};

// Helper function to render text with styled numbers
const renderTextWithStyledNumbers = (
  text,
  theme,
  settings,
  key = "",
  searchPhrase = "",
  highlightColor = null,
) => {
  // Pre-calculated highlight colors for better performance
  const highlightTextColors = {
    yellow: theme.dark ? "#FCD34D" : "#F59E0B", // Amber
    green: theme.dark ? "#34D399" : "#059669", // Emerald
    brown: theme.dark ? "#D2B48C" : "#8B4513", // Brown
    purple: theme.dark ? "#C084FC" : "#7C3AED", // Violet
    pink: theme.dark ? "#F472B6" : "#DB2777", // Pink
    orange: theme.dark ? "#FB923C" : "#EA580C", // Orange
  };

  // Determine text color based on highlight
  const baseTextColor = highlightColor
    ? highlightTextColors[highlightColor] || theme.colors.text
    : theme.colors.text;

  // If there's a search phrase, first highlight it
  if (searchPhrase && searchPhrase.trim()) {
    const regex = new RegExp(
      `(${searchPhrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    const parts = text.split(regex);

    return parts.map((part, partIndex) => {
      // Odd indices are captured groups (the matches) — much more reliable
      // than regex.test(part) which is stateful with the 'g' flag.
      const isMatch = partIndex % 2 === 1;

      if (isMatch) {
        // This is the search match - render with text color highlight
        return (
          <Text
            key={`${key}-search-${partIndex}-${part.slice(0, 5)}`}
            style={{
              fontSize: responsiveFontSize(settings.fontSize),
              fontFamily: "ZillaSlabsm",
              color: theme.dark ? "#FBBF24" : "#D97706", // Bright amber/orange text
              textShadowColor: theme.dark ? "#00000050" : "#FFFFFF80", // Subtle shadow for visibility
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
              lineHeight: Math.round(
                responsiveFontSize(settings.fontSize) * 1.4, // Tighter line height
              ),
            }}
          >
            {part}
          </Text>
        );
      } else {
        // Regular text - apply number styling with highlight consideration
        return renderTextWithStyledNumbersOnly(
          part,
          theme,
          settings,
          `${key}-${partIndex}`,
          highlightColor,
        );
      }
    });
  } else {
    // No search phrase - use original function with highlight color
    return renderTextWithStyledNumbersOnly(
      text,
      theme,
      settings,
      key,
      highlightColor,
    );
  }
};

// Original function renamed for internal use
const renderTextWithStyledNumbersOnly = (
  text,
  theme,
  settings,
  key = "",
  highlightColor = null,
) => {
  // Pre-calculated highlight colors for better performance
  const highlightTextColors = {
    yellow: theme.dark ? "#FCD34D" : "#F59E0B", // Amber
    green: theme.dark ? "#34D399" : "#059669", // Emerald
    brown: theme.dark ? "#D2B48C" : "#8B4513", // Brown
    purple: theme.dark ? "#C084FC" : "#7C3AED", // Violet
    pink: theme.dark ? "#F472B6" : "#DB2777", // Pink
    orange: theme.dark ? "#FB923C" : "#EA580C", // Orange
  };

  // Determine text color based on highlight
  const baseTextColor = highlightColor
    ? highlightTextColors[highlightColor] || theme.colors.text
    : theme.colors.text;

  // Split text by numbers (including decimals, dates, times, etc.)
  const numberRegex = /(\d+(?:\.\d+)?(?::\d+)?(?:\s*(?:AM|PM|am|pm))?)/g;

  // Check if text starts with a paragraph number pattern (number followed by period and space)
  const paragraphNumberMatch = text.match(/^(\d+)\.\s+(.*)$/);

  if (paragraphNumberMatch) {
    const [, paragraphNumber, remainingText] = paragraphNumberMatch;

    // Render paragraph number with special styling, then process the rest normally
    const restParts = remainingText.split(numberRegex);

    return [
      // Paragraph number with special italic styling and theme color
      <Text
        key={`${key}-paragraph-number`}
        style={{
          fontSize: responsiveFontSize(80),
          fontFamily: "Serif",
          color: theme.dark ? theme.colors.hlight : "#5d3211", // Theme-appropriate color
          // fontStyle: "italic", // Italics for paragraph numbers
          // fontWeight: "bold", // Slightly bold
          // lineHeight: Math.round(responsiveFontSize(settings.fontSize) * 1.4), // Restored to 1.4 for readability
        }}
      >
        {paragraphNumber}.{" "}
      </Text>,
      // Process the remaining text normally
      ...restParts.map((part, index) => {
        const isNumber = numberRegex.test(part);

        if (isNumber) {
          return (
            <Text
              key={`${key}-number-${index}-${part.slice(0, 5)}`}
              style={{
                fontSize: responsiveFontSize(settings.fontSize),
                fontFamily: settings.fontFamily || "ZillaSlab",
                color: highlightColor
                  ? baseTextColor
                  : theme.dark
                    ? "#b37407"
                    : "#36240f", // Use highlight color or default amber/orange for numbers
                lineHeight: Math.round(
                  responsiveFontSize(settings.fontSize) * 1.4, // Tighter line height
                ),
              }}
            >
              {part}
            </Text>
          );
        } else {
          return (
            <Text
              key={`${key}-text-${index}-${part.slice(0, 10)}`}
              style={{
                fontSize: responsiveFontSize(settings.fontSize),
                fontFamily: settings.fontFamily || "ZillaSlab",
                color: baseTextColor, // Use highlight color or default text color
                lineHeight: Math.round(
                  responsiveFontSize(settings.fontSize) * 1.4, // Tighter line height
                ),
              }}
            >
              {part}
            </Text>
          );
        }
      }),
    ];
  }

  // If no paragraph number at start, process normally
  const parts = text.split(numberRegex);

  return parts.map((part, index) => {
    const isNumber = numberRegex.test(part);

    if (isNumber) {
      return (
        <Text
          key={`${key}-number-${index}-${part.slice(0, 5)}`}
          style={{
            fontSize: responsiveFontSize(settings.fontSize),
            fontFamily: settings.fontFamily || "ZillaSlab",
            color: highlightColor
              ? baseTextColor
              : theme.dark
                ? "#b37407"
                : "#36240f", // Use highlight color or default amber/orange for numbers
            // fontWeight: "700", // Bold numbers
            lineHeight: Math.round(responsiveFontSize(settings.fontSize) * 1.4), // Restored to 1.4 for readability
          }}
        >
          {part}
        </Text>
      );
    } else {
      return (
        <Text
          key={`${key}-text-${index}-${part.slice(0, 10)}`}
          style={{
            fontSize: responsiveFontSize(settings.fontSize),
            fontFamily: settings.fontFamily || "ZillaSlab",
            color: baseTextColor, // Use highlight color or default text color
            lineHeight: Math.round(responsiveFontSize(settings.fontSize) * 1.4), // Restored to 1.4 for readability
          }}
        >
          {part}
        </Text>
      );
    }
  });
};

// Memoized endnote text component - with number styling and search highlighting
const EndnoteText = React.memo(({ parts, theme, settings, searchPhrase }) => (
  <>
    {parts.map((part, partIndex) => {
      const lowerPart = part.toLowerCase();
      if (lowerPart === "endnote") {
        return (
          <Text
            key={`endnote-${partIndex}-${part.slice(0, 10)}`}
            style={{
              fontSize: responsiveFontSize(settings.fontSize),
              fontFamily: "ZillaSlab",
              color: theme.dark ? theme.colors.hlight : "#5d3211",
              textDecorationLine: "underline",
              lineHeight: Math.round(
                responsiveFontSize(settings.fontSize) * 1.4, // Tighter line height
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
              fontFamily: "ZillaSlab",
              color: theme.dark ? theme.colors.hlight : "#5d3211",
              textDecorationLine: "underline",
              lineHeight: Math.round(
                responsiveFontSize(settings.fontSize) * 1.4, // Tighter line height
              ),
            }}
          >
            {part}
          </Text>
        );
      } else {
        return renderTextWithStyledNumbers(
          part,
          theme,
          settings,
          `endnote-${partIndex}`,
          searchPhrase,
          null, // No highlight color for endnotes
        );
      }
    })}
  </>
));

// Memoized endnote with title component - handles title text between Endnote and William Marrion Branham with number styling and search highlighting
const EndnoteWithTitleText = React.memo(
  ({ parts, theme, settings, searchPhrase }) => {
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
                  fontFamily: "ZillaSlab",
                  color: theme.dark ? theme.colors.hlight : "#5d3211",
                  textDecorationLine: "underline",
                  lineHeight: Math.round(
                    responsiveFontSize(settings.fontSize) * 1.4,
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
                  fontFamily: "ZillaSlab",
                  color: theme.dark ? "#FFFFFF" : "#000000",
                  textDecorationLine: "underline",
                  lineHeight: Math.round(
                    responsiveFontSize(settings.fontSize) * 1.4,
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
            return renderTextWithStyledNumbers(
              part,
              theme,
              settings,
              `title-${partIndex}`,
              searchPhrase,
              null, // No highlight color for title sections
            );
          } else {
            // Regular text (before Endnote or after William Marrion Branham)
            return renderTextWithStyledNumbers(
              part,
              theme,
              settings,
              `regular-${partIndex}`,
              searchPhrase,
              null, // No highlight color for endnote sections
            );
          }
        })}
      </>
    );
  },
);

// Module-level mutex — prevents every mounted paragraph firing simultaneously

// Standalone blinking finger — uses Animated opacity so it never triggers a
// JS re-render on the parent Text while the user has a text selection active.
// (The old useState/setInterval approach re-rendered the parent Text every 550ms,
// resetting the selection handles each time.)
const BlinkingFinger = ({ onPress, color, fontSize }) => {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.08,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 520,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.Text
      onPress={onPress}
      style={{ color, fontSize, fontWeight: "700", opacity }}
    >
      {" \u261E"}
    </Animated.Text>
  );
};
// when the user copies selected text (only the first one to acquire it acts).
let _clipboardBusy = false;

const ParagraphText = React.memo(
  ({
    paragraph,
    index,
    theme,
    settings,
    onLayout,
    selectedSermon,
    searchPhrase,
    isSelected = false,
    onParagraphClick,
    onEndnoteClick,
  }) => {
    const { highlights } = useAppContext();

    // Check if this paragraph is highlighted - optimized with direct highlights access
    const currentHighlight = useMemo(() => {
      const highlightKey = `${selectedSermon.id}-${index}`;
      // Direct access to highlights from context instead of using getHighlight
      const highlight = highlights[highlightKey] || null;
      return highlight;
    }, [selectedSermon.id, index, highlights]); // Use highlights directly for better reactivity

    // Optimized text style with highlight color support - memoized for performance
    const textStyle = useMemo(() => {
      const baseSize = responsiveFontSize(settings?.fontSize || 22);
      const fontFamily = settings?.fontFamily || "ZillaSlab";
      const lineHeight = Math.round(baseSize * 1.4); // Restored to 1.4 for better text readability

      // Pre-calculated highlight colors for better performance
      const highlightTextColors = {
        yellow: theme.dark ? "#FCD34D" : "#F59E0B", // Amber
        green: theme.dark ? "#34D399" : "#059669", // Emerald
        brown: theme.dark ? "#D2B48C" : "#8B4513", // Brown
        purple: theme.dark ? "#C084FC" : "#7C3AED", // Violet
        pink: theme.dark ? "#F472B6" : "#DB2777", // Pink
        orange: theme.dark ? "#FB923C" : "#EA580C", // Orange
      };

      // Use highlight color if available, otherwise default text color
      const textColor = currentHighlight
        ? highlightTextColors[currentHighlight] || theme.colors.text
        : theme.colors.text;

      return [
        styles.paragraphText,
        {
          color: textColor,
          fontFamily: fontFamily,
          fontSize: baseSize,
          lineHeight: lineHeight,
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
      [theme.colors.text],
    );

    // Enhanced container style with selection mode - text color highlighting instead of background
    const containerStyle = useMemo(() => {
      const baseStyle = [styles.paragraphContainer];

      // Selected state - add underline effect
      if (isSelected) {
        baseStyle.push({
          // borderWidth: 2,
          borderColor: theme.dark ? "#fee2d072" : "#d57a3e",
          backgroundColor: theme.dark
            ? "rgba(213, 122, 62, 0.08)"
            : "rgba(213, 122, 62, 0.06)",
          marginBottom: 12,
          borderRadius: 5,
          borderStyle: "dashed",
        });
      }

      // Add visual indicator if this is the last read paragraph
      if (selectedSermon?.lastReadParagraph === index) {
        baseStyle.push({
          // borderWidth: 2,
          borderStyle: "dashed",
          border: theme.dark ? "#faeed1" : "#6b320bff",
          backgroundColor: theme.dark
            ? "rgba(213, 122, 62, 0.08)"
            : "rgba(213, 122, 62, 0.06)",
          marginBottom: 12,
          borderRadius: 10,
        });
      }

      return baseStyle;
    }, [
      currentHighlight,
      theme.dark,
      theme.colors.hlight,
      selectedSermon?.lastReadParagraph,
      index,
      isSelected,
    ]);

    // Memoize text processing for endnotes and titles (search removed)
    const processedText = useMemo(() => {
      // Require "Endnote:" (with colon) so we don't mistakenly classify paragraphs
      // that merely mention the word "endnote" in regular prose.
      const hasEndnote = paragraph.includes("Endnote:");
      const hasWilliamBranham = paragraph.includes("William Marrion Branham");

      if (hasEndnote && hasWilliamBranham) {
        const parts = paragraph.split(/(Endnote|William Marrion Branham)/gi);
        const endnoteIdx = parts.findIndex(
          (p) => p.toLowerCase() === "endnote",
        );
        const branhamIdx = parts.findIndex(
          (p) => p.toLowerCase() === "william marrion branham",
        );
        // isPureEndnote = true when there is no substantive text before "Endnote:"
        // (only a paragraph number like "53" or whitespace is acceptable)
        const preEndnoteText = parts
          .slice(0, endnoteIdx)
          .join("")
          .replace(/^\d+\.?\s*/, "") // strip leading paragraph number
          .trim();
        const isPureEndnote = preEndnoteText.length === 0;
        return {
          type: "endnote_with_title",
          parts,
          endnoteIdx,
          branhamIdx,
          isPureEndnote,
        };
      } else if (hasEndnote) {
        const parts = paragraph.split(/(Endnote)/gi);
        const endnoteIdx = parts.findIndex(
          (p) => p.toLowerCase() === "endnote",
        );
        const preEndnoteText = parts
          .slice(0, endnoteIdx)
          .join("")
          .replace(/^\d+\.?\s*/, "")
          .trim();
        const isPureEndnote = preEndnoteText.length === 0;
        return { type: "endnote", parts, endnoteIdx, isPureEndnote };
      } else {
        return { type: "normal", text: paragraph };
      }
    }, [paragraph]);

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
      [onLayout],
    );

    // Handle endnote click — extract endnote data and trigger callback
    const handleEndnoteClick = useCallback(() => {
      if (!onEndnoteClick) return;

      console.log("[ParagraphText] Raw paragraph:", paragraph);
      const endnoteData = parseEndnote(paragraph);
      console.log("[ParagraphText] Parsed endnote data:", endnoteData);

      if (endnoteData) {
        onEndnoteClick(endnoteData, index, selectedSermon);
      }
    }, [paragraph, index, selectedSermon, onEndnoteClick]);

    // Clipboard listener: when the user selects & copies any piece of this
    // paragraph, we prepend the sermon title + paragraph number automatically.
    useEffect(() => {
      if (typeof Clipboard.addClipboardListener !== "function") return;
      const subscription = Clipboard.addClipboardListener(async () => {
        if (_clipboardBusy) return;
        const content = await Clipboard.getStringAsync();
        if (!content || content.length < 5) return;
        // Skip if it already has our attribution prefix
        if (content.startsWith('"') && content.includes("\nP⟫")) return;
        // Only act if the copied text belongs to this paragraph
        if (!paragraph.includes(content.trim())) return;
        _clipboardBusy = true;
        try {
          const title = selectedSermon?.title ?? "Sermon";
          const date = selectedSermon?.date ? ` · ${selectedSermon.date}` : "";
          const quotedContent = content
            .split("\n")
            .map((line) => `> ${line}`)
            .join("\n");

          await Clipboard.setStringAsync(
            `_${title}_\n` +
              `\`⁋${index + 1}»${selectedSermon.year}\` *Robert Lambert Lee*\n\n` +
              quotedContent,
          );
        } finally {
          setTimeout(() => {
            _clipboardBusy = false;
          }, 500);
        }
      });
      return () => subscription.remove();
    }, [paragraph, index, selectedSermon]);

    // Render text content based on type
    const renderTextContent = useCallback(() => {
      switch (processedText.type) {
        case "endnote_with_title":
          return (
            <EndnoteWithTitleText
              parts={processedText.parts}
              theme={theme}
              settings={settings}
              searchPhrase={searchPhrase}
            />
          );
        case "endnote":
          return (
            <EndnoteText
              parts={processedText.parts}
              theme={theme}
              settings={settings}
              searchPhrase={searchPhrase}
            />
          );
        default:
          return processedText.text;
      }
    }, [processedText, theme, settings, searchPhrase]);

    // Selection highlight colour — warm amber/brown matching the app palette.
    // Flows through to TextView.setHighlightColor() on Android; on iOS it
    // sets the UITextView selection bar colour via tintColor.
    const selectionColor = theme.dark
      ? "rgba(213, 122, 62, 0.45)" // warm orange, dark mode
      : "rgba(93, 50, 17, 0.3)"; // deep brown, light mode

    // ── Inline paragraph number style (flows with text) ────────────────────
    const accentColor = theme.dark ? "#fab17a" : "#5d3211";
    // System font (no fontFamily) so fontWeight:"700" renders properly —
    // ZillaSlab does not ship a bold variant, so bold has no effect on it.
    const inlineNumberStyle = {
      fontSize: responsiveFontSize(30),
      fontWeight: "100",
      opacity: 0.8,
      color: accentColor,
      fontFamily: "System",
      // lineHeight: Math.round(
      //   responsiveFontSize(settings?.fontSize || 22) * 1.4,
      // ),
    };

    return (
      <View style={containerStyle} onLayout={handleLayout}>
        {/* ── Single text column — number is inline ── */}
        <View style={styles.selectableTextContainer}>
          <Text
            style={textStyle}
            selectable={true}
            selectionColor={selectionColor}
            dataDetectorType="none"
            allowFontScaling={false}
          >
            {/* Inline paragraph number */}
            <Text style={inlineNumberStyle}>{index + 1} </Text>
            {processedText.type === "endnote_with_title"
              ? processedText.parts.map((part, partIndex) => {
                  const { endnoteIdx, branhamIdx } = processedText;
                  // Accent section: from the "Endnote" token (inclusive) up to
                  // "William Marrion Branham" token (exclusive).
                  // Text BEFORE "Endnote" and WMB + everything after → normal.
                  const isBeforeEndnote =
                    endnoteIdx !== -1 && partIndex < endnoteIdx;
                  const isAtOrAfterBranham =
                    branhamIdx !== -1 && partIndex >= branhamIdx;
                  const isEndnoteWord = partIndex === endnoteIdx;
                  const isAccentSection =
                    !isBeforeEndnote && !isAtOrAfterBranham;

                  const isBranhamToken = partIndex === branhamIdx;

                  // Link-like color: bright amber/orange in dark, rich brown in light
                  const linkColor = theme.dark ? "#f0b38b" : "#7a3b10";

                  if (isAccentSection) {
                    // "Endnote" keyword + datecode/title — styled as a tappable link
                    return (
                      <Text
                        key={`acc-${partIndex}`}
                        onPress={handleEndnoteClick}
                        suppressHighlighting={false}
                        style={{
                          color: linkColor,
                          fontFamily: settings?.fontFamily || "ZillaSlab",
                          fontSize: responsiveFontSize(
                            settings?.fontSize || 22,
                          ),
                          fontWeight: isEndnoteWord ? "700" : "400",
                          textDecorationLine: "underline",
                        }}
                      >
                        {part}
                      </Text>
                    );
                  } else if (isBranhamToken) {
                    // "William Marrion Branham" + blinking finger
                    return (
                      <React.Fragment key={`wmb-${partIndex}`}>
                        <Text
                          onPress={handleEndnoteClick}
                          suppressHighlighting={false}
                          style={{
                            color: linkColor,
                            fontFamily: settings?.fontFamily || "ZillaSlab",
                            fontSize: responsiveFontSize(
                              settings?.fontSize || 22,
                            ),
                            fontWeight: "700",
                            textDecorationLine: "underline",
                          }}
                        >
                          {part}
                        </Text>
                        <BlinkingFinger
                          onPress={handleEndnoteClick}
                          color={linkColor}
                          fontSize={responsiveFontSize(
                            (settings?.fontSize || 22) * 1.15,
                          )}
                        />
                      </React.Fragment>
                    );
                  } else {
                    // Pre-Endnote text and the quote after WMB — normal body text
                    return (
                      <Text
                        key={`norm-${partIndex}`}
                        style={{
                          color: theme.dark ? theme.colors.text : "#000000",
                          fontFamily: settings?.fontFamily || "ZillaSlab",
                          fontSize: responsiveFontSize(
                            settings?.fontSize || 22,
                          ),
                        }}
                      >
                        {part}
                      </Text>
                    );
                  }
                })
              : processedText.type === "endnote"
                ? processedText.parts.map((part, partIndex) => {
                    const { endnoteIdx } = processedText;
                    const isEndnoteWord = partIndex === endnoteIdx;

                    if (isEndnoteWord) {
                      // "Endnote" keyword — link style + blinking finger after
                      return (
                        <React.Fragment key={`endnote-frag-${partIndex}`}>
                          <Text
                            key={`endnote-${partIndex}`}
                            onPress={handleEndnoteClick}
                            suppressHighlighting={false}
                            style={{
                              color: theme.dark
                                ? theme.colors.hlight
                                : "#7a3b10",
                              fontFamily: settings?.fontFamily || "ZillaSlab",
                              fontSize: responsiveFontSize(
                                settings?.fontSize || 22,
                              ),
                              fontWeight: "700",
                              textDecorationLine: "underline",
                            }}
                          >
                            {part}
                          </Text>
                          <BlinkingFinger
                            onPress={handleEndnoteClick}
                            color={theme.dark ? theme.colors.hlight : "#7a3b10"}
                            fontSize={responsiveFontSize(
                              (settings?.fontSize || 22) * 1.15,
                            )}
                          />
                        </React.Fragment>
                      );
                    } else {
                      return part;
                    }
                  })
                : renderTextWithStyledNumbers(
                    processedText.text,
                    theme,
                    settings,
                    "normal",
                    searchPhrase,
                    currentHighlight,
                  )}
          </Text>
        </View>
      </View>
    );
  },
);

// Add display name for debugging
ParagraphText.displayName = "ParagraphText";

export default ParagraphText;
