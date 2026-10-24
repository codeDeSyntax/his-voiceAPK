import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system/legacy";
import { formatSermonIntoParagraphs } from "../utils/paragraphSplitter";
import type { Sermon, SermonId, SermonType } from "../types";
import { errorMessage } from "../../../shared/utils/errors";
import { DATABASE_NAME, getDatabaseDirectory, getDatabasePath } from './databaseLocation';
import { waitForDatabaseReplacement } from './databaseLifecycle';

let db: SQLite.SQLiteDatabase | null = null; // Persistent database instance
let isIndexing = false; // Lock to prevent multiple indexing processes
let connectionAttempts = 0;
let isOpening = false; // Lock to prevent concurrent database opens
let openPromise: Promise<SQLite.SQLiteDatabase> | null = null; // Shared promise for concurrent callers
let isInitialized = false; // Lock to prevent multiple initializations
let initPromise: Promise<boolean> | null = null; // Shared promise for concurrent init callers
let closePromise: Promise<void> | null = null;
const MAX_CONNECTION_RETRIES = 3;
interface ValueRow { value: string }
interface CountRow { count: number }
interface SermonRow extends Sermon { sermon: string | null }
interface SearchSermonRow {
  id: string;
  title: string;
  location: string | null;
  year: string | null;
  type: SermonType;
  date: string | null;
  sermon: string | null;
  audioUrl: string | null;
  downloadLink: string | null;
  paragraph_count: number | null;
}
interface ParagraphMatchRow { paragraph_index: number; paragraph_text: string }
interface TableNameRow { name: string }

/**
 * Get fresh database connection - avoids singleton issues
 * Each operation gets its own connection to prevent conflicts
 */
const getFreshConnection = async () => {
  try {
    await waitForDatabaseReplacement();
    if (closePromise) await closePromise;
    const connection = await SQLite.openDatabaseAsync(DATABASE_NAME, { useNewConnection: true }, getDatabaseDirectory());
    return connection;
  } catch (error) {
    console.error("Error getting fresh database connection:", error);
    throw error;
  }
};

/**
 * Get or open database connection (singleton pattern for primary operations)
 */
