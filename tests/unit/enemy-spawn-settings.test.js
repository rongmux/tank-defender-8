const assert = require("assert").strict;
const {
  DEFAULT_ENEMY_SPAWN_PACING,
  calculateEnemySpawnDelay,
  normalizeEnemySpawnPacing,
  scaleEnemySpawnDelay
} = require("../../src/config/enemy-spawn-settings");

assert.deepEqual(DEFAULT_ENEMY_SPAWN_PACING, {
  firstDelay: 0,
  baseDelay: 190,
  stageStep: 4,
  minDelay: 50,
  extendedLoopMinDelay: 50,
  twoPlayerDelayReduction: 20
});
assert(Object.isFrozen(DEFAULT_ENEMY_SPAWN_PACING));
assert.deepEqual(normalizeEnemySpawnPacing(), DEFAULT_ENEMY_SPAWN_PACING);

const reduction = normalizeEnemySpawnPacing({
  firstDelay: "5",
  baseDelay: 90,
  stageStep: 3,
  minDelay: 20,
  extendedLoopMinDelay: 10,
  twoPlayerDelayReduction: 7
});
assert.deepEqual(reduction, {
  firstDelay: 5,
  baseDelay: 90,
  stageStep: 3,
  minDelay: 20,
  extendedLoopMinDelay: 10,
  twoPlayerDelayReduction: 7
});
const multiplier = normalizeEnemySpawnPacing({ twoPlayerDelayMultiplier: 0.75 });
assert.equal(multiplier.twoPlayerDelayMultiplier, 0.75);
assert.equal("twoPlayerDelayReduction" in multiplier, false);
const reductionWins = normalizeEnemySpawnPacing({ twoPlayerDelayReduction: 8, twoPlayerDelayMultiplier: 0.5 });
assert.equal(reductionWins.twoPlayerDelayReduction, 8);
assert.equal("twoPlayerDelayMultiplier" in reductionWins, false);

assert.equal(calculateEnemySpawnDelay(DEFAULT_ENEMY_SPAWN_PACING, 1, 70, false), 186);
assert.equal(calculateEnemySpawnDelay(DEFAULT_ENEMY_SPAWN_PACING, 35, 70, false), 50);
assert.equal(calculateEnemySpawnDelay(DEFAULT_ENEMY_SPAWN_PACING, 36, 70, true), 50);
const customCurve = { baseDelay: 100, stageStep: 10, minDelay: 40, extendedLoopMinDelay: 20 };
assert.equal(calculateEnemySpawnDelay(customCurve, 5, 70, false), 50);
assert.equal(calculateEnemySpawnDelay(customCurve, 8, 70, false), 40);
assert.equal(calculateEnemySpawnDelay(customCurve, 8, 70, true), 20);
assert.equal(calculateEnemySpawnDelay(customCurve, 8, 6, true), 40);
assert.equal(scaleEnemySpawnDelay(100, 1, DEFAULT_ENEMY_SPAWN_PACING), 100);
assert.equal(scaleEnemySpawnDelay(100, 2, DEFAULT_ENEMY_SPAWN_PACING), 80);
assert.equal(scaleEnemySpawnDelay(10, 2, DEFAULT_ENEMY_SPAWN_PACING), 0);
assert.equal(scaleEnemySpawnDelay(101, 2, multiplier), 76);

assert.throws(() => normalizeEnemySpawnPacing(true), /enemySpawnPacing must be an object/);
for (const key of ["firstDelay", "baseDelay", "stageStep", "minDelay", "extendedLoopMinDelay", "twoPlayerDelayReduction"]) {
  for (const value of [-1, 1.5, 3601]) {
    assert.throws(() => normalizeEnemySpawnPacing({ [key]: value }), new RegExp(`enemySpawnPacing\\.${key}`));
  }
}
for (const twoPlayerDelayMultiplier of [0.09, 1.01]) {
  assert.throws(() => normalizeEnemySpawnPacing({ twoPlayerDelayMultiplier }), /twoPlayerDelayMultiplier/);
}

console.log("enemy-spawn-settings unit test passed");
