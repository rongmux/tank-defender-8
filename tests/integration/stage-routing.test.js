const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;
const schema = JSON.parse(JSON.stringify(api.stagePackSchema()));

assert(modules.stageRouting, "stage routing module should register before game.js");
assert.equal(Object.isFrozen(modules.stageRouting), true);

const builtIn35 = JSON.parse(JSON.stringify(api.debugStageCycleProbe(35)));
const builtIn36 = JSON.parse(JSON.stringify(api.debugStageCycleProbe(36)));
const builtIn70 = JSON.parse(JSON.stringify(api.debugStageCycleProbe(70)));
assert.equal(builtIn35.stageCycleLimit, 70);
assert.equal(builtIn35.mapDataStage, 35);
assert.equal(builtIn35.enemyDataStage, 35);
assert.equal(builtIn36.mapDataStage, 1);
assert.equal(builtIn36.enemyDataStage, 35);
assert.equal(builtIn70.mapDataStage, 35);
assert.equal(builtIn70.enemyDataStage, 35);

const customPack = {
  id: "stage-routing-integration",
  totalStages: 2,
  maps: [schema.maps[0], schema.maps[0]],
  enemies: [schema.enemies[0].slice(0, 1), schema.enemies[0].slice(0, 3)],
  stageSettings: [
    { maxActiveEnemies: 2, maxActiveEnemiesTwoPlayer: 5 },
    { maxActiveEnemies: 3, maxActiveEnemiesTwoPlayer: 6 }
  ],
  gameSettings: {
    stageAdvance: { loopAfterFinalStage: false }
  }
};
assert.equal(api.loadStagePack(customPack), true);

const custom1 = JSON.parse(JSON.stringify(api.debugStageCycleProbe(1)));
const custom2 = JSON.parse(JSON.stringify(api.debugStageCycleProbe(2)));
const clamped = JSON.parse(JSON.stringify(api.debugStageCycleProbe(5)));
assert.equal(custom1.stageCount, 2);
assert.equal(custom1.stageCycleLimit, 2);
assert.equal(custom1.enemyTotal, 1);
assert.equal(custom1.onePlayerMaxActiveEnemies, 2);
assert.equal(custom1.twoPlayerMaxActiveEnemies, 5);
assert.equal(custom2.enemyTotal, 3);
assert.equal(custom2.onePlayerMaxActiveEnemies, 3);
assert.equal(custom2.twoPlayerMaxActiveEnemies, 6);
assert.equal(clamped.mapDataStage, 2);
assert.equal(clamped.enemyDataStage, 2);
assert.equal(clamped.enemyTotal, 3);

console.log("stage-routing integration test passed");
