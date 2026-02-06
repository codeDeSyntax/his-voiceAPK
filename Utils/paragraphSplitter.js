/**
 * Unified paragraph splitting utility - shared between mobile and desktop
 * Ensures consistent paragraph boundaries across all platforms
 *
 * Strategy: Equal-volume paragraphs (target 375 words per paragraph)
 * - Never breaks words
 * - Respects sentence boundaries
 * - Produces balanced paragraphs of similar length
 */

/**
 * Creates equal-volume paragraphs with consistent word counts
 * This is the core algorithm that ensures mobile and desktop parity
 *
 * @param {string} text - Text to split into equal-volume paragraphs
 * @returns {string[]} - Array of balanced paragraph strings
 */
const createEqualVolumeParagraphs = (text) => {
  if (!text || text.length < 200) {
    return [text];
  }

  // Target words per paragraph - adjustable based on content preference
  const minWordsPerParagraph = 300;
  const maxWordsPerParagraph = 450;
  const targetWordsPerParagraph = 375;

  // Split text into sentences while preserving sentence boundaries
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0);

  if (sentences.length <= 2) {
    return [text]; // Too few sentences to split meaningfully
  }

  // Calculate total words and estimate optimal paragraph count
  const totalWords = text.split(/\s+/).length;
  const estimatedParagraphs = Math.ceil(totalWords / targetWordsPerParagraph);
  const targetWordsPerParagraphAdjusted = Math.floor(
    totalWords / estimatedParagraphs,
  );

  const result = [];
  let currentParagraph = "";
  let currentWordCount = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    const sentenceWordCount = sentence.split(/\s+/).length;

    // Check if adding this sentence would exceed our target
    const wouldExceedTarget =
      currentWordCount + sentenceWordCount > targetWordsPerParagraphAdjusted;
    const hasMinimumWords = currentWordCount >= minWordsPerParagraph;
    const isLastSentence = i === sentences.length - 1;

    if (wouldExceedTarget && hasMinimumWords && !isLastSentence) {
      // Current paragraph is complete, start a new one
      if (currentParagraph.trim()) {
        result.push(currentParagraph.trim());
      }
      currentParagraph = sentence;
      currentWordCount = sentenceWordCount;
    } else {
      // Add sentence to current paragraph
      currentParagraph += (currentParagraph ? " " : "") + sentence;
      currentWordCount += sentenceWordCount;
    }

    // Handle oversized paragraphs by splitting at natural breaks
    if (currentWordCount > maxWordsPerParagraph && !isLastSentence) {
      if (currentParagraph.trim()) {
        result.push(currentParagraph.trim());
      }
      currentParagraph = "";
      currentWordCount = 0;
    }
  }

  // Add the last paragraph if it has content
  if (currentParagraph.trim()) {
    // If the last paragraph is too small, try to merge with previous
    if (currentWordCount < minWordsPerParagraph / 2 && result.length > 0) {
      const lastParagraph = result.pop();
      result.push(lastParagraph + " " + currentParagraph.trim());
    } else {
      result.push(currentParagraph.trim());
    }
  }

  return result.length > 0 ? result : [text];
};

/**
 * Format sermon into equal-volume paragraphs (synchronous)
 * Use this for smaller texts or when async is not needed
 *
 * @param {string} text - Raw sermon text
 * @returns {string[]} - Array of paragraph strings
 */
export const formatSermonIntoParagraphs = (text) => {
  if (!text) return [];

  // Early return for small texts
  if (text.length < 100) {
    return [text.trim()];
  }

  // Normalize line endings and whitespace
  const cleaned = text.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();

  // Split by major paragraph boundaries (double line breaks)
  const majorParagraphs = cleaned
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0);

  // Process each major paragraph using equal-volume algorithm
  const result = [];
  for (const paragraph of majorParagraphs) {
    const equalVolumeParagraphs = createEqualVolumeParagraphs(paragraph.trim());
    result.push(...equalVolumeParagraphs);
  }

  return result;
};

/**
 * Format sermon into equal-volume paragraphs (asynchronous)
 * Use this for large texts to avoid blocking the UI
 * Splits very large texts into batches for processing
 *
 * @param {string} text - Raw sermon text
 * @returns {Promise<string[]>} - Promise that resolves to array of paragraph strings
 */
