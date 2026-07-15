const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;
const schema = JSON.parse(JSON.stringify(api.stagePackSchema()));

assert(modules.stageSettings, "stage settings module should register before game.js");
assert.equal(schema.stageSettings.length, 1);
assert.equal(schema.stageSettings[0].maxActiveEnemies, 4);
assert.equal(schema.stageSettings[0].maxActiveEnemiesTwoPlayer, 6);
assert.deepEqual(schema.stageSettings[0].playerSpawns, [{ x: 4, y: 12 }, { x: 8, y: 12 }]);
assert.deepEqual(schema.stageSettings[0].enemySpawns, [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 12, y: 0 }]);
assert.equal(schema.stageSettings[0].powerUpSpawns.length, 16);

const customPack = {
  id: "stage-settings-integration",
  totalStages: 1,
  maps: [schema.maps[0]],
  enemies: [schema.enemies[0].slice(0, 3)],
  stageSettings: [{
    maxActiveEnemies: 2,
    maxActiveEnemiesTwoPlayer: 5,
    playerSpawns: [{ x: 3, y: 12 }, { x: 9, y: 12 }],
    enemySpawns: [{ x: 1, y: 0 }, { x: 6, y: 0 }, { x: 11, y: 0 }],
    powerUpSpawns: [{ x: 2, y: 2 }, { x: 10, y: 10 }]
  }]
};
assert.equal(api.validateStagePack(customPack).ok, true);
assert.equal(api.loadStagePack(customPack), true);
const current = JSON.parse(JSON.stringify(api.currentPackInfo()));
assert.equal(current.maxActiveEnemies, 2);
assert.deepEqual(current.playerSpawns, customPack.stageSettings[0].playerSpawns);
assert.deepEqual(current.enemySpawns, customPack.stageSettings[0].enemySpawns);
assert.deepEqual(current.powerUpSpawns, customPack.stageSettings[0].powerUpSpawns);
const cycle = JSON.parse(JSON.stringify(api.debugStageCycleProbe(1)));
assert.equal(cycle.onePlayerMaxActiveEnemies, 2);
assert.equal(cycle.twoPlayerMaxActiveEnemies, 5);

const invalidPacks = [
  { ...customPack, id: "bad-capacity", stageSettings: [{ maxActiveEnemies: 0 }] },
  {
    ...customPack,
    id: "bad-player-spawn",
    stageSettings: [{
      playerSpawns: [{ x: 99, y: 12 }, { x: 8, y: 12 }],
      enemySpawns: [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 12, y: 0 }]
    }]
  },
  { ...customPack, id: "bad-power-up-spawn", stageSettings: [{ powerUpSpawns: [{ x: 13, y: 1 }] }] }
];
for (const pack of invalidPacks) assert.equal(api.validateStagePack(pack).ok, false);

console.log("stage-settings integration test passed");
