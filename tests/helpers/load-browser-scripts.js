const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DEFAULT_BROWSER_SCRIPTS = Object.freeze([
  "src/core/geometry.js",
  "src/core/frame-counter.js",
  "src/core/battle-random.js",
  "src/config/value-normalization.js",
  "src/config/player-movement-settings.js",
  "src/config/power-up-settings.js",
  "src/config/timing-settings.js",
  "src/config/enemy-types.js",
  "src/config/player-upgrades.js",
  "src/stages/stage-grid.js",
  "src/config/stage-settings.js",
  "src/stages/enemy-sequences.js",
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
