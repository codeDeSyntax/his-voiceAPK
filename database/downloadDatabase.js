import { Directory, File, Paths } from "expo-file-system";
import { getSermonCount } from "./sermonDB";

// Configuration
const GITHUB_OWNER = "codeDeSyntax";
const GITHUB_REPO = "hisvoice-data";
const GITHUB_RELEASE_TAG = "V1.0.0";
const DB_FILENAME = "sermons-db.db";
const TEMP_DB_FILENAME = `${DB_FILENAME}.download`;

const getSQLiteDirectory = () => new Directory(Paths.document, "SQLite");
const getDatabaseFile = () => new File(getSQLiteDirectory(), DB_FILENAME);
const getTempDatabaseFile = () =>
  new File(getSQLiteDirectory(), TEMP_DB_FILENAME);

/**
 * Get the path where the database should be stored.
 */
export const getDatabasePath = () => getDatabaseFile().uri;

/**
 * Get the GitHub release URL for the database file.
 */
const getGitHubDownloadUrl = () =>
  `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/download/${GITHUB_RELEASE_TAG}/${DB_FILENAME}`;

const ensureSQLiteDirectory = () => {
  getSQLiteDirectory().create({ intermediates: true, idempotent: true });
};

const deleteIfExists = (file) => {
  if (file.exists) {
    file.delete();
  }
};

const moveDownloadedDatabaseIntoPlace = (tempFile, dbFile) => {
  if (!tempFile.exists || tempFile.size <= 0) {
    throw new Error("Download failed before a valid database file was saved");
  }

  tempFile.move(dbFile, { overwrite: true });

  if (!dbFile.exists || dbFile.size <= 0) {
    throw new Error("Downloaded database could not be moved into place");
  }
};

const formatMB = (bytes) => (bytes / 1024 / 1024).toFixed(2);

const createDatabaseDownloadTask = (downloadUrl, tempFile, onProgress, signal) =>
  File.createDownloadTask(downloadUrl, tempFile, {
    idempotent: true,
    signal,
    onProgress: ({ bytesWritten, totalBytes }) => {
      if (!totalBytes || totalBytes <= 0) return;

      const percentage = Math.floor((bytesWritten / totalBytes) * 100);
      onProgress?.(percentage, `Downloading ${percentage}%...`);
    },
  });

/**
 * Download database from GitHub releases.
 *
 * SDK 56 implementation notes:
 * - Uses the modern expo-file-system File/Directory API.
 * - Downloads into a temporary file first, then overwrites the active DB.
 * - Keeps the existing DB intact if the network download fails midway.
 */
export const downloadDatabaseFromGitHub = async (onProgress) => {
  const downloadUrl = getGitHubDownloadUrl();
  const dbFile = getDatabaseFile();
  const tempFile = getTempDatabaseFile();

  try {
    console.log(`Downloading database from: ${downloadUrl}`);
    onProgress?.(0, "Starting download...");

    ensureSQLiteDirectory();
    deleteIfExists(tempFile);

    const downloadTask = createDatabaseDownloadTask(
      downloadUrl,
      tempFile,
      onProgress,
    );
    await downloadTask.downloadAsync();

    moveDownloadedDatabaseIntoPlace(tempFile, dbFile);

    console.log(`Database downloaded successfully to: ${dbFile.uri}`);
    console.log(
      `Downloaded file size: ${dbFile.size} bytes (${formatMB(dbFile.size)} MB)`,
    );
    onProgress?.(100, "Download complete!");

    return {
      success: true,
      path: dbFile.uri,
      size: dbFile.size,
    };
  } catch (error) {
    console.error("Error downloading database:", error);

    try {
      deleteIfExists(tempFile);
      console.log("Cleaned up incomplete database download");
    } catch (cleanupError) {
      console.error("Error during cleanup:", cleanupError);
    }

    throw error;
  }
};

/**
 * Same download flow as downloadDatabaseFromGitHub, with AbortController support.
 * This lets us add a cancel button in the UI without changing the storage logic.
 */
export const downloadDatabaseWithSignal = async (onProgress, signal) => {
  const downloadUrl = getGitHubDownloadUrl();
  const dbFile = getDatabaseFile();
  const tempFile = getTempDatabaseFile();

  try {
    onProgress?.(0, "Starting download...");
    ensureSQLiteDirectory();
    deleteIfExists(tempFile);

    const downloadTask = createDatabaseDownloadTask(
      downloadUrl,
      tempFile,
      onProgress,
      signal,
    );
    await downloadTask.downloadAsync();

    moveDownloadedDatabaseIntoPlace(tempFile, dbFile);

    onProgress?.(100, "Download complete!");
    return {
      success: true,
      path: dbFile.uri,
      size: dbFile.size,
    };
  } catch (error) {
    deleteIfExists(tempFile);
    throw error;
  }
};

/**
 * Check if database exists locally and is valid.
 */
export const databaseExists = async () => {
  try {
    const dbFile = getDatabaseFile();

    if (!dbFile.exists || dbFile.size <= 4096) {
      console.log("Database file does not exist");
      return false;
    }

    try {
      const sermonCount = await getSermonCount();
      console.log(`Database has ${sermonCount} sermons`);
      return sermonCount > 0;
    } catch (dbError) {
      console.error("Cannot query database:", dbError.message);
      return false;
    }
  } catch (error) {
    console.error("Error checking database existence:", error);
    return false;
  }
};

/**
 * Get database file size.
 */
export const getDatabaseSize = async () => {
  try {
    const dbFile = getDatabaseFile();
    return dbFile.exists ? dbFile.size : 0;
  } catch (error) {
    console.error("Error getting database size:", error);
    return 0;
  }
};

/**
 * Delete local database.
 *
 * NOTE: closeDatabase() should be called separately by the reset function.
 */
export const deleteLocalDatabase = async () => {
  try {
    const dbFile = getDatabaseFile();
    deleteIfExists(dbFile);
    console.log("Local database deleted");
  } catch (error) {
    console.error("Error deleting database:", error);
    throw error;
  }
};
