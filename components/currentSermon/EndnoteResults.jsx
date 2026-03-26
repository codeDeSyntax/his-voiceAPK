import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Animated,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useAppContext } from "../../Logic/globalState";
import { getSermonContent, resolveSermonNumericId } from "../../Logic/branhamApi";

// ── Skeleton loader — mimics the result layout while loading ──────────────
const SkeletonBar = ({ width, height = 10, style, shimmerAnim, theme }) => {
  const isDark = theme.dark;
  const baseColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(93,50,17,0.06)";
  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });
  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: height / 2,
          backgroundColor: baseColor,
          opacity: shimmerOpacity,
        },
        style,
      ]}
    />
  );
};

const SkeletonResultItem = ({ shimmerAnim, theme, delay = 0 }) => {
  const isDark = theme.dark;
  const sep = isDark ? "rgba(255,255,255,0.04)" : "rgba(93,50,17,0.04)";
  // Offset the shimmer for each item for a cascading effect
  const offset = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: delay === 0 ? [0.3, 1, 0.3] : delay === 1 ? [0.6, 0.3, 1] : [1, 0.3, 0.6],
  });
  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      {/* Date pill + badge row */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <SkeletonBar width={72} height={16} shimmerAnim={shimmerAnim} theme={theme} style={{ borderRadius: 10 }} />
        <SkeletonBar width={48} height={12} shimmerAnim={shimmerAnim} theme={theme} />
      </View>
      {/* Title line */}
      <SkeletonBar width="85%" height={13} shimmerAnim={shimmerAnim} theme={theme} style={{ marginBottom: 6 }} />
      {/* Subtitle line */}
      <SkeletonBar width="60%" height={11} shimmerAnim={shimmerAnim} theme={theme} />
      {/* Separator */}
      <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: sep, marginTop: 14 }} />
    </View>
  );
};

const SearchLoader = ({ theme }) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={{ flex: 1, paddingTop: 4 }}>
      <SkeletonResultItem shimmerAnim={shimmer} theme={theme} delay={0} />
      <SkeletonResultItem shimmerAnim={shimmer} theme={theme} delay={1} />
      <SkeletonResultItem shimmerAnim={shimmer} theme={theme} delay={2} />
    </View>
  );
};

