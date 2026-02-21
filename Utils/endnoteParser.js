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
export const parseEndnote = (fullText) => {
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
const parseEndnoteContent = (endnoteContent) => {
  console.log("[Parser] Parsing endnote content:", endnoteContent);

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
    console.log("[Parser] Found dateCode:", dateCode, "Remainder:", remainder);
  }

  // 2. Extract Title (text between start/datecode and "William Marrion Branham")
  let title = "";
  const branhamIndex = remainder.indexOf("William Marrion Branham");
  if (branhamIndex > -1) {
    title = remainder.substring(0, branhamIndex).trim();
    remainder = remainder
      .substring(branhamIndex + "William Marrion Branham".length)
      .trim();
    console.log("[Parser] Found title:", title, "Remainder:", remainder);
  }

  // 3. Extract Paragraph Number (first number after "William Marrion Branham")
  let paragraph = "";
  const paragraphMatch = remainder.match(/^(\d+)/);
  if (paragraphMatch) {
    paragraph = paragraphMatch[1];
    remainder = remainder.substring(paragraphMatch[0].length).trim();
    console.log(
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

  // ExactPhrase: first 8 words (long enough to be genuinely unique)
  const longQuote = words.slice(0, 8).join(" ");

  // AllWords: key words only (strip stop words), up to 6 meaningful words
  const keywords = words
    .map((w) => w.replace(/[^a-zA-Z0-9'\-]/g, "").toLowerCase())
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
    .slice(0, 6)
    .join(" ");

  // Backwards-compat field: short 5-word quote kept as "quote"
  const quote = words.slice(0, 5).join(" ");

  console.log("[Parser] longQuote:", longQuote, "| keywords:", keywords);

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
export const extractAllEndnotes = (text) => {
  if (!text || !text.includes("Endnote:")) {
    return [];
  }

  const endnotes = [];
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
export const hasEndnote = (text) => {
  return text && text.includes("Endnote:");
};
