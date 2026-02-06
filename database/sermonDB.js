import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system/legacy";
import { formatSermonIntoParagraphs } from "../Utils/paragraphSplitter";

const DB_NAME = "sermons-db.db"; // Match downloadDatabase.js
let db = null; // Persistent database instance
let isIndexing = false; // Lock to prevent multiple indexing processes
let connectionAttempts = 0;
let isOpening = false; // Lock to prevent concurrent database opens
let openPromise = null; // Shared promise for concurrent callers
let isInitialized = false; // Lock to prevent multiple initializations
let initPromise = null; // Shared promise for concurrent init callers
const MAX_CONNECTION_RETRIES = 3;

/**
 * Get the full database file path
 */
const getDatabasePath = () => {
  return `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;
};

/**
 * Get fresh database connection - avoids singleton issues
 * Each operation gets its own connection to prevent conflicts
 */
const getFreshConnection = async () => {
  try {
    const connection = await SQLite.openDatabaseAsync(DB_NAME);
    return connection;
  } catch (error) {
    console.error("Error getting fresh database connection:", error);
    throw error;
  }
};

/**
 * Get or open database connection (singleton pattern for primary operations)
 */
export const openDatabase = async () => {
  try {
    // If already open, return immediately
    if (db !== null) {
      return db;
    }

    // If another call is already opening, wait for it
    if (isOpening && openPromise) {
      return await openPromise;
    }

    // Set lock and create shared promise
    isOpening = true;
    openPromise = (async () => {
      try {
        connectionAttempts = 0;

        // Verify the database file exists
        const dbPath = getDatabasePath();
        const fileInfo = await FileSystem.getInfoAsync(dbPath);
        console.log(`📂 Opening database at: ${dbPath}`);
        console.log(
          `📊 File exists: ${fileInfo.exists}, Size: ${fileInfo.exists ? (fileInfo.size / 1024 / 1024).toFixed(2) + " MB" : "N/A"}`,
        );

        db = await SQLite.openDatabaseAsync(DB_NAME);
        console.log("Database opened successfully");

        // Immediately verify sermon count after opening (optional, for debugging)
        try {
          const countCheck = await db.getFirstAsync(
            "SELECT COUNT(*) as count FROM sermons",
          );
          console.log(
            `📊 Sermon count immediately after opening: ${countCheck?.count || 0}`,
          );
        } catch (countError) {
          // Table might not exist yet, ignore this error
          console.log(
            "📂 Sermon count check skipped (table may not exist yet)",
          );
        }

        return db;
      } finally {
        isOpening = false;
        openPromise = null;
      }
    })();

    return await openPromise;
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

    // If we still have a valid db reference despite error, return it
    if (db) {
      console.warn("Returning existing db connection despite error");
      return db;
    }

    throw error;
  }
};

/**
 * Check if search index exists and build if needed
 */
const checkAndBuildSearchIndex = async (database) => {
  try {
    // Prevent multiple indexing processes - set lock immediately
    if (isIndexing) {
      console.log("Search index already building, skipping...");
      return;
    }
    // Set lock BEFORE any async operations to prevent race conditions
    isIndexing = true;

    // Check if search index has been built
    const result = await database.getFirstAsync(
      "SELECT value FROM migration_status WHERE key = ?",
      ["search_index_built"],
    );

    if (result?.value === "true") {
      console.log("Search index already exists");
      isIndexing = false;
      return;
    }

    console.log("Search index not found. Building index in background...");

    // Check if we have sermons to index
    const sermonCount = await database.getFirstAsync(
      "SELECT COUNT(*) as count FROM sermons WHERE sermon IS NOT NULL",
    );

    if (sermonCount?.count > 0) {
      // Delay indexing by 2 seconds to avoid immediate connection issues
      // This lets the main connection stabilize first
      setTimeout(() => {
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
      }, 2000);

      console.log("Search index building scheduled for background...");
    } else {
      // No sermons to index, release lock
      isIndexing = false;
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
  // If already initialized, return immediately
  if (isInitialized) {
    console.log("✅ Database already initialized, skipping...");
    return true;
  }

  // If another call is already initializing, wait for it
  if (initPromise) {
    console.log("⏳ Waiting for existing initialization...");
    return await initPromise;
  }

  initPromise = (async () => {
    try {
      // Open the database (singleton pattern handles this)
      const database = await openDatabase();

      // Check if tables already exist (downloaded database)
      try {
        const tableCheck = await database.getFirstAsync(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='sermons'",
        );

        if (tableCheck) {
          console.log(
            "✅ Tables already exist (downloaded database) - skipping creation",
          );

          // Even if main tables exist, ensure FTS5 and paragraphs tables are created
          // These might not exist in the downloaded database
          console.log("Creating search-related tables if needed...");

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

          console.log("✅ Search tables created/verified");

          // Just check and build search index if needed
          await checkAndBuildSearchIndex(database);
          isInitialized = true;
          return true;
        }
      } catch (checkError) {
        console.log("No existing tables found, will create new ones");
      }

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

      isInitialized = true;
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
  })();

  try {
    const result = await initPromise;
    return result;
  } catch (error) {
    isInitialized = false;
    throw error;
  } finally {
    initPromise = null;
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
      // Use the unified paragraph formatting algorithm for consistent indexing
      const formattedParagraphs = formatSermonIntoParagraphs(sermon.sermon);

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
/**
 * Populate FTS5 and paragraphs tables for a sermon
 * Should be called after inserting a sermon
 */
export const indexSermonForSearch = async (
  sermonId,
  retryCount = 0,
  dbConnection = null,
) => {
  const MAX_RETRIES = 2;

  try {
    // Check if indexing was stopped before starting
    if (!isIndexing) {
      return;
    }

    // Use passed connection or fallback to singleton
    const database = dbConnection || (await openDatabase());

    // Verify database is not null
    if (!database) {
      console.error(
        `⚠️ Database is null for sermon ${sermonId}, skipping indexing`,
      );
      return;
    }

    // Get the sermon
    const sermon = await database.getFirstAsync(
      "SELECT id, title, sermon FROM sermons WHERE id = ?",
      [sermonId],
    );

    if (!sermon || !sermon.sermon) {
      return;
    }

    // Check again before writing
    if (!isIndexing) {
      return;
    }

    // Wrap all database writes in try-catch to handle closed database
    try {
      // Insert into FTS5 table
      await database.runAsync(
        "INSERT OR REPLACE INTO sermons_fts(sermon_id, title, sermon) VALUES (?, ?, ?)",
        [sermon.id, sermon.title, sermon.sermon],
      );

      // Format sermon into paragraphs using unified algorithm
      const paragraphs = formatSermonIntoParagraphs(sermon.sermon);

      // Insert paragraphs (use INSERT OR REPLACE to handle duplicates)
      for (let i = 0; i < paragraphs.length; i++) {
        // Check if stopped during loop
        if (!isIndexing) {
          return;
        }

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
    } catch (dbWriteError) {
      // If database is closed/readonly, silently fail - this is expected during reset
      if (
        dbWriteError.message?.includes("readonly") ||
        dbWriteError.message?.includes("closed")
      ) {
        return; // Silently stop - database is being reset
      }
      throw dbWriteError; // Re-throw other errors
    }

    console.log(`✅ Indexed sermon ${sermonId}`);
  } catch (error) {
    // Retry logic for connection errors
    if (
      retryCount < MAX_RETRIES &&
      error.message?.includes("NullPointerException")
    ) {
      console.warn(
        `⚠️ Retrying indexing sermon ${sermonId} (attempt ${retryCount + 1}/${MAX_RETRIES})...`,
      );
      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, 500 * (retryCount + 1)),
      );
      return indexSermonForSearch(sermonId, retryCount + 1, dbConnection);
    }

    // Silently fail after retries - indexing is background work
    console.error(
      `⚠️ Failed indexing sermon ${sermonId}: ${error.message || error}`,
    );
  }
};

/**
 * Rebuild FTS5 and paragraphs tables for all sermons
 * Call this once after migration or when adding FTS5 for first time
 * Processes in batches to avoid memory issues
 */
export const rebuildSearchIndex = async () => {
  try {
    // Add a small delay to ensure database is fully stable
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Get fresh database connection and verify it's valid
    let database = null;
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries && !database) {
      try {
        database = await openDatabase();

        // Verify database is not null and is functional
        if (!database) {
          throw new Error("Database is null");
        }

        // Test the connection
        await database.getFirstAsync("SELECT 1");
        console.log("✅ Database connection verified for indexing");
        break;
      } catch (connError) {
        retries++;
        console.warn(
          `⚠️ Database connection attempt ${retries}/${maxRetries} failed:`,
          connError.message,
        );

        if (retries < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
          database = null;
        } else {
          console.error(
            "❌ Failed to get valid database connection for indexing",
          );
          isIndexing = false;
          return false;
        }
      }
    }

    if (!database) {
      console.error("❌ No valid database connection available");
      isIndexing = false;
      return false;
    }

    console.log("🔍 Rebuilding search index...");

    // Check if tables exist before trying to clear them
    const ftsTableExists = await database.getFirstAsync(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='sermons_fts'",
    );
    const paragraphsTableExists = await database.getFirstAsync(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='sermon_paragraphs'",
    );

    // Clear existing data only if tables exist
    if (ftsTableExists) {
      console.log("Clearing existing FTS data...");
      await database.runAsync("DELETE FROM sermons_fts");
    }
    if (paragraphsTableExists) {
      console.log("Clearing existing paragraphs data...");
      await database.runAsync("DELETE FROM sermon_paragraphs");
    }

    // Get total count first
    const countResult = await database.getFirstAsync(
      "SELECT COUNT(*) as count FROM sermons WHERE sermon IS NOT NULL",
    );
    const totalSermons = countResult?.count || 0;

    console.log(`📚 Indexing ${totalSermons} sermons in batches...`);

    // Process in batches of 50 to avoid memory issues
    const batchSize = 50;
    let indexed = 0;
    let offset = 0;

    while (offset < totalSermons) {
      // Check if indexing was force-stopped
      if (!isIndexing) {
        console.log("⚠️ Indexing was stopped");
        break;
      }

      // Get batch of sermons
      const sermons = await database.getAllAsync(
        "SELECT id, title, sermon FROM sermons WHERE sermon IS NOT NULL LIMIT ? OFFSET ?",
        [batchSize, offset],
      );

      // Index each sermon in the batch
      for (const sermon of sermons) {
        if (!isIndexing) {
          console.log("⚠️ Indexing was stopped");
          break;
        }
        await indexSermonForSearch(sermon.id, 0, database);
        indexed++;
        if (indexed % 50 === 0) {
          console.log(`📊 Indexed ${indexed}/${totalSermons} sermons`);
        }
      }

      offset += batchSize;

      // Small delay between batches to let other operations run
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    console.log("✅ Search index rebuilt successfully");
    return true;
  } catch (error) {
    console.error("❌ Error rebuilding search index:", error);
    // Don't throw - allow app to continue even if indexing fails
    return false;
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

// Wait for any ongoing indexing to complete
export const waitForIndexingComplete = async (maxWaitTime = 30000) => {
  const startTime = Date.now();
  while (isIndexing && Date.now() - startTime < maxWaitTime) {
    console.log("⏳ Waiting for search indexing to complete...");
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (isIndexing) {
    console.warn("⚠️ Indexing timeout - proceeding anyway");
  } else {
    console.log("✅ Indexing complete");
  }
};

// Force-stop indexing (for emergency reset scenarios)
export const forceStopIndexing = () => {
  if (isIndexing) {
    console.warn("🛑 FORCE-STOPPING all indexing operations");
    isIndexing = false;
  }
};

// Close database connection
export const closeDatabase = async () => {
  if (db) {
    try {
      await db.closeAsync();
      db = null;
      isOpening = false;
      openPromise = null;
      isInitialized = false;
      initPromise = null;
      console.log("Database closed");
    } catch (error) {
      console.warn("⚠️ Error closing database:", error.message);
      // Force null even if close fails
      db = null;
      isOpening = false;
      openPromise = null;
      isInitialized = false;
      initPromise = null;
    }
  } else {
    console.log("✅ No database connection to close");
  }
};
