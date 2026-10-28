import * as LegacyFileSystem from "expo-file-system/legacy";
import * as SQLite from 'expo-sqlite';
import { closeDatabase, forceStopIndexing, getSermonCount } from "./sermonDB";
import { errorMessage } from "../../../shared/utils/errors";
import { DATABASE_NAME, TEMP_DATABASE_NAME, getDatabaseDirectory, getDatabasePath } from './databaseLocation';
import { withDatabaseReplacement } from './databaseLifecycle';

export { getDatabasePath } from './databaseLocation';

interface DatabaseReleaseInfo {
  tagName: string;
  assetId: number | null;
  assetSize: number | null;
  publishedAt: string | null;
  downloadUrl: string;
  isFallback: boolean;
}
type DownloadProgress = (percentage: number, message: string) => void;

// Configuration
const GITHUB_OWNER = "codeDeSyntax";
const GITHUB_REPO = "hisvoice-data";
const FALLBACK_GITHUB_RELEASE_TAG = "V1.0.0";
const DB_FILENAME = DATABASE_NAME;
const TEMP_DB_FILENAME = TEMP_DATABASE_NAME;
const RELEASE_INFO_FILENAME = `${DB_FILENAME}.release.json`;

const getSQLiteDirectoryUri = getDatabaseDirectory;

const getDatabaseFile = getDatabasePath;
const getTempDatabaseFile = () =>
  `${getSQLiteDirectoryUri()}${TEMP_DB_FILENAME}`;
const getReleaseInfoFile = () =>
  `${getSQLiteDirectoryUri()}${RELEASE_INFO_FILENAME}`;

/**
 * Get the fallback GitHub release URL for the database file.
 */
const getFallbackGitHubDownloadUrl = () =>
  `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/download/${FALLBACK_GITHUB_RELEASE_TAG}/${DB_FILENAME}`;

