const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context, source } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.stageRuntime, "stage runtime module should register before game.js");
assert.equal(Object.isFrozen(modules.stageRuntime), true);

const builtInInfo = JSON.parse(JSON.stringify(api.currentPackInfo()));
assert.equal(builtInInfo.totalStages, 35);
assert.equal(builtInInfo.stageCycleLimit, 70);
assert.equal(builtInInfo.enemyTotal, 20);
assert.equal(builtInInfo.maxActiveEnemies, 4);
assert.deepEqual(builtInInfo.playerSpawns, [{ x: 4, y: 12 }, { x: 8, y: 12 }]);
assert.deepEqual(builtInInfo.enemySpawns, [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 12, y: 0 }]);

const schema = JSON.parse(JSON.stringify(api.stagePackSchema()));
assert.equal(api.loadStagePack({
  id: "stage-runtime-integration",
  totalStages: 2,
  maps: [schema.maps[0], schema.maps[0]],
  enemies: [schema.enemies[0].slice(0, 1), schema.enemies[0].slice(0, 3)],
  stageSettings: [
    {
      maxActiveEnemies: 2,
      maxActiveEnemiesTwoPlayer: 5,
      playerSpawns: [{ x: 1, y: 11 }, { x: 2, y: 11 }],
      enemySpawns: [{ x: 1, y: 0 }, { x: 5, y: 0 }, { x: 11, y: 0 }],
      powerUpSpawns: [{ x: 2, y: 2 }]
    },
    {
      maxActiveEnemies: 3,
      maxActiveEnemiesTwoPlayer: 6,
      playerSpawns: [{ x: 3, y: 11 }, { x: 9, y: 11 }],
      enemySpawns: [{ x: 2, y: 0 }, { x: 6, y: 0 }, { x: 10, y: 0 }],
      powerUpSpawns: [{ x: 4, y: 4 }]
    }
  ],
  gameSettings: {
    initialLives: 7,
    stageAdvance: { loopAfterFinalStage: false }
  }
}), true);

const customInfo = JSON.parse(JSON.stringify(api.currentPackInfo()));
assert.equal(customInfo.id, "stage-runtime-integration");
assert.equal(customInfo.totalStages, 2);
assert.equal(customInfo.stageCycleLimit, 2);
assert.equal(customInfo.enemyTotal, 1);
assert.equal(customInfo.maxActiveEnemies, 2);
assert.equal(customInfo.initialLives, 7);
assert.deepEqual(customInfo.playerSpawns, [{ x: 1, y: 11 }, { x: 2, y: 11 }]);
assert.deepEqual(customInfo.enemySpawns, [{ x: 1, y: 0 }, { x: 5, y: 0 }, { x: 11, y: 0 }]);
assert.deepEqual(customInfo.powerUpSpawns, [{ x: 2, y: 2 }]);
assert.equal(customInfo.enemySequence.length, 1);

const stageTwo = JSON.parse(JSON.stringify(api.debugStageCycleProbe(2)));
assert.equal(stageTwo.mapDataStage, 2);
assert.equal(stageTwo.enemyDataStage, 2);
assert.equal(stageTwo.enemyTotal, 3);
assert.equal(stageTwo.onePlayerMaxActiveEnemies, 3);
assert.equal(stageTwo.twoPlayerMaxActiveEnemies, 6);

assert(source.includes('stageRuntime'));
assert(source.includes("createStageRuntime({"));
assert(!source.includes("function stageRoute(stage)"));
assert(!source.includes("function createStageGrid(stage)"));
assert(!source.includes("function enemySequenceForStage(stage)"));

console.log("stage-runtime integration test passed");
