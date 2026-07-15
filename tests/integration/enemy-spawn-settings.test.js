const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;
const schema = JSON.parse(JSON.stringify(api.stagePackSchema()));

assert(modules.enemySpawnSettings, "enemy spawn settings module should register before game.js");
assert.deepEqual(schema.gameSettings.enemySpawnPacing, {
  firstDelay: 0,
  baseDelay: 190,
  stageStep: 4,
  minDelay: 50,
  extendedLoopMinDelay: 50,
  twoPlayerDelayReduction: 20
});
const stage1 = JSON.parse(JSON.stringify(api.debugStageCycleProbe(1)));
const stage35 = JSON.parse(JSON.stringify(api.debugStageCycleProbe(35)));
const stage36 = JSON.parse(JSON.stringify(api.debugStageCycleProbe(36)));
assert.equal(stage1.defaultEnemySpawnDelay, 186);
assert.equal(stage1.twoPlayerDefaultEnemySpawnDelay, 166);
assert.equal(stage1.firstEnemySpawnDelay, 0);
assert.equal(stage35.defaultEnemySpawnDelay, 50);
assert.equal(stage35.twoPlayerDefaultEnemySpawnDelay, 30);
assert.equal(stage36.defaultEnemySpawnDelay, 50);

const customPacing = {
  firstDelay: 5,
  baseDelay: 9,
  stageStep: 1,
  minDelay: 4,
  extendedLoopMinDelay: 3,
  twoPlayerDelayReduction: 2
};
const customPack = {
  id: "enemy-spawn-settings-integration",
  totalStages: 1,
  maps: [schema.maps[0]],
  enemies: [schema.enemies[0].slice(0, 3).map((enemy) => ({ ...enemy, spawnDelay: null }))],
  gameSettings: { enemySpawnPacing: customPacing }
};
assert.equal(api.validateStagePack(customPack).ok, true);
assert.equal(api.loadStagePack(customPack), true);
assert.deepEqual(JSON.parse(JSON.stringify(api.currentPackInfo().enemySpawnPacing)), customPacing);
const customCycle = JSON.parse(JSON.stringify(api.debugStageCycleProbe(1)));
assert.equal(customCycle.defaultEnemySpawnDelay, 8);
assert.equal(customCycle.twoPlayerDefaultEnemySpawnDelay, 6);
assert.equal(customCycle.firstEnemySpawnDelay, 5);
assert.equal(customCycle.twoPlayerFirstEnemySpawnDelay, 3);

const multiplierPack = {
  ...customPack,
  id: "enemy-spawn-settings-legacy-multiplier",
  gameSettings: {
    enemySpawnPacing: {
      firstDelay: 5,
      baseDelay: 9,
      stageStep: 1,
      minDelay: 4,
      extendedLoopMinDelay: 3,
      twoPlayerDelayMultiplier: 0.5
    }
  }
};
assert.equal(api.loadStagePack(multiplierPack), true);
const multiplierCycle = JSON.parse(JSON.stringify(api.debugStageCycleProbe(1)));
assert.equal(multiplierCycle.twoPlayerDefaultEnemySpawnDelay, 4);
assert.equal(multiplierCycle.twoPlayerFirstEnemySpawnDelay, 3);

const invalidPacing = [
  { minDelay: -1 },
  { stageStep: 1.5 },
  { twoPlayerDelayReduction: 3601 },
  { twoPlayerDelayMultiplier: 0.05 }
];
for (const [index, enemySpawnPacing] of invalidPacing.entries()) {
  const pack = {
    ...customPack,
    id: `bad-enemy-spawn-settings-${index}`,
    gameSettings: { enemySpawnPacing }
  };
  assert.equal(api.validateStagePack(pack).ok, false);
}

console.log("enemy-spawn-settings integration test passed");
