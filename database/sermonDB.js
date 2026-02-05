import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system/legacy";

const DB_NAME = "sermons-db.db"; // Match downloadDatabase.js
let db = null; // Persistent database instance
let isIndexing = false; // Lock to prevent multiple indexing processes

/**
 * Get or open database connection (singleton pattern)
 */
export const openDatabase = async () => {
  try {
    if (db === null) {
      db = await SQLite.openDatabaseAsync(DB_NAME);
      console.log("Database opened successfully");
    }
    return db;
  } catch (error) {
    console.error("Error opening database:", error);
    // If database is corrupted, try to delete it so it can be re-downloaded
    if (error.message && error.message.includes("not a database")) {
      try {
        console.log("Database appears corrupted, attempting to delete...");
        const dbPath = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;
        await FileSystem.deleteAsync(dbPath);
        console.log("Corrupted database deleted");
        db = null; // Reset the singleton
      } catch (deleteError) {
        console.error("Error deleting corrupted database:", deleteError);
      }
    }
    throw error;
  }
};

/**
 * Check if search index exists and build if needed
 */
const checkAndBuildSearchIndex = async (database) => {
  try {
    // Prevent multiple indexing processes - check and set atomically
    if (isIndexing) {
      console.log("Search index already building, skipping...");
      return;
    }

    // Check if search index has been built
    const result = await database.getFirstAsync(
      "SELECT value FROM migration_status WHERE key = ?",
      ["search_index_built"],
    );

    if (result?.value !== "true") {
      // Set lock immediately before checking sermon count
      if (isIndexing) {
        console.log("Search index already building, skipping...");
        return;
      }
      isIndexing = true;

      console.log("Search index not found. Building index in background...");

      // Check if we have sermons to index
      const sermonCount = await database.getFirstAsync(
        "SELECT COUNT(*) as count FROM sermons WHERE sermon IS NOT NULL",
      );

      if (sermonCount?.count > 0) {
        // Build the index in background (don't await)
        rebuildSearchIndex()
          .then(() => {
            console.log("✅ Background search index built successfully!");
            // Mark as built
            return database.runAsync(
              "INSERT OR REPLACE INTO migration_status (key, value) VALUES (?, ?)",
              ["search_index_built", "true"],
            );
          })
          .catch((error) => {
            console.error("Error building search index in background:", error);
          })
          .finally(() => {
            // Release lock
            isIndexing = false;
          });

        console.log("Search index building started in background...");
      } else {
        // No sermons to index, release lock
        isIndexing = false;
      }
    } else {
      console.log("Search index already exists");
    }
  } catch (error) {
    console.error("Error checking search index:", error);
    isIndexing = false;
    // Don't throw - allow app to continue even if indexing fails
  }
};

/**
 * Initialize database - creates tables if they don't exist
 */
