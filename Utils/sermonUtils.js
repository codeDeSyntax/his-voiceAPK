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
  const batchSize = 5000; // Smaller batches (5KB) for better responsiveness
  const batches = [];

  for (let i = 0; i < text.length; i += batchSize) {
    batches.push(text.substring(i, i + batchSize));
  }

  let allParagraphs = [];

  for (const batch of batches) {
    // Process each batch with minimal delay
    await new Promise((resolve) => setTimeout(resolve, 1));
    const batchParagraphs = formatSermonIntoParagraphsFast(batch);
    allParagraphs = allParagraphs.concat(batchParagraphs);
  }

  return allParagraphs;
};

/**
 * Optimized fast formatter for sermon texts - Enhanced for low-resource devices
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

  // Simplified processing for better performance
  const result = [];
  const maxLength = 1000; // Slightly larger to reduce processing overhead

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();

    if (trimmed.length <= maxLength) {
      result.push(trimmed);
    } else {
      // Simplified sentence splitting - avoid complex regex
      const parts = trimmed.split(". ");
      let current = "";

      for (const part of parts) {
        const testLength = current.length + part.length + 2; // +2 for ". "

        if (testLength > maxLength && current) {
          result.push(current.trim());
          current = part;
        } else {
          current += (current ? ". " : "") + part;
        }
      }

      if (current.trim()) {
        result.push(current.trim());
      }
    }
  }

  return result;
};

/**
 * Formats sermon text into properly sized paragraphs (optimized)
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

  // Process paragraphs more efficiently
  const formattedParagraphs = [];
  const maxLength = 800;

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();

    if (paragraph.length <= maxLength) {
      formattedParagraphs.push(paragraph);
    } else {
      // Split long paragraphs more efficiently
      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      let currentParagraph = "";

      for (const sentence of sentences) {
        const trimmedSentence = sentence.trim();

        if (currentParagraph.length + trimmedSentence.length > maxLength) {
          if (currentParagraph.trim()) {
            formattedParagraphs.push(currentParagraph.trim());
          }
          currentParagraph = trimmedSentence;
        } else {
          currentParagraph += (currentParagraph ? " " : "") + trimmedSentence;
        }
      }

      if (currentParagraph.trim()) {
        formattedParagraphs.push(currentParagraph.trim());
      }
    }
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

  const searchResults = [];
  const lowerSearchPhrase = searchPhrase.toLowerCase();

  // Check if search phrase is a paragraph number
  const paragraphNumberMatch = searchPhrase.match(/^#?(\d+)$/);
  if (paragraphNumberMatch) {
    const paragraphNumber = parseInt(paragraphNumberMatch[1]);
    if (paragraphNumber > 0 && paragraphNumber <= paragraphs.length) {
      return [paragraphNumber - 1]; // Convert to zero-based index
    }
  }

  // Optimized text search using forEach instead of filter/map
  paragraphs.forEach((paragraph, index) => {
    if (paragraph.toLowerCase().includes(lowerSearchPhrase)) {
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
