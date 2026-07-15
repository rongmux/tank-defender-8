const assert = require("assert").strict;
const {
  DEFAULT_ENEMY_SPAWNS,
  DEFAULT_MAX_ACTIVE_ENEMIES,
  DEFAULT_MAX_ACTIVE_ENEMIES_TWO_PLAYER,
  DEFAULT_PLAYER_SPAWNS,
  DEFAULT_POWERUP_SPAWNS,
  TILE_SIZE,
  normalizePowerUpSpawnPoint,
  normalizeSpawnPoint,
  normalizeStageSettings,
  pixelToTilePoint,
  powerUpPixelToTilePoint
} = require("../../src/config/stage-settings");

assert.equal(TILE_SIZE, 16);
assert.equal(DEFAULT_MAX_ACTIVE_ENEMIES, 4);
assert.equal(DEFAULT_MAX_ACTIVE_ENEMIES_TWO_PLAYER, 6);
assert.deepEqual(DEFAULT_PLAYER_SPAWNS.map(pixelToTilePoint), [{ x: 4, y: 12 }, { x: 8, y: 12 }]);
assert.deepEqual(DEFAULT_ENEMY_SPAWNS.map(pixelToTilePoint), [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 12, y: 0 }]);
assert.equal(DEFAULT_POWERUP_SPAWNS.length, 16);
assert.deepEqual(DEFAULT_POWERUP_SPAWNS[0], { x: 18, y: 18 });
assert.deepEqual(DEFAULT_POWERUP_SPAWNS[15], { x: 98, y: 178 });
assert(Object.isFrozen(DEFAULT_PLAYER_SPAWNS));
assert(DEFAULT_PLAYER_SPAWNS.every(Object.isFrozen));

const defaults = normalizeStageSettings(undefined, 2);
assert.equal(defaults.length, 2);
assert.equal(defaults[0].maxActiveEnemies, 4);
assert.equal(defaults[0].maxActiveEnemiesTwoPlayer, 6);
assert.deepEqual(defaults[0].playerSpawns, DEFAULT_PLAYER_SPAWNS);
defaults[0].playerSpawns[0].x = 999;
assert.equal(defaults[1].playerSpawns[0].x, DEFAULT_PLAYER_SPAWNS[0].x);

const custom = normalizeStageSettings([{
  maxActiveEnemies: "2",
  playerSpawns: [{ x: 3, y: 12 }, { x: 9, y: 12 }],
  enemySpawns: [{ x: 1, y: 0 }, { x: 6, y: 0 }, { x: 11, y: 0 }],
  powerUpSpawns: [{ x: 2, y: 2 }, { x: 10, y: 10 }]
}], 1)[0];
assert.equal(custom.maxActiveEnemies, 2);
assert.equal(custom.maxActiveEnemiesTwoPlayer, 2, "an explicit shared maximum remains the two-player fallback");
assert.deepEqual(custom.playerSpawns.map(pixelToTilePoint), [{ x: 3, y: 12 }, { x: 9, y: 12 }]);
assert.deepEqual(custom.enemySpawns.map(pixelToTilePoint), [{ x: 1, y: 0 }, { x: 6, y: 0 }, { x: 11, y: 0 }]);
assert.deepEqual(custom.powerUpSpawns.map(powerUpPixelToTilePoint), [{ x: 2, y: 2 }, { x: 10, y: 10 }]);
assert.deepEqual(normalizeSpawnPoint({ x: "4", y: "12" }, "spawn"), { x: 65, y: 193 });
assert.deepEqual(normalizePowerUpSpawnPoint({ x: "4", y: "12" }, "spawn"), { x: 66, y: 194 });

assert.throws(() => normalizeStageSettings([{}, {}], 1), /must not contain more than 1 stages/);
assert.throws(() => normalizeStageSettings(["bad"], 1), /stageSettings\[0\] must be an object/);
assert.throws(() => normalizeStageSettings([{ maxActiveEnemies: 0 }], 1), /maxActiveEnemies must be an integer from 1 to 8/);
assert.throws(() => normalizeStageSettings([{ maxActiveEnemiesTwoPlayer: 9 }], 1), /maxActiveEnemiesTwoPlayer must be an integer from 1 to 8/);
assert.throws(() => normalizeStageSettings([{ playerSpawns: [{ x: 4, y: 12 }] }], 1), /must contain at least 2 spawn points/);
assert.throws(() => normalizeStageSettings([{ enemySpawns: [] }], 1), /must contain at least 3 spawn points/);
assert.throws(() => normalizeStageSettings([{ powerUpSpawns: [] }], 1), /must contain at least one spawn point/);
assert.throws(() => normalizeSpawnPoint(null, "spawn"), /spawn must be an object/);
assert.throws(() => normalizeSpawnPoint({ x: 13, y: 0 }, "spawn"), /spawn.x must be an integer from 0 to 12/);
assert.throws(() => normalizePowerUpSpawnPoint({ x: 0, y: -1 }, "spawn"), /spawn.y must be an integer from 0 to 12/);

console.log("stage-settings unit test passed");
