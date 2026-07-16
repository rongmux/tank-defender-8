const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DEFAULT_BROWSER_SCRIPTS = Object.freeze([
  "src/core/geometry.js",
  "src/core/frame-counter.js",
  "src/core/battle-random.js",
  "src/core/directions.js",
  "src/audio/free-audio-manifest.js",
  "src/audio/audio-presentation.js",
  "src/audio/audio-mix-rules.js",
  "src/audio/fixed-frame-audio-state.js",
  "src/rules/enemy-ai-rules.js",
  "src/rules/enemy-spawn-rules.js",
  "src/entities/enemy-state.js",
  "src/entities/player-state.js",
  "src/entities/power-up-state.js",
  "src/rules/power-up-collection-rules.js",
  "src/rules/power-up-effect-rules.js",
  "src/rules/power-up-spawn-rules.js",
  "src/entities/projectile-state.js",
  "src/rules/projectile-collision-rules.js",
  "src/rules/projectile-impact-rules.js",
  "src/entities/transient-effect-state.js",
  "src/rules/score-rules.js",
  "src/rules/stage-result-rules.js",
  "src/rules/tank-collision-rules.js",
  "src/config/value-normalization.js",
  "src/config/game-session-settings.js",
  "src/config/combat-settings.js",
  "src/config/enemy-ai-settings.js",
  "src/config/enemy-spawn-settings.js",
  "src/config/explosion-settings.js",
  "src/config/player-movement-settings.js",
  "src/config/power-up-settings.js",
  "src/config/timing-settings.js",
  "src/presentation/free-sprite-manifest.js",
  "src/presentation/pixel-font.js",
  "src/presentation/tank-presentation.js",
  "src/presentation/effect-presentation.js",
  "src/presentation/screen-presentation.js",
  "src/presentation/battle-hud-presentation.js",
  "src/config/stage-flow-settings.js",
  "src/config/enemy-types.js",
  "src/config/player-upgrades.js",
  "src/stages/stage-grid.js",
  "src/rules/terrain-collision-rules.js",
  "src/rules/wall-damage-rules.js",
  "src/config/stage-settings.js",
  "src/stages/stage-pack.js",
  "src/stages/stage-routing.js",
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
