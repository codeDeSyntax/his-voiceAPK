const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function storageWith(setItem) {
  const source = fs.readFileSync(require.resolve('../src/shared/storage/storage.ts'), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } });
  const exports = {};
  vm.runInNewContext(outputText, { exports, require: () => ({ setItem }), Map, Promise, JSON });
  return exports;
}

test('a delayed write cannot overwrite newer bookmarks, and unrelated keys can proceed', async () => {
  const saved = new Map();
  let release;
  const blocked = new Promise(resolve => { release = resolve; });
  const storage = storageWith(async (key, value) => {
    if (value === '["first"]') await blocked;
    saved.set(key, value);
  });
  const first = storage.writeStored('bookmarks', ['first']);
  const second = storage.writeStored('bookmarks', ['second']);
  await storage.writeStored('settings', { darkMode: true });
  assert.equal(saved.has('bookmarks'), false);
  assert.equal(saved.get('settings'), '{"darkMode":true}');
  release();
  await Promise.all([first, second]);
  assert.equal(saved.get('bookmarks'), '["second"]');
});

test('a failed storage write does not block the next save', async () => {
  let attempts = 0;
  let saved;
  const storage = storageWith(async (_key, value) => {
    if (++attempts === 1) throw new Error('disk unavailable');
    saved = value;
  });
  await assert.rejects(storage.writeStored('positions', 1), /disk unavailable/);
  await storage.writeStored('positions', 2);
  assert.equal(saved, '2');
});

test('corrupt saved JSON falls back without breaking startup', () => {
  const storage = storageWith(async () => {});
  assert.equal(storage.parseStored('{invalid', 'fallback'), 'fallback');
  assert.equal(storage.parseStored(null, 'fallback'), 'fallback');
  assert.equal(storage.parseStored('0', 5), 0);
});
