import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteLocalDatabase } from "../../features/sermons/data/downloadDatabase";
import { forceStopIndexing, closeDatabase } from "../../features/sermons/data/sermonDB";
import { errorMessage } from "./errors";

/**
 * Reset the entire app to fresh state (first launch)
 * Clears all user data AND deletes database file including:
 * - Settings (dark mode, font size, colors)
 * - Reading positions
 * - Bookmarks
 * - Highlights
 * - Last opened sermon
 * - Migration status (so app will re-download/re-index)
 * - DELETES the database file itself
 */
export const resetAppToFresh = async () => {
  try {
    console.log("🔄 STARTING COMPLETE APP RESET...");

    // Step 0: Force-stop any ongoing indexing immediately (no waiting)
    console.log("Step 0: Force-stopping all indexing operations...");
    forceStopIndexing();
    console.log("✅ All indexing stopped");

    // Step 0.5: Wait for in-flight indexing operations to complete
    console.log("Step 0.5: Waiting for in-flight operations to complete...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("✅ In-flight operations completed");

    // Step 0.75: Close database connection
    console.log("Step 0.75: Closing database connection...");
    await closeDatabase();
    console.log("✅ Database connection closed");

    // Small delay to ensure connection is fully closed
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Step 1: Delete the database file (this is the critical step)
    console.log("Step 1: Deleting database file...");
    try {
      await deleteLocalDatabase();
      console.log("✅ Database file deleted successfully!");
    } catch (dbFileError) {
      console.error("❌ ERROR deleting database file:", errorMessage(dbFileError));
      throw new Error(`Failed to delete database: ${errorMessage(dbFileError)}`);
    }

    // Small delay to ensure file deletion is complete
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Step 2: Clear all AsyncStorage data
    console.log("Step 2: Clearing AsyncStorage...");
    const keysToRemove = [
      "sermonSettings",
      "sermonLastPositions",
      "sermonBookmarks",
      "sermonHighlights",
      "lastOpenedSermon",
    ];

    await AsyncStorage.multiRemove(keysToRemove);
    console.log("✅ AsyncStorage cleared:", keysToRemove.join(", "));

    console.log("✅✅✅ APP RESET COMPLETE - APP IS NOW FRESH ✅✅✅");
    return { success: true };
  } catch (error) {
    console.error("❌ RESET FAILED:", errorMessage(error));
    return { success: false, error: errorMessage(error) };
  }
};

/**
 * Just clear user preferences (keep database)
 */
export const resetUserPreferences = async () => {
  try {
    console.log("🔄 Resetting user preferences...");

    const keysToRemove = [
      "sermonSettings",
      "sermonLastPositions",
      "sermonBookmarks",
      "sermonHighlights",
      "lastOpenedSermon",
    ];

    await AsyncStorage.multiRemove(keysToRemove);
    console.log("✅ User preferences reset");
    return { success: true };
  } catch (error) {
    console.error("❌ Error resetting preferences:", error);
    return { success: false, error: errorMessage(error) };
  }
};
