import type {
  BranhamSearchOptions,
  BranhamSearchResponse,
  BranhamSermonContent,
  Endnote,
} from '../types';

/**
 * API service for querying branham.org sermon database
 * Endpoints: https://table.branham.org/rest/userQuery
 */

const API_BASE_URL = "https://table.branham.org/rest";

/**
 * Search for a text phrase in the sermon database
 * @param {string} text - The text to search for
 * @param {Object} options - Search options
 * @param {string} options.language - Language code (default: "en")
 * @param {string} options.searchType - Search type ("ExactPhrase" or "AllWords", default: "AllWords")
 * @param {number} options.pageSize - Number of results per page (default: 25)
 * @param {number} options.pageNumber - Page number (default: 1)
 * @returns {Promise<Object>} Search results
 */
export const searchSermons = async (
  text: string,
  options: BranhamSearchOptions = {},
): Promise<BranhamSearchResponse> => {
  const {
    language = "en",
    searchType = "AllWords",
    pageSize = 25,
    pageNumber = 1,
  } = options;

  if (!text || text.trim().length === 0) {
    throw new Error("Search text is required");
  }

  try {
    const payload = {
      Language: language,
      SearchType: searchType,
      Text: text,
      PageSize: pageSize,
    };

    const response = await fetch(`${API_BASE_URL}/userQuery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error searching sermons:", error);
    throw error;
  }
};

// In-memory cache for the sermon index (datecode → numeric ID map)
let sermonIndexMap: Map<string, number> | null = null;
let sermonIndexFetchPromise: Promise<Map<string, number>> | null = null;

/**
 * Fetch and cache the full sermon index.
 * Returns a Map of datecode (e.g. "47-1207") → numeric SermonProductIdentityId.
 */
const getSermonIndexMap = async () => {
  if (sermonIndexMap) return sermonIndexMap;
  // Deduplicate concurrent calls
  if (sermonIndexFetchPromise) return sermonIndexFetchPromise;

  sermonIndexFetchPromise = (async () => {
    if (__DEV__) console.log("[Sermon API] Fetching sermon index...");
    const response = await fetch(`${API_BASE_URL}/index/allSermons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Language: "en" }),
    });
    if (!response.ok) throw new Error(`Index fetch failed: ${response.status}`);
    const data = await response.json();
    const map = new Map<string, number>();
    (data?.Result?.Sermons || data?.Sermons || []).forEach((s: { p?: string; i?: number }) => {
      if (s.p && s.i != null) map.set(s.p, s.i);
    });
    if (__DEV__)
      console.log(`[Sermon API] Sermon index loaded: ${map.size} entries`);
    sermonIndexMap = map;
    sermonIndexFetchPromise = null;
    return map;
  })();

  return sermonIndexFetchPromise;
};

/**
 * Resolve a datecode (e.g. "47-1207") to the numeric SermonProductIdentityId.
 * Returns null if not found.
 */
export const resolveSermonNumericId = async (datecode: string | null): Promise<number | null> => {
  if (!datecode) return null;
  try {
    const map = await getSermonIndexMap();
    const id = map.get(datecode);
    return id != null ? id : null;
  } catch (e) {
    console.error(
      "[Sermon API] Could not resolve sermon ID for datecode:",
      datecode,
      e,
    );
    return null;
  }
};

/**
 * Get full sermon content by sermon ID
 * @param {number} sermonId - The numeric SermonProductIdentityId
 * @returns {Promise<Object>} Full sermon content with sections
 */
