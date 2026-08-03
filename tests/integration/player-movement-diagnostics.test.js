const assert = require("assert").strict;
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const PLAYER_MOVEMENT_DIAGNOSTIC_METHODS = [
  "debugPlayerMovementCadenceProbe",
  "debugTankTrackAnimationProbe",
  "debugFriendlyFireDurationProbe",
  "debugFriendlyFireRefreshProbe",
  "debugPlayerStunProbe",
  "debugWasdDirectionProbe",
  "debugPlayerTurnAlignmentProbe",
  "debugPlayerBrickRecoveryProbe",
  "debugIceMovementProbe",
  "debugIceCoverRenderProbe",
  "debugForestPowerUpLayerProbe"
];

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.playerMovementDiagnostics, "player movement diagnostics should register before game.js");
assert.equal(Object.isFrozen(modules.playerMovementDiagnostics), true);
assert.equal(Object.isFrozen(modules.playerMovementInputDiagnostics), true);
assert.equal(Object.isFrozen(modules.playerMovementMotionDiagnostics), true);
assert.deepEqual(
  JSON.parse(JSON.stringify(Object.keys(api).slice(113, 124))),
  PLAYER_MOVEMENT_DIAGNOSTIC_METHODS
);

const outputs = PLAYER_MOVEMENT_DIAGNOSTIC_METHODS.map((name) => api[name]());
const json = JSON.stringify(outputs);
assert.equal(Buffer.byteLength(json), 2414);
assert.equal(
  crypto.createHash("sha256").update(json).digest("hex"),
  "418247028ceca73a1fc50e29fe24c7cdae0a36f5e4b16cee8ac94bc4704c7167"
);

const debugSource = fs.readFileSync(path.join(root, "src/runtime/debug-api.js"), "utf8");
const diagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/player-movement-diagnostics.js"),
  "utf8"
);
const motionDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/player-movement-motion-diagnostics.js"),
  "utf8"
);
const inputDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/player-movement-input-diagnostics.js"),
  "utf8"
);
assert(debugSource.includes("...createPlayerMovementDiagnostics(state, deps)"));
assert.equal(diagnosticsSource.includes("eval("), false);
assert.equal(motionDiagnosticsSource.includes("eval("), false);
assert.equal(inputDiagnosticsSource.includes("eval("), false);
for (const name of PLAYER_MOVEMENT_DIAGNOSTIC_METHODS) {
  assert.equal(debugSource.includes(`${name}(`), false);
  assert.equal(
    diagnosticsSource.includes(`${name}(`) ||
      motionDiagnosticsSource.includes(`${name}(`) ||
      inputDiagnosticsSource.includes(`${name}(`),
    true
  );
}
assert(debugSource.split(/\r?\n/).length < 2400);

console.log("player-movement-diagnostics integration test passed");