// ── Extract highlighted phrase verbatim from API Fragment HTML ─────────────
// The API wraps matched tokens in <span class="hit-snippet-highlight">.
// For ExactPhrase we extract the complete contiguous highlighted sequence
// (including punctuation like em-dashes between consecutive spans) so we
// get the exact text as stored in the database — correct case, punctuation, etc.
const extractHighlightedPhrase = (fragment) => {
  if (!fragment) return null;
  const spanRe = /<span class="hit-snippet-highlight">([\s\S]*?)<\/span>/g;
  let match;
  let phrase = "";
  let lastEnd = 0;

  while ((match = spanRe.exec(fragment)) !== null) {
    const between = fragment.slice(lastEnd, match.index);
    if (phrase.length > 0) {
      // Only continue the phrase if the gap between spans is punctuation / no plain word
      if (/^[\s\u2014\u2013\-—–,.:;!?"'()]*$/.test(between)) {
        phrase += between + match[1];
      } else {
        break; // non-punctuation gap means the phrase ended
      }
    } else {
      phrase = match[1];
    }
    lastEnd = spanRe.lastIndex;
  }
  return phrase.trim() || null;
};

// ── Highlight search terms in text ─────────────────────────────────────────
const HighlightedText = ({
  text,
  searchQuery,
  theme,
  style = {},
  searchType = "AllWords",
  prefix = null,
  prefixStyle = {},
}) => {
  if (!text) return null;

  const isDark = theme.dark;
  const normalFg = isDark ? "rgba(255,255,255,0.85)" : "#3a1f08";
  const highlightBg = isDark ? "#5d321170" : "#5d321125";
  const highlightFg = isDark ? "#f8e3d5" : "#5d3211";

  if (!searchQuery) {
    return (
      <Text style={[styles.fragmentText, style, { color: normalFg }]}>
        {prefix ? <Text style={prefixStyle}>{prefix}</Text> : null}
        {text}
      </Text>
    );
  }

  // Escape regex special chars, then replace straight apostrophe with a class
  // that also matches curly/fancy apostrophes so normalised queries hit both.
  const escapeAndApostrophe = (s) =>
    s
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/'/g, "[\u2018\u2019\u201A\u201B\u02BC\u02BB']");

  let regex;
  if (searchType === "ExactPhrase") {
    const escaped = escapeAndApostrophe(searchQuery);
    regex = new RegExp(`(${escaped})`, "gi");
  } else {
    const words = searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 0)
      .map(escapeAndApostrophe);
    regex = new RegExp(`(${words.join("|")})`, "gi");
  }

  // Normalise apostrophes for comparison (straight) so isMatch works
  const normaliseApostrophe = (s) =>
    s.replace(/[\u2018\u2019\u201A\u201B\u02BC\u02BB]/g, "'");

  const queryNorm = normaliseApostrophe(searchQuery).toLowerCase();
  const parts = text.split(regex);

  return (
    <Text style={[styles.fragmentText, style]}>
      {prefix ? <Text style={prefixStyle}>{prefix}</Text> : null}
      {parts.map((part, index) => {
        const partNorm = normaliseApostrophe(part).toLowerCase();
        const isMatch =
          searchType === "ExactPhrase"
            ? partNorm === queryNorm
            : queryNorm.split(/\s+/).some((w) => partNorm === w);
        if (isMatch) {
          return (
            <Text
              key={index}
              style={{
                backgroundColor: highlightBg,
                color: highlightFg,
                fontFamily: "Merriweather",
              }}
            >
              {part}
            </Text>
          );
        }
        return (
          <Text key={index} style={{ color: normalFg }}>
            {part}
          </Text>
        );
      })}
    </Text>
  );
};

