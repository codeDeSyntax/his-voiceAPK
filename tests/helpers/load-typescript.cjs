const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

module.exports = function loadTypeScript(file, mocks = {}, globals = {}) {
  const filename = path.resolve(__dirname, '../..', file);
  const source = fs.readFileSync(filename, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require(name) {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      throw new Error(`Missing test dependency: ${name}`);
    },
    __DEV__: false,
    console: { log() {}, warn() {}, error() {} },
    Error, DOMException, AbortController, setTimeout, clearTimeout,
    ...globals,
  }, { filename });
  return exports;
};
