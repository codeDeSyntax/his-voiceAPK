import * as FileSystem from "expo-file-system/legacy";

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
    onProgress?.("Downloading database from GitHub...");

    // Create directory if it doesn't exist
    const dbDir = `${FileSystem.documentDirectory}SQLite`;
    try {
      await FileSystem.makeDirectoryAsync(dbDir, { intermediates: true });
    } catch (error) {
      // Directory might already exist
      console.log("SQLite directory already exists or created");
    }

    // Download the file
    const downloadResult = await FileSystem.downloadAsync(downloadUrl, dbPath, {
      fromCache: false,
    });

    if (downloadResult.status !== 200) {
      // Clean up incomplete file if download failed
      try {
        await FileSystem.deleteAsync(dbPath);
        console.log("Cleaned up incomplete database file");
      } catch (cleanupError) {
        console.error("Error cleaning up incomplete file:", cleanupError);
      }
      throw new Error(`Download failed with status ${downloadResult.status}`);
    }

    // Ensure the file is writable by copying it to a temporary location and back
    // This removes any read-only flags from the download
    try {
      const tempPath = `${dbPath}.temp`;
      await FileSystem.copyAsync({
        from: dbPath,
        to: tempPath,
      });
      await FileSystem.deleteAsync(dbPath);
      await FileSystem.moveAsync({
        from: tempPath,
        to: dbPath,
      });
      console.log("Database file permissions set to writable");
    } catch (permError) {
      console.error("Error setting file permissions:", permError);
      // Continue anyway, the database might still work
    }

    console.log(`✅ Database downloaded successfully to: ${dbPath}`);
    onProgress?.("Database downloaded successfully!");

    return {
      success: true,
      path: dbPath,
      size: downloadResult.size,
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
    // A valid populated database should be > 10KB
    if (
      fileInfo.exists &&
      fileInfo.isDirectory === false &&
      fileInfo.size > 10000
    ) {
      return true;
    }
    return false;
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