// ── Strip HTML tags from sermon section Content ────────────────────────────
const stripHtml = (html) =>
  (html || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// ── Parse paragraph range from API (e.g., "25-30" or "130") ───────────────
const parseParagraphRange = (paragraphStr) => {
  if (!paragraphStr) return { start: 0, end: 0 };

  // Handle range like "25-30"
  if (paragraphStr.includes("-")) {
    const parts = paragraphStr.split("-");
    return {
      start: parseInt(parts[0]) || 0,
      end: parseInt(parts[1]) || 0,
    };
  }

  // Single paragraph number
  const num = parseInt(paragraphStr);
  return { start: num, end: num };
};

// ── Result Item with expandable paragraphs (grouped by sermon) ───────────────
const ResultItem = ({
  items,
  isPrimary,
  isBestMatch,
  searchQuery,
  theme,
  defaultExpanded,
  onFetchContent,
  sermonContent,
  isLoadingContent,
  searchType,
  targetParagraph,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isDark = theme.dark;
  const accentColor = isDark ? "#d57a3e" : "#5d3211";
  const subtleText = isDark ? "rgba(255,255,255,0.28)" : "rgba(93,50,17,0.4)";

  // For ExactPhrase: extract the exact highlighted phrase from the API fragment
  // so HighlightedText uses the verbatim database text (correct case, em-dashes, etc.)
  const exactPhraseFromFragment = useMemo(() => {
    if (searchType !== "ExactPhrase") return null;
    for (const itm of items) {
      const phrase = extractHighlightedPhrase(itm.Properties?.Fragment);
      if (phrase) return phrase;
    }
    return null;
  }, [items, searchType]);

  // Use extracted phrase for ExactPhrase, otherwise use the passed-in searchQuery (keywords)
  const effectiveSearchQuery =
    searchType === "ExactPhrase"
      ? exactPhraseFromFragment || searchQuery
      : searchQuery;

  // Use first item for sermon metadata
  const item = items[0];

  // Get all paragraph ranges from all matches in this sermon
  const paragraphRanges = items.map((i) =>
    parseParagraphRange(i.Properties?.Paragraph),
  );

  // Get fragment text from search result (fallback if sermon content not available)
  const fragmentText =
    item.Properties?.Fragment?.replace(/<span[^>]*>/g, "").replace(
      /<\/span>/g,
      "",
    ) || "";

  // Get paragraphs to display based on best match or secondary
  const paragraphsToShow = useMemo(() => {
    // API returns Result.Sections — each section has { Paragraph: "20", Content: "...", IsHit: bool }
    // Filter out the "header" section (Paragraph === "header")
    const sections = sermonContent?.Sections
      ? sermonContent.Sections.filter((s) => {
          const n = parseInt(s.Paragraph);
          return !isNaN(n) && n > 0;
        })
      : null;

    if (sections && sections.length > 0 && !sermonContent.failed) {
      // Find the earliest and latest match paragraph numbers from search results
      const allMatchStarts = paragraphRanges
        .map((r) => r.start)
        .filter((s) => s > 0);
      const allMatchEnds = paragraphRanges
        .map((r) => r.end)
        .filter((e) => e > 0);

      if (allMatchStarts.length === 0 && !targetParagraph) return [];

      const anchor = targetParagraph || Math.max(...allMatchEnds);

      const postContext = isBestMatch ? 50 : 25;
      const windowStart = anchor - 3;
      const windowEnd = anchor + postContext;

      // Filter sections whose paragraph RANGE overlaps [anchor-3 .. anchor+postContext].
      // Sections use ranges like "303-308" so we must check overlap, not just start point.
      return sections
        .filter((s) => {
          const r = parseParagraphRange(s.Paragraph);
          return r.end >= windowStart && r.start <= windowEnd;
        })
        .map((s) => {
          const r = parseParagraphRange(s.Paragraph);
          const isMatch = s.IsHit || paragraphRanges.some(
            (range) => r.end >= range.start && r.start <= range.end,
          );
          return { ...s, Content: stripHtml(s.Content), displayIndex: r.start, isMatch };
        });
    }

    // Fallback: use fragments from search result items directly
    // Apply the same window so we don't show fragments from paragraph 1 onwards
    const anchor = targetParagraph || 0;
    const windowStart = anchor > 0 ? anchor - 3 : 0;
    const windowEnd = anchor > 0 ? anchor + (isBestMatch ? 50 : 25) : Infinity;

    return items
      .map((itm) => {
        const range = parseParagraphRange(itm.Properties?.Paragraph);
        const frag =
          itm.Properties?.Fragment?.replace(/<span[^>]*>/g, "").replace(
            /<\/span>/g,
            "",
          ) || "";
        return {
          Content: frag,
          displayIndex: range.start,
          isMatch: true,
          isFragment: true,
          rangeEnd: range.end,
        };
      })
      .filter((p) => p.Content && p.rangeEnd >= windowStart && p.displayIndex <= windowEnd);
  }, [sermonContent, paragraphRanges, isBestMatch, items, targetParagraph]);

  // Fetch content when expanded (only if not already fetched or failed)
  useEffect(() => {
    if (
      expanded &&
      item.DocumentRecordId &&
      !sermonContent &&
      !isLoadingContent
    ) {
      onFetchContent(item.DocumentRecordId, item.RecordId, item.Properties?.DateCode);
    }
  }, [expanded, item.DocumentRecordId, sermonContent, isLoadingContent]);

  return (
    <View style={styles.resultItem}>
      <TouchableOpacity
        style={styles.resultHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.resultMetaRow}>
          {item.Properties?.DateCode && (
            <View
              style={[
                styles.datePill,
                {
                  backgroundColor: isDark
                    ? "rgba(213,122,62,0.15)"
                    : "rgba(93,50,17,0.08)",
                },
              ]}
            >
              <Text style={[styles.metaText, { color: accentColor }]}>
                {item.Properties.DateCode}
              </Text>
            </View>
          )}
          {items.length > 1 ? (
            <Text style={[styles.metaText, { color: subtleText }]}>
              {items.length} matches · ¶{" "}
             
            </Text>
          ) : (
            item.Properties?.Paragraph && (
              <Text style={[styles.metaText, { color: subtleText }]}>
                ¶ {item.Properties.Paragraph}
              </Text>
            )
          )}
        </View>

        <View style={styles.expandIcon}>
          {isBestMatch ? (
            <View
              style={[
                styles.primaryBadge,
                {
                  backgroundColor: accentColor,
                  borderTopColor: isDark
                    ? "rgba(255,255,255,0.25)"
                    : "rgba(255,255,255,0.4)",
                  borderBottomColor: isDark
                    ? "rgba(0,0,0,0.3)"
                    : "rgba(93,50,17,0.2)",
                  shadowColor: isDark ? "#000" : "#5d3211",
                },
              ]}
            >
              {/* Top highlight sheen */}
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "50%",
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  backgroundColor: "rgba(255,255,255,0.18)",
                }}
              />
              <Text style={styles.primaryBadgeText}>BEST</Text>
            </View>
          ) : (
            <Feather
              name={expanded ? "chevron-up" : "chevron-down"}
              size={16}
              color={subtleText}
            />
          )}
        </View>
      </TouchableOpacity>

      {/* Title */}
      {item.Properties?.Title && (
        <Text style={[styles.resultTitle, { color: theme.colors.text }]}>
          {item.Properties.Title}
        </Text>
      )}

      {/* Expanded content with paragraphs */}
      {expanded && (
        <View style={styles.expandedContent}>
          {isLoadingContent ? (
            <Text style={[styles.loadingText, { color: subtleText }]}>
              Loading paragraphs...
            </Text>
          ) : paragraphsToShow.length > 0 ? (
            paragraphsToShow.map((para, idx) => (
              <View
                key={idx}
                style={[
                  styles.paragraphRow,
                  para.isMatch && styles.matchParagraphRow,
                ]}
              >
                {(() => {
                  // Split leading paragraph number(s) from content text
                  // e.g. "274 Six months..." → prefix="274 ", body="Six months..."
                  const match = para.Content.match(/^(\d+(?:-\d+)?\s+)/);
                  const prefix = match ? match[1] : null;
                  const body = match ? para.Content.slice(match[1].length) : para.Content;
                  return (
                    <HighlightedText
                      text={body}
                      searchQuery={effectiveSearchQuery}
                      theme={theme}
                      style={para.isMatch && styles.matchText}
                      searchType={searchType}
                      prefix={prefix}
                      prefixStyle={{
                        color: accentColor,
                        fontFamily: "Merriweather",
                        fontWeight: "bold",
                        fontSize: 11,
                      }}
                    />
                  );
                })()}
              </View>
            ))
          ) : (
            <Text style={[styles.noContentText, { color: subtleText }]}>
              Could not load paragraph content
            </Text>
          )}
        </View>
      )}

      {/* Collapsed hint */}
      {!expanded && !isPrimary && (
        <TouchableOpacity onPress={() => setExpanded(true)}>
          <Text style={[styles.expandHint, { color: accentColor }]}>
            Tap to see more...
          </Text>
        </TouchableOpacity>
      )}

      <View
        style={[
          styles.resultSeparator,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.07)"
              : "rgba(93,50,17,0.08)",
          },
        ]}
      />
    </View>
  );
};

