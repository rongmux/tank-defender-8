const assert = require("assert").strict;
const enemySpawnRules = require("../../src/rules/enemy-spawn-rules");

const {
  ENEMY_SPAWN_TANK_SIZE,
  activeEnemyCount,
  findAvailableEnemySlot,
  isEnemySpawnPointOccupied,
  selectEnemySpawnIndex
} = enemySpawnRules;

assert.equal(Object.isFrozen(enemySpawnRules), true);
assert.equal(ENEMY_SPAWN_TANK_SIZE, 14);

const alive = (slotIndex, overrides) => ({
  slotIndex,
  alive: true,
  destroying: false,
  respawn: 0,
  ...overrides
});
assert.equal(activeEnemyCount([alive(5), alive(4, { destroying: true }), alive(3, { alive: false })]), 2);
assert.equal(findAvailableEnemySlot([], 4), 5);
assert.equal(findAvailableEnemySlot([alive(5), alive(3)], 4), 4);
assert.equal(findAvailableEnemySlot([alive(5, { alive: false }), alive(4)], 4), 5);
assert.equal(findAvailableEnemySlot([alive(5), alive(4), alive(3), alive(2)], 4), null);

const point = { x: 32, y: 16 };
const overlapping = { ...alive(2), x: 32, y: 16, w: 14, h: 14 };
const touching = { ...alive(2), x: 46, y: 16, w: 14, h: 14 };
assert.equal(isEnemySpawnPointOccupied(point, [overlapping], []), true);
assert.equal(isEnemySpawnPointOccupied(point, [touching], []), false);
assert.equal(isEnemySpawnPointOccupied(point, [], [overlapping]), true);
assert.equal(isEnemySpawnPointOccupied(point, [], [{ ...overlapping, destroying: true }]), false);
assert.equal(isEnemySpawnPointOccupied(point, [{ ...overlapping, respawn: 1 }], []), false);
assert.equal(isEnemySpawnPointOccupied(point, [{ ...overlapping, alive: false }], []), false);

assert.equal(selectEnemySpawnIndex({}, 0), 1);
assert.equal(selectEnemySpawnIndex({}, 1), 2);
assert.equal(selectEnemySpawnIndex({}, 2), 0);
assert.equal(selectEnemySpawnIndex({ spawnIndex: 0 }, 7), 0);

console.log("enemy-spawn-rules unit test passed");