export const getSermonContent = async (sermonId: string | number): Promise<BranhamSermonContent | null> => {
  if (!sermonId) {
    throw new Error("Sermon ID is required");
  }

  if (__DEV__)
    console.log("[Sermon API] Fetching sermon content for ID:", sermonId);

  // If sermonId is numeric use SermonProductIdentityId; if it's a string
  // DocumentRecordId (e.g. "620B0009") use SermonRecordId instead.
  const isNumeric =
    typeof sermonId === "number" || /^\d+$/.test(String(sermonId));

  try {
    const payload = isNumeric
      ? {
          Language: "en",
          SermonProductIdentityId: Number(sermonId),
          GetAllContent: true,
          HighlightQuery: null,
        }
      : {
          Language: "en",
          SermonRecordId: String(sermonId),
          GetAllContent: true,
          HighlightQuery: null,
        };

    const response = await fetch(`${API_BASE_URL}/sermons/sermonRequest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data?.Status === "Successful") {
      if (__DEV__)
        console.log("[Sermon API] Successfully fetched sermon content");
      return data.Result;
    } else {
      if (__DEV__)
        console.log(
          "[Sermon API] API returned non-success status:",
          data?.Status,
        );
      return null;
    }
  } catch (error) {
    console.error("[Sermon API] Error fetching sermon content:", error);
    throw error;
  }
};

/**
 * Get autocomplete suggestions for a partial word/phrase
 * @param {string} text - Partial text to get suggestions for
 * @param {Object} options - Options
 * @param {string} options.language - Language code (default: "en")
 * @param {string} options.searchType - Search type (default: "AllWords")
 * @param {number} options.pageSize - Number of suggestions (default: 50)
 * @returns {Promise<Object>} Suggestions
 */
export const getAutocompleteSuggestions = async (
  text: string,
  options: BranhamSearchOptions = {},
): Promise<BranhamSearchResponse> => {
  const { language = "en", searchType = "AllWords", pageSize = 50 } = options;

  if (!text || text.trim().length === 0) {
    throw new Error("Search text is required");
  }

  try {
    const payload = {
      Language: language,
      SearchType: searchType,
      Text: text,
      PageSize: pageSize,
    };

    const response = await fetch(
      `${API_BASE_URL}/autoComplete/suggestionsForWordPart`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting autocomplete suggestions:", error);
    throw error;
  }
};

/**
 * Search by paragraph reference (datecode + title + paragraph number)
 * Used as a fallback when quote text search fails
 * @param {Object} endnoteData - Parsed endnote data
 * @param {string} endnoteData.datecode - Sermon datecode (e.g., "56-0527")
 * @param {string} endnoteData.title - Sermon title
 * @param {string} endnoteData.paragraph - Paragraph number
 * @returns {Promise<Object>} Search results filtered to target paragraph
 */
export const searchByParagraphReference = async (endnoteData: Endnote): Promise<BranhamSearchResponse> => {
  const { datecode, title, paragraph } = endnoteData;

  if (!datecode && !title) {
    if (__DEV__)
      console.log("[Endnote API] No datecode or title for paragraph search");
    throw new Error("Datecode or title is required for paragraph search");
  }

  if (__DEV__)
    console.log("[Endnote API] Searching by paragraph reference:", {
      datecode,
      title,
      paragraph,
    });

  try {
    // Search using datecode or title to narrow down to the specific sermon
    const searchText = datecode || title;
    if (!searchText) throw new Error("Datecode or title is required for paragraph search");
    const result = await searchSermons(searchText, {
      searchType: "ExactPhrase",
      pageSize: 100, // Get more results to ensure we find the target paragraph
    });

    const totalHits = result?.Result?.TotalHits || result?.TotalHits || 0;
    if (__DEV__)
      console.log(
        "[Endnote API] Initial paragraph reference search - results found:",
        totalHits,
      );

    // If we have a paragraph number, filter results to only those matching or near it
    if (paragraph && result?.Result?.Results) {
      const targetParagraph = parseInt(paragraph);
      const paragraphRange = 2; // Show results within ±2 paragraphs

      const filteredResults = result.Result.Results.filter((item) => {
        const paragraphStr = item.Properties?.Paragraph;
        if (!paragraphStr) return false;

        // Parse paragraph range (e.g., "174", "174-176")
        const parts = paragraphStr.split("-");
        const startPara = parseInt(parts[0]);
        const endPara = parts[1] ? parseInt(parts[1]) : startPara;

        // Check if target paragraph is within this result's range or nearby
        return (
          (targetParagraph >= startPara && targetParagraph <= endPara) || // Exact match
          Math.abs(targetParagraph - startPara) <= paragraphRange || // Within range of start
          Math.abs(targetParagraph - endPara) <= paragraphRange // Within range of end
        );
      });

      // Sort filtered results by paragraph number (natural reading order)
      filteredResults.sort((a, b) => {
        const aParaStr = a.Properties?.Paragraph;
        const bParaStr = b.Properties?.Paragraph;

        const aPara = parseInt(aParaStr?.split("-")[0]);
        const bPara = parseInt(bParaStr?.split("-")[0]);

        // Sort by paragraph number (51, 52, 53, 54, 55)
        return aPara - bPara;
      });

      if (__DEV__)
        console.log(
          `[Endnote API] Filtered to ${filteredResults.length} results near paragraph ${paragraph}`,
        );

      // If filtering resulted in no matches, return unfiltered results from the sermon
      // (better to show the whole sermon than nothing)
      if (filteredResults.length === 0) {
        if (__DEV__)
          console.log(
            "[Endnote API] No results after filtering, returning all sermon results",
          );
        return result;
      }

      // Return filtered results
      return {
        ...result,
        Result: {
          ...result.Result,
          Results: filteredResults,
          TotalHits: filteredResults.length,
          TotalPages: Math.ceil(
            filteredResults.length / result.Result.PageSize,
          ),
        },
      };
    }

    return result;
  } catch (error) {
    console.error(
      "[Endnote API] Error searching by paragraph reference:",
      error,
    );
    throw error;
  }
};

/**
 * Search for endnote quote with automatic fallback to paragraph reference
 * @param {Object} endnoteData - Full parsed endnote data
 * @param {string} endnoteData.quote - Quote text to search for
 * @param {string} endnoteData.datecode - Sermon datecode (fallback)
 * @param {string} endnoteData.title - Sermon title (fallback)
 * @param {string} endnoteData.paragraph - Paragraph number (fallback)
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Search results with metadata
 */
export const searchEndnoteQuote = async (
  endnoteData: Endnote,
  options: BranhamSearchOptions = {},
): Promise<BranhamSearchResponse & { searchMethod?: string }> => {
  const { quote, longQuote, keywords, datecode, title, paragraph } =
    endnoteData;
  const { searchType = "ExactPhrase" } = options;

  const normalizeQuery = (text: string | null): string => {
    if (!text) return "";
    return String(text)
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, "-")
      .replace(/\s+/g, " ")
      .trim();
  };

  const buildQueryVariants = (text: string): string[] => {
    const normalized = normalizeQuery(text);
    if (!normalized) return [];

    const variants = new Set([normalized]);
    // Branham API content can vary between apostrophe forms.
    variants.add(normalized.replace(/'/g, "\u2019"));
    variants.add(normalized.replace(/\u2019/g, "'"));
    return [...variants].filter((item) => item.length >= 3);
  };

  // Choose the right query text based on search mode:
  //   ExactPhrase → use the longer quote (8 words) for a tighter, more meaningful match
  //   AllWords    → use keyword-only text (no stop words) for a broader match
  const queryTextRaw =
    searchType === "ExactPhrase"
      ? longQuote || quote || "" // prefer 8-word form
      : keywords || quote || ""; // prefer key-words-only form
  const queryText = normalizeQuery(queryTextRaw);

  if (__DEV__)
    console.log("[Endnote API] Starting endnote search with:", {
      queryText,
      searchType,
      datecode,
      title,
      paragraph,
    });

  const isNetworkErr = (e: unknown): boolean =>
    e instanceof TypeError ||
    (e instanceof Error && (e.message.toLowerCase().includes("network request failed") ||
      e.message.toLowerCase().includes("failed to fetch")));

  let lastNetworkError = null;

  try {
    // Primary: Try searching by quote text (with normalized variants)
    if (queryText && queryText.length >= 3) {
      if (__DEV__)
        console.log(
          "[Endnote API] Primary search - using queryText:",
          queryText,
          "with type:",
          searchType,
        );

      try {
        const variants = buildQueryVariants(queryText);
        for (const variant of variants) {
          const result = await searchSermons(variant, {
            searchType,
            pageSize: 50,
          });

          const totalHits = result?.Result?.TotalHits || result?.TotalHits || 0;
          if (__DEV__) {
            console.log(
              "[Endnote API] Quote search results:",
              totalHits,
              "for variant:",
              variant,
            );
          }

          if (totalHits > 0) {
            return { ...result, searchMethod: "quote" };
          }
        }

        if (__DEV__)
          console.log(
            "[Endnote API] No results from quote search, trying fallback...",
          );
      } catch (quoteError) {
        if (__DEV__)
          console.log("[Endnote API] Quote search failed:", quoteError instanceof Error ? quoteError.message : String(quoteError));
        if (isNetworkErr(quoteError)) lastNetworkError = quoteError;
      }
    }

    // Fallback 1: if ExactPhrase misses, try AllWords automatically.
    if (searchType === "ExactPhrase") {
      try {
        const allWordsQuery = normalizeQuery(keywords || quote || queryText);
        if (allWordsQuery && allWordsQuery.length >= 3) {
          const result = await searchSermons(allWordsQuery, {
            searchType: "AllWords",
            pageSize: 50,
          });
          const totalHits = result?.Result?.TotalHits || result?.TotalHits || 0;
          if (__DEV__) {
            console.log("[Endnote API] AllWords fallback results:", totalHits);
          }
          if (totalHits > 0) {
            return { ...result, searchMethod: "quote_fallback_all_words" };
          }
        }
      } catch (allWordsError) {
        if (isNetworkErr(allWordsError)) lastNetworkError = allWordsError;
      }
    }

    // Fallback 2: paragraph reference search
    if ((datecode || title) && paragraph) {
      try {
        const result = await searchByParagraphReference({
          datecode,
          title,
          paragraph,
          quote: null,
          longQuote: null,
          keywords: null,
          fullEndnote: "",
        });
        const totalHits = result?.Result?.TotalHits || result?.TotalHits || 0;
        if (totalHits > 0) {
          return { ...result, searchMethod: "paragraph_reference" };
        }
      } catch (paragraphError) {
        if (isNetworkErr(paragraphError)) lastNetworkError = paragraphError;
      }
    }

    // If both methods failed, return empty results (or re-throw if it was a network error)
    if (__DEV__)
      console.log(
        "[Endnote API] All search methods exhausted, returning empty results",
      );
    if (lastNetworkError) {
      throw lastNetworkError;
    }
    return {
      Status: "Successful",
      Result: { TotalHits: 0, Results: [], PageSize: 0 },
      searchMethod: "none",
    };
  } catch (error) {
    console.error("[Endnote API] Error in endnote search:", error);
    throw error;
  }
};
