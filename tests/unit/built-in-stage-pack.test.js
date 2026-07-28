const assert = require("assert").strict;
const builtInStagePack = require("../../src/stages/built-in-stage-pack");
const { DEFAULT_ENEMY_TYPES, cloneEnemyTypes } = require("../../src/config/enemy-types");
const { normalizeGameSettings } = require("../../src/stages/stage-pack");
const { buildOriginalStyleEnemySequences } = require("../../src/stages/enemy-sequences");
const { buildOriginalStageGrid } = require("../../src/stages/original-stage-data");
const { gridToRows } = require("../../src/stages/stage-grid");

const {
  BUILT_IN_STAGE_PACK_ID,
  createBuiltInStagePack,
  pickFallbackEnemyType
} = builtInStagePack;

assert.equal(Object.isFrozen(builtInStagePack), true);
assert.equal(BUILT_IN_STAGE_PACK_ID, "original-style");

const pack = createBuiltInStagePack();
assert.deepEqual(Object.keys(pack), [
  "id",
  "totalStages",
  "enemyTotal",
  "enemyTotals",
  "enemyTypes",
  "gameSettings",
  "maps",
  "enemies",
  "createGrid",
  "enemyAt"
]);
assert.equal(pack.id, BUILT_IN_STAGE_PACK_ID);
assert.equal(pack.totalStages, 35);
assert.equal(pack.enemyTotal, 20);
assert.deepEqual(pack.enemyTotals, Array(35).fill(20));
assert.deepEqual(pack.enemyTypes, cloneEnemyTypes(DEFAULT_ENEMY_TYPES));
assert.deepEqual(pack.gameSettings, normalizeGameSettings());
assert.deepEqual(pack.maps, []);
assert.deepEqual(pack.enemies, buildOriginalStyleEnemySequences());
assert(pack.enemies.every((sequence) => sequence.length === 20));

assert.deepEqual(pack.enemyAt(1, 0), {
  typeIndex: 0,
  carrier: false,
  spawnIndex: 1,
  powerUpType: null,
  spawnDelay: null
});
assert.deepEqual(pack.enemyAt(1, 3), {
  typeIndex: 0,
  carrier: true,
  spawnIndex: 1,
  powerUpType: null,
  spawnDelay: null
});
assert.deepEqual(pack.enemyAt(35, 19), {
  typeIndex: 3,
  carrier: false,
  spawnIndex: 2,
  powerUpType: null,
  spawnDelay: null
});

assert.deepEqual(gridToRows(pack.createGrid(1)), gridToRows(buildOriginalStageGrid(1)));
assert.deepEqual(gridToRows(pack.createGrid(35)), gridToRows(buildOriginalStageGrid(35)));
const mapBeforeMutation = gridToRows(pack.createGrid(2));
pack.maps.push(Array.from({ length: 13 }, () => "B".repeat(13)));
assert.deepEqual(gridToRows(pack.createGrid(2)), mapBeforeMutation);

assert.deepEqual(
  Array.from({ length: 20 }, (_, index) => pickFallbackEnemyType(1, index)),
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
);
assert.equal(pickFallbackEnemyType(16, 0), 2);
assert.equal(pickFallbackEnemyType(16, 4), 3);
assert.equal(pickFallbackEnemyType(16, 8), 3);
assert.equal(pickFallbackEnemyType(16, 16), 0);

pack.enemies[0] = [];
assert.deepEqual(pack.enemyAt(1, 3), {
  typeIndex: 0,
  carrier: true,
  spawnIndex: 1,
  powerUpType: null,
  spawnDelay: null
});
assert.equal(pack.enemyAt(1, 8).typeIndex, 1);
pack.enemies[15] = [];
assert.equal(pack.enemyAt(16, 4).typeIndex, 3);

pack.enemies[0] = [{
  typeIndex: 99,
  carrier: 1,
  spawnIndex: 99,
  powerUpType: "star",
  spawnDelay: 9.9
}];
assert.deepEqual(pack.enemyAt(1, 0), {
  typeIndex: 3,
  carrier: true,
  spawnIndex: 2,
  powerUpType: "star",
  spawnDelay: 9
});

const secondPack = createBuiltInStagePack();
assert.notEqual(secondPack, pack);
assert.notEqual(secondPack.enemyTotals, pack.enemyTotals);
assert.notEqual(secondPack.enemyTypes, pack.enemyTypes);
assert.notEqual(secondPack.gameSettings, pack.gameSettings);
assert.notEqual(secondPack.gameSettings.explosionRules, pack.gameSettings.explosionRules);
assert.notEqual(secondPack.enemies, pack.enemies);
assert.equal(secondPack.maps.length, 0);
assert.equal(secondPack.enemies[0][0].typeIndex, 0);

console.log("built-in-stage-pack unit test passed");
