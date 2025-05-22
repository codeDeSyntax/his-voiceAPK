/**
 * Utility functions for sermon processing and searching
 */

/**
 * Formats sermon text into properly sized paragraphs
 * @param {string} text - Raw sermon text
 * @returns {Array} - Array of paragraph strings
 */
export const formatSermonIntoParagraphs = (text) => {
    if (!text) return [];
  
    // Split text into paragraphs based on various indicators
    const rawParagraphs = text
      // First normalize line breaks
      .replace(/\r\n/g, "\n")
      // Replace multiple spaces with single space
      .replace(/\s+/g, " ")
      // Split on obvious paragraph breaks (double line breaks)
      .split(/\n\s*\n/);
  
    // Further process each paragraph - if they're too long, break them up
    const formattedParagraphs = [];
  
    rawParagraphs.forEach((paragraph) => {
      // Skip empty paragraphs
      if (!paragraph.trim()) return;
  
      // If paragraph is very long, try to split at logical points
      if (paragraph.length > 800) {
        // Look for sentence endings followed by spaces as potential break points
        const sentences = paragraph.split(/(?<=[.!?])\s+/);
  
        let currentParagraph = "";
        sentences.forEach((sentence) => {
          if (currentParagraph.length + sentence.length > 800) {
            if (currentParagraph.trim()) {
              formattedParagraphs.push(currentParagraph.trim());
            }
            currentParagraph = sentence;
          } else {
            currentParagraph += " " + sentence;
          }
        });
  
        if (currentParagraph.trim()) {
          formattedParagraphs.push(currentParagraph.trim());
        }
      } else {
        formattedParagraphs.push(paragraph.trim());
      }
    });
  
    return formattedParagraphs;
  };
  
  /**
   * Search for text in paragraphs or by paragraph number
   * @param {Array} paragraphs - Array of paragraph strings
   * @param {string} searchPhrase - Text to search for or paragraph number
   * @returns {Array} - Array of search result indices
   */
  export const searchSermon =  (paragraphs, searchPhrase) => {
    if (!searchPhrase || !paragraphs || paragraphs.length === 0) {
      return [];
    }
  
    const searchResults = [];
    
    // Check if search phrase is a paragraph number
    // First, check if it's a standalone number (e.g., "5" or "#5")
    const paragraphNumberMatch = searchPhrase.match(/^#?(\d+)$/);
    if (paragraphNumberMatch) {
      const paragraphNumber = parseInt(paragraphNumberMatch[1]);
      if (paragraphNumber > 0 && paragraphNumber <= paragraphs.length) {
        searchResults.push(paragraphNumber - 1); // Convert to zero-based index
        return searchResults;
      }
    }
    
    // Text search
    paragraphs.forEach((paragraph, index) => {
      if (paragraph.toLowerCase().includes(searchPhrase.toLowerCase())) {
        searchResults.push(index);
      }
    });
    
    return searchResults;
  };