const getLatestReleaseApiUrl = () =>
  `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;

const getFallbackReleaseInfo = (): DatabaseReleaseInfo => ({
  tagName: FALLBACK_GITHUB_RELEASE_TAG,
  assetId: null,
  assetSize: null,
  publishedAt: null,
  downloadUrl: getFallbackGitHubDownloadUrl(),
  isFallback: true,
});

export const getLatestDatabaseReleaseInfo = async (
  signal?: AbortSignal,
  timeoutMs = 3500,
): Promise<DatabaseReleaseInfo> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const abortHandler = () => {
    clearTimeout(timer);
    controller.abort();
  };

  if (signal) {
    if (signal.aborted) {
      clearTimeout(timer);
      controller.abort();
    } else {
      signal.addEventListener("abort", abortHandler, { once: true });
    }
  }

  try {
    const response = await fetch(getLatestReleaseApiUrl(), {
      headers: {
        Accept: "application/vnd.github+json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`GitHub latest release request failed: ${response.status}`);
    }

    const latestRelease = await response.json();
    const databaseAsset = latestRelease.assets?.find(
      (asset: { name: string; id?: number; size?: number; browser_download_url?: string }) => asset.name === DB_FILENAME,
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
    if (signal?.aborted) {
      throw error;
    }

    console.warn(
      "Could not resolve latest database release within timeout. Falling back to pinned database release.",
      errorMessage(error),
    );
    return getFallbackReleaseInfo();
  } finally {
    clearTimeout(timer);
    if (signal) {
      signal.removeEventListener("abort", abortHandler);
    }
  }
};

const ensureSQLiteDirectory = async () => {
  await LegacyFileSystem.makeDirectoryAsync(getSQLiteDirectoryUri(), {
    intermediates: true,
  });
};

const getFileInfo = async (uri: string) => {
  const info = await LegacyFileSystem.getInfoAsync(uri);
  return info.exists ? info : null;
};

const deleteIfExists = async (uri: string) => {
  const info = await getFileInfo(uri);
  if (info) {
    await LegacyFileSystem.deleteAsync(uri, { idempotent: true });
  }
};

const moveDownloadedDatabaseIntoPlace = async (downloadedUri: string, dbFile: string) => {
  const downloadedFile = await getFileInfo(downloadedUri);

  if (!downloadedFile || downloadedFile.size <= 0) {
    throw new Error("Download failed before a valid database file was saved");
  }

  await deleteIfExists(dbFile);

  await LegacyFileSystem.moveAsync({
    from: downloadedUri,
    to: dbFile,
  });

  const movedFile = await getFileInfo(dbFile);
  if (!movedFile || movedFile.size <= 0) {
    throw new Error("Downloaded database could not be moved into place");
  }
};

const formatMB = (bytes: number) => (bytes / 1024 / 1024).toFixed(2);

const readLocalReleaseInfo = async () => {
  const releaseInfoFile = getReleaseInfoFile();
  if (!(await getFileInfo(releaseInfoFile))) return null;

  try {
    const contents = await LegacyFileSystem.readAsStringAsync(releaseInfoFile);
    return JSON.parse(contents);
  } catch (error) {
    console.warn("Could not read local database release info:", error);
    return null;
  }
};

export const getLocalDatabaseReleaseInfo = readLocalReleaseInfo;

const writeLocalReleaseInfo = async (releaseInfo: DatabaseReleaseInfo, dbFile: string) => {
  const releaseInfoFile = getReleaseInfoFile();
  const dbInfo = await getFileInfo(dbFile);
  await LegacyFileSystem.writeAsStringAsync(
    releaseInfoFile,
    JSON.stringify(
      {
        tagName: releaseInfo.tagName,
        assetId: releaseInfo.assetId,
        assetSize: releaseInfo.assetSize,
        publishedAt: releaseInfo.publishedAt,
        downloadedAt: new Date().toISOString(),
        localSize: dbInfo?.size ?? 0,
      },
      null,
      2,
    ),
  );
};

const releaseMatches = (localRelease: DatabaseReleaseInfo | null, latestRelease: DatabaseReleaseInfo | null) => {
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

export const getDatabaseStatus = async (signal?: AbortSignal) => {
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
  downloadUrl: string,
  tempFile: string,
  onProgress: DownloadProgress,
  signal?: AbortSignal,
) => {
  // Track last reported percentage so we only call onProgress when the
  // displayed integer value actually changes — avoids flooding the JS thread
  // with dozens of setState calls per second on every raw network chunk.
  let lastReportedPct = -1;

  const downloadTask = LegacyFileSystem.createDownloadResumable(
    downloadUrl,
    tempFile,
    {},
    ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
      if (!totalBytesExpectedToWrite || totalBytesExpectedToWrite <= 0) return;

      const percentage = Math.floor(
        (totalBytesWritten / totalBytesExpectedToWrite) * 100,
      );

      // Only propagate when the percentage has moved by at least 1 full point
      if (percentage === lastReportedPct) return;
      lastReportedPct = percentage;
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
    if (result.status !== 200) {
      throw new Error(`Database download failed with HTTP ${result.status}`);
    }
    return result.uri;
  } finally {
    signal?.removeEventListener?.("abort", cancelDownload);
  }
};

const downloadDatabase = async (onProgress: DownloadProgress, signal?: AbortSignal) => {
  const releaseInfo = await getLatestDatabaseReleaseInfo(signal);
  const downloadUrl = releaseInfo.downloadUrl;
  const dbFile = getDatabaseFile();
  const tempFile = getTempDatabaseFile();

  console.log(
    `Downloading database from ${releaseInfo.tagName}: ${downloadUrl}`,
  );
  onProgress?.(0, "Starting download...");

  await ensureSQLiteDirectory();
  await deleteIfExists(tempFile);

  const downloadedUri = await downloadDatabaseToTempFile(
    downloadUrl,
    tempFile,
    onProgress,
    signal,
  );
  if (releaseInfo.assetSize != null) {
    const downloadedInfo = await getFileInfo(downloadedUri);
    if (downloadedInfo?.size !== releaseInfo.assetSize) {
      throw new Error('The database download is incomplete. Please try again.');
    }
  }

  // Validate the temporary file without creating tables or touching the active DB.
  const downloadedDatabase = await SQLite.openDatabaseAsync(
    TEMP_DATABASE_NAME,
    { useNewConnection: true },
    getDatabaseDirectory(),
  );
  let sermonCount: number;
  try {
    const row = await downloadedDatabase.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM sermons');
    sermonCount = row?.count ?? 0;
    if (sermonCount <= 0) throw new Error('The downloaded database contains no sermons. Please try again.');
  } finally {
    await downloadedDatabase.closeAsync();
  }

  if (signal?.aborted) throw new Error('Download cancelled.');
  await withDatabaseReplacement(async () => {
    forceStopIndexing();
    await closeDatabase();
    await moveDownloadedDatabaseIntoPlace(downloadedUri, dbFile);
    // Journals from the previous database must never be applied to its replacement.
    await deleteIfExists(`${dbFile}-wal`);
    await deleteIfExists(`${dbFile}-shm`);
    await deleteIfExists(`${dbFile}-journal`);
    await writeLocalReleaseInfo(releaseInfo, dbFile);
  });

  const dbInfo = await getFileInfo(dbFile);
  console.log(`Database downloaded successfully to: ${dbFile}`);
  console.log(`Downloaded database contains ${sermonCount} sermons`);
  console.log(
    `Downloaded file size: ${dbInfo?.size ?? 0} bytes (${formatMB(dbInfo?.size ?? 0)} MB)`,
  );
  onProgress?.(100, "Download complete!");

  return {
    success: true,
    path: dbFile,
    size: dbInfo?.size ?? 0,
    release: releaseInfo.tagName,
  };
};

/**
 * Download database from GitHub releases.
 *
 * Uses a shared FileSystem/SQLite directory and validates the temporary DB first.
 * - Downloads into a temporary file first, then overwrites the active DB.
 * - Keeps the existing DB intact if the network download fails midway.
 */
export const downloadDatabaseFromGitHub = async (onProgress: DownloadProgress) => {
  const tempFile = getTempDatabaseFile();

  try {
    return await downloadDatabase(onProgress);
  } catch (error) {
    console.error("Error downloading database:", error);

    try {
      await deleteIfExists(tempFile);
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
export const downloadDatabaseWithSignal = async (onProgress: DownloadProgress, signal: AbortSignal) => {
  const tempFile = getTempDatabaseFile();

  try {
    return await downloadDatabase(onProgress, signal);
  } catch (error) {
    await deleteIfExists(tempFile);
    throw error;
  }
};

/**
 * Check if the database exists locally and is valid.
 *
 * A large SQLite file can still contain no sermons. Check the actual rows.
 */
export const databaseExists = async () => {
  try {
    const dbFile = getDatabaseFile();

    const dbInfo = await getFileInfo(dbFile);
    if (!dbInfo || dbInfo.size <= 4096) {
      console.log("Database file does not exist or is too small");
      return false;
    }

    const sermonCount = await getSermonCount();
    console.log(`Database has ${sermonCount} sermons`);
    return sermonCount > 0;
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
    const dbInfo = await getFileInfo(dbFile);
    return dbInfo?.size ?? 0;
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
    await deleteIfExists(dbFile);
    await deleteIfExists(releaseInfoFile);
    console.log("Local database deleted");
  } catch (error) {
    console.error("Error deleting database:", error);
    throw error;
  }
};
