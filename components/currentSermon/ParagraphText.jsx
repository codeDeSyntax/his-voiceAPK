import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { Text, View, Animated } from "react-native";
import * as Clipboard from "expo-clipboard";
import { styles } from "../../styles/currentsermon";
import { responsiveFontSize } from "../../Utils/responsiveUtils";
import { useAppContext } from "../../Logic/globalState";
import { parseEndnote, extractAllEndnotes } from "../../Utils/endnoteParser";

// Memoized highlight colors - calculate once
const HIGHLIGHT_COLORS = {
  yellow: { light: "#B88808", dark: "#D4A830" }, // warm honey/gold
  green: { light: "#4A7028", dark: "#88B060" }, // sage olive
  brown: { light: "#8A4820", dark: "#C08050" }, // sienna copper
  purple: { light: "#6A4870", dark: "#A87CA8" }, // dusty plum
  pink: { light: "#904848", dark: "#C08080" }, // dusty rose
  orange: { light: "#B85820", dark: "#D88040" }, // terracotta
};

// Map persisted settings values to runtime font keys loaded in App.js.
const resolveReaderFontFamily = (fontFamily) => {
  if (!fontFamily || fontFamily === "System") return undefined;
  if (fontFamily === "ZillaSlab-Regular") return "ZillaSlab";
  if (fontFamily === "ZillaSlab-SemiBold") return "ZillaSlabsm";
  return fontFamily;
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
  const resolvedFontFamily =
    resolveReaderFontFamily(settings?.fontFamily) || "ZillaSlab";

  // Pre-calculated highlight colors for better performance
  const highlightTextColors = {
    yellow: theme.dark ? "#E0B840" : "#8A6400", // golden amber
    green: theme.dark ? "#80B858" : "#3A6820", // olive green
    brown: theme.dark ? "#D09060" : "#8B4010", // sienna (reddish, distinct from default)
    purple: theme.dark ? "#B888C8" : "#6B3580", // plum purple
    pink: theme.dark ? "#D88898" : "#A03050", // crimson rose
    orange: theme.dark ? "#E08840" : "#C05818", // terracotta orange
  };

  // Determine text color based on highlight
  const defaultText = theme.dark ? "#f8efe8ff" : theme.colors.text;
  const baseTextColor = highlightColor
    ? highlightTextColors[highlightColor] || defaultText
    : defaultText;

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
              fontFamily: resolvedFontFamily,
              color: theme.dark ? "#FBBF24" : "#D97706", // Bright amber/orange text
              textShadowColor: theme.dark ? "#00000050" : "#FFFFFF80", // Subtle shadow for visibility
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
              lineHeight: Math.round(
                responsiveFontSize(settings.fontSize) * 1.55,
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
  const resolvedFontFamily =
    resolveReaderFontFamily(settings?.fontFamily) || "ZillaSlab";

  // Pre-calculated highlight colors for better performance
  const highlightTextColors = {
    yellow: theme.dark ? "#E0B840" : "#8A6400", // golden amber
    green: theme.dark ? "#80B858" : "#3A6820", // olive green
    brown: theme.dark ? "#D09060" : "#8B4010", // sienna (reddish, distinct from default)
    purple: theme.dark ? "#B888C8" : "#6B3580", // plum purple
    pink: theme.dark ? "#D88898" : "#A03050", // crimson rose
    orange: theme.dark ? "#E08840" : "#C05818", // terracotta orange
  };

  // Determine text color based on highlight
  const defaultText = theme.dark ? "#f8efe8ff" : theme.colors.text;
  const baseTextColor = highlightColor
    ? highlightTextColors[highlightColor] || defaultText
    : defaultText;

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
          // lineHeight: Math.round(responsiveFontSize(settings.fontSize) * 1.55),
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
                fontFamily: resolvedFontFamily,
                color: highlightColor
                  ? baseTextColor
                  : theme.dark
                    ? "#b37407"
                    : "#36240f", // Use highlight color or default amber/orange for numbers
                lineHeight: Math.round(
                  responsiveFontSize(settings.fontSize) * 1.55,
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
                fontFamily: resolvedFontFamily,
                color: baseTextColor, // Use highlight color or default text color
                lineHeight: Math.round(
                  responsiveFontSize(settings.fontSize) * 1.55,
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
            fontFamily: resolvedFontFamily,
            color: highlightColor
              ? baseTextColor
              : theme.dark
                ? "#b37407"
                : "#36240f", // Use highlight color or default amber/orange for numbers
            // fontWeight: "700", // Bold numbers
            lineHeight: Math.round(
              responsiveFontSize(settings.fontSize) * 1.55,
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
            fontFamily: resolvedFontFamily,
            color: baseTextColor, // Use highlight color or default text color
            lineHeight: Math.round(
              responsiveFontSize(settings.fontSize) * 1.55,
            ),
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
                responsiveFontSize(settings.fontSize) * 1.55,
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
                responsiveFontSize(settings.fontSize) * 1.55,
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
                    responsiveFontSize(settings.fontSize) * 1.55,
                  ),
                }}
              >
                {part}
              </Text>
            );
          } else if (/^william\s+(?:marrion\s+)?branham$/i.test(part)) {
            const titleText = (
              <Text
                key={`title-${partIndex}-${part.slice(0, 10)}`}
                style={{
                  fontSize: responsiveFontSize(settings.fontSize),
                  fontFamily: "ZillaSlab",
                  color: theme.dark ? "#FFFFFF" : "#000000",
                  textDecorationLine: "underline",
                  lineHeight: Math.round(
                    responsiveFontSize(settings.fontSize) * 1.55,
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
    const endnoteTapRef = useRef({ key: "", ts: 0 });

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
      const fontFamily =
        resolveReaderFontFamily(settings?.fontFamily) || "ZillaSlab";
      const lineHeight = Math.round(baseSize * 1.55); // Medium-style generous line spacing

      // Pre-calculated highlight colors for better performance
      const highlightTextColors = {
        yellow: theme.dark ? "#E0B840" : "#8A6400", // golden amber
        green: theme.dark ? "#80B858" : "#3A6820", // olive green
        brown: theme.dark ? "#D09060" : "#8B4010", // sienna (reddish, distinct from default)
        purple: theme.dark ? "#B888C8" : "#6B3580", // plum purple
        pink: theme.dark ? "#D88898" : "#A03050", // crimson rose
        orange: theme.dark ? "#E08840" : "#C05818", // terracotta orange
      };

      // Use highlight color if available, otherwise default text color
      const textColor = currentHighlight
        ? highlightTextColors[currentHighlight] ||
          (theme.dark ? "#f8efe8ff" : theme.colors.text)
        : theme.dark
          ? "#f8efe8ff"
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

    // Enhanced container style with
    //  selection mode - text color highlighting instead of background
    const containerStyle = useMemo(() => {
      const baseStyle = [styles.paragraphContainer];

      const highlightBgColors = {
        yellow: theme.dark ? "rgba(212,168,48,0.14)" : "rgba(184,136,8,0.11)",
        green: theme.dark ? "rgba(136,176,96,0.15)" : "rgba(74,112,40,0.11)",
        brown: theme.dark ? "rgba(192,128,80,0.14)" : "rgba(138,72,32,0.11)",
        purple: theme.dark ? "rgba(168,124,168,0.15)" : "rgba(106,72,112,0.11)",
        pink: theme.dark ? "rgba(192,128,128,0.15)" : "rgba(144,72,72,0.11)",
        orange: theme.dark ? "rgba(216,128,64,0.15)" : "rgba(184,88,32,0.11)",
      };

      const highlightBorderColors = {
        yellow: theme.dark ? "rgba(212,168,48,0.36)" : "rgba(184,136,8,0.32)",
        green: theme.dark ? "rgba(136,176,96,0.38)" : "rgba(74,112,40,0.32)",
        brown: theme.dark ? "rgba(192,128,80,0.36)" : "rgba(138,72,32,0.32)",
        purple: theme.dark ? "rgba(168,124,168,0.38)" : "rgba(106,72,112,0.32)",
        pink: theme.dark ? "rgba(192,128,128,0.38)" : "rgba(144,72,72,0.32)",
        orange: theme.dark ? "rgba(216,128,64,0.38)" : "rgba(184,88,32,0.32)",
      };

      if (currentHighlight) {
        baseStyle.push({
          backgroundColor:
            highlightBgColors[currentHighlight] ||
            (theme.dark ? "rgba(242,205,180,0.1)" : "rgba(93,50,17,0.08)"),
          borderWidth: 0,
          borderColor:
            highlightBorderColors[currentHighlight] ||
            (theme.dark ? "rgba(242,205,180,0.35)" : "rgba(93,50,17,0.32)"),
          borderRadius: 20,
          paddingLeft: 6,
        });
      }

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

      return baseStyle;
    }, [currentHighlight, theme.dark, theme.colors.hlight, isSelected]);

    // Memoize text processing for endnotes and titles (search removed)
    const processedText = useMemo(() => {
      // Require "Endnote:" (with colon) so we don't mistakenly classify paragraphs
      // that merely mention the word "endnote" in regular prose.
      const hasEndnote = paragraph.includes("Endnote:");
      // Match both "William Marrion Branham" and "William Branham"
      const hasWilliamBranham = /William\s+(?:Marrion\s+)?Branham/i.test(
        paragraph,
      );

      if (hasEndnote && hasWilliamBranham) {
        // Split on "Endnote" keyword OR any "William [Marrion] Branham" variant
        const parts = paragraph.split(
          /(Endnote|William\s+(?:Marrion\s+)?Branham)/gi,
        );
        // Collect ALL endnote and WMB indices
        const endnoteIndices = [];
        const branhamIndices = [];
        parts.forEach((p, i) => {
          const lower = p.toLowerCase();
          if (lower === "endnote") endnoteIndices.push(i);
          else if (/^william\s+(?:marrion\s+)?branham$/i.test(p))
            branhamIndices.push(i);
        });
        // Pair each Endnote with its nearest following WMB
        const regions = endnoteIndices.map((eIdx, i) => ({
          endnoteIdx: eIdx,
          branhamIdx: branhamIndices[i] ?? -1,
        }));
        const firstEndnoteIdx = endnoteIndices[0] ?? -1;
        const preEndnoteText = parts
          .slice(0, firstEndnoteIdx)
          .join("")
          .replace(/^\d+\.?\s*/, "")
          .trim();
        const isPureEndnote = preEndnoteText.length === 0;
        return {
          type: "endnote_with_title",
          parts,
          regions,
          isPureEndnote,
        };
      } else if (hasEndnote) {
        const parts = paragraph.split(/(Endnote)/gi);
        // Collect ALL endnote indices
        const endnoteIndices = [];
        parts.forEach((p, i) => {
          if (p.toLowerCase() === "endnote") endnoteIndices.push(i);
        });
        const firstEndnoteIdx = endnoteIndices[0] ?? -1;
        const preEndnoteText = parts
          .slice(0, firstEndnoteIdx)
          .join("")
          .replace(/^\d+\.?\s*/, "")
          .trim();
        const isPureEndnote = preEndnoteText.length === 0;
        return { type: "endnote", parts, endnoteIndices, isPureEndnote };
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
    // endnoteNumber identifies which endnote in the paragraph (0-based)
    const handleEndnoteClick = useCallback(
      (endnoteNumber = 0) => {
        if (!onEndnoteClick) return;

        const tapKey = `${selectedSermon?.id || ""}-${index}-${endnoteNumber}`;
        const now = Date.now();

        // Nested clickable Text spans can fire duplicate onPress events in quick
        // succession when selection is enabled; swallow near-duplicate taps.
        if (
          endnoteTapRef.current.key === tapKey &&
          now - endnoteTapRef.current.ts < 420
        ) {
          return;
        }
        endnoteTapRef.current = { key: tapKey, ts: now };

        console.log("[ParagraphText] Raw paragraph:", paragraph);
        const allEndnotes = extractAllEndnotes(paragraph);
        const endnoteData = allEndnotes[endnoteNumber] || allEndnotes[0];
        console.log(
          "[ParagraphText] Parsed endnote data:",
          endnoteData,
          "index:",
          endnoteNumber,
        );

        if (endnoteData) {
          // Let text selection/layout finish this frame before opening the
          // endnote sheet to avoid a visible viewport nudge.
          requestAnimationFrame(() => {
            onEndnoteClick(endnoteData, index, selectedSermon);
          });
        }
      },
      [paragraph, index, selectedSermon, onEndnoteClick],
    );

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
            .map((line) => ` ${line}`)
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

    const isLastRead = selectedSermon?.lastReadParagraph === index;

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
            {/* Last-read "Lr" superscript/subscript inline marker */}
            {isLastRead && (
              <Text style={{ color: accentColor, opacity: 0.75 }}>
                <Text
                  style={{
                    fontSize: responsiveFontSize(12),
                    fontFamily: "Merriweather",
                  }}
                >
                  L
                </Text>
                <Text
                  style={{
                    fontSize: responsiveFontSize(8),
                    fontFamily: "Merriweather",
                  }}
                >
                  r{" "}
                </Text>
              </Text>
            )}
            {/* Inline paragraph number */}
            <Text style={inlineNumberStyle}>{index + 1} </Text>
            {processedText.type === "endnote_with_title"
              ? processedText.parts.map((part, partIndex) => {
                  const { regions } = processedText;
                  // Link-like color: bright amber/orange in dark, rich brown in light
                  const linkColor = theme.dark ? "#f0b38b" : "#7a3b10";

                  // Determine which endnote region (if any) this part belongs to
                  let regionIndex = -1;
                  let isEndnoteWord = false;
                  let isBranhamToken = false;
                  let isAccentSection = false;

                  for (let r = 0; r < regions.length; r++) {
                    const { endnoteIdx, branhamIdx } = regions[r];
                    if (partIndex === endnoteIdx) {
                      regionIndex = r;
                      isEndnoteWord = true;
                      isAccentSection = true;
                      break;
                    } else if (partIndex === branhamIdx) {
                      regionIndex = r;
                      isBranhamToken = true;
                      break;
                    } else if (
                      partIndex > endnoteIdx &&
                      (branhamIdx === -1 || partIndex < branhamIdx)
                    ) {
                      regionIndex = r;
                      isAccentSection = true;
                      break;
                    }
                  }

                  const clickHandler =
                    regionIndex >= 0
                      ? () => handleEndnoteClick(regionIndex)
                      : () => handleEndnoteClick(0);

                  if (isAccentSection) {
                    // "Endnote" keyword + datecode/title — styled as a tappable link
                    return (
                      <Text
                        key={`acc-${partIndex}`}
                        onPress={clickHandler}
                        suppressHighlighting={false}
                        style={{
                          color: linkColor,
                          fontFamily:
                            resolveReaderFontFamily(settings?.fontFamily) ||
                            "ZillaSlab",
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
                          onPress={clickHandler}
                          suppressHighlighting={false}
                          style={{
                            color: linkColor,
                            fontFamily:
                              resolveReaderFontFamily(settings?.fontFamily) ||
                              "ZillaSlab",
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
                          onPress={clickHandler}
                          color={linkColor}
                          fontSize={responsiveFontSize(
                            (settings?.fontSize || 22) * 1.15,
                          )}
                        />
                      </React.Fragment>
                    );
                  } else {
                    // Normal body text (before/between/after endnote regions)
                    if (searchPhrase && searchPhrase.trim()) {
                      return (
                        <React.Fragment key={`norm-${partIndex}`}>
                          {renderTextWithStyledNumbers(
                            part,
                            theme,
                            settings,
                            `ewt-norm-${partIndex}`,
                            searchPhrase,
                            currentHighlight,
                          )}
                        </React.Fragment>
                      );
                    }
                    return (
                      <Text
                        key={`norm-${partIndex}`}
                        style={{
                          color: theme.dark ? theme.colors.text : "#000000",
                          fontFamily:
                            resolveReaderFontFamily(settings?.fontFamily) ||
                            "ZillaSlab",
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
                    const { endnoteIndices } = processedText;
                    // Check if this part is any of the endnote tokens
                    const endnoteNumber = endnoteIndices.indexOf(partIndex);
                    const isEndnoteWord = endnoteNumber !== -1;

                    if (isEndnoteWord) {
                      const clickHandler = () =>
                        handleEndnoteClick(endnoteNumber);
                      // "Endnote" keyword — link style + blinking finger after
                      return (
                        <React.Fragment key={`endnote-frag-${partIndex}`}>
                          <Text
                            key={`endnote-${partIndex}`}
                            onPress={clickHandler}
                            suppressHighlighting={false}
                            style={{
                              color: theme.dark
                                ? theme.colors.hlight
                                : "#7a3b10",
                              fontFamily:
                                resolveReaderFontFamily(settings?.fontFamily) ||
                                "ZillaSlab",
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
                            onPress={clickHandler}
                            color={theme.dark ? theme.colors.hlight : "#7a3b10"}
                            fontSize={responsiveFontSize(
                              (settings?.fontSize || 22) * 1.15,
                            )}
                          />
                        </React.Fragment>
                      );
                    } else {
                      // Apply search highlighting to non-keyword parts
                      if (searchPhrase && searchPhrase.trim()) {
                        return (
                          <React.Fragment key={`en-norm-${partIndex}`}>
                            {renderTextWithStyledNumbers(
                              part,
                              theme,
                              settings,
                              `en-norm-${partIndex}`,
                              searchPhrase,
                              currentHighlight,
                            )}
                          </React.Fragment>
                        );
                      }
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
