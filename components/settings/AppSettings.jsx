import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { closeDatabase, forceStopIndexing } from "../../database/sermonDB";
import { deleteLocalDatabase } from "../../database/downloadDatabase";
import { resetAppToFresh } from "../../Utils/resetApp";

const AppSettings = ({ theme, router, compact = false }) => {
  const handleDeleteDatabaseFile = async () => {
    Alert.alert(
      "Delete Database",
      "This will delete all downloaded sermon data. You will need to download it again. Your settings will be preserved.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Delete cancelled"),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              console.log("🗑️  Deleting database file...");

              // Step 1: Stop any ongoing indexing FIRST
              console.log("🛑 Stopping any ongoing indexing...");
              forceStopIndexing();

              // Step 2: Wait for in-flight DB writes to finish
              console.log("⏳ Waiting for in-flight operations...");
              await new Promise((resolve) => setTimeout(resolve, 2000));

              // Step 3: Close the database connection (resets singleton + isInitialized)
              try {
                await closeDatabase();
                console.log("✅ Database connection closed");
              } catch (closeErr) {
                console.warn("⚠️ Error closing database:", closeErr.message);
              }

              // Step 4: Small delay to ensure connection is fully released
              await new Promise((resolve) => setTimeout(resolve, 300));

              // Step 5: Delete the database file
              await deleteLocalDatabase();

              console.log("✅ Database file deleted");
              Alert.alert("Success", "Database deleted successfully.", [
                {
                  text: "OK",
                  onPress: () => {
                    // Navigate to Welcome screen to re-download database
                    router.replace("welcome");
                  },
                },
              ]);
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert(
                "Error",
                `Failed to delete database: ${error.message}`,
              );
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  const handleResetAllSettings = async () => {
    Alert.alert(
      "Reset All Settings",
      "This will reset all your preferences (dark mode, font size, bookmarks, highlights, reading progress). Your downloaded sermon data will be preserved.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Reset cancelled"),
          style: "cancel",
        },
        {
          text: "Reset",
          onPress: async () => {
            try {
              console.log("🔄 Resetting all settings...");

              // Clear all settings from AsyncStorage
              await AsyncStorage.multiRemove([
                "sermonSettings",
                "sermonLastPositions",
                "sermonBookmarks",
                "sermonHighlights",
                "lastOpenedSermon",
              ]);

              console.log("✅ All settings reset");

              // Navigate home — DB is still intact, no need to go to Welcome
              Alert.alert(
                "Success",
                "All settings have been reset to defaults. The app will now reload.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      router.replace("Home");
                    },
                  },
                ],
              );
            } catch (error) {
              console.error("Reset error:", error);
              Alert.alert(
                "Error",
                `Failed to reset settings: ${error.message}`,
              );
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  const handleResetAppToFresh = async () => {
    Alert.alert(
      "Reset App to Fresh",
      "This will reset EVERYTHING to first-time launch state:\n• Clear all preferences\n• Clear reading progress\n• Clear bookmarks & highlights\n• Reset database migration\n\nThe app will reload to the Welcome screen.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Reset cancelled"),
          style: "cancel",
        },
        {
          text: "Reset",
          onPress: async () => {
            try {
              console.log("🔄 Starting fresh state reset...");
              const result = await resetAppToFresh();

              if (result.success) {
                Alert.alert(
                  "Success",
                  "App has been reset to fresh state. Reloading now...",
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        router.replace("welcome");
                      },
                    },
                  ],
                );
              } else {
                throw new Error(result.error);
              }
            } catch (error) {
              console.error("Fresh reset error:", error);
              Alert.alert("Error", `Failed to reset: ${error.message}`);
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  // const handleRebuildSearchIndex = async () => {
  //   Alert.alert(
  //     "Rebuild Search Index",
  //     "This will delete the database and re-download everything with the new FTS5 search index. This may take a few minutes.",
  //     [
  //       {
  //         text: "Cancel",
  //         style: "cancel",
  //       },
  //       {
  //         text: "Rebuild",
  //         onPress: async () => {
  //           try {
  //             console.log("🔄 Rebuilding search index...");
  //
  //             // Close the database connection first
  //             await closeDatabase();
  //             console.log("✅ Database connection closed");
  //
  //             // Delete the database file
  //             await deleteLocalDatabase();
  //             console.log("✅ Database file deleted");
  //
  //             Alert.alert(
  //               "Success",
  //               "Database deleted. The app will now re-download and index all sermons.",
  //               [
  //                 {
  //                   text: "OK",
  //                   onPress: () => {
  //                     // Navigate to Welcome - it will handle re-download and initialization
  //                     router.replace("welcome");
  //                   },
  //                 },
  //               ],
  //             );
  //           } catch (error) {
  //             console.error("Rebuild error:", error);
  //             Alert.alert("Error", `Failed to rebuild: ${error.message}`);
  //           }
  //         },
  //         style: "destructive",
  //       },
  //     ],
  //   );
  // };

  const handleExportDatabase = async () => {
    try {
      Alert.alert("Exporting Database", "Preparing database for download...", [
        { text: "OK" },
      ]);

      console.log("Starting database export...");

      // The database file should be in the SQLite default directory
      // Try multiple possible locations
      const possiblePaths = [
        `${FileSystem.documentDirectory}SQLite/sermons.db`,
        `${FileSystem.documentDirectory}sermons.db`,
      ];

      let sourceDbPath = null;
      let dbFileSize = 0;

      // Find the actual database file
      for (const path of possiblePaths) {
        try {
          console.log(`Checking: ${path}`);
          const info = await FileSystem.getInfoAsync(path);
          if (info.exists && info.isDirectory === false) {
            sourceDbPath = path;
            dbFileSize = info.size;
            console.log(`✅ Found database at: ${path} (${dbFileSize} bytes)`);
            break;
          }
        } catch (e) {
          console.log(`Not found at: ${path}`);
        }
      }

      if (!sourceDbPath) {
        Alert.alert(
          "Error",
          "Database file not found. Please ensure the app has fully loaded the data.",
        );
        return;
      }

      // Create temporary path for export
      const timestamp = new Date().toISOString().slice(0, 10);
      const tempPath = `${FileSystem.cacheDirectory}sermons-${timestamp}.db`;

      try {
        console.log(`Copying database from: ${sourceDbPath}`);
        console.log(`Copying to: ${tempPath}`);

        await FileSystem.copyAsync({
          from: sourceDbPath,
          to: tempPath,
        });

        console.log("✅ Database copied successfully");

        // Share the file
        console.log("Opening share dialog...");
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(tempPath, {
            mimeType: "application/octet-stream",
            dialogTitle: "Export Sermons Database",
          });
          console.log("Share dialog opened");
        } else {
          Alert.alert(
            "Sharing not available",
            "Your device doesn't support file sharing.",
          );
        }
      } catch (copyError) {
        console.error("Copy error:", copyError);
        Alert.alert(
          "Error",
          `Failed to copy database file: ${copyError.message}`,
        );
        return;
      }
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert(
        "Export Error",
        `Failed to export database: ${error.message}`,
      );
    }
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    disabled = false,
    rightIcon = "chevron-forward",
  }) => {
    const [pressed, setPressed] = useState(false);

    return (
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 16,
          paddingHorizontal: 4,
          borderBottomWidth: 1,
          borderBottomColor: theme.dark
            ? "rgba(242, 205, 180, 0.08)"
            : "rgba(93, 50, 17, 0.08)",
          opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
        }}
        onPress={onPress}
        onPressIn={() => !disabled && setPressed(true)}
        onPressOut={() => setPressed(false)}
        activeOpacity={1}
        disabled={disabled}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <Ionicons
            name={icon}
            size={24}
            color={
              disabled
                ? theme.dark
                  ? "#666666"
                  : "#999999"
                : theme.colors.text
            }
            style={{ marginRight: 16 }}
          />

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: disabled
                  ? theme.dark
                    ? "#666666"
                    : "#999999"
                  : theme.colors.text,
                fontFamily: "ZillaSlab",
                marginBottom: subtitle ? 2 : 0,
              }}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={{
                  fontSize: 13,
                  color: disabled
                    ? theme.dark
                      ? "#555555"
                      : "#AAAAAA"
                    : theme.colors.text + "60",
                  fontFamily: "ZillaSlab",
                }}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        <Ionicons
          name={rightIcon}
          size={20}
          color={
            disabled
              ? theme.dark
                ? "#666666"
                : "#999999"
              : theme.colors.text + "40"
          }
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ paddingHorizontal: 0 }}>
      {/* Rebuild Search Index - DISABLED */}
      {/* <SettingItem
        icon="build-outline"
        title="Rebuild Search Index"
        subtitle="Clear & rebuild database with FTS5 search"
        onPress={handleRebuildSearchIndex}
        rightIcon="chevron-forward"
      /> */}

      {/* Delete Database File */}
      <SettingItem
        icon="trash-outline"
        title="Delete Database"
        subtitle="Remove downloaded sermon data"
        onPress={handleDeleteDatabaseFile}
        rightIcon="chevron-forward"
      />

      {/* Reset All Settings */}
      <SettingItem
        icon="refresh-outline"
        title="Reset All Settings"
        subtitle="Reset preferences, bookmarks, highlights"
        onPress={handleResetAllSettings}
        rightIcon="chevron-forward"
      />

      {/* Reset App to Fresh State - commented out, not safe for regular users */}
      {/* <SettingItem
        icon="refresh-circle-outline"
        title="Reset App to Fresh"
        subtitle="Complete reset to first-time launch"
        onPress={handleResetAppToFresh}
        rightIcon="chevron-forward"
      /> */}

      {/* Export Database */}
      <SettingItem
        icon="download-outline"
        title="Export Database"
        subtitle="Download sermons.db for bundling"
        onPress={handleExportDatabase}
        rightIcon="chevron-forward"
        disabled={true}
      />

      {/* About */}
      <SettingItem
        icon="help-circle-outline"
        title="About"
        subtitle="App information, privacy policy"
        onPress={() => router.push("About")}
        rightIcon="chevron-forward"
      />

      {/* Check for Updates */}
      <SettingItem
        icon="download-outline"
        title="Check for Updates"
        subtitle="Current version 1.0.0"
        disabled={true}
        rightIcon="chevron-forward"
      />

      {/* Feedback */}
      <SettingItem
        icon="mail-outline"
        title="Send Feedback"
        subtitle="Help us improve the app"
        disabled={true}
        rightIcon="chevron-forward"
      />

      {/* Rate App */}
      <SettingItem
        icon="star-outline"
        title="Rate App"
        subtitle="Rate us on the App Store"
        disabled={true}
        rightIcon="chevron-forward"
      />
    </View>
  );
};

export default AppSettings;
