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
assert.equal(Object.isFrozen(modules.combatProjectileDiagnostics), true);
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
const detailedHarness = createBrowserGameHarness(root);
const detailedApi = detailedHarness.context.window.TankDefender8;
const detailedSchema = detailedApi.stagePackSchema();
const activeBulletProbe = detailedApi.debugActiveBulletLimitProbe();
assert(activeBulletProbe.base.maxBullets === 1, "base player tank should have a one-bullet active limit");
assert(activeBulletProbe.base.counts.join(",") === "1,1", "base player tank should not fire a second active bullet");
assert(activeBulletProbe.upgraded.maxBullets === 2, "second-star player tank should have a two-bullet active limit");
assert(activeBulletProbe.upgraded.counts.join(",") === "1,2,2", "second-star player tank should not exceed two active bullets");
assert(activeBulletProbe.upgraded.speeds.every((speed) => speed === detailedSchema.playerUpgradeRules[2].bulletSpeed), "upgraded active bullets should use the fast bullet speed");
assert(activeBulletProbe.upgraded.powers.every((power) => power === 1), "second-star active bullets should still use normal wall power");
assert(activeBulletProbe.enemy.maxBullets === 1, "enemy tanks should have a one-bullet active limit");
assert(activeBulletProbe.enemy.counts.join(",") === "1,1", "enemy tanks should not fire a second active bullet while their first remains on screen");
assert(activeBulletProbe.enemy.speeds[0] === detailedSchema.enemyTypes[2].bullet, "enemy active bullet probe should use the configured enemy bullet speed");
assert(activeBulletProbe.enemy.powers[0] === detailedSchema.enemyTypes[2].wallPower, "enemy active bullet probe should use the configured enemy wall power");
const playerFireInputProbe = detailedApi.debugPlayerFireInputProbe();
assert(playerFireInputProbe.firstPress === 1, "a fresh player fire press should create one bullet");
assert(playerFireInputProbe.heldAfterBulletClears === 0, "holding fire should not automatically shoot again after the active bullet clears");
assert(playerFireInputProbe.repressAfterRelease === 1, "releasing and pressing fire again should create a new bullet");
assert(playerFireInputProbe.fullSlotPress === 1 && playerFireInputProbe.fullSlotPressAfterClear === 0, "a fire press made while the bullet slot is full should be discarded");
assert(playerFireInputProbe.fullSlotRepress === 1, "a new fire press should work after a full bullet slot becomes free");
assert(playerFireInputProbe.doubleShotCounts.join(",") === "1,2,2", "second-star tanks should fill two bullet slots with separate presses and discard a press when both are occupied");
assert(playerFireInputProbe.spawnPress === 0 && playerFireInputProbe.spawnPressAfterUnlock === 0, "fire pressed during player spawning should be discarded instead of queued");
assert(playerFireInputProbe.stunnedPress === 1, "a stunned player should still fire from a fresh press");
const diagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/combat-diagnostics.js"),
  "utf8"
);
const projectileDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/combat-projectile-diagnostics.js"),
  "utf8"
);
assert(debugSource.includes("...createCombatDiagnostics(state, deps)"));
assert.equal(diagnosticsSource.includes("eval("), false);
assert.equal(projectileDiagnosticsSource.includes("eval("), false);
for (const name of COMBAT_DIAGNOSTIC_METHODS) {
  assert.equal(debugSource.includes(`${name}(`), false);
  assert.equal(
    diagnosticsSource.includes(`${name}(`) || projectileDiagnosticsSource.includes(`${name}(`),
    true
  );
}
assert(debugSource.split(/\r?\n/).length < 2000);

console.log("combat-diagnostics integration test passed");
