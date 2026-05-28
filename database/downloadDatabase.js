import { Directory, File, Paths } from "expo-file-system";
import * as LegacyFileSystem from "expo-file-system/legacy";
import { getSermonCount } from "./sermonDB";

// Configuration
const GITHUB_OWNER = "codeDeSyntax";
const GITHUB_REPO = "hisvoice-data";
const FALLBACK_GITHUB_RELEASE_TAG = "V1.0.0";
const DB_FILENAME = "sermons-db.db";
const TEMP_DB_FILENAME = `${DB_FILENAME}.download`;
const RELEASE_INFO_FILENAME = `${DB_FILENAME}.release.json`;

const getSQLiteDirectory = () => new Directory(Paths.document, "SQLite");
const getDatabaseFile = () => new File(getSQLiteDirectory(), DB_FILENAME);
const getTempDatabaseFile = () =>
  new File(getSQLiteDirectory(), TEMP_DB_FILENAME);
const getReleaseInfoFile = () =>
  new File(getSQLiteDirectory(), RELEASE_INFO_FILENAME);

/**
 * Get the path where the database should be stored.
 */
export const getDatabasePath = () => getDatabaseFile().uri;

/**
 * Get the fallback GitHub release URL for the database file.
 */
const getFallbackGitHubDownloadUrl = () =>
  `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/download/${FALLBACK_GITHUB_RELEASE_TAG}/${DB_FILENAME}`;

