const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DEFAULT_BROWSER_SCRIPTS = Object.freeze([
  "src/core/frame-counter.js",
  "src/core/battle-random.js",
  "src/game.js"
]);

function loadBrowserScripts(root, context, scripts = DEFAULT_BROWSER_SCRIPTS) {
  const sandbox = vm.isContext(context) ? context : vm.createContext(context);
  const sources = {};
  for (const relativePath of scripts) {
    const source = fs.readFileSync(path.join(root, relativePath), "utf8");
    sources[relativePath] = source;
    vm.runInContext(source, sandbox, { filename: relativePath });
  }
  return { context: sandbox, sources };
}

module.exports = {
  DEFAULT_BROWSER_SCRIPTS,
  loadBrowserScripts
};
