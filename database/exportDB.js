import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { openDatabase } from "./sermonDB";

/**
 * Export the SQLite database file for backup or deployment
 * This allows extracting the database from the device
 */
export const exportDatabase = async () => {
  try {
    console.log("Starting database export...");

    // Get the database path
    const db = await openDatabase();
    const dbPath = `${FileSystem.documentDirectory}SQLite/sermons.db`;

    console.log("Database path:", dbPath);

    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(dbPath);
    if (!fileInfo.exists) {
      throw new Error(
        "Database file not found. Make sure the app has loaded sermons at least once.",
      );
    }

    console.log(
      "Database size:",
      (fileInfo.size / 1024 / 1024).toFixed(2),
      "MB",
    );

    // Create a temporary copy in cache directory (shareable location)
    const tempPath = `${FileSystem.cacheDirectory}sermons.db`;
    await FileSystem.copyAsync({
      from: dbPath,
      to: tempPath,
    });

    console.log("Temporary copy created at:", tempPath);

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error("Sharing is not available on this device");
    }

    // Share the database file
    await Sharing.shareAsync(tempPath, {
      mimeType: "application/x-sqlite3",
      dialogTitle: "Export Sermons Database",
      UTI: "public.database",
    });

    console.log("✅ Database exported successfully");
    return { success: true, size: fileInfo.size };
  } catch (error) {
    console.error("Error exporting database:", error);
    throw error;
  }
};

/**
 * Get database file information
 */
export const getDatabaseInfo = async () => {
  try {
    const dbPath = `${FileSystem.documentDirectory}SQLite/sermons.db`;
    const fileInfo = await FileSystem.getInfoAsync(dbPath);

    if (!fileInfo.exists) {
      return { exists: false };
    }

    return {
      exists: true,
      size: fileInfo.size,
      sizeMB: (fileInfo.size / 1024 / 1024).toFixed(2),
      path: dbPath,
    };
  } catch (error) {
    console.error("Error getting database info:", error);
    return { exists: false, error: error.message };
  }
};
