const assert = require("assert").strict;
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const POWER_UP_DIAGNOSTIC_METHODS = [
  "debugPowerUpTypePoolProbe",
  "debugBattleRandomProbe",
  "debugPowerUpFlashCadenceProbe",
  "debugPausedPowerUpVisualProbe",
  "debugWaterAnimationCadenceProbe",
  "debugPowerUpTtlProbe",
  "debugPowerUpPickupBoundaryProbe",
  "debugPowerUpPickupPriorityProbe",
  "debugPowerUpPickupRenderProbe",
  "debugPowerUpFootprintClearProbe",
  "debugPowerUpTerrainMutationProbe",
  "debugPowerUpSpawnTerrainProbe",
  "debugPowerUpSpawnRandomProbe",
  "debugPowerUpSpawnRotationProbe",
  "debugCarrierSpawnClearsPowerUpProbe"
];

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.powerUpDiagnostics, "power-up diagnostics should register before game.js");
assert.equal(Object.isFrozen(modules.powerUpDiagnostics), true);
assert.deepEqual(
  JSON.parse(JSON.stringify(Object.keys(api).slice(75, 90))),
  POWER_UP_DIAGNOSTIC_METHODS
);

const outputs = Object.fromEntries(
  POWER_UP_DIAGNOSTIC_METHODS.map((name) => [name, api[name]()])
);
const json = JSON.stringify(outputs);
assert.equal(Buffer.byteLength(json), 7420);
assert.equal(
  crypto.createHash("sha256").update(json).digest("hex"),
  "e0af19122317cf100882ed36619614462c89429036c27695f51c161ab8392faf"
);

const debugSource = fs.readFileSync(path.join(root, "src/runtime/debug-api.js"), "utf8");
const diagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/power-up-diagnostics.js"),
  "utf8"
);
assert(debugSource.includes("...createPowerUpDiagnostics(state, deps)"));
assert.equal(diagnosticsSource.includes("eval("), false);
for (const name of POWER_UP_DIAGNOSTIC_METHODS) {
  assert.equal(debugSource.includes(`${name}(`), false);
  assert.equal(diagnosticsSource.includes(`${name}(`), true);
}
assert(debugSource.split(/\r?\n/).length < 3050);

console.log("power-up-diagnostics integration test passed");
