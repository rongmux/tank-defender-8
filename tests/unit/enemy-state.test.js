const assert = require("assert").strict;
const {
  ENEMY_ACCENT,
  ENEMY_DESTRUCTION_SCORE_TICKS,
  ENEMY_SIZE,
  advanceEnemyDestructionState,
  createEnemyState
} = require("../../src/entities/enemy-state");

const type = {
  name: "custom",
  speed: 0.5,
  hp: 2,
  bullet: 4,
  wallPower: 2,
  reload: 13,
  score: 150,
  color: "#abcdef",
  hitColors: ["#111111", "#222222"],
  fireChance: 0.25
};
const spec = {
  typeIndex: 0,
  carrier: true,
  spawnIndex: 2,
  powerUpType: "star",
  spawnDelay: 0
};
const settings = {
  timings: { enemyInitialReload: 12, enemySpawnFlash: 11 }
};

assert.equal(ENEMY_SIZE, 14);
assert.equal(ENEMY_ACCENT, "#2b2a28");
assert.equal(ENEMY_DESTRUCTION_SCORE_TICKS, 6);

const enemy = createEnemyState({
  id: 100,
  slotIndex: 5,
  spawn: { x: 193, y: 1 },
  direction: 2,
  type,
  typeIndex: 0,
  spec,
  settings,
  normalMoveSpeed: 0.5
});
assert.deepEqual(enemy, {
  kind: "enemy",
  id: 100,
  slotIndex: 5,
  x: 193,
  y: 1,
  w: 14,
  h: 14,
  dir: 2,
  speed: 0.5,
  hp: 2,
  maxHp: 2,
  bulletSpeed: 4,
  bulletPower: 2,
  reloadBase: 13,
  reload: 12,
  score: 150,
  color: "#abcdef",
  hitColors: ["#111111", "#222222"],
  accent: "#2b2a28",
  typeIndex: 0,
  carrier: true,
  powerUpType: "star",
  fireChance: 0.25,
  alternateMovement: true,
  blockedPauseTicks: 0,
  pendingTurn: false,
  spawnFlash: 11,
  alive: true,
  destroying: false,
  destroyTicks: 0,
  slide: 0,
  trackPhase: 0
});
assert.notEqual(enemy.hitColors, type.hitColors);
enemy.hitColors[0] = "#ffffff";
assert.equal(type.hitColors[0], "#111111");

const fastType = { ...type, speed: 1, hitColors: null };
const fastEnemy = createEnemyState({
  id: 101,
  slotIndex: 4,
  spawn: { x: 97, y: 1 },
  direction: 2,
  type: fastType,
  typeIndex: 1,
  spec: { ...spec, carrier: false, powerUpType: null },
  settings,
  normalMoveSpeed: 0.5
});
assert.equal(fastEnemy.alternateMovement, false);
assert.equal(fastEnemy.hitColors, null);
assert.equal(fastEnemy.carrier, false);
assert.equal(fastEnemy.powerUpType, null);

const typeOneAtNormalSpeed = createEnemyState({
  id: 102,
  slotIndex: 3,
  spawn: { x: 1, y: 1 },
  direction: 2,
  type,
  typeIndex: 1,
  spec,
  settings,
  normalMoveSpeed: 0.5
});
assert.equal(typeOneAtNormalSpeed.alternateMovement, false);

const destruction = {
  alive: true,
  destroying: true,
  destroyTicks: 0,
  destroyExplosionTicks: 18
};
assert.equal(advanceEnemyDestructionState(destruction, false, 9), false);
assert.equal(destruction.destroyTicks, 0);
for (let tick = 0; tick < 23; tick += 1) {
  assert.equal(advanceEnemyDestructionState(destruction, true, 9), false);
}
assert.equal(destruction.destroyTicks, 23);
assert.equal(destruction.alive, true);
assert.equal(destruction.destroying, true);
assert.equal(advanceEnemyDestructionState(destruction, true, 9), true);
assert.equal(destruction.destroyTicks, 24);
assert.equal(destruction.alive, false);
assert.equal(destruction.destroying, false);

const fallbackDestruction = {
  alive: true,
  destroying: true,
  destroyTicks: Number.NaN,
  destroyExplosionTicks: 0
};
assert.equal(advanceEnemyDestructionState(fallbackDestruction, true, 3), false);
assert.equal(fallbackDestruction.destroyTicks, 1);
for (let tick = 0; tick < 7; tick += 1) advanceEnemyDestructionState(fallbackDestruction, true, 3);
assert.equal(advanceEnemyDestructionState(fallbackDestruction, true, 3), true);

console.log("enemy-state unit test passed");
