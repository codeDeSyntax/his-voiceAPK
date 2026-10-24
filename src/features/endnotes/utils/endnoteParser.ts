import type { Endnote } from '../types';

/**
 * Parser for endnotes in sermon text
 * Format: "Endnote: DateCode - Title William Marrion Branham ParagraphNumber QUOTE TEXT"
 * Example: "Endnote: 56-0527 - At Kadesh-Barnea William Marrion Branham 130 THE PEOPLE, AT THE HOUR OF DECISION NOW!"
 *
 * The endnote can span multiple lines, so we need to capture all text after "Endnote:"
 */

/**
 * Parse an endnote string to extract its components
 * @param {string} fullText - The full paragraph text containing the endnote
 * @returns {Object|null} Parsed endnote with { datecode, title, paragraph, quote } or null if not an endnote
 */
export const parseEndnote = (fullText: string): Endnote | null => {
  if (!fullText || !fullText.includes("Endnote:")) {
    return null;
  }

  // Extract the endnote section (everything after "Endnote:" - can span multiple lines)
  // Use [\s\S] to match any character including newlines
  const endnoteMatch = fullText.match(/Endnote:\s*([\s\S]+?)(?=\n\s*\n|$)/);
  if (!endnoteMatch) {
    // Fallback: try to get everything after "Endnote:"
    const fallbackMatch = fullText.match(/Endnote:\s*(.+)/);
    if (!fallbackMatch) return null;
    return parseEndnoteContent(fallbackMatch[1].trim());
  }

  return parseEndnoteContent(endnoteMatch[1].trim());
};

/**
 * Parse the endnote content string to extract components
 * @param {string} endnoteContent - The content after "Endnote:"
 * @returns {Object} Parsed endnote with { datecode, title, paragraph, quote }
 */
const parseEndnoteContent = (endnoteContent: string): Endnote => {
  if (__DEV__) console.log("[Parser] Parsing endnote content:", endnoteContent);

  // Parse: DateCode - Title William Marrion Branham ParagraphNumber QUOTE
  // Example: "56-0527 - At Kadesh-Barnea William Marrion Branham 130 THE PEOPLE, AT..."
  // Also handles: "53-1213E - Faith William Marrion Branham 42 Listen..."

  // 1. Extract DateCode (starts with digits like 56-0527 or 53-1213E, may or may not be present)
  let dateCode = "";
  let remainder = endnoteContent;

  // Updated regex to handle optional letter suffix (e.g., 53-1213E)
  const dateMatch = remainder.match(/^(\d{2}-\d{4}[A-Za-z]?)\s*-\s*/);
  if (dateMatch) {
    dateCode = dateMatch[1];
    remainder = remainder.substring(dateMatch[0].length);
    if (__DEV__) console.log("[Parser] Found dateCode:", dateCode, "Remainder:", remainder);
  }

  // 2. Extract Title (text between start/datecode and "William [Marrion] Branham")
  //    Handles both "William Marrion Branham" and "William Branham"
  let title = "";
  const branhamMatch = remainder.match(/William\s+(?:Marrion\s+)?Branham/i);
  if (branhamMatch) {
    const branhamIndex = branhamMatch.index ?? 0;
    title = remainder.substring(0, branhamIndex).trim();
    remainder = remainder
      .substring(branhamIndex + branhamMatch[0].length)
      .trim();
    if (__DEV__) console.log("[Parser] Found title:", title, "Remainder:", remainder);
  }

  // 3. Extract Paragraph Number (first number after "William Marrion Branham")
  let paragraph = "";
  const paragraphMatch = remainder.match(/^(\d+)/);
  if (paragraphMatch) {
    paragraph = paragraphMatch[1];
    remainder = remainder.substring(paragraphMatch[0].length).trim();
    if (__DEV__) console.log(
      "[Parser] Found paragraph:",
      paragraph,
      "Remainder:",
      remainder,
    );
  }

  // 4. Extract quote text in two forms:
  //    - longQuote: first 8 words  → used for ExactPhrase (strict, fewer but precise hits)
  //    - keywords:  key words only  → used for AllWords (broader, filters stop words)
  const STOP_WORDS = new Set([
    "a",
    "an",
    "the",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "is",
    "it",
    "its",
    "that",
    "this",
    "was",
    "are",
    "be",
    "been",
    "as",
    "i",
    "you",
    "he",
    "she",
    "we",
    "they",
    "my",
    "your",
    "his",
    "her",
    "our",
    "their",
    "not",
    "no",
    "so",
    "up",
    "do",
    "if",
    "me",
    "him",
    "us",
    "now",
    "just",
    "then",
    "will",
    "can",
    "may",
    "had",
    "has",
    "have",
    "said",
    "am",
    "what",
    "how",
    "when",
    "there",
    "which",
    "who",
    "would",
    "could",
    "should",
    "all",
    "one",
    "two",
    "more",
  ]);

  const words = remainder.split(/\s+/).filter((w) => w.length > 0);

  // For ExactPhrase: only lowercase + unify apostrophes — keep ALL punctuation
  // exactly as-is because the quote is a verbatim copy of the database text
  // (commas, em-dashes, colons etc. are part of the phrase to match).
  const normaliseForExact = (w: string): string =>
    w.toLowerCase().replace(/[\u2018\u2019\u201A\u201B\u02BC\u02BB]/g, "'");

  // For AllWords / display: also strip leading/trailing punctuation so
  // stop-word filtering and length checks work cleanly.
  const normaliseWord = (w: string): string => {
    let s = normaliseForExact(w);
    s = s.replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, "");
    return s;
  };

  // ExactPhrase: first 8 words — punctuation kept, only lowercased
  const longQuote = words
    .slice(0, 8)
    .map(normaliseForExact)
    .filter(Boolean)
    .join(" ");

  // AllWords: key words only (strip stop words), UP TO 3 most specific words.
  const keywords = words
    .map(normaliseWord)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
    .slice(0, 3)
    .join(" ");

  // Backwards-compat field: short 5-word quote
  const quote = words
    .slice(0, 5)
    .map(normaliseForExact)
    .filter(Boolean)
    .join(" ");

  if (__DEV__) console.log("[Parser] longQuote:", longQuote, "| keywords:", keywords);

  return {
    datecode: dateCode || null,
    title: title || null,
    paragraph: paragraph || null,
    quote: quote || null, // 5-word fallback
    longQuote: longQuote || null, // 8-word exact phrase
    keywords: keywords || null, // key words for AllWords
    fullEndnote: endnoteContent,
  };
};

/**
 * Extract all endnotes from text
 * @param {string} text - The sermon paragraph text
 * @returns {Array} Array of parsed endnotes
 */
export const extractAllEndnotes = (text: string): Endnote[] => {
  if (!text || !text.includes("Endnote:")) {
    return [];
  }

  const endnotes: Endnote[] = [];
  const parts = text.split(/(?=Endnote:)/);

  for (const part of parts) {
    const parsed = parseEndnote(part);
    if (parsed) {
      endnotes.push(parsed);
    }
  }

  return endnotes;
};

/**
 * Check if text contains an endnote
 * @param {string} text - The text to check
 * @returns {boolean} True if text contains an endnote
 */
export const hasEndnote = (text: string): boolean => {
  return text.includes("Endnote:");
};
