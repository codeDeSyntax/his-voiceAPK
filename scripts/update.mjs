#!/usr/bin/env node
/**
 * OTA Update script
 * Usage:
 *   pnpm update "fix search bug"
 *   pnpm update "ui improvements"
 */

import { execFileSync, execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const args = process.argv.slice(2);
const commitMsg = args[0];

if (!commitMsg) {
  console.error("Error: Please provide a commit message.");
  console.error('Usage: pnpm update "your message"');
  process.exit(1);
}

const run = (command, commandArgs, label) => {
  console.log(`\n> ${label}`);
  execFileSync(command, commandArgs, {
    cwd: root,
    stdio: "inherit",
  });
};

const runShell = (command, label) => {
  console.log(`\n> ${label}`);
  execSync(command, {
    cwd: root,
    stdio: "inherit",
    shell: true,
  });
};

const capture = (command, commandArgs) => {
  try {
    return execFileSync(command, commandArgs, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
};

const getVersion = () => {
  const pkgPath = resolve(root, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  return pkg.version;
};

const main = async () => {
  const version = getVersion();
  console.log("\nOTA Update script for hisvoice");
  console.log(`Current version : ${version}`);
  console.log(`Commit message  : ${commitMsg}`);

  const dirty = capture("git", ["status", "--porcelain"]);
  if (dirty) {
    console.log("\nDetected uncommitted changes. Committing...");
    run("git", ["add", "."], "Stage all changes");
    run("git", ["commit", "-m", commitMsg], `Commit: ${commitMsg}`);
  } else {
    console.log("\nNo uncommitted changes. Proceeding with OTA update...");
  }

  runShell(
    `eas update --platform android --channel production --message "${commitMsg}"`,
    "Publish OTA update",
  );
  run("git", ["push"], "Push commits");

  console.log(`\nOTA update v${version} published successfully.`);
  console.log(
    "Releases: https://github.com/codeDeSyntax/his-voiceAPK/releases\n",
  );
};

main().catch((error) => {
  console.error("\nOTA update script failed.");
  console.error(error?.message || error);
  process.exit(1);
});
