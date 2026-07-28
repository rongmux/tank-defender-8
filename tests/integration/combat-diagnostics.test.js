const assert = require("assert").strict;
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const COMBAT_DIAGNOSTIC_METHODS = [
  "debugHelmetProtectionProbe",
  "debugEnemyBulletPlayerCollisionProbe",
  "debugPlayerBulletEnemyCollisionProbe",
  "debugPlayerSpawnLockProbe",
  "debugActiveBulletLimitProbe",
  "debugPlayerFireInputProbe",
  "debugCrossingBulletCancelProbe",
  "debugProjectileRuleProbe",
  "debugFieldBoundaryBulletProbe",
  "debugTerrainHitSoundProbe",
  "debugFriendlyFireProbe",
  "debugFriendlyFireProtectionProbe"
];

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.combatDiagnostics, "combat diagnostics should register before game.js");
assert.equal(Object.isFrozen(modules.combatDiagnostics), true);
assert(modules.battleLoopRuntime, "battle loop runtime should register before game.js");
assert.equal(Object.isFrozen(modules.battleLoopRuntime), true);
assert.deepEqual(
  JSON.parse(JSON.stringify(Object.keys(api).slice(101, 113))),
  COMBAT_DIAGNOSTIC_METHODS
);

const outputs = COMBAT_DIAGNOSTIC_METHODS.map((name) => api[name]());
const json = JSON.stringify(outputs);
assert.equal(Buffer.byteLength(json), 5147);
assert.equal(
  crypto.createHash("sha256").update(json).digest("hex"),
  "610833017059b265259ef4b26cc5bed1076687c3e7b181c40588eb6545ad39f2"
);

const debugSource = fs.readFileSync(path.join(root, "src/runtime/debug-api.js"), "utf8");
const diagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/combat-diagnostics.js"),
  "utf8"
);
assert(debugSource.includes("...createCombatDiagnostics(state, deps)"));
assert.equal(diagnosticsSource.includes("eval("), false);
for (const name of COMBAT_DIAGNOSTIC_METHODS) {
  assert.equal(debugSource.includes(`${name}(`), false);
  assert.equal(diagnosticsSource.includes(`${name}(`), true);
}
assert(debugSource.split(/\r?\n/).length < 2000);

console.log("combat-diagnostics integration test passed");
