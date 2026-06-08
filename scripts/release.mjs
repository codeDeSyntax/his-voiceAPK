#!/usr/bin/env node
/**
 * Release script
 * Usage:
 *   pnpm release "your commit message"         -> patch
 *   pnpm release "your commit message" minor   -> minor
 *   pnpm release "your commit message" major   -> major
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const args = process.argv.slice(2);

const BUMP_TYPES = new Set(["patch", "minor", "major"]);
const bumpType = args.find((arg) => BUMP_TYPES.has(arg)) || "patch";
const commitMsg = args.find((arg) => !BUMP_TYPES.has(arg));

if (!commitMsg) {
  console.error("Error: Please provide a commit message.");
  console.error('Usage: pnpm release "your message" [patch|minor|major]');
  process.exit(1);
}

const run = (command, commandArgs, label) => {
  console.log(`\n> ${label}`);
  execFileSync(command, commandArgs, {
    cwd: root,
    stdio: "inherit",
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

const sleep = (ms) =>
  new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

const readJson = (fileName) => {
  const filePath = resolve(root, fileName);
  return JSON.parse(readFileSync(filePath, "utf8"));
};

const writeJson = (fileName, value) => {
  const filePath = resolve(root, fileName);
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
};

const getVersion = () => readJson("package.json").version;

const bumpVersion = (version, type) => {
  const parts = version.split(".").map((part) => Number.parseInt(part, 10));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    throw new Error(`Unsupported version format: ${version}`);
  }

  const [major, minor, patch] = parts;
  if (type === "major") return `${major + 1}.0.0`;
  if (type === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
};

const updateReleaseVersions = (newVersion) => {
  const pkg = readJson("package.json");
  const app = readJson("app.json");

  pkg.version = newVersion;
  app.expo.version = newVersion;
  app.expo.android = app.expo.android || {};
  app.expo.android.versionCode =
    typeof app.expo.android.versionCode === "number"
      ? app.expo.android.versionCode + 1
      : 2;

  writeJson("package.json", pkg);
  writeJson("app.json", app);
  return app.expo.android.versionCode;
};

const main = async () => {
  const currentVersion = getVersion();
  console.log("\nRelease script for hisvoice");
  console.log(`Current version : ${currentVersion}`);
  console.log(`Bump type       : ${bumpType}`);
  console.log(`Commit message  : ${commitMsg}`);

  const branch = capture("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
  if (branch && branch !== "main" && branch !== "master") {
    console.log(`\nWarning: You are on branch '${branch}', not main/master.`);
    console.log("Continuing in 3 seconds. Press Ctrl+C to abort.");
    await sleep(3000);
  }

  const dirty = capture("git", ["status", "--porcelain"]);
  if (dirty) {
    console.log(
      "\nDetected uncommitted changes. They will be included in release commit.",
    );
    await sleep(1200);
    run("git", ["add", "."], "Stage all changes");
    run("git", ["commit", "-m", commitMsg], `Commit changes: ${commitMsg}`);
  }

  const newVersion = bumpVersion(currentVersion, bumpType);
  const tagName = `v${newVersion}`;
  const existingTag = capture("git", ["tag", "--list", tagName]);
  if (existingTag) {
    throw new Error(`Tag ${tagName} already exists.`);
  }

  const versionCode = updateReleaseVersions(newVersion);
  console.log(`\nNew version     : ${newVersion}`);
  console.log(`Android code    : ${versionCode}`);

  run("git", ["add", "package.json", "app.json"], "Stage release versions");
  run(
    "git",
    ["commit", "-m", `Release ${tagName}`],
    `Commit release versions: ${tagName}`,
  );
  run("git", ["tag", "-a", tagName, "-m", `Release ${tagName}`], `Create release tag: ${tagName}`);

  run("git", ["push", "origin", branch || "HEAD"], "Push release branch");
  run("git", ["push", "origin", tagName], `Push release tag: ${tagName}`);

  console.log(`\nRelease v${newVersion} triggered successfully.`);
  console.log("Actions:  https://github.com/codeDeSyntax/his-voiceAPK/actions");
  console.log(
    "Releases: https://github.com/codeDeSyntax/his-voiceAPK/releases\n",
  );
};

main().catch((error) => {
  console.error("\nRelease script failed.");
  console.error(error?.message || error);
  process.exit(1);
});
