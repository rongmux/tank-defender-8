const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;
const schema = JSON.parse(JSON.stringify(api.stagePackSchema()));

assert(modules.enemySpawnRules, "enemy spawn rules module should register before game.js");
assert.equal(Object.isFrozen(modules.enemySpawnRules), true);
assert.equal(modules.enemySpawnRules.selectEnemySpawnIndex({}, 0), 1);

const overlap = JSON.parse(JSON.stringify(api.debugEnemySpawnOverlapProbe()));
assert.deepEqual(overlap.blocked, {
  enemyCount: 1,
  enemySpawned: 0,
  retry: schema.gameSettings.timings.enemySpawnRetry
});
assert.deepEqual(overlap.beforeRetry, {
  enemyCount: 1,
  enemySpawned: 0,
  retry: 0
});
assert.equal(overlap.afterRetry.enemyCount, 2);
assert.equal(overlap.afterRetry.enemySpawned, 1);
assert.equal(overlap.afterRetry.enemyOverlap, false);

const timeline = JSON.parse(JSON.stringify(api.debugEnemySpawnTimelineProbe(1, 3)));
assert.deepEqual(timeline.spawnIndices, [1, 2, 0]);
assert.deepEqual(timeline.slots, [5, 4, 3]);

console.log("enemy-spawn-rules integration test passed");
