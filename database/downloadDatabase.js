import * as FileSystem from "expo-file-system/legacy";
import { closeDatabase, getSermonCount } from "./sermonDB";

// Configuration
const GITHUB_OWNER = "codeDeSyntax"; // Update this
const GITHUB_REPO = "hisvoice-data"; // Update this
const GITHUB_RELEASE_TAG = "V1.0.0"; // Match the release tag in URL
const DB_FILENAME = "sermons-db.db"; // Match the filename in GitHub release
const DB_VERSION_KEY = "sermons_db_version1";

/**
 * Get the path where the database should be stored
 */
export const getDatabasePath = () => {
  return `${FileSystem.documentDirectory}SQLite/${DB_FILENAME}`;
};

/**
 * Get the GitHub release URL for the database file
 */
const getGitHubDownloadUrl = () => {
  return `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/download/${GITHUB_RELEASE_TAG}/${DB_FILENAME}`;
};

/**
 * Download database from GitHub releases
 */
export const downloadDatabaseFromGitHub = async (onProgress) => {
  try {
    const dbPath = getDatabasePath();
    const downloadUrl = getGitHubDownloadUrl();

    console.log(`Downloading database from: ${downloadUrl}`);
    onProgress?.(0, "Starting download...");

    // Delete any existing database file first
    try {
      const existingFile = await FileSystem.getInfoAsync(dbPath);
      if (existingFile.exists) {
        console.log("🗑️ Deleting existing database file...");
        await FileSystem.deleteAsync(dbPath);
        console.log("✅ Existing database deleted");
      }
    } catch (deleteError) {
      console.log("No existing database to delete");
    }

    // Small delay after deletion
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Create directory if it doesn't exist
    const dbDir = `${FileSystem.documentDirectory}SQLite`;
    try {
      await FileSystem.makeDirectoryAsync(dbDir, { intermediates: true });
    } catch (error) {
      // Directory might already exist
      console.log("SQLite directory already exists or created");
    }

    // Create download resumable with progress callback
    const downloadResumable = FileSystem.createDownloadResumable(
      downloadUrl,
      dbPath,
      {},
      (downloadProgress) => {
        const progress =
          downloadProgress.totalBytesWritten /
          downloadProgress.totalBytesExpectedToWrite;
        const percentage = Math.floor(progress * 100);
        onProgress?.(percentage, `Downloading ${percentage}%...`);
      },
    );

    // Download the file with real progress tracking
    const downloadResult = await downloadResumable.downloadAsync();

    if (!downloadResult || downloadResult.status !== 200) {
      // Clean up incomplete file if download failed
      try {
        await FileSystem.deleteAsync(dbPath);
        console.log("Cleaned up incomplete database file");
      } catch (cleanupError) {
        console.error("Error cleaning up incomplete file:", cleanupError);
      }
      throw new Error(
        `Download failed with status ${downloadResult?.status || "unknown"}`,
      );
    }

    console.log(`✅ Database downloaded successfully to: ${dbPath}`);
    onProgress?.(100, "Download complete!");

    // Verify the downloaded file size
    const fileInfo = await FileSystem.getInfoAsync(dbPath);
    console.log(
      `📊 Downloaded file size: ${fileInfo.size} bytes (${(fileInfo.size / 1024 / 1024).toFixed(2)} MB)`,
    );

    return {
      success: true,
      path: dbPath,
      size: fileInfo.size,
    };
  } catch (error) {
    console.error("Error downloading database:", error);
    // Ensure we clean up any partial file
    try {
      const dbPath = getDatabasePath();
      const fileInfo = await FileSystem.getInfoAsync(dbPath);
      if (fileInfo.exists && fileInfo.isDirectory === false) {
        await FileSystem.deleteAsync(dbPath);
        console.log("Cleaned up incomplete database file after error");
      }
    } catch (cleanupError) {
      console.error("Error during cleanup:", cleanupError);
    }
    throw error;
  }
};

/**
 * Check if database exists locally and is valid (size check only)
 */
export const databaseExists = async () => {
  try {
    const dbPath = getDatabasePath();
    const fileInfo = await FileSystem.getInfoAsync(dbPath);

    // Check if file exists and is larger than an empty database (~4KB)
    if (!fileInfo.exists || fileInfo.isDirectory) {
      console.log("📂 Database file does not exist");
      return false;
    }

    // File exists, but check if it has sermons
    try {
      const sermonCount = await getSermonCount();
      console.log(`📊 Database has ${sermonCount} sermons`);

      // Database is valid if it has at least some sermons
      return sermonCount > 0;
    } catch (dbError) {
      // If we can't query the database, consider it invalid
      console.error("❌ Cannot query database:", dbError.message);
      return false;
    }
  } catch (error) {
    console.error("Error checking database existence:", error);
    return false;
  }
};

/**
 * Get database file size
 */
export const getDatabaseSize = async () => {
  try {
    const dbPath = getDatabasePath();
    const fileInfo = await FileSystem.getInfoAsync(dbPath);
    if (fileInfo.exists && fileInfo.isDirectory === false) {
      return fileInfo.size;
    }
    return 0;
  } catch (error) {
    console.error("Error getting database size:", error);
    return 0;
  }
};

/**
 * Delete local database (for resetting) - deletes any database file regardless of size
 * NOTE: closeDatabase() should be called separately by the reset function
 */
export const deleteLocalDatabase = async () => {
  try {
    const dbPath = getDatabasePath();
    const fileInfo = await FileSystem.getInfoAsync(dbPath);
    if (fileInfo.exists && fileInfo.isDirectory === false) {
      await FileSystem.deleteAsync(dbPath);
      console.log("Local database deleted");
    }
  } catch (error) {
    console.error("Error deleting database:", error);
    throw error;
  }
};
