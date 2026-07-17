const assert = require("assert").strict;
const stageRuntimeModule = require("../../src/stages/stage-runtime");
const { createBuiltInStagePack } = require("../../src/stages/built-in-stage-pack");
const { createStagePackSchema } = require("../../src/stages/stage-pack-schema");
const { normalizeStagePack } = require("../../src/stages/stage-pack");
const { buildProceduralStage } = require("../../src/stages/procedural-stage");
const { gridToQuadrants, gridToRows } = require("../../src/stages/stage-grid");

const { createStageRuntime } = stageRuntimeModule;
const builtInStagePack = createBuiltInStagePack();
const state = {
  stagePack: builtInStagePack,
  stage: 1,
  playerCount: 1,
  demoMode: false
};

assert.equal(Object.isFrozen(stageRuntimeModule), true);
assert.throws(() => createStageRuntime(), /getState must be a function/);
assert.throws(() => createStageRuntime({ getState() {} }), /builtInStagePack must be an object/);

const runtime = createStageRuntime({
  getState: () => state,
  builtInStagePack,
  demoMaxActiveEnemies: 5
});
assert.equal(Object.isFrozen(runtime), true);

assert.equal(runtime.stageCount(), 35);
assert.equal(runtime.stageCycleLimit(), 70);
assert.equal(runtime.isExtendedLoopStage(35), false);
assert.equal(runtime.isExtendedLoopStage(36), true);
assert.equal(runtime.mapDataStage(36), 1);
assert.equal(runtime.enemyDataStage(36), 35);
assert.equal(runtime.enemyTotal(1), 20);
assert.equal(runtime.maxActiveEnemies(1, 1), 4);
assert.equal(runtime.maxActiveEnemies(1, 2), 6);
assert.equal(runtime.gameSettings(), builtInStagePack.gameSettings);
assert.equal(runtime.enemyTypeDefinitions(), builtInStagePack.enemyTypes);
assert.equal(runtime.stageSettings(), null);
assert.deepEqual(runtime.playerSpawnPoint(1), { x: 65, y: 193 });
assert.deepEqual(runtime.playerSpawnPoint(2), { x: 129, y: 193 });
assert.deepEqual(runtime.enemySpawnPoint(4), { x: 97, y: 1 });
assert.deepEqual(runtime.currentPlayerSpawns(), [{ x: 4, y: 12 }, { x: 8, y: 12 }]);
assert.deepEqual(runtime.currentEnemySpawns(), [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 12, y: 0 }]);
assert.equal(runtime.currentPowerUpSpawns().length, 16);
assert.deepEqual(gridToRows(runtime.createStageGrid(1)), gridToRows(builtInStagePack.createGrid(1)));
assert.deepEqual(runtime.getEnemySpec(1, 0), builtInStagePack.enemyAt(1, 0));
assert.equal(runtime.enemySequenceForStage(1).length, 20);

state.demoMode = true;
assert.equal(runtime.maxActiveEnemies(1, 1), 5);
state.demoMode = false;

const schema = createStagePackSchema();
const stageTwoRows = schema.maps[0].slice();
stageTwoRows[0] = "B............";
const customPack = normalizeStagePack({
  id: "stage-runtime-unit",
  totalStages: 2,
  maps: [schema.maps[0], stageTwoRows],
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
      powerUpSpawns: [{ x: 4, y: 4 }, { x: 8, y: 8 }]
    }
  ],
  gameSettings: {
    initialLives: 7,
    stageAdvance: { loopAfterFinalStage: false }
  }
});
state.stagePack = customPack;
state.stage = 2;
state.playerCount = 2;

assert.equal(runtime.stageCount(), 2);
assert.equal(runtime.stageCycleLimit(), 2);
assert.equal(runtime.mapDataStage(5), 2);
assert.equal(runtime.enemyDataStage(5), 2);
assert.equal(runtime.enemyTotal(2), 3);
assert.equal(runtime.maxActiveEnemies(), 6);
assert.equal(runtime.maxActiveEnemies(1, 1), 2);
assert.equal(runtime.gameSettings(), customPack.gameSettings);
assert.equal(runtime.enemyTypeDefinitions(), customPack.enemyTypes);
assert.equal(runtime.stageSettings(), customPack.stageSettings[1]);
assert.deepEqual(runtime.playerSpawnPoint(1), { x: 49, y: 177 });
assert.deepEqual(runtime.enemySpawnPoint(2), { x: 161, y: 1 });
assert.deepEqual(runtime.currentPlayerSpawns(), [{ x: 3, y: 11 }, { x: 9, y: 11 }]);
assert.deepEqual(runtime.currentEnemySpawns(), [{ x: 2, y: 0 }, { x: 6, y: 0 }, { x: 10, y: 0 }]);
assert.deepEqual(runtime.currentPowerUpSpawns(), [{ x: 4, y: 4 }, { x: 8, y: 8 }]);
assert.deepEqual(gridToRows(runtime.createStageGrid(2)), stageTwoRows);
assert.equal(runtime.getEnemySpec(2, 2).typeIndex, customPack.enemies[1][2].typeIndex);
assert.equal(runtime.enemySequenceForStage(2).length, 3);

const rawQuadrantPack = {
  totalStages: 1,
  gameSettings: builtInStagePack.gameSettings,
  enemyTypes: builtInStagePack.enemyTypes,
  quadrants: [schema.quadrants[0]],
  enemies: [[]]
};
state.stagePack = rawQuadrantPack;
state.stage = 1;
assert.deepEqual(gridToQuadrants(runtime.createStageGrid(1)), schema.quadrants[0]);
assert.deepEqual(runtime.getEnemySpec(1, 0), builtInStagePack.enemyAt(1, 0));

state.stagePack = {
  totalStages: 1,
  gameSettings: builtInStagePack.gameSettings,
  enemyTypes: builtInStagePack.enemyTypes,
  enemies: [[]]
};
assert.deepEqual(gridToRows(runtime.createStageGrid(1)), gridToRows(buildProceduralStage(1)));

state.stagePack = null;
state.stage = 1;
assert.equal(runtime.stageCount(), 35);
assert.equal(runtime.gameSettings(), builtInStagePack.gameSettings);

console.log("stage-runtime unit test passed");