const getLatestReleaseApiUrl = () =>
  `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;

const getFallbackReleaseInfo = () => ({
  tagName: FALLBACK_GITHUB_RELEASE_TAG,
  assetId: null,
  assetSize: null,
  publishedAt: null,
  downloadUrl: getFallbackGitHubDownloadUrl(),
  isFallback: true,
});

export const getLatestDatabaseReleaseInfo = async (signal) => {
  try {
    const response = await fetch(getLatestReleaseApiUrl(), {
      headers: {
        Accept: "application/vnd.github+json",
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(`GitHub latest release request failed: ${response.status}`);
    }

    const latestRelease = await response.json();
    const databaseAsset = latestRelease.assets?.find(
      (asset) => asset.name === DB_FILENAME,
    );

    if (!databaseAsset?.browser_download_url) {
      throw new Error(`Latest release does not include ${DB_FILENAME}`);
    }

    return {
      tagName: latestRelease.tag_name,
      assetId: databaseAsset.id ?? null,
      assetSize: databaseAsset.size ?? null,
      publishedAt: latestRelease.published_at ?? null,
      downloadUrl: databaseAsset.browser_download_url,
      isFallback: false,
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      throw error;
    }

    console.warn(
      "Could not resolve latest database release. Falling back to pinned database release.",
      error?.message || error,
    );
    return getFallbackReleaseInfo();
  }
};

const ensureSQLiteDirectory = () => {
  getSQLiteDirectory().create({ intermediates: true, idempotent: true });
};

const deleteIfExists = (file) => {
  if (file.exists) {
    file.delete();
  }
};

const moveDownloadedDatabaseIntoPlace = async (downloadedUri, dbFile) => {
  const downloadedFile = new File(downloadedUri);

  if (!downloadedFile.exists || downloadedFile.size <= 0) {
    throw new Error("Download failed before a valid database file was saved");
  }

  deleteIfExists(dbFile);

  await LegacyFileSystem.moveAsync({
    from: downloadedFile.uri,
    to: dbFile.uri,
  });

  if (!dbFile.exists || dbFile.size <= 0) {
    throw new Error("Downloaded database could not be moved into place");
  }
};

const formatMB = (bytes) => (bytes / 1024 / 1024).toFixed(2);

const readLocalReleaseInfo = async () => {
  const releaseInfoFile = getReleaseInfoFile();
  if (!releaseInfoFile.exists) return null;

  try {
    const contents = await LegacyFileSystem.readAsStringAsync(releaseInfoFile.uri);
    return JSON.parse(contents);
  } catch (error) {
    console.warn("Could not read local database release info:", error);
    return null;
  }
};

export const getLocalDatabaseReleaseInfo = readLocalReleaseInfo;

const writeLocalReleaseInfo = async (releaseInfo, dbFile) => {
  const releaseInfoFile = getReleaseInfoFile();
  await LegacyFileSystem.writeAsStringAsync(
    releaseInfoFile.uri,
    JSON.stringify(
      {
        tagName: releaseInfo.tagName,
        assetId: releaseInfo.assetId,
        assetSize: releaseInfo.assetSize,
        publishedAt: releaseInfo.publishedAt,
        downloadedAt: new Date().toISOString(),
        localSize: dbFile.size,
      },
      null,
      2,
    ),
  );
};

const releaseMatches = (localRelease, latestRelease) => {
  if (!localRelease || !latestRelease) return false;
  if (localRelease.tagName !== latestRelease.tagName) return false;

  if (
    latestRelease.assetId != null &&
    localRelease.assetId != null &&
    localRelease.assetId !== latestRelease.assetId
  ) {
    return false;
  }

  if (
    latestRelease.assetSize != null &&
    localRelease.assetSize != null &&
    localRelease.assetSize !== latestRelease.assetSize
  ) {
    return false;
  }

  return true;
};

export const getDatabaseStatus = async (signal) => {
  const exists = await databaseExists();
  if (!exists) {
    return {
      exists: false,
      current: false,
      needsDownload: true,
      needsUpdate: false,
      localRelease: null,
      latestRelease: null,
    };
  }

  const [localRelease, latestRelease] = await Promise.all([
    readLocalReleaseInfo(),
    getLatestDatabaseReleaseInfo(signal),
  ]);

  if (latestRelease.isFallback) {
    return {
      exists: true,
      current: true,
      needsDownload: false,
      needsUpdate: false,
      localRelease,
      latestRelease,
    };
  }

  const current = releaseMatches(localRelease, latestRelease);

  return {
    exists: true,
    current,
    needsDownload: false,
    needsUpdate: !current,
    localRelease,
    latestRelease,
  };
};

const downloadDatabaseToTempFile = async (
  downloadUrl,
  tempFile,
  onProgress,
  signal,
) => {
  const downloadTask = LegacyFileSystem.createDownloadResumable(
    downloadUrl,
    tempFile.uri,
    {},
    ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
      if (!totalBytesExpectedToWrite || totalBytesExpectedToWrite <= 0) return;

      const percentage = Math.floor(
        (totalBytesWritten / totalBytesExpectedToWrite) * 100,
      );
      onProgress?.(percentage, `Downloading ${percentage}%...`);
    },
  );

  const cancelDownload = () => {
    downloadTask.cancelAsync().catch(() => {});
  };

  signal?.addEventListener?.("abort", cancelDownload);

  try {
    const result = await downloadTask.downloadAsync();
    if (signal?.aborted) {
      throw new Error("Download cancelled.");
    }
    if (!result?.uri) {
      throw new Error("Download was cancelled before a file was saved");
    }
    return result.uri;
  } finally {
    signal?.removeEventListener?.("abort", cancelDownload);
  }
};

const downloadDatabase = async (onProgress, signal) => {
  const releaseInfo = await getLatestDatabaseReleaseInfo(signal);
  const downloadUrl = releaseInfo.downloadUrl;
  const dbFile = getDatabaseFile();
  const tempFile = getTempDatabaseFile();

  console.log(
    `Downloading database from ${releaseInfo.tagName}: ${downloadUrl}`,
  );
  onProgress?.(0, "Starting download...");

  ensureSQLiteDirectory();
  deleteIfExists(tempFile);

  const downloadedUri = await downloadDatabaseToTempFile(
    downloadUrl,
    tempFile,
    onProgress,
    signal,
  );
  await moveDownloadedDatabaseIntoPlace(downloadedUri, dbFile);
  await writeLocalReleaseInfo(releaseInfo, dbFile);

  console.log(`Database downloaded successfully to: ${dbFile.uri}`);
  console.log(
    `Downloaded file size: ${dbFile.size} bytes (${formatMB(dbFile.size)} MB)`,
  );
  onProgress?.(100, "Download complete!");

  return {
    success: true,
    path: dbFile.uri,
    size: dbFile.size,
    release: releaseInfo.tagName,
  };
};

/**
 * Download database from GitHub releases.
 *
 * SDK 56 implementation notes:
 * - Uses the modern expo-file-system File/Directory API.
 * - Downloads into a temporary file first, then overwrites the active DB.
 * - Keeps the existing DB intact if the network download fails midway.
 */
export const downloadDatabaseFromGitHub = async (onProgress) => {
  const tempFile = getTempDatabaseFile();

  try {
    return await downloadDatabase(onProgress);
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
  const tempFile = getTempDatabaseFile();

  try {
    return await downloadDatabase(onProgress, signal);
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
    const releaseInfoFile = getReleaseInfoFile();
    deleteIfExists(dbFile);
    deleteIfExists(releaseInfoFile);
    console.log("Local database deleted");
  } catch (error) {
    console.error("Error deleting database:", error);
    throw error;
  }
};