/**
 * EndnoteResults — Modal component to display endnote search results
 * Matches the sleek design of CurrentSermonSearch
 */
const EndnoteResults = ({
  visible,
  onClose,
  endnoteData,
  searchResults,
  theme,
  isLoading,
  onRetrySearch,
  networkError,
  embedded = false,
}) => {
  const { settings } = useAppContext();
  const [sermonContents, setSermonContents] = useState({}); // Cache by RecordId
  const [loadingContents, setLoadingContents] = useState({});
  const loadingRef = useRef({}); // Track loading state synchronously to prevent duplicate fetches
  const [searchType, setSearchType] = useState("ExactPhrase"); // ExactPhrase or AllWords

  const isDark = theme?.dark || false;
  const accentColor = isDark ? "#d57a3e" : "#5d3211";
  const subtleText = isDark ? "rgba(255,255,255,0.28)" : "rgba(93,50,17,0.4)";

  // Toggle search type and retry search
  const handleToggleSearchType = useCallback(() => {
    const newType = searchType === "ExactPhrase" ? "AllWords" : "ExactPhrase";
    setSearchType(newType);
    if (onRetrySearch) {
      onRetrySearch(newType);
    }
  }, [searchType, onRetrySearch]);

  const rawResults =
    searchResults?.Results || searchResults?.Result?.Results || [];
  const totalHits =
    searchResults?.TotalHits || searchResults?.Result?.TotalHits || 0;
  const searchQuery =
    searchType === "ExactPhrase"
      ? endnoteData?.longQuote || endnoteData?.quote || ""
      : endnoteData?.keywords || endnoteData?.quote || "";

  // Group results by sermon (DocumentRecordId + Title + DateCode)
  const groupedResults = useMemo(() => {
    if (!rawResults.length) return [];

    const groups = {};
    const groupOrder = []; // Track order groups are first seen (API's relevance order)
    const primaryDatecode = endnoteData?.datecode;
    const primaryTitle = endnoteData?.title?.toLowerCase();

    rawResults.forEach((result) => {
      // Create unique key for this sermon
      const key = `${result.DocumentRecordId || ""}_${result.Properties?.DateCode || ""}_${result.Properties?.Title || ""}`;

      if (!groups[key]) {
        groups[key] = {
          items: [],
          isPrimary: false,
          documentRecordId: result.DocumentRecordId,
          datecode: result.Properties?.DateCode || null,
          firstSeenIndex: groupOrder.length, // Track when first seen
        };
        groupOrder.push(key);
      }

      groups[key].items.push(result);

      // Check if this sermon is the primary match
      if (
        (primaryDatecode && result.Properties?.DateCode === primaryDatecode) ||
        (primaryTitle &&
          result.Properties?.Title?.toLowerCase().includes(primaryTitle))
      ) {
        groups[key].isPrimary = true;
      }
    });

    // Convert to array and sort by order first seen (preserves API's relevance ranking)
    // The first result from the API is the best match, so its group should be first
    return Object.values(groups).sort((a, b) => {
      return a.firstSeenIndex - b.firstSeenIndex;
    });
  }, [rawResults, endnoteData]);

  // Fetch sermon content for a specific result
  const handleFetchContent = async (documentRecordId, recordId, datecode) => {
    const cacheKey = String(documentRecordId);

    // Check cache and loading state (use ref for synchronous check)
    if (sermonContents[cacheKey]) {
      console.log("[EndnoteResults] Content already cached for:", cacheKey);
      return;
    }
    if (loadingRef.current[cacheKey]) {
      console.log("[EndnoteResults] Already loading content for:", cacheKey);
      return;
    }

    console.log("[EndnoteResults] Fetching content for:", cacheKey);
    loadingRef.current[cacheKey] = true; // Set synchronously
    setLoadingContents((prev) => ({ ...prev, [cacheKey]: true }));

    try {
      // Resolve the numeric SermonProductIdentityId via the sermon index
      const numericId = datecode ? await resolveSermonNumericId(datecode) : null;
      const idToFetch = numericId ?? documentRecordId;
      console.log("[EndnoteResults] Resolved ID:", idToFetch, "(datecode:", datecode, ")");
      const content = await getSermonContent(idToFetch);
      if (content) {
        setSermonContents((prev) => ({ ...prev, [cacheKey]: content }));
      } else {
        // Mark as failed so we don't retry indefinitely
        console.log(
          "[EndnoteResults] Sermon content unavailable for:",
          cacheKey,
        );
        setSermonContents((prev) => ({
          ...prev,
          [cacheKey]: { failed: true },
        }));
      }
    } catch (error) {
      console.error("[EndnoteResults] Error fetching sermon content:", error);
      // Mark as failed
      setSermonContents((prev) => ({ ...prev, [cacheKey]: { failed: true } }));
    } finally {
      loadingRef.current[cacheKey] = false; // Clear synchronously
      setLoadingContents((prev) => ({ ...prev, [cacheKey]: false }));
    }
  };

  // Pre-fetch best match (first result) content
  useEffect(() => {
    if (!visible || groupedResults.length === 0) return;

    const bestMatch = groupedResults[0];
    if (!bestMatch?.documentRecordId) return;

    const cacheKey = String(bestMatch.documentRecordId);
    // Only fetch if not already cached or loading
    if (!sermonContents[cacheKey] && !loadingContents[cacheKey]) {
      handleFetchContent(
        bestMatch.documentRecordId,
        bestMatch.items[0]?.RecordId,
        bestMatch.datecode || endnoteData?.datecode,
      );
    }
  }, [
    visible,
    groupedResults.length,
    endnoteData?.datecode,
    endnoteData?.title,
  ]);

  // Early return AFTER all hooks
  if (!visible) return null;

  return (
    <View
      style={
        embedded
          ? { flex: 1, overflow: "hidden" }
          : [styles.container, { backgroundColor: theme.colors.background }]
      }
    >
      <View
        style={[
          styles.contentWrapper,
          embedded && { paddingTop: 0 },
        ]}
      >
        {/* Header — only shown when not embedded (back arrow navigation) */}
        {!embedded && (
          <View
            style={[
              styles.header,
              {
                borderBottomColor: isDark
                  ? "rgba(80, 61, 49, 0.6)"
                  : "rgba(93, 50, 17, 0.1)",
              },
            ]}
          >
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="arrow-left" size={22} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        )}

        {/* Compact endnote meta bar — datecode · paragraph · toggle */}
        {endnoteData && (
          <View
            style={[
              styles.endnoteBar,
              {
                backgroundColor: isDark
                        ? "rgba(213,122,62,0.12)"
                        : "rgba(93,50,17,0.06)",
                        borderRadius:20,
                borderBottomColor: isDark
                  ? "rgba(230,195,184,0.06)"
                  : "rgba(93,50,17,0.05)",
              },
            ]}
          >
            <View style={[styles.endnoteMeta , {}]}>
              {/* Datecode glass pill */}
              {endnoteData.datecode && (
                <View
                  style={[
                    styles.glassPill,
                    {
                      backgroundColor: isDark
                        ? "rgba(213,122,62,0.12)"
                        : "rgba(93,50,17,0.06)",
                      borderColor: isDark
                        ? "rgba(213,122,62,0.20)"
                        : "rgba(93,50,17,0.10)",
                    },
                  ]}
                >
                  <Text style={[styles.metaText, { color: accentColor }]}>
                    {endnoteData.datecode}
                  </Text>
                </View>
              )}
              {endnoteData.paragraph && (
                <Text style={[styles.metaText, { color: subtleText }]}>
                  ¶ {endnoteData.paragraph}
                </Text>
              )}

              {/* Search method note */}
              {!isLoading && searchResults?.searchMethod === "paragraph_reference" && (
                <Text style={[styles.metaText, { color: subtleText, fontSize: 9.5 }]}>
                  · by reference
                </Text>
              )}

              <View style={{ flex: 1 }} />

              {/* Glass segmented toggle */}
              <View
                style={[
                  styles.segmentedToggle,
                  {
                    backgroundColor: isDark
                      ? "rgba(60,50,44,0.85)"
                      : "rgba(250,238,209,0.85)",
                    borderColor: isDark
                      ? "rgba(255,255,255,0.12)"
                      : "rgba(93,50,17,0.08)",
                    borderTopColor: isDark
                      ? "rgba(255,255,255,0.22)"
                      : "rgba(255,255,255,0.55)",
                    borderBottomColor: isDark
                      ? "rgba(0,0,0,0.3)"
                      : "rgba(93,50,17,0.12)",
                    shadowColor: isDark ? "#000" : "#5d3211",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0.4 : 0.15,
                    shadowRadius: 4,
                    elevation: 4,
                  },
                ]}
              >
                {/* Top highlight sheen */}
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "50%",
                    borderTopLeftRadius: 5,
                    borderTopRightRadius: 5,
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(255,255,255,0.4)",
                  }}
                />
                {[
                  { label: "Exact", value: "ExactPhrase" },
                  { label: "Words", value: "AllWords" },
                ].map((opt) => {
                  const isActive = searchType === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => {
                        if (!isActive && !isLoading) handleToggleSearchType();
                      }}
                      style={[
                        styles.segmentBtn,
                        isActive && {
                          backgroundColor: isDark
                            ? "rgba(213,122,62,0.80)"
                            : "#7a3b10",
                          borderRadius: 4,
                          shadowColor: isDark ? "#d57a3e" : "#5d3211",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.3,
                          shadowRadius: 3,
                          elevation: 3,
                        },
                      ]}
                      disabled={isLoading}
                    >
                      <Text
                        style={{
                          color: isActive
                            ? "#fff"
                            : isDark
                              ? "rgba(255,255,255,0.35)"
                              : "rgba(93,50,17,0.35)",
                          fontSize: 9.5,
                          fontWeight: isActive ? "700" : "500",
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Quote — compact, no italic */}
            {endnoteData.quote && (
              <Text
                style={[
                  styles.inlineQuote,
                  { color: isDark ? "rgba(248,227,213,0.50)" : "rgba(90,46,15,0.80)" },
                ]}
                numberOfLines={2}
              >
                "{endnoteData.quote}"
              </Text>
            )}
          </View>
        )}

        {/* Loader / Network Error / Results / Empty state */}
        {isLoading ? (
          <SearchLoader theme={theme} />
        ) : networkError ? (
          <View style={styles.emptyStateContainer}>
            <Feather
              name="wifi-off"
              size={38}
              color={isDark ? "rgba(255,255,255,0.15)" : "rgba(93,50,17,0.2)"}
              style={{ marginBottom: 18 }}
            />
            <Text
              style={[
                styles.emptyStateTitle,
                {
                  color: isDark
                    ? "rgba(255,255,255,0.55)"
                    : "rgba(93,50,17,0.65)",
                },
              ]}
            >
              No internet connection
            </Text>
            <Text style={[styles.emptyStateMessage, { color: subtleText }]}>
              Connect to the internet and try again
            </Text>
            <TouchableOpacity
              onPress={() => onRetrySearch && onRetrySearch(searchType)}
              style={[
                styles.retryButton,
                {
                  borderColor: isDark
                    ? "rgba(213,122,62,0.3)"
                    : "rgba(93,50,17,0.15)",
                  backgroundColor: isDark
                    ? "rgba(213,122,62,0.08)"
                    : "rgba(93,50,17,0.04)",
                },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[styles.retryButtonText, { color: accentColor }]}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={styles.resultsContainer}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {groupedResults.map((group, index) => {
              const cacheKey = String(group.documentRecordId);

              return (
                <ResultItem
                  key={`${group.documentRecordId}-${index}`}
                  items={group.items}
                  isPrimary={group.isPrimary}
                  isBestMatch={index === 0}
                  searchQuery={searchQuery}
                  theme={theme}
                  defaultExpanded={index === 0}
                  onFetchContent={handleFetchContent}
                  sermonContent={sermonContents[cacheKey]}
                  isLoadingContent={loadingContents[cacheKey]}
                  searchType={searchType}
                  targetParagraph={parseInt(endnoteData?.paragraph) || null}
                />
              );
            })}

            {/* No Results */}
            {groupedResults.length === 0 && (
              <View style={styles.emptyStateContainer}>
                <Feather
                  name="search"
                  size={40}
                  color={
                    isDark ? "rgba(255,255,255,0.15)" : "rgba(93,50,17,0.2)"
                  }
                  style={{ marginBottom: 16 }}
                />
                <Text
                  style={[
                    styles.emptyStateTitle,
                    {
                      color: isDark
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(93,50,17,0.6)",
                    },
                  ]}
                >
                  No matches found
                </Text>
                <Text style={[styles.emptyStateMessage, { color: subtleText }]}>
                  This quote may not exist in the database
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: -50,
    width: "100%",
    height: "110%",
    zIndex: 1000,
  },
  contentWrapper: {
    flex: 1,
    paddingTop:
      Platform.OS === "ios" ? 44 + 20 : (StatusBar.currentHeight || 0) + 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeButton: {
    padding: 8,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Merriweather",
    // fontWeight: "700",
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 9,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginTop: 1,
    fontFamily: "Merriweather",
  },
  endnoteBar: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  endnoteMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 10.5,
    fontFamily: "Merriweather",
    letterSpacing: 0.3,
  },
  segmentedToggle: {
    flexDirection: "row",
    borderRadius: 5,
    borderWidth: 1,
    overflow: "hidden",
  },
  segmentBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  inlineQuote: {
    fontSize: 13.5,
    fontFamily: "ZillaSlabsm",
    textDecorationLine:"underline",
    lineHeight: 16,
    marginTop: 5,
  },
  resultsContainer: {
    flex: 1,
  },
  resultItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  datePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(180,120,70,0.25)",
  },
  expandIcon: {
    paddingLeft: 8,
  },
  primaryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },
  primaryBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: "white",
  },
  resultTitle: {
    fontSize: 14,
    fontFamily: "Merriweather",
    marginTop: 6,
    lineHeight: 19,
  },
  expandHint: {
    fontSize: 12,
    fontFamily: "Merriweather",
    marginTop: 6,
  },
  expandedContent: {
    marginTop: 12,
  },
  paragraphRow: {
    flexDirection: "row",
    paddingTop: 8,
  },
  matchParagraphRow: {
    backgroundColor: "transparent",
  },
  paragraphNumber: {
    fontSize: 12,
    fontFamily: "Merriweathersm",
    minWidth: 28,
    paddingTop: 2,
  },
  fragmentText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Merriweather",
    flex: 1,
  },
  matchText: {
    fontFamily: "Merriweather",
  },
  loadingText: {
    fontSize: 13,
    fontFamily: "Merriweather",
    paddingVertical: 12,
  },
  noContentText: {
    fontSize: 13,
    fontFamily: "Merriweather",
    paddingVertical: 12,
  },
  resultSeparator: {
    height: StyleSheet.hairlineWidth,
    marginTop: 14,
    marginHorizontal: 4,
    opacity: 0.5,
  },
  emptyStateContainer: {
    alignItems: "center",
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 17,
    fontFamily: "Merriweather",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateMessage: {
    fontSize: 13,
    fontFamily: "Merriweather",
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  retryButtonText: {
    fontSize: 13,
    fontFamily: "Merriweather",
    letterSpacing: 0.3,
  },
});

export default EndnoteResults;