export const formatSermonIntoParagraphsAsync = async (text) => {
  if (!text) return [];

  return new Promise((resolve) => {
    const processInChunks = async () => {
      try {
        // For very large texts, process in batches
        if (text.length > 30000) {
          const result = await processLargeTextInBatches(text);
          resolve(result);
        } else {
          // For smaller texts, use optimized direct processing
          setTimeout(() => {
            const result = formatSermonIntoParagraphs(text);
            resolve(result);
          }, 10); // Small delay to prevent blocking
        }
      } catch (error) {
        console.error("Error processing sermon:", error);
        // Fallback to synchronous processing
        resolve(formatSermonIntoParagraphs(text));
      }
    };

    processInChunks();
  });
};

/**
 * Process very large texts in smaller batches
 * Maintains paragraph coherence across batches
 *
 * @param {string} text - Raw sermon text
 * @returns {Promise<string[]>} - Promise that resolves to array of paragraph strings
 */
const processLargeTextInBatches = async (text) => {
  // Split by major paragraph boundaries first
  const majorParagraphs = text
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0);

  let allParagraphs = [];
  const batchSize = 3; // Process 3 major paragraphs at a time

  for (let i = 0; i < majorParagraphs.length; i += batchSize) {
    // Minimal delay between batches
    await new Promise((resolve) => setTimeout(resolve, 1));

    const batch = majorParagraphs.slice(i, i + batchSize).join("\n\n");
    const batchParagraphs = formatSermonIntoParagraphs(batch);
    allParagraphs = allParagraphs.concat(batchParagraphs);
  }

  return allParagraphs;
};

/**
 * Export configuration constants for consistency
 */
export const PARAGRAPH_CONFIG = {
  minWordsPerParagraph: 300,
  maxWordsPerParagraph: 450,
  targetWordsPerParagraph: 375,
  minTextLengthForSplitting: 100,
  largeTextThreshold: 30000, // Bytes
  batchSize: 3, // Major paragraphs per batch
};

/**
 * Validate that two paragraph arrays are equivalent
 * Useful for ensuring mobile and desktop consistency
 *
 * @param {string[]} paragraphs1 - First paragraph array
 * @param {string[]} paragraphs2 - Second paragraph array
 * @returns {boolean} - True if paragraphs are equivalent
 */
export const validateParagraphParity = (paragraphs1, paragraphs2) => {
  if (paragraphs1.length !== paragraphs2.length) {
    console.warn(
      `Paragraph count mismatch: ${paragraphs1.length} vs ${paragraphs2.length}`,
    );
    return false;
  }

  for (let i = 0; i < paragraphs1.length; i++) {
    if (paragraphs1[i].trim() !== paragraphs2[i].trim()) {
      console.warn(
        `Paragraph ${i} mismatch:\n  Version 1: "${paragraphs1[i].substring(0, 50)}..."\n  Version 2: "${paragraphs2[i].substring(0, 50)}..."`,
      );
      return false;
    }
  }

  return true;
};

/**
 * Search for text in paragraphs or by paragraph number
 *
 * @param {string[]} paragraphs - Array of paragraph strings
 * @param {string} searchPhrase - Text to search for or paragraph number
 * @returns {number[]} - Array of indices where search phrase is found
 */
export const searchSermon = (paragraphs, searchPhrase) => {
  if (!searchPhrase || !paragraphs || paragraphs.length === 0) {
    return [];
  }

  const trimmedPhrase = searchPhrase.trim();
  if (!trimmedPhrase) {
    return [];
  }

  const searchResults = [];
  const lowerSearchPhrase = trimmedPhrase.toLowerCase();

  // Check if search phrase is a paragraph number
  const paragraphNumberMatch = trimmedPhrase.match(/^#?(\d+)$/);
  if (paragraphNumberMatch) {
    const paragraphNumber = parseInt(paragraphNumberMatch[1]);
    if (paragraphNumber > 0 && paragraphNumber <= paragraphs.length) {
      return [paragraphNumber - 1]; // Convert to zero-based index
    }
    return []; // Invalid paragraph number
  }

  // Text search - find all paragraphs containing the search phrase
  paragraphs.forEach((paragraph, index) => {
    if (paragraph && paragraph.toLowerCase().includes(lowerSearchPhrase)) {
      searchResults.push(index);
    }
  });

  return searchResults;
};

/**
 * Debounced search function to prevent excessive searching
 *
 * @param {string[]} paragraphs - Array of paragraph strings
 * @param {string} searchPhrase - Text to search for
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {Promise<number[]>} - Promise that resolves to search result indices
 */
export const searchSermonDebounced = (
  paragraphs,
  searchPhrase,
  delay = 300,
) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(searchSermon(paragraphs, searchPhrase));
    }, delay);
  });
};
