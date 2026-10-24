const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { fileURLToPath, pathToFileURL } = require('node:url');
const { DatabaseSync } = require('node:sqlite');
const load = require('./helpers/load-typescript.cjs');

function createDatabase(filename, count, large = false) {
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  const database = new DatabaseSync(filename);
  try {
    database.exec('CREATE TABLE sermons (id TEXT PRIMARY KEY, title TEXT)');
    for (let index = 0; index < count; index++) {
      database.prepare('INSERT INTO sermons VALUES (?, ?)').run(String(index), `Sermon ${index}`);
    }
    if (large) database.exec('CREATE TABLE padding (data BLOB); INSERT INTO padding VALUES (zeroblob(2097152))');
  } finally { database.close(); }
}

function harness(t, { count = 1, large = false, failClose = false, status = 200, sizeDelta = 0 } = {}) {
  const base = path.resolve(__dirname, '../.expo/database-tests-');
  const root = fs.mkdtempSync(base);
  // Expo Go scopes use a literal percent-encoded name, itself encoded in file URIs.
  const documentDirectory = `${pathToFileURL(path.join(root, 'ExperienceData', '%40josiah-ok%2Fhis-voice')).href}/`;
  const directory = `${documentDirectory}SQLite/`;
  const active = fileURLToPath(`${directory}sermons-db.db`);
  const fixture = path.join(root, 'release.db');
  createDatabase(active, count, large);
  const connections = [];
  const opens = [];
  t.after(() => {
    for (const connection of connections) if (!connection.closed) connection.raw.close();
    const resolved = path.resolve(root);
    if (!resolved.startsWith(base)) throw new Error('Unexpected database test cleanup path');
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  const fileSystem = {
    documentDirectory,
    async getInfoAsync(uri) {
      const filename = fileURLToPath(uri);
      return fs.existsSync(filename) ? { exists: true, size: fs.statSync(filename).size, uri } : { exists: false, uri };
    },
    async makeDirectoryAsync(uri) { fs.mkdirSync(fileURLToPath(uri), { recursive: true }); },
    async deleteAsync(uri) { const filename = fileURLToPath(uri); if (fs.existsSync(filename)) fs.unlinkSync(filename); },
    async moveAsync({ from, to }) { fs.renameSync(fileURLToPath(from), fileURLToPath(to)); },
    async readAsStringAsync(uri) { return fs.readFileSync(fileURLToPath(uri), 'utf8'); },
    async writeAsStringAsync(uri, data) { fs.writeFileSync(fileURLToPath(uri), data); },
    createDownloadResumable(_url, uri, _options, progress) {
      return {
        async downloadAsync() {
          fs.copyFileSync(fixture, fileURLToPath(uri));
          const size = fs.statSync(fixture).size;
          progress({ totalBytesWritten: size, totalBytesExpectedToWrite: size });
          return { uri, status };
        },
        async cancelAsync() {},
      };
    },
  };
  const sqlite = {
    // Deliberately different from FileSystem.documentDirectory, like the failing app.
    defaultDatabaseDirectory: pathToFileURL(path.join(root, 'default-SQLite')).href,
    async openDatabaseAsync(name, options, providedDirectory) {
      opens.push({ name, options, directory: providedDirectory });
      const filename = path.normalize(fileURLToPath(`${providedDirectory ?? sqlite.defaultDatabaseDirectory}/${name}`));
      fs.mkdirSync(path.dirname(filename), { recursive: true });
      const raw = new DatabaseSync(filename);
      const connection = {
        raw, closed: false,
        async getFirstAsync(sql, parameters = []) { return raw.prepare(sql).get(...parameters) ?? null; },
        async closeAsync() {
          if (failClose && filename === active) throw new Error('Database is busy');
          raw.close();
          connection.closed = true;
        },
      };
      connections.push(connection);
      return connection;
    },
  };
  const location = load('src/features/sermons/data/databaseLocation.ts', { 'expo-file-system/legacy': fileSystem });
  const lifecycle = load('src/features/sermons/data/databaseLifecycle.ts');
  const errors = { errorMessage: error => error instanceof Error ? error.message : String(error) };
  const library = load('src/features/sermons/data/sermonDB.ts', {
    'expo-sqlite': sqlite,
    'expo-file-system/legacy': fileSystem,
    '../utils/paragraphSplitter': { formatSermonIntoParagraphs: text => [text] },
    '../../../shared/utils/errors': errors,
    './databaseLocation': location,
    './databaseLifecycle': lifecycle,
  });
  const downloads = load('src/features/sermons/data/downloadDatabase.ts', {
    'expo-sqlite': sqlite,
    'expo-file-system/legacy': fileSystem,
    './sermonDB': library,
    '../../../shared/utils/errors': errors,
    './databaseLocation': location,
    './databaseLifecycle': lifecycle,
  }, {
    fetch: async () => ({
      ok: true,
      json: async () => ({ tag_name: 'v1.0.1', assets: [{ name: 'sermons-db.db', id: 1, size: fs.statSync(fixture).size + sizeDelta, browser_download_url: 'https://example.test/sermons-db.db' }] }),
    }),
  });
  return { library, downloads, location, lifecycle, active, fixture, directory, opens, connections };
}

test('SQLite reads the downloaded Expo Go file, even when its default directory differs', async t => {
  const app = harness(t, { count: 2 });
  assert.match(app.directory, /%2540josiah-ok%252Fhis-voice/);
  assert.equal(await app.library.getSermonCount(), 2);
  assert.equal(app.opens[0].directory, app.directory);
  assert.equal(app.location.getDatabasePath(), `${app.directory}sermons-db.db`);
});

test('a validated download replaces the old DB and the next query reads its new rows', async t => {
  const app = harness(t);
  assert.equal(await app.library.getSermonCount(), 1);
  const oldConnection = app.connections[0];
  createDatabase(app.fixture, 3);
  const result = await app.downloads.downloadDatabaseFromGitHub(() => {});
  assert.equal(result.success, true);
  assert.equal(oldConnection.closed, true);
  assert.equal(await app.library.getSermonCount(), 3);
  assert.equal(await app.downloads.databaseExists(), true);
  const validation = app.opens.find(open => open.name.endsWith('.download'));
  assert.equal(validation.directory, app.directory);
  assert.equal(validation.options.useNewConnection, true);
});

test('a large downloaded database with zero sermons is rejected and the old DB survives', async t => {
  const app = harness(t);
  createDatabase(app.fixture, 0, true);
  assert.ok(fs.statSync(app.fixture).size > 1024 * 1024);
  await assert.rejects(app.downloads.downloadDatabaseFromGitHub(() => {}), /contains no sermons/);
  assert.equal(await app.library.getSermonCount(), 1);
  assert.equal(fs.existsSync(`${app.active}.download`), false);
});

test('an existing large but empty database is not reported as ready', async t => {
  const app = harness(t, { count: 0, large: true });
  assert.equal(await app.downloads.databaseExists(), false);
});

test('an incomplete download is rejected before touching the active DB', async t => {
  const app = harness(t, { sizeDelta: 1 });
  createDatabase(app.fixture, 3);
  await assert.rejects(app.downloads.downloadDatabaseFromGitHub(() => {}), /incomplete/);
  assert.equal(await app.library.getSermonCount(), 1);
});

test('an HTTP error is rejected even if the downloader supplies a file URI', async t => {
  const app = harness(t, { status: 404 });
  createDatabase(app.fixture, 3);
  await assert.rejects(app.downloads.downloadDatabaseFromGitHub(() => {}), /HTTP 404/);
  assert.equal(await app.library.getSermonCount(), 1);
});

test('a failed close prevents replacing a database that is still open', async t => {
  const app = harness(t, { failClose: true });
  assert.equal(await app.library.getSermonCount(), 1);
  createDatabase(app.fixture, 3);
  await assert.rejects(app.downloads.downloadDatabaseFromGitHub(() => {}), /busy/);
  assert.equal(await app.library.getSermonCount(), 1);
});

test('a status query waits for the file swap instead of opening the old database', async t => {
  const app = harness(t, { count: 2 });
  let release;
  const blocked = new Promise(resolve => { release = resolve; });
  const replacing = app.lifecycle.withDatabaseReplacement(() => blocked);
  const count = app.library.getSermonCount();
  await Promise.resolve();
  assert.equal(app.opens.length, 0);
  release();
  await replacing;
  assert.equal(await count, 2);
});

test('concurrent replacements run one at a time and a failure releases waiting readers', async () => {
  const lifecycle = load('src/features/sermons/data/databaseLifecycle.ts');
  let release;
  const blocked = new Promise(resolve => { release = resolve; });
  const sequence = [];
  const first = lifecycle.withDatabaseReplacement(async () => { sequence.push('first'); await blocked; throw new Error('failed'); });
  const rejected = assert.rejects(first, /failed/);
  const second = lifecycle.withDatabaseReplacement(async () => { sequence.push('second'); });
  await Promise.resolve();
  assert.deepEqual(sequence, ['first']);
  release();
  await rejected;
  await second;
  await lifecycle.waitForDatabaseReplacement();
  assert.deepEqual(sequence, ['first', 'second']);
});
