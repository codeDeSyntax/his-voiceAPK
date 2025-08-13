/**
 * Utility functions for sermon processing and searching
 */

/**
 * Ultra-fast async formatter using chunked processing for large sermon texts
 * Optimized for low-resource devices with progressive processing
 * @param {string} text - Raw sermon text
 * @returns {Promise<Array>} - Array of paragraph strings
 */
export const formatSermonIntoParagraphsAsync = async (text) => {
  if (!text) return [];

  return new Promise((resolve) => {
    // Use smaller chunks for better UI responsiveness
    const processInChunks = async () => {
      try {
        // For very large texts, use worker-like approach with smaller batches
        if (text.length > 30000) {
          const result = await processLargeTextInBatches(text);
          resolve(result);
        } else {
          // For smaller texts, use optimized direct processing with delay
          setTimeout(() => {
            const result = formatSermonIntoParagraphsFast(text);
            resolve(result);
          }, 10); // Small delay to prevent blocking
        }
      } catch (error) {
        console.error("Error processing sermon:", error);
        // Fallback to simple processing
        resolve(formatSermonIntoParagraphsFast(text));
      }
    };

    // Process immediately for better perceived performance
    processInChunks();
  });
};

/**
 * Process very large texts in smaller batches for better performance
 * @param {string} text - Raw sermon text
 * @returns {Promise<Array>} - Array of paragraph strings
 */
const processLargeTextInBatches = async (text) => {
  // For very large texts, we need to be smarter about batching
  // to maintain paragraph coherence across batches

  // First, split by major paragraph boundaries
  const majorParagraphs = text
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0);

  let allParagraphs = [];
  const batchSize = 3; // Process 3 major paragraphs at a time

  for (let i = 0; i < majorParagraphs.length; i += batchSize) {
    // Process each batch with minimal delay
    await new Promise((resolve) => setTimeout(resolve, 1));

    const batch = majorParagraphs.slice(i, i + batchSize).join("\n\n");
    const batchParagraphs = formatSermonIntoParagraphsFast(batch);
    allParagraphs = allParagraphs.concat(batchParagraphs);
  }

  return allParagraphs;
};

/**
 * Creates equal-volume paragraphs ensuring words are never broken
 * @param {string} text - Text to split into equal-volume paragraphs
 * @returns {Array} - Array of balanced paragraph strings
 */
const createEqualVolumeParagraphs = (text) => {
  if (!text || text.length < 200) {
    return [text];
  }

  // Target words per paragraph (adjustable based on content length)
  const minWordsPerParagraph = 300;
  const maxWordsPerParagraph = 450;
  const targetWordsPerParagraph = 375;

  // Split text into words while preserving sentence boundaries
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
    totalWords / estimatedParagraphs
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
 * Optimized fast formatter for sermon texts - Enhanced for equal-volume paragraphs
 * @param {string} text - Raw sermon text
 * @returns {Array} - Array of paragraph strings
 */
const formatSermonIntoParagraphsFast = (text) => {
  if (!text) return [];

  // Early return for small texts
  if (text.length < 100) {
    return [text.trim()];
  }

  // Super optimized processing - avoid multiple passes and use simpler operations
  const cleaned = text.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();

  // Split and filter in one pass with simpler logic
  const paragraphs = cleaned
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 5); // Lower threshold for faster processing

  // Process using equal-volume algorithm
  const result = [];

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    const equalVolumeParagraphs = createEqualVolumeParagraphs(trimmed);
    result.push(...equalVolumeParagraphs);
  }

  return result;
};

/**
 * Formats sermon text into properly sized paragraphs (optimized for equal volume)
 * @param {string} text - Raw sermon text
 * @returns {Array} - Array of paragraph strings
 */
export const formatSermonIntoParagraphs = (text) => {
  if (!text) return [];

  // Early return for small texts
  if (text.length < 100) {
    return [text.trim()];
  }

  // Use more efficient regex patterns
  const paragraphs = text
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim()
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0);

  // Process paragraphs using equal-volume algorithm
  const formattedParagraphs = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();
    const equalVolumeParagraphs = createEqualVolumeParagraphs(paragraph);
    formattedParagraphs.push(...equalVolumeParagraphs);
  }

  return formattedParagraphs;
};

/**
 * Optimized search for text in paragraphs or by paragraph number
 * @param {Array} paragraphs - Array of paragraph strings
 * @param {string} searchPhrase - Text to search for or paragraph number
 * @returns {Array} - Array of search result indices
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

  // Optimized text search using forEach instead of filter/map
  paragraphs.forEach((paragraph, index) => {
    if (paragraph && paragraph.toLowerCase().includes(lowerSearchPhrase)) {
      searchResults.push(index);
    }
  });

  return searchResults;
};

/**
 * Debounced search function to prevent excessive searching
 * @param {Array} paragraphs - Array of paragraph strings
 * @param {string} searchPhrase - Text to search for
 * @param {number} delay - Delay in milliseconds
 * @returns {Promise<Array>} - Promise that resolves to search results
 */
export const searchSermonDebounced = (
  paragraphs,
  searchPhrase,
  delay = 300
) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(searchSermon(paragraphs, searchPhrase));
    }, delay);
  });
};
