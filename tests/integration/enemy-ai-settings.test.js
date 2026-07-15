const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;
const schema = JSON.parse(JSON.stringify(api.stagePackSchema()));

assert(modules.enemyAiSettings, "enemy AI settings module should register before game.js");
assert.deepEqual(schema.gameSettings.enemyAi, {
  intersectionTurnChance: 1 / 16,
  blockedRetryChance: 3 / 4,
  blockedRetryTicks: 2,
  horizontalFirstChance: 1 / 2
});
const defaultBlocked = JSON.parse(JSON.stringify(api.debugEnemyBlockedStateProbe()));
assert.equal(defaultBlocked.retry.blockedPauseTicks, 2);
assert.equal(defaultBlocked.retryPause1, 1);
assert.equal(defaultBlocked.retryPause2, 0);
assert.equal(defaultBlocked.turn.pendingTurn, true);

const customAi = {
  intersectionTurnChance: 0.33,
  blockedRetryChance: 0.44,
  blockedRetryTicks: 5,
  horizontalFirstChance: 0.22
};
const customPack = {
  id: "enemy-ai-settings-integration",
  totalStages: 1,
  maps: [schema.maps[0]],
  enemies: [schema.enemies[0].slice(0, 3)],
  gameSettings: { enemyAi: customAi }
};
assert.equal(api.validateStagePack(customPack).ok, true);
assert.equal(api.loadStagePack(customPack), true);
assert.deepEqual(JSON.parse(JSON.stringify(api.currentPackInfo().enemyAi)), customAi);
const retryPack = {
  ...customPack,
  id: "enemy-ai-settings-custom-retry",
  gameSettings: { enemyAi: { ...customAi, intersectionTurnChance: 0 } }
};
assert.equal(api.loadStagePack(retryPack), true);
const customBlocked = JSON.parse(JSON.stringify(api.debugEnemyBlockedStateProbe()));
assert.equal(customBlocked.retry.blockedPauseTicks, 5);
assert.equal(customBlocked.retryPause1, 4);
assert.equal(customBlocked.retryPause2, 3);

const legacyPack = {
  ...customPack,
  id: "enemy-ai-settings-legacy-aliases",
  gameSettings: { enemyAi: { randomTurnChance: 0.2, targetAxisBias: 0.8 } }
};
assert.equal(api.loadStagePack(legacyPack), true);
const legacyCurrent = JSON.parse(JSON.stringify(api.currentPackInfo().enemyAi));
assert.equal(legacyCurrent.intersectionTurnChance, 0.2);
assert.equal(legacyCurrent.horizontalFirstChance, 0.8);

const invalidAi = [
  { intersectionTurnChance: -0.1 },
  { blockedRetryChance: 1.1 },
  { blockedRetryTicks: 61 },
  { targetAxisBias: 2 }
];
for (const [index, enemyAi] of invalidAi.entries()) {
  const pack = { ...customPack, id: `bad-enemy-ai-settings-${index}`, gameSettings: { enemyAi } };
  assert.equal(api.validateStagePack(pack).ok, false);
}

console.log("enemy-ai-settings integration test passed");