export const openDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  await waitForDatabaseReplacement();
  if (closePromise) await closePromise;
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
        db = await SQLite.openDatabaseAsync(DATABASE_NAME, {}, getDatabaseDirectory());
        if (__DEV__) console.log(`Database opened: ${getDatabasePath()}`);
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
    if (errorMessage(error).includes("not a database")) {
      try {
        console.log("Database appears corrupted, attempting to delete...");
        const dbPath = getDatabasePath();
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
 * Verify the pre-built search index shipped with the database.
 * Falls back to a background rebuild only for legacy databases.
 */
const checkAndBuildSearchIndex = async (database: SQLite.SQLiteDatabase) => {
  try {
    const result = await database.getFirstAsync<ValueRow>(
      "SELECT value FROM migration_status WHERE key = ?",
      ["search_index_built"],
    );

    if (result?.value === "true") {
      console.log("✅ Pre-built search index detected");
      return true;
    }

    if (isIndexing) {
      console.log("Search index already building in background...");
      return true;
    }

    const sermonCount = await database.getFirstAsync<CountRow>(
      "SELECT COUNT(*) as count FROM sermons WHERE sermon IS NOT NULL",
    );

    if (!sermonCount?.count) {
      return true;
    }

    console.log(
      "Legacy database without search index. Building index in background...",
    );
    isIndexing = true;

    setTimeout(() => {
      rebuildSearchIndex()
        .then(async (built) => {
          if (!built) {
            return;
          }
          await database.runAsync(
            "INSERT OR REPLACE INTO migration_status (key, value) VALUES (?, ?)",
            ["search_index_built", "true"],
          );
          console.log("✅ Legacy search index built successfully!");
        })
        .catch((error) => {
          console.error("Error building legacy search index:", error);
        })
        .finally(() => {
          isIndexing = false;
        });
    }, 500);

    return true;
  } catch (error) {
    console.error("Error checking search index:", error);
    return true;
  }
};

/**
 * Initialize database - creates tables if they don't exist
 */
export const initializeDatabase = async () => {
  // If already initialized, return immediately
  if (isInitialized) {
    return true;
  }

  // If another call is already initializing, wait for it
  if (initPromise) {
    return await initPromise;
  }

  initPromise = (async () => {
    try {
      // Open the database (singleton pattern handles this)
      const database = await openDatabase();

      // Check if tables already exist (downloaded database)
      try {
        const tableCheck = await database.getFirstAsync<TableNameRow>(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='sermons'",
        );

        if (tableCheck) {
          // Even if main tables exist, ensure FTS5 and paragraphs tables are created
          // These might not exist in the downloaded database
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

      await checkAndBuildSearchIndex(database);

      isInitialized = true;
      return true;
    } catch (error) {
      console.error("Error initializing database:", error);
      // If database is corrupted, delete it
      if (errorMessage(error).includes("not a database")) {
        try {
          console.log("Database is corrupted, deleting and resetting...");
          const dbPath = getDatabasePath();
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
    const result = await database.getFirstAsync<ValueRow>(
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
export const insertSermon = async (sermon: Sermon) => {
  try {
    const database = await openDatabase();

    // Convert id to string to handle both number and string IDs
    const sermonId = String(sermon.id);

    // Count paragraphs if sermon text exists
    let paragraphCount = 0;
    if (sermon.sermon) {
      paragraphCount = sermon.sermon
        .split(/\n\s*\n/)
        .filter((p: string) => p.trim()).length;
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
export const insertSermonsBatch = async (sermons: Sermon[]) => {
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
          .filter((p: string) => p.trim()).length;
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

    const sermons = await database.getAllAsync<SermonRow>(
      `SELECT id, title, location, year, type, date, audioUrl, downloadLink, paragraph_count 
       FROM sermons 
       ORDER BY date DESC`,
    );

    return sermons || [];
  } catch (error) {
    console.error("Error getting sermons metadata:", error);
    throw error;
  }
};

// Get sermon by ID (full data including text)
export const getSermonById = async (sermonId: SermonId) => {
  try {
    const database = await openDatabase();
    const sermon = await database.getFirstAsync<SermonRow>(
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
export const getSermonsByType = async (type: SermonType): Promise<Sermon[]> => {
  try {
    const database = await openDatabase();
    const sermons = await database.getAllAsync<SearchSermonRow>(
      `SELECT id, title, location, year, type, date, audioUrl, downloadLink, paragraph_count 
       FROM sermons 
       WHERE type = ? 
       ORDER BY date DESC`,
      [type],
    );
    return sermons as Sermon[];
  } catch (error) {
    console.error("Error getting sermons by type:", error);
    throw error;
  }
};

// Search sermons (searches title and sermon content)
export const searchSermons = async (searchText: string) => {
  try {
    const database = await openDatabase();
    const searchPattern = `%${searchText}%`;

    const sermons = await database.getAllAsync<SearchSermonRow>(
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
  searchText: string,
  contextLength = 150,
) => {
  try {
    const database = await openDatabase();
    const searchPattern = `%${searchText}%`;

    // Get sermons that match the search (reduced limit for faster results)
    const sermons = await database.getAllAsync<SearchSermonRow>(
      `SELECT id, title, location, year, sermon
       FROM sermons 
       WHERE sermon LIKE ?
       ORDER BY date DESC
       LIMIT 20`,
      [searchPattern],
    );

    // Process results to extract context and paragraph indices
    const results: Array<{ id: string | number; title: string; year?: string | null; location?: string | null; sermon: string | null; matches: Array<{ paragraphIndex: number; context: string; fullParagraph: string }>; totalMatches: number }> = [];
    const regex = new RegExp(`(${searchText})`, "gi");

    for (const sermon of sermons) {
      // Use the unified paragraph formatting algorithm for consistent indexing
      const formattedParagraphs = formatSermonIntoParagraphs(sermon.sermon ?? "");

      const matches: Array<{
        paragraphIndex: number;
        context: string;
        fullParagraph: string;
      }> = [];

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
  sermonId: SermonId,
  retryCount = 0,
  dbConnection: SQLite.SQLiteDatabase | null = null,
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
    const sermon = await database.getFirstAsync<{ id: string; title: string; sermon: string | null }>(
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
        errorMessage(dbWriteError).includes("readonly") ||
        errorMessage(dbWriteError).includes("closed")
      ) {
        return; // Silently stop - database is being reset
      }
      throw dbWriteError; // Re-throw other errors
    }

    console.log(`✅ Indexed sermon ${sermonId}`);
  } catch (error) {
    // If indexing was stopped, don't retry - just exit silently
    if (!isIndexing) {
      return;
    }

    // NullPointerException means the DB connection is dead
    // Stop ALL indexing - no point retrying individual sermons
    if (errorMessage(error).includes("NullPointerException")) {
      console.error(
        `❌ Database connection lost at sermon ${sermonId} - stopping indexing`,
      );
      isIndexing = false;
      return;
    }

    // For other errors, just log and continue to next sermon
    console.error(
      `⚠️ Failed indexing sermon ${sermonId}: ${errorMessage(error)}`,
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
          errorMessage(connError),
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
    const countResult = await database.getFirstAsync<CountRow>(
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

      // Verify database connection is still alive before each batch
      try {
        await database.getFirstAsync("SELECT 1");
      } catch (connCheckError) {
        console.error("❌ Database connection lost during indexing - stopping");
        isIndexing = false;
        break;
      }

      // Get batch of sermons
      const sermons = await database.getAllAsync<SearchSermonRow>(
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
export const searchSermonsWithFTS = async (searchPhrase: string) => {
  try {
    if (!searchPhrase || searchPhrase.trim().length === 0) {
      return [];
    }

    const database = await openDatabase();
    const pattern = `%${searchPhrase.toLowerCase()}%`;

    // Sanitize for FTS5: strip quotes and special FTS operators, then wrap
    // in double-quotes so FTS5 treats it as an exact phrase match.
    const sanitized = searchPhrase.replace(/['"*^(){}:]/g, " ").trim();
    const ftsQuery = `"${sanitized}"`;

    // Use FTS5 to find matching sermons (much faster)
    const matchingSermons = await database.getAllAsync<{ id: string; title: string; year: string | null; location: string | null }>(
      `SELECT DISTINCT s.id, s.title, s.year, s.location
       FROM sermons s
       INNER JOIN sermons_fts ON sermons_fts.sermon_id = s.id
       WHERE sermons_fts MATCH ?
       ORDER BY s.date DESC`,
      [ftsQuery],
    );

    const results = [];

    for (const sermon of matchingSermons) {
      // Get matching paragraphs from pre-computed table
      const paragraphMatches = await database.getAllAsync<ParagraphMatchRow>(
        `SELECT paragraph_index, paragraph_text
         FROM sermon_paragraphs
         WHERE sermon_id = ? AND paragraph_text LIKE ?
         ORDER BY paragraph_index`,
        [sermon.id, pattern],
      );

      if (paragraphMatches.length > 0) {
        // Extract a longer context window around the first match for richer previews
        const firstMatch = paragraphMatches[0].paragraph_text;
        const matchIndex = firstMatch
          .toLowerCase()
          .indexOf(searchPhrase.toLowerCase());
        const start = Math.max(0, matchIndex - 130);
        const end = Math.min(
          firstMatch.length,
          matchIndex + searchPhrase.length + 300,
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
export const getSermonParagraphs = async (sermonId: SermonId): Promise<string[]> => {
  try {
    const database = await openDatabase();
    const paragraphs = await database.getAllAsync<ParagraphMatchRow>(
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
    const result = await database.getFirstAsync<CountRow>(
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

// Reset database state variables without touching the native connection
// Use this when you need a fresh connection (e.g., after downloading a new DB file)
// but calling closeAsync() would crash (e.g., on fresh app with no open connection)
export const resetDatabaseState = () => {
  console.log("🔄 Resetting database state (no native close)...");
  db = null;
  isOpening = false;
  openPromise = null;
  isInitialized = false;
  initPromise = null;
  console.log(
    "✅ Database state reset - next access will open fresh connection",
  );
};

// Close database connection
export const closeDatabase = async () => {
  if (closePromise) return closePromise;
  closePromise = (async () => {
    // An open started before a download/reset must finish before its file is replaced.
    if (openPromise) await openPromise;
    if (db) {
      // Let failures reach the caller: replacing a file whose handle is still open is unsafe.
      await db.closeAsync();
      console.log("✅ Database closed successfully");
    }
    db = null;
    isOpening = false;
    openPromise = null;
    isInitialized = false;
    initPromise = null;
  })().finally(() => { closePromise = null; });
  return closePromise;
};
