// import * as SQLite from "expo-sqlite";
// import * as FileSystem from "expo-file-system";
// import { Asset } from "expo-asset";

// const DB_NAME = "sermons.db";

// /**
//  * Copy the bundled database to the app's document directory
//  * This runs once on first launch
//  */
// export const copyBundledDatabase = async () => {
//   try {
//     const dbPath = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;

//     // Check if database already exists
//     const dbExists = await FileSystem.getInfoAsync(dbPath);

//     if (dbExists.exists) {
//       console.log("Database already exists, skipping copy");
//       return { success: true, alreadyExists: true };
//     }

//     console.log("Copying bundled database...");

//     // Ensure SQLite directory exists
//     const sqliteDir = `${FileSystem.documentDirectory}SQLite`;
//     const dirInfo = await FileSystem.getInfoAsync(sqliteDir);
//     if (!dirInfo.exists) {
//       await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });
//     }

//     // Load the bundled database asset
//     const asset = Asset.fromModule(require("../assets/sermons.db"));
//     await asset.downloadAsync();

//     // Copy the database file
//     await FileSystem.copyAsync({
//       from: asset.localUri,
//       to: dbPath,
//     });

//     console.log("✅ Database copied successfully to:", dbPath);
//     return { success: true, alreadyExists: false };
//   } catch (error) {
//     console.error("Error copying bundled database:", error);
//     return { success: false, error: error.message };
//   }
// };

// /**
//  * Open database connection
//  */
// export const openDatabase = async () => {
//   try {
//     const db = await SQLite.openDatabaseAsync(DB_NAME);
//     console.log("Database opened successfully");
//     return db;
//   } catch (error) {
//     console.error("Error opening database:", error);
//     throw error;
//   }
// };

// /**
//  * Initialize database - copies bundled DB and opens it
//  */
// export const initializeDatabase = async () => {
//   try {
//     // Copy bundled database if needed
//     const copyResult = await copyBundledDatabase();
//     if (!copyResult.success) {
//       throw new Error(`Failed to copy database: ${copyResult.error}`);
//     }

//     // Open the database
//     const database = await openDatabase();

//     // Create sermons table - stores as-is from your current format
//     await database.execAsync(`
//       CREATE TABLE IF NOT EXISTS sermons (
//         id TEXT PRIMARY KEY,
//         title TEXT NOT NULL,
//         location TEXT,
//         year TEXT,
//         type TEXT NOT NULL,
//         date TEXT,
//         sermon TEXT,
//         audioUrl TEXT,
//         downloadLink TEXT,
//         paragraph_count INTEGER DEFAULT 0,
//         created_at INTEGER DEFAULT (strftime('%s', 'now'))
//       );
      
//       CREATE INDEX IF NOT EXISTS idx_sermons_type ON sermons(type);
//       CREATE INDEX IF NOT EXISTS idx_sermons_year ON sermons(year);
//       CREATE INDEX IF NOT EXISTS idx_sermons_date ON sermons(date);
      
//       CREATE TABLE IF NOT EXISTS migration_status (
//         key TEXT PRIMARY KEY,
//         value TEXT,
//         updated_at INTEGER DEFAULT (strftime('%s', 'now'))
//       );
//     `);

//     console.log("Database tables initialized successfully");
//     return true;
//   } catch (error) {
//     console.error("Error initializing database:", error);
//     throw error;
//   }
// };

// // Check if migration has been completed
// export const isMigrationComplete = async () => {
//   try {
//     const database = await openDatabase();
//     const result = await database.getFirstAsync(
//       "SELECT value FROM migration_status WHERE key = ?",
//       ["migration_completed"],
//     );
//     return result?.value === "true";
//   } catch (error) {
//     console.error("Error checking migration status:", error);
//     return false;
//   }
// };

// // Mark migration as complete
// export const setMigrationComplete = async () => {
//   try {
//     const database = await openDatabase();
//     await database.runAsync(
//       "INSERT OR REPLACE INTO migration_status (key, value) VALUES (?, ?)",
//       ["migration_completed", "true"],
//     );
//     console.log("Migration marked as complete");
//   } catch (error) {
//     console.error("Error setting migration status:", error);
//     throw error;
//   }
// };

// // Insert sermon into database
// export const insertSermon = async (sermon) => {
//   try {
//     const database = await openDatabase();

//     // Convert id to string to handle both number and string IDs
//     const sermonId = String(sermon.id);

//     // Count paragraphs if sermon text exists
//     let paragraphCount = 0;
//     if (sermon.sermon) {
//       paragraphCount = sermon.sermon
//         .split(/\n\s*\n/)
//         .filter((p) => p.trim()).length;
//     }

