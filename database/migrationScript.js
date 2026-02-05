import {
  initializeDatabase,
  isMigrationComplete,
  setMigrationComplete,
  openDatabase,
  getSermonCount,
} from "./sermonDB";
import { downloadDatabaseFromGitHub, databaseExists } from "./downloadDatabase";

/**
 * Migrate sermons - downloads database from GitHub releases on first launch
 * Subsequent launches will use the locally downloaded database
 */
export const migrateSermons = async (onProgress) => {
  try {
    console.log("Starting sermon migration...");

    // Initialize database tables
    await initializeDatabase();

    // Check if migration already completed
    const migrationDone = await isMigrationComplete();
    const count = await getSermonCount();

    if (migrationDone && count > 0) {
      console.log(`Migration already completed. ${count} sermons in database.`);
      return { success: true, alreadyCompleted: true, count };
    }

    // Check if database file exists locally
    const dbExists = await databaseExists();
    if (!dbExists) {
      console.log("Database file not found. Downloading from GitHub...");
      onProgress?.("Downloading database from GitHub...");

      const downloadResult = await downloadDatabaseFromGitHub(onProgress);
      if (!downloadResult.success) {
        throw new Error("Failed to download database from GitHub");
      }

      console.log(`✅ Database downloaded: ${downloadResult.size} bytes`);
      onProgress?.("Database downloaded successfully!");
    } else {
      console.log("Database file already exists locally");
      onProgress?.("Using local database...");
    }

    // Mark migration as complete
    console.log("Marking migration as complete...");
    await setMigrationComplete();

    console.log(`✅ Migration completed. ${count} sermons in database.`);

    onProgress?.("Database initialized successfully!");
    console.log("Database initialization completed successfully!");

    return {
      success: true,
      alreadyCompleted: false,
      count: count,
    };
  } catch (error) {
    console.error("Error during migration:", error);
    onProgress?.(`Migration failed: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Check migration status without running it
 */
export const checkMigrationStatus = async () => {
  try {
    await initializeDatabase();
    const completed = await isMigrationComplete();
    const count = await getSermonCount();

    return {
      completed,
      count,
      needsMigration: !completed || count === 0,
    };
  } catch (error) {
    console.error("Error checking migration status:", error);
    return {
      completed: false,
      count: 0,
      needsMigration: true,
      error: error.message,
    };
  }
};