export const initializeDatabase = async () => {
  try {
    // Open the database
    const database = await openDatabase();
    console.log("Creating tables...");

    // Create sermons table
    await database.runAsync(`
      CREATE TABLE IF NOT EXISTS sermons (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        location TEXT,
        year TEXT,
        type TEXT NOT NULL,
        date TEXT,
        sermon TEXT,
        audioUrl TEXT,
        downloadLink TEXT,
        paragraph_count INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    await database.runAsync(`
      CREATE INDEX IF NOT EXISTS idx_sermons_type ON sermons(type)
    `);

    await database.runAsync(`
      CREATE INDEX IF NOT EXISTS idx_sermons_year ON sermons(year)
    `);

    await database.runAsync(`
      CREATE INDEX IF NOT EXISTS idx_sermons_date ON sermons(date)
    `);

    // Create FTS5 virtual table for full-text search
    await database.runAsync(`
      CREATE VIRTUAL TABLE IF NOT EXISTS sermons_fts USING fts5(
        sermon_id UNINDEXED,
        title,
        sermon
      )
    `);

    // Create pre-computed paragraphs table
    await database.runAsync(`
      CREATE TABLE IF NOT EXISTS sermon_paragraphs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sermon_id TEXT NOT NULL,
        paragraph_index INTEGER NOT NULL,
        paragraph_text TEXT NOT NULL,
        word_count INTEGER,
        start_char INTEGER,
        end_char INTEGER,
        FOREIGN KEY (sermon_id) REFERENCES sermons(id),
        UNIQUE(sermon_id, paragraph_index)
      )
    `);

    await database.runAsync(`
      CREATE INDEX IF NOT EXISTS idx_paragraphs_sermon ON sermon_paragraphs(sermon_id)
    `);

    await database.runAsync(`
      CREATE TABLE IF NOT EXISTS migration_status (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    console.log("Database tables initialized successfully");

    // Check if we need to build the search index
    await checkAndBuildSearchIndex(database);

    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    // If database is corrupted, delete it
    if (error.message && error.message.includes("not a database")) {
      try {
        console.log("Database is corrupted, deleting and resetting...");
        const dbPath = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;
        await FileSystem.deleteAsync(dbPath);
        console.log("Corrupted database deleted");
        db = null; // Reset singleton so next open creates fresh database
      } catch (deleteError) {
        console.error("Error deleting corrupted database:", deleteError);
      }
    }
    throw error;
  }
};

// Check if migration has been completed
export const isMigrationComplete = async () => {
  try {
    const database = await openDatabase();
    const result = await database.getFirstAsync(
      "SELECT value FROM migration_status WHERE key = ?",
      ["migration_completed"],
    );
    return result?.value === "true";
  } catch (error) {
    console.error("Error checking migration status:", error);
    return false;
  }
};

// Mark migration as complete
export const setMigrationComplete = async () => {
  try {
    const database = await openDatabase();
    await database.runAsync(
      "INSERT OR REPLACE INTO migration_status (key, value) VALUES (?, ?)",
      ["migration_completed", "true"],
    );
    console.log("Migration marked as complete");
  } catch (error) {
    console.error("Error setting migration status:", error);
    throw error;
  }
};

// Insert sermon into database
export const insertSermon = async (sermon) => {
  try {
    const database = await openDatabase();

    // Convert id to string to handle both number and string IDs
    const sermonId = String(sermon.id);

    // Count paragraphs if sermon text exists
    let paragraphCount = 0;
    if (sermon.sermon) {
      paragraphCount = sermon.sermon
        .split(/\n\s*\n/)
        .filter((p) => p.trim()).length;
    }

    await database.runAsync(
      `INSERT OR REPLACE INTO sermons 
       (id, title, location, year, type, date, sermon, audioUrl, downloadLink, paragraph_count) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sermonId,
        sermon.title || "",
        sermon.location || "",
        sermon.year || "",
        sermon.type || "text",
        sermon.date || "",
        sermon.sermon || "",
        sermon.audioUrl || "",
        sermon.downloadLink || "",
        paragraphCount,
      ],
    );

    // Index for search if sermon has text
    if (sermon.sermon) {
      await indexSermonForSearch(sermonId);
    }

    return true;
  } catch (error) {
    console.error("Error inserting sermon:", error);
    throw error;
  }
};

// Batch insert sermons (faster for migration)
export const insertSermonsBatch = async (sermons) => {
  try {
    const database = await openDatabase();

    console.log(`Starting batch insert of ${sermons.length} sermons...`);

    // Insert without transaction - let the caller handle transactions
    for (const sermon of sermons) {
      const sermonId = String(sermon.id);

      let paragraphCount = 0;
      if (sermon.sermon) {
        paragraphCount = sermon.sermon
          .split(/\n\s*\n/)
          .filter((p) => p.trim()).length;
      }

      await database.runAsync(
        `INSERT OR REPLACE INTO sermons 
         (id, title, location, year, type, date, sermon, audioUrl, downloadLink, paragraph_count) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sermonId,
          sermon.title || "",
          sermon.location || "",
          sermon.year || "",
          sermon.type || "text",
          sermon.date || "",
          sermon.sermon || "",
          sermon.audioUrl || "",
          sermon.downloadLink || "",
          paragraphCount,
        ],
      );
    }

    console.log(`Successfully inserted ${sermons.length} sermons`);
    return true;
  } catch (error) {
    console.error("Error in batch insert:", error);
    throw error;
  }
};