//     await database.runAsync(
//       `INSERT OR REPLACE INTO sermons 
//        (id, title, location, year, type, date, sermon, audioUrl, downloadLink, paragraph_count) 
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         sermonId,
//         sermon.title || "",
//         sermon.location || "",
//         sermon.year || "",
//         sermon.type || "text",
//         sermon.date || "",
//         sermon.sermon || "",
//         sermon.audioUrl || "",
//         sermon.downloadLink || "",
//         paragraphCount,
//       ],
//     );

//     return true;
//   } catch (error) {
//     console.error("Error inserting sermon:", error);
//     throw error;
//   }
// };

// // Batch insert sermons (faster for migration)
// export const insertSermonsBatch = async (sermons) => {
//   try {
//     const database = await openDatabase();

//     console.log(`Starting batch insert of ${sermons.length} sermons...`);

//     // Insert without transaction - let the caller handle transactions
//     for (const sermon of sermons) {
//       const sermonId = String(sermon.id);

//       let paragraphCount = 0;
//       if (sermon.sermon) {
//         paragraphCount = sermon.sermon
//           .split(/\n\s*\n/)
//           .filter((p) => p.trim()).length;
//       }

//       await database.runAsync(
//         `INSERT OR REPLACE INTO sermons 
//          (id, title, location, year, type, date, sermon, audioUrl, downloadLink, paragraph_count) 
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//         [
//           sermonId,
//           sermon.title || "",
//           sermon.location || "",
//           sermon.year || "",
//           sermon.type || "text",
//           sermon.date || "",
//           sermon.sermon || "",
//           sermon.audioUrl || "",
//           sermon.downloadLink || "",
//           paragraphCount,
//         ],
//       );
//     }

//     console.log(`Successfully inserted ${sermons.length} sermons`);
//     return true;
//   } catch (error) {
//     console.error("Error in batch insert:", error);
//     throw error;
//   }
// };

// // Get all sermons metadata (for list view - lightweight)
// export const getAllSermonsMetadata = async () => {
//   try {
//     const database = await openDatabase();
//     const sermons = await database.getAllAsync(
//       `SELECT id, title, location, year, type, date, audioUrl, downloadLink, paragraph_count 
//        FROM sermons 
//        ORDER BY date DESC`,
//     );
//     return sermons;
//   } catch (error) {
//     console.error("Error getting sermons metadata:", error);
//     throw error;
//   }
// };

// // Get sermon by ID (full data including text)
// export const getSermonById = async (sermonId) => {
//   try {
//     const database = await openDatabase();
//     const sermon = await database.getFirstAsync(
//       "SELECT * FROM sermons WHERE id = ?",
//       [String(sermonId)],
//     );
//     return sermon;
//   } catch (error) {
//     console.error("Error getting sermon by ID:", error);
//     throw error;
//   }
// };

// // Get sermons by type
// export const getSermonsByType = async (type) => {
//   try {
//     const database = await openDatabase();
//     const sermons = await database.getAllAsync(
//       `SELECT id, title, location, year, type, date, audioUrl, downloadLink, paragraph_count 
//        FROM sermons 
//        WHERE type = ? 
//        ORDER BY date DESC`,
//       [type],
//     );
//     return sermons;
//   } catch (error) {
//     console.error("Error getting sermons by type:", error);
//     throw error;
//   }
// };

// // Search sermons (searches title and sermon content)
// export const searchSermons = async (searchText) => {
//   try {
//     const database = await openDatabase();
//     const searchPattern = `%${searchText}%`;

//     const sermons = await database.getAllAsync(
//       `SELECT id, title, location, year, type, date, audioUrl, downloadLink, paragraph_count 
//        FROM sermons 
//        WHERE title LIKE ? OR sermon LIKE ?
//        ORDER BY date DESC
//        LIMIT 100`,
//       [searchPattern, searchPattern],
//     );

//     return sermons;
//   } catch (error) {
//     console.error("Error searching sermons:", error);
//     throw error;
//   }
// };

// // Get sermon count
// export const getSermonCount = async () => {
//   try {
//     const database = await openDatabase();
//     const result = await database.getFirstAsync(
//       "SELECT COUNT(*) as count FROM sermons",
//     );
//     return result?.count || 0;
//   } catch (error) {
//     console.error("Error getting sermon count:", error);
//     return 0;
//   }
// };

// // Clear all data (useful for testing)
// export const clearAllData = async () => {
//   try {
//     const database = await openDatabase();
//     await database.execAsync(`
//       DELETE FROM sermons;
//       DELETE FROM migration_status;
//     `);
//     console.log("All data cleared");
//     return true;
//   } catch (error) {
//     console.error("Error clearing data:", error);
//     throw error;
//   }
// };

// // Close database connection
// export const closeDatabase = async () => {
//   if (db) {
//     await db.closeAsync();
//     db = null;
//     console.log("Database closed");
//   }
// };
