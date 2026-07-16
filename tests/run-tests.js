const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const testFiles = [
  "tests/unit/value-normalization.test.js",
  "tests/unit/combat-settings.test.js",
  "tests/unit/enemy-ai-settings.test.js",
  "tests/unit/enemy-spawn-settings.test.js",
  "tests/unit/enemy-state.test.js",
  "tests/unit/explosion-settings.test.js",
  "tests/unit/game-session-settings.test.js",
  "tests/unit/player-movement-settings.test.js",
  "tests/unit/player-state.test.js",
  "tests/unit/projectile-state.test.js",
  "tests/unit/power-up-state.test.js",
  "tests/unit/transient-effect-state.test.js",
  "tests/unit/score-rules.test.js",
  "tests/unit/stage-result-rules.test.js",
  "tests/unit/tank-collision-rules.test.js",
  "tests/unit/terrain-collision-rules.test.js",
  "tests/unit/power-up-settings.test.js",
  "tests/unit/stage-flow-settings.test.js",
  "tests/unit/timing-settings.test.js",
  "tests/unit/enemy-types.test.js",
  "tests/unit/player-upgrades.test.js",
  "tests/unit/stage-settings.test.js",
  "tests/unit/stage-pack.test.js",
  "tests/unit/stage-routing.test.js",
  "tests/unit/enemy-sequences.test.js",
  "tests/unit/stage-grid.test.js",
  "tests/unit/directions.test.js",
  "tests/unit/geometry.test.js",
  "tests/unit/frame-counter.test.js",
  "tests/unit/battle-random.test.js",
  "tests/unit/browser-entry.test.js",
  "tests/integration/collision.test.js",
  "tests/integration/combat-settings.test.js",
  "tests/integration/enemy-ai-settings.test.js",
  "tests/integration/enemy-spawn-settings.test.js",
  "tests/integration/enemy-state.test.js",
  "tests/integration/explosion-settings.test.js",
  "tests/integration/game-session-settings.test.js",
  "tests/integration/player-movement-settings.test.js",
  "tests/integration/player-state.test.js",
  "tests/integration/projectile-state.test.js",
  "tests/integration/power-up-state.test.js",
  "tests/integration/transient-effect-state.test.js",
  "tests/integration/score-rules.test.js",
  "tests/integration/stage-result-rules.test.js",
  "tests/integration/tank-collision-rules.test.js",
  "tests/integration/terrain-collision-rules.test.js",
  "tests/integration/power-up-settings.test.js",
  "tests/integration/stage-flow-settings.test.js",
  "tests/integration/timing-settings.test.js",
  "tests/integration/enemy-types.test.js",
  "tests/integration/player-upgrades.test.js",
  "tests/integration/stage-settings.test.js",
  "tests/integration/stage-pack.test.js",
  "tests/integration/stage-routing.test.js",
  "tests/integration/frame-counter.test.js",
  "tests/integration/enemy-sequences.test.js",
  "tests/integration/stage-grid.test.js",
  "tools/smoke-test.js"
];

for (const testFile of testFiles) {
  const result = spawnSync(process.execPath, [path.join(root, testFile)], {
    cwd: root,
    stdio: "inherit"
  });
  if (result.status !== 0) process.exit(result.status || 1);
}

console.log("all tests passed");