// Get all sermons metadata (for list view - lightweight)
export const getAllSermonsMetadata = async () => {
  try {
    const database = await openDatabase();

    // First, test the connection with a simple query
    try {
      await database.getFirstAsync("SELECT 1");
    } catch (testError) {
      console.error("Database connection test failed:", testError);
      throw new Error("Database is not properly initialized");
    }

    const sermons = await database.getAllAsync(
      `SELECT id, title, location, year, type, date, audioUrl, downloadLink, paragraph_count 
       FROM sermons 
       ORDER BY date DESC`,
    );

    // DEBUG: Log what we got
    console.log("=== getAllSermonsMetadata result ===");
    console.log("Total sermons:", sermons?.length || 0);
    if (sermons && sermons.length > 0) {
      console.log("First sermon keys:", Object.keys(sermons[0]));
      console.log("First sermon:", sermons[0]);
      // Check audio sermons
      const audioSermons = sermons.filter((s) => s.type === "mp3");
      console.log("Audio sermons count:", audioSermons.length);
      if (audioSermons.length > 0) {
        console.log("First audio sermon:", audioSermons[0]);
      }
    }

    return sermons || [];
  } catch (error) {
    console.error("Error getting sermons metadata:", error);
    throw error;
  }
};

// Get sermon by ID (full data including text)
export const getSermonById = async (sermonId) => {
  try {
    const database = await openDatabase();
    const sermon = await database.getFirstAsync(
      "SELECT * FROM sermons WHERE id = ?",
      [String(sermonId)],
    );

    return sermon;
  } catch (error) {
    console.error("Error getting sermon by ID:", error);
    throw error;
  }
};

// Get sermons by type
export const getSermonsByType = async (type) => {
  try {
    const database = await openDatabase();
    const sermons = await database.getAllAsync(
      `SELECT id, title, location, year, type, date, audioUrl, downloadLink, paragraph_count 
       FROM sermons 
       WHERE type = ? 
       ORDER BY date DESC`,
      [type],
    );
    return sermons;
  } catch (error) {
    console.error("Error getting sermons by type:", error);
    throw error;
  }
};

// Search sermons (searches title and sermon content)
export const searchSermons = async (searchText) => {
  try {
    const database = await openDatabase();
    const searchPattern = `%${searchText}%`;

    const sermons = await database.getAllAsync(
      `SELECT id, title, location, year, type, date, audioUrl, downloadLink, paragraph_count 
       FROM sermons 
       WHERE title LIKE ? OR sermon LIKE ?
       ORDER BY date DESC
       LIMIT 100`,
      [searchPattern, searchPattern],
    );

    return sermons;
  } catch (error) {
    console.error("Error searching sermons:", error);
    throw error;
  }
};

