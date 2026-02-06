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

    // NOTE: initializeDatabase() is already called by loadSermons() before this
    // No need to call it again here

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
      console.log(
        "📂 Database file not found. User needs to download manually.",
      );
      onProgress?.("Database not found. Please download from Welcome screen.");

      // Don't auto-download - let user click the button on Welcome screen
      return {
        success: false,
        needsDownload: true,
        error: "Database file not found. Please download from Welcome screen.",
      };
    }

    console.log("✅ Database file exists locally");
    onProgress?.("Using local database...");

    // Mark migration as complete
    console.log("Marking migration as complete...");
    await setMigrationComplete();

    const finalCount = await getSermonCount();
    console.log(`✅ Migration completed. ${finalCount} sermons in database.`);

    onProgress?.("Database initialized successfully!");
    console.log("Database initialization completed successfully!");

    return {
      success: true,
      alreadyCompleted: false,
      count: finalCount,
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
    // NOTE: initializeDatabase() is already called by loadSermons() before this
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
