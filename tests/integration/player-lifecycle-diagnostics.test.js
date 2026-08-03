const assert = require("assert").strict;
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const PLAYER_LIFECYCLE_DIAGNOSTIC_METHODS = [
  "debugPlayerDeathRespawnProbe",
  "debugPlayerGameOverMessageProbe",
  "debugRenderPlayerGameOverMessage",
  "debugLifeAwardProbe"
];

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.playerLifecycleDiagnostics, "player lifecycle diagnostics should register before game.js");
assert.equal(Object.isFrozen(modules.playerLifecycleDiagnostics), true);
assert.equal(Object.isFrozen(modules.playerLifecycleGameOverDiagnostics), true);
assert.deepEqual(
  JSON.parse(JSON.stringify(Object.keys(api).slice(97, 101))),
  PLAYER_LIFECYCLE_DIAGNOSTIC_METHODS
);

const outputs = PLAYER_LIFECYCLE_DIAGNOSTIC_METHODS.map((name) => api[name]());
const json = JSON.stringify(outputs);
assert.equal(Buffer.byteLength(json), 5172);
assert.equal(
  crypto.createHash("sha256").update(json).digest("hex"),
  "e035ae7af20a15a045a813fd4e20d936c08c1c831f5f0c706ac1f5569687a406"
);

const debugSource = fs.readFileSync(path.join(root, "src/runtime/debug-api.js"), "utf8");
const diagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/player-lifecycle-diagnostics.js"),
  "utf8"
);
const gameOverDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/player-lifecycle-game-over-diagnostics.js"),
  "utf8"
);
assert(debugSource.includes("...createPlayerLifecycleDiagnostics(state, deps)"));
assert.equal(diagnosticsSource.includes("eval("), false);
assert.equal(gameOverDiagnosticsSource.includes("eval("), false);
for (const name of PLAYER_LIFECYCLE_DIAGNOSTIC_METHODS) {
  assert.equal(debugSource.includes(`${name}(`), false);
  assert.equal(
    diagnosticsSource.includes(`${name}(`) || gameOverDiagnosticsSource.includes(`${name}(`),
    true
  );
}
assert(debugSource.split(/\r?\n/).length < 800);

console.log("player-lifecycle-diagnostics integration test passed");