// Advanced search that returns sermon content with match context
export const searchSermonsWithContext = async (
  searchText,
  contextLength = 150,
) => {
  try {
    const database = await openDatabase();
    const searchPattern = `%${searchText}%`;

    // Get sermons that match the search (reduced limit for faster results)
    const sermons = await database.getAllAsync(
      `SELECT id, title, location, year, sermon
       FROM sermons 
       WHERE sermon LIKE ?
       ORDER BY date DESC
       LIMIT 20`,
      [searchPattern],
    );

    // Process results to extract context and paragraph indices
    const results = [];
    const regex = new RegExp(`(${searchText})`, "gi");

    for (const sermon of sermons) {
      // Use the same paragraph formatting as CurrentSermon to get accurate indices
      const formattedParagraphs = formatSermonForSearch(sermon.sermon);

      const matches = [];

      formattedParagraphs.forEach((paragraph, paragraphIndex) => {
        if (paragraph.trim() && regex.test(paragraph)) {
          regex.lastIndex = 0;
          const match = paragraph.match(regex);

          if (match) {
            const matchIndex = paragraph.indexOf(match[0]);
            const start = Math.max(0, matchIndex - contextLength);
            const end = Math.min(
              paragraph.length,
              matchIndex + match[0].length + contextLength,
            );
            const context = paragraph.slice(start, end);

            matches.push({
              paragraphIndex: paragraphIndex, // 0-based, matches CurrentSermon
              context: context.trim(),
              fullParagraph: paragraph,
            });
          }
        }
      });

      if (matches.length > 0) {
        results.push({
          id: sermon.id,
          title: sermon.title,
          year: sermon.year,
          location: sermon.location,
          sermon: sermon.sermon,
          matches: matches,
          totalMatches: matches.length,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Error searching sermons with context:", error);
    throw error;
  }
};

// Simplified sermon formatting for search - matches CurrentSermon's paragraph splitting
// This ensures paragraph indices match exactly between search and display
const formatSermonForSearch = (text) => {
  if (!text || text.length < 100) return [text];

  // Step 1: Clean and normalize text (same as CurrentSermon)
  const cleaned = text.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();

  // Step 2: Split by double newlines (major paragraph breaks)
  const rawParagraphs = cleaned
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 5);

  // Step 3: Apply equal-volume splitting (simplified but accurate)
  const result = [];

  for (const paragraph of rawParagraphs) {
    const trimmed = paragraph.trim();
    const wordCount = trimmed.split(/\s+/).length;

    // If paragraph is small enough, keep it as-is
    if (wordCount < 200) {
      result.push(trimmed);
      continue;
    }

    // For larger paragraphs, split into ~300 word chunks at sentence boundaries
    const sentences = trimmed.split(/(?<=[.!?])\s+/);
    let currentChunk = "";
    let currentWords = 0;

    for (const sentence of sentences) {
      const sentenceWords = sentence.split(/\s+/).length;

      if (currentWords > 0 && currentWords + sentenceWords > 350) {
        // Start new chunk
        if (currentChunk.trim()) {
          result.push(currentChunk.trim());
        }
        currentChunk = sentence;
        currentWords = sentenceWords;
      } else {
        currentChunk += (currentChunk ? " " : "") + sentence;
        currentWords += sentenceWords;
      }
    }

    // Add remaining chunk
    if (currentChunk.trim()) {
      result.push(currentChunk.trim());
    }
  }

  return result.length > 0 ? result : [text];
};

/**
 * Populate FTS5 and paragraphs tables for a sermon
 * Should be called after inserting a sermon
 */
export const indexSermonForSearch = async (sermonId) => {
  try {
    const database = await openDatabase();

    // Get the sermon
    const sermon = await database.getFirstAsync(
      "SELECT id, title, sermon FROM sermons WHERE id = ?",
      [sermonId],
    );

    if (!sermon || !sermon.sermon) {
      return;
    }

    // Insert into FTS5 table
    await database.runAsync(
      "INSERT OR REPLACE INTO sermons_fts(sermon_id, title, sermon) VALUES (?, ?, ?)",
      [sermon.id, sermon.title, sermon.sermon],
    );

    // Format sermon into paragraphs
    const paragraphs = formatSermonForSearch(sermon.sermon);

    // Insert paragraphs (use INSERT OR REPLACE to handle duplicates)
    for (let i = 0; i < paragraphs.length; i++) {
      const wordCount = paragraphs[i]
        .split(/\s+/)
        .filter((w) => w.trim()).length;
      await database.runAsync(
        `INSERT OR REPLACE INTO sermon_paragraphs 
         (sermon_id, paragraph_index, paragraph_text, word_count, start_char, end_char) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [sermon.id, i, paragraphs[i], wordCount, 0, 0],
      );
    }

    console.log(
      `Indexed sermon ${sermonId} with ${paragraphs.length} paragraphs`,
    );
  } catch (error) {
    console.error(`Error indexing sermon ${sermonId}:`, error);
  }
};

/**
 * Rebuild FTS5 and paragraphs tables for all sermons
 * Call this once after migration or when adding FTS5 for first time
 * Processes in batches to avoid memory issues
 */
export const rebuildSearchIndex = async () => {
  try {
    const database = await openDatabase();

    console.log("Rebuilding search index...");

    // Clear existing data
    await database.runAsync("DELETE FROM sermons_fts");
    await database.runAsync("DELETE FROM sermon_paragraphs");

    // Get total count first
    const countResult = await database.getFirstAsync(
      "SELECT COUNT(*) as count FROM sermons WHERE sermon IS NOT NULL",
    );
    const totalSermons = countResult?.count || 0;

    console.log(`Indexing ${totalSermons} sermons in batches...`);

    // Process in batches of 50 to avoid memory issues
    const batchSize = 50;
    let indexed = 0;
    let offset = 0;

    while (offset < totalSermons) {
      // Get batch of sermons
      const sermons = await database.getAllAsync(
        "SELECT id, title, sermon FROM sermons WHERE sermon IS NOT NULL LIMIT ? OFFSET ?",
        [batchSize, offset],
      );

      // Index each sermon in the batch
      for (const sermon of sermons) {
        await indexSermonForSearch(sermon.id);
        indexed++;
        if (indexed % 50 === 0) {
          console.log(`Indexed ${indexed}/${totalSermons} sermons`);
        }
      }

      offset += batchSize;

      // Small delay between batches to let other operations run
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    console.log("Search index rebuilt successfully");
    return true;
  } catch (error) {
    console.error("Error rebuilding search index:", error);
    throw error;
  }
};

/**
 * Search sermons using FTS5 with pre-computed paragraphs
 * Much faster than the old approach
 */
export const searchSermonsWithFTS = async (searchPhrase) => {
  try {
    if (!searchPhrase || searchPhrase.trim().length === 0) {
      return [];
    }

    const database = await openDatabase();
    const pattern = `%${searchPhrase.toLowerCase()}%`;

    // Use FTS5 to find matching sermons (much faster)
    const matchingSermons = await database.getAllAsync(
      `SELECT DISTINCT s.id, s.title, s.year, s.location
       FROM sermons s
       INNER JOIN sermons_fts ON sermons_fts.sermon_id = s.id
       WHERE sermons_fts MATCH ?
       ORDER BY s.date DESC
       LIMIT 20`,
      [searchPhrase],
    );

    const results = [];

    for (const sermon of matchingSermons) {
      // Get matching paragraphs from pre-computed table
      const paragraphMatches = await database.getAllAsync(
        `SELECT paragraph_index, paragraph_text
         FROM sermon_paragraphs
         WHERE sermon_id = ? AND paragraph_text LIKE ?
         ORDER BY paragraph_index
         LIMIT 5`,
        [sermon.id, pattern],
      );

      if (paragraphMatches.length > 0) {
        // Extract context (first 200 chars of first match)
        const firstMatch = paragraphMatches[0].paragraph_text;
        const matchIndex = firstMatch
          .toLowerCase()
          .indexOf(searchPhrase.toLowerCase());
        const start = Math.max(0, matchIndex - 50);
        const end = Math.min(
          firstMatch.length,
          matchIndex + searchPhrase.length + 100,
        );
        let context = firstMatch.substring(start, end);
        if (start > 0) context = "..." + context;
        if (end < firstMatch.length) context = context + "...";

        results.push({
          id: sermon.id,
          title: sermon.title,
          year: sermon.year,
          location: sermon.location,
          matches: paragraphMatches.map((pm) => ({
            paragraphIndex: pm.paragraph_index,
            context: context, // Using first match context for preview
            fullParagraph: pm.paragraph_text,
          })),
          totalMatches: paragraphMatches.length,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Error in FTS search:", error);
    throw error;
  }
};

/**
 * Get pre-computed paragraphs for a sermon
 */
export const getSermonParagraphs = async (sermonId) => {
  try {
    const database = await openDatabase();
    const paragraphs = await database.getAllAsync(
      `SELECT paragraph_index, paragraph_text 
       FROM sermon_paragraphs 
       WHERE sermon_id = ? 
       ORDER BY paragraph_index`,
      [sermonId],
    );
    return paragraphs.map((p) => p.paragraph_text);
  } catch (error) {
    console.error(`Error getting paragraphs for sermon ${sermonId}:`, error);
    return [];
  }
};

// Get sermon count
export const getSermonCount = async () => {
  try {
    const database = await openDatabase();
    const result = await database.getFirstAsync(
      "SELECT COUNT(*) as count FROM sermons",
    );
    return result?.count || 0;
  } catch (error) {
    console.error("Error getting sermon count:", error);
    return 0;
  }
};

// Clear all data (useful for testing)
export const clearAllData = async () => {
  try {
    const database = await openDatabase();

    // Drop the old tables to handle schema changes
    await database.execAsync(`
      DROP TABLE IF EXISTS sermons_fts;
      DROP TABLE IF EXISTS sermon_paragraphs;
      DELETE FROM sermons;
      DELETE FROM migration_status;
    `);

    console.log("All data cleared");
    return true;
  } catch (error) {
    console.error("Error clearing data:", error);
    throw error;
  }
};

// Close database connection
export const closeDatabase = async () => {
  if (db) {
    await db.closeAsync();
    db = null;
    console.log("Database closed");
  }
};
