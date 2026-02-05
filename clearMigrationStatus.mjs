import * as SQLite from "expo-sqlite";

async function clearMigrationStatus() {
  try {
    console.log(
      "🔄 Clearing migration status to force database regeneration...\n",
    );

    // Open the database
    const db = await SQLite.openDatabaseAsync("sermons.db");
    console.log("✅ Database opened");

    // Delete the migration status record to force re-migration
    await db.execAsync(`
      DELETE FROM migration_status WHERE key = 'migration_completed';
    `);

    console.log("✅ Migration status cleared!");
    console.log("\n📝 Next app launch will:");
    console.log("   1. Detect migration is needed");
    console.log("   2. Load updated sermons/audio.js with 469 sermons");
    console.log("   3. Regenerate the database with unique download links");
    console.log("   4. Create 591 total sermons (122 text + 469 audio)");
    console.log("\n🎉 Ready to regenerate database on next app launch!");

    await db.closeAsync();
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("\n💡 If database doesn't exist yet, that's fine!");
    console.log("   The app will create it on first launch.");
  }
}

clearMigrationStatus();
