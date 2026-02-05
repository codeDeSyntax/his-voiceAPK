// const fs = require("fs");
// const path = require("path");
// const os = require("os");

// console.log("Searching for sermons.db...\n");

// // For iOS Simulator (macOS)
// if (os.platform() === "darwin") {
//   const simulatorPath = path.join(
//     os.homedir(),
//     "Library/Developer/CoreSimulator/Devices",
//   );
//   console.log("Checking iOS Simulator path:", simulatorPath);

//   if (fs.existsSync(simulatorPath)) {
//     // Search for sermons.db in all simulator devices
//     const findDB = (dir) => {
//       try {
//         const files = fs.readdirSync(dir);
//         for (const file of files) {
//           const fullPath = path.join(dir, file);
//           const stat = fs.statSync(fullPath);

//           if (stat.isDirectory()) {
//             if (file === "sermons.db") {
//               return fullPath;
//             }
//             const result = findDB(fullPath);
//             if (result) return result;
//           } else if (file === "sermons.db") {
//             return fullPath;
//           }
//         }
//       } catch (err) {
//         // Skip permission errors
//       }
//       return null;
//     };

//     const dbPath = findDB(simulatorPath);
//     if (dbPath) {
//       console.log("✅ Found database at:", dbPath);
//       const destPath = path.join(__dirname, "assets", "sermons.db");

//       // Create assets directory if it doesn't exist
//       if (!fs.existsSync(path.join(__dirname, "assets"))) {
//         fs.mkdirSync(path.join(__dirname, "assets"));
//       }

//       fs.copyFileSync(dbPath, destPath);
//       console.log("✅ Database copied to:", destPath);
//       console.log(
//         "\nDatabase size:",
//         (fs.statSync(destPath).size / 1024 / 1024).toFixed(2),
//         "MB",
//       );
//     } else {
//       console.log(
//         "❌ Database not found. Make sure the app has run at least once.",
//       );
//     }
//   } else {
//     console.log("iOS Simulator not found on this system.");
//   }
// }

// // For Android (Windows/Mac/Linux)
// if (
//   os.platform() === "win32" ||
//   os.platform() === "linux" ||
//   os.platform() === "darwin"
// ) {
//   console.log(
//     "\nFor Android, please ensure device/emulator is connected and run:",
//   );
//   console.log(
//     "adb pull /data/data/com.boblambert.hisvoice/databases/sermons.db ./assets/sermons.db",
//   );
//   console.log("\nOr use the following commands:");
//   console.log(
//     '1. adb shell "run-as com.boblambert.hisvoice cat databases/sermons.db" > assets/sermons.db',
//   );
//   console.log(
//     "2. Or: adb exec-out run-as com.boblambert.hisvoice cat databases/sermons.db > assets/sermons.db",
//   );
// }

// console.log(
//   "\n📝 Note: The app must have run at least once for the database to exist.",
// );
