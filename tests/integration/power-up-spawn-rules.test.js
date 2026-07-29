const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.powerUpSpawnRules, "power-up spawn rules module should register before game.js");
assert.equal(Object.isFrozen(modules.powerUpSpawnRules), true);
assert.deepEqual(
  JSON.parse(JSON.stringify(modules.powerUpSpawnRules.ORIGINAL_POWER_UP_POSITION_AXIS)),
  [34, 82, 130, 178]
);
assert.equal(modules.powerUpSpawnRules.ORIGINAL_POWER_UP_SPAWN_SPOTS.length, 16);
assert.deepEqual(
  JSON.parse(JSON.stringify(modules.powerUpSpawnRules.selectOriginalPowerUpSpawnSpot(
    modules.powerUpSpawnRules.ORIGINAL_POWER_UP_SPAWN_SPOTS,
    1,
    2
  ))),
  { x: 82, y: 130 }
);

const terrain = JSON.parse(JSON.stringify(api.debugPowerUpSpawnTerrainProbe()));
assert.equal(terrain.openTiles.length, 1);
assert.deepEqual(terrain.openTiles[0], { x: 2, y: 1 });
assert(terrain.candidateTiles.length > terrain.openTiles.length);
assert.equal(terrain.candidateTiles.some((tile) => tile.x === 1 && tile.y === 1), false);
assert.notDeepEqual(terrain.nonRepeatTile, { x: 2, y: 1 });
assert.deepEqual(terrain.fallbackTile, { x: 3, y: 3 });

const random = JSON.parse(JSON.stringify(api.debugPowerUpSpawnRandomProbe(8)));
assert.equal(random.candidateCount, 4);
assert.equal(random.pickedFromCandidates, true);
assert(random.uniquePickCount > 1);
assert(random.uniquePickCount < random.candidateCount);
assert.equal(random.immediateRepeats, false);

const types = JSON.parse(JSON.stringify(api.debugPowerUpTypePoolProbe()));
assert.deepEqual(types.types, ["grenade", "helmet", "shovel", "star", "timer", "tank"]);
assert.deepEqual(types.randomTable, ["helmet", "timer", "shovel", "star", "grenade", "tank", "grenade", "star"]);
assert.deepEqual(types.sampledTable, types.randomTable);
assert.deepEqual(types.weights, { grenade: 2, helmet: 1, shovel: 1, star: 2, timer: 1, tank: 1 });

console.log("power-up-spawn-rules integration test passed");
