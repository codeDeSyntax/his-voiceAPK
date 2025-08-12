/**
 * Test script to demonstrate the improved equal-volume paragraph algorithm
 */

// Import the updated functions
const { formatSermonIntoParagraphs } = require("./Utils/sermonUtils");

// Sample sermon text for testing
const sampleSermonText = `
This is the first major section of the sermon. It contains several sentences that should be grouped together based on content volume rather than arbitrary character limits. This approach ensures better readability and more natural paragraph breaks. The old algorithm would split based on character count alone, which often resulted in uneven paragraphs.

Now we have a second major section that talks about different concepts. This section also has multiple sentences that need to be properly grouped. The new algorithm considers word count and sentence boundaries to create more balanced paragraphs. It ensures that no words are broken across paragraph boundaries, maintaining the integrity of the text.

Here is a third section with even more content to test the algorithm. This section demonstrates how the equal-volume approach creates more consistent paragraph sizes. Instead of having some very short paragraphs and others very long, we now get paragraphs that are more similar in volume. This makes the reading experience much more pleasant and consistent for users.

The fourth section continues with additional content to further test our algorithm. The goal is to have paragraphs that are roughly equal in terms of word count and content volume. This approach respects natural sentence boundaries while ensuring that each paragraph contains a reasonable amount of content. No partial words will appear at the end of paragraphs.

Finally, this last section wraps up our test content. The algorithm should handle this appropriately, ensuring that the final paragraph doesn't become too small or too large compared to the others. If needed, it will merge small final paragraphs with the previous one to maintain balance.
`;

// Test the algorithm
console.log("Testing Equal-Volume Paragraph Algorithm");
console.log("========================================");

const paragraphs = formatSermonIntoParagraphs(sampleSermonText);

paragraphs.forEach((paragraph, index) => {
  const wordCount = paragraph.split(/\s+/).length;
  const charCount = paragraph.length;

  console.log(`\nParagraph ${index + 1}:`);
  console.log(`Words: ${wordCount}, Characters: ${charCount}`);
  console.log(
    `Text: ${paragraph.substring(0, 100)}${paragraph.length > 100 ? "..." : ""}`
  );
});

console.log(`\nTotal paragraphs created: ${paragraphs.length}`);
console.log("\nWord count distribution:");
const wordCounts = paragraphs.map((p) => p.split(/\s+/).length);
const avgWords = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;
const minWords = Math.min(...wordCounts);
const maxWords = Math.max(...wordCounts);

console.log(`Average: ${avgWords.toFixed(1)} words`);
console.log(`Range: ${minWords} - ${maxWords} words`);
console.log(
  `Variation: ${(((maxWords - minWords) / avgWords) * 100).toFixed(1)}%`
);
