const assert = require("assert").strict;
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const ENEMY_DIAGNOSTIC_METHODS = [
  "debugCarrierReleaseProbe",
  "debugCarrierFlashProbe",
  "debugPausedTankVisualProbe",
  "debugEnemyColorProbe",
  "debugEnemyTargetEligibilityProbe",
  "debugEnemyAiPhaseProbe",
  "debugEnemyTargetingProbe",
  "debugEnemyMovementCadenceProbe",
  "debugEnemyBlockedStateProbe",
  "debugEnemySpawnTimelineProbe",
  "debugSpawnAnimationCadenceProbe"
];

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.enemyDiagnostics, "enemy diagnostics should register before game.js");
assert.equal(Object.isFrozen(modules.enemyDiagnostics), true);
assert.deepEqual(
  JSON.parse(JSON.stringify(Object.keys(api).slice(56, 67))),
  ENEMY_DIAGNOSTIC_METHODS
);

const outputs = {
  debugCarrierReleaseProbe: api.debugCarrierReleaseProbe(4),
  debugCarrierFlashProbe: api.debugCarrierFlashProbe(),
  debugPausedTankVisualProbe: api.debugPausedTankVisualProbe(),
  debugEnemyColorProbe: api.debugEnemyColorProbe(3, 1),
  debugEnemyTargetEligibilityProbe: api.debugEnemyTargetEligibilityProbe(),
  debugEnemyAiPhaseProbe: api.debugEnemyAiPhaseProbe(35, 2),
  debugEnemyTargetingProbe: api.debugEnemyTargetingProbe(),
  debugEnemyMovementCadenceProbe: api.debugEnemyMovementCadenceProbe(),
  debugEnemyBlockedStateProbe: api.debugEnemyBlockedStateProbe(),
  debugEnemySpawnTimelineProbe: api.debugEnemySpawnTimelineProbe(2, 3),
  debugSpawnAnimationCadenceProbe: api.debugSpawnAnimationCadenceProbe()
};
const json = JSON.stringify(outputs);
assert.equal(Buffer.byteLength(json), 3839);
assert.equal(
  crypto.createHash("sha256").update(json).digest("hex"),
  "bc7b15f12f7439eee59f1d476235a60e2b90eb0c6936174bd6a49136891ad443"
);

const debugSource = fs.readFileSync(path.join(root, "src/runtime/debug-api.js"), "utf8");
const diagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/enemy-diagnostics.js"),
  "utf8"
);
assert(debugSource.includes("...createEnemyDiagnostics(state, deps)"));
assert.equal(diagnosticsSource.includes("eval("), false);
for (const name of ENEMY_DIAGNOSTIC_METHODS) {
  assert.equal(debugSource.includes(`${name}(`), false);
  assert.equal(diagnosticsSource.includes(`${name}(`), true);
}
assert(debugSource.split(/\r?\n/).length < 4550);

console.log("enemy-diagnostics integration test passed");
