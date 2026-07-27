const assert = require("assert").strict;
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.stagePackDiagnostics, "stage-pack diagnostics module should register before game.js");
assert.equal(Object.isFrozen(modules.stagePackDiagnostics), true);

const current = JSON.parse(JSON.stringify(api.currentPackInfo()));
const snapshot = JSON.parse(JSON.stringify(api.debugSnapshot()));
for (const key of modules.stagePackDiagnostics.DEBUG_PACK_INFO_KEYS) {
  assert.deepEqual(snapshot[key], current[key], `debug snapshot should reuse pack field: ${key}`);
}

const first = api.currentPackInfo();
first.playerMovement.frameCadence[0] = false;
first.explosionRules.enemyDestroy.ttl = -1;
first.enemyTypes[0].hp = -1;
first.playerUpgradeRules[0].maxBullets = -1;
first.enemySequence[0].typeIndex = -1;

const second = api.currentPackInfo();
assert.notEqual(second.playerMovement.frameCadence[0], false);
assert.notEqual(second.explosionRules.enemyDestroy.ttl, -1);
assert.notEqual(second.enemyTypes[0].hp, -1);
assert.notEqual(second.playerUpgradeRules[0].maxBullets, -1);
assert.notEqual(second.enemySequence[0].typeIndex, -1);

const debugSource = fs.readFileSync(path.join(root, "src/runtime/debug-api.js"), "utf8");
const snapshotSource = fs.readFileSync(path.join(root, "src/runtime/debug-snapshot.js"), "utf8");
const publicAdaptersSource = fs.readFileSync(
  path.join(root, "src/runtime/public-api-adapters.js"),
  "utf8"
);
assert(debugSource.includes("...publicAdapters.packInfo,"));
assert(publicAdaptersSource.includes("return createCurrentPackInfo(game, stageRuntime);"));
assert(snapshotSource.includes("...createDebugPackInfo(game, stageRuntime)"));
assert.equal((debugSource.match(/bonusLifeScores:/g) || []).length, 0);
assert.equal((debugSource.match(/playerUpgradeRules:/g) || []).length, 0);

console.log("stage-pack-diagnostics integration test passed");
