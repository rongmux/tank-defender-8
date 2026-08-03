const assert = require("assert").strict;
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const TERRAIN_DIAGNOSTIC_METHODS = [
  "debugTerrainCollisionProbe",
  "debugBaseWallPriorityProbe",
  "debugBaseDestructionSequenceProbe",
  "debugRenderBaseDestructionFrame",
  "debugTankCollisionProbe",
  "debugEnemyOverlapRecoveryProbe"
];

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.terrainDiagnostics, "terrain diagnostics should register before game.js");
assert.equal(Object.isFrozen(modules.terrainDiagnostics), true);
assert.equal(Object.isFrozen(modules.terrainBaseDiagnostics), true);
assert.deepEqual(
  JSON.parse(JSON.stringify(Object.keys(api).slice(124, 130))),
  TERRAIN_DIAGNOSTIC_METHODS
);

const outputs = TERRAIN_DIAGNOSTIC_METHODS.map((name) => api[name]());
const json = JSON.stringify(outputs);
assert.equal(Buffer.byteLength(json), 6225);
assert.equal(
  crypto.createHash("sha256").update(json).digest("hex"),
  "bafe79bb1927cc920ce09304dfaadf23342351de57b3ac67899d31140af9c34f"
);

const debugSource = fs.readFileSync(path.join(root, "src/runtime/debug-api.js"), "utf8");
const diagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/terrain-diagnostics.js"),
  "utf8"
);
const baseDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/terrain-base-diagnostics.js"),
  "utf8"
);
assert(debugSource.includes("...createTerrainDiagnostics(state, deps)"));
assert.equal(diagnosticsSource.includes("eval("), false);
assert.equal(baseDiagnosticsSource.includes("eval("), false);
assert(diagnosticsSource.includes("...createTerrainBaseDiagnostics(scope)"));
for (const name of TERRAIN_DIAGNOSTIC_METHODS) {
  assert.equal(debugSource.includes(`${name}(`), false);
  assert.equal(
    diagnosticsSource.includes(`${name}(`) || baseDiagnosticsSource.includes(`${name}(`),
    true
  );
}
assert(debugSource.split(/\r?\n/).length < 1200);

console.log("terrain-diagnostics integration test passed");
