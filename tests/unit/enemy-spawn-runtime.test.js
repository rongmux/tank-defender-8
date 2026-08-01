const assert = require("assert").strict;
const enemySpawnRuntime = require("../../src/runtime/enemy-spawn-runtime");

assert.equal(Object.isFrozen(enemySpawnRuntime), true);
assert.throws(
  () => enemySpawnRuntime.setupEnemySpawnRuntime(),
  /state must be an object/
);
assert.throws(
  () => enemySpawnRuntime.setupEnemySpawnRuntime({ game: {}, fn: {} }, {}, {}),
  /callbacks\.clearPowerUpForCarrierSpawn must be a function/
);

const settings = {
  timings: { enemySpawnRetry: 3 },
  enemySpawnPacing: { firstDelay: 8 },
  bonusLifeScores: []
};
const state = {
  game: {
    stage: 1,
    playerCount: 1,
    enemySpawned: 0,
    nextSpawn: 0,
    players: [],
    enemies: []
  },
  fn: {}
};
const events = [];
const specs = [
  { typeIndex: 0, carrier: true, spawnDelay: null },
  { typeIndex: 1, carrier: false, spawnDelay: 9 }
];
const deps = {
  DEFAULT_ENEMY_SPAWN_PACING: { firstDelay: 8 },
  DOWN: 2,
  ENEMY_MOVE_SPEED: { normal: 0.5 },
  activeEnemyCount(enemies) {
    return enemies.filter((enemy) => enemy.alive !== false && !enemy.destroying).length;
  },
  calculateEnemySpawnDelay(pacing, stage, cycleLimit, extended) {
    return pacing.firstDelay + stage + cycleLimit + (extended ? 1 : 0);
  },
  createEnemyState(options) {
    return { ...options, alive: true, destroying: false };
  },
  findAvailableEnemySlot(enemies) {
    return enemies.length < 2 ? enemies.length : null;
  },
  isEnemySpawnPointOccupied() {
    return false;
  },
  scaleEnemySpawnDelay(delay, playerCount) {
    return delay * playerCount;
  },
  selectEnemySpawnIndex() {
    return 0;
  }
};
const callbacks = {
  clearPowerUpForCarrierSpawn(carrier) {
    events.push({ name: "clearPowerUp", carrier });
  },
  enemyTypeDefinitions() {
    return [{ name: "basic" }, { name: "fast" }];
  },
  enemySpawnPoint(index) {
    return { x: index * 16, y: 0 };
  },
  enemyTotal() {
    return specs.length;
  },
  gameSettings() {
    return settings;
  },
  getEnemySpec(stage, index) {
    return specs[index];
  },
  isExtendedLoopStage(stage) {
    return stage > 35;
  },
  maxActiveEnemies() {
    return 2;
  },
  stageCycleLimit() {
    return 35;
  }
};

const api = enemySpawnRuntime.setupEnemySpawnRuntime(state, deps, callbacks);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), [
  "spawnEnemies",
  "enemySpawnDelay",
  "defaultEnemySpawnDelay",
  "scaleEnemySpawnDelayForPlayers"
]);
assert.equal(state.fn.spawnEnemies, api.spawnEnemies);

api.spawnEnemies();
assert.equal(state.game.enemySpawned, 1);
assert.equal(state.game.enemies.length, 1);
assert.equal(state.game.enemies[0].type.name, "basic");
assert.equal(state.game.enemies[0].normalMoveSpeed, 0.5);
assert.deepEqual(events, [{ name: "clearPowerUp", carrier: true }]);
assert.equal(state.game.nextSpawn, 9);

assert.equal(api.enemySpawnDelay(1, 2), 0);
assert.equal(api.enemySpawnDelay(1, 1), 9);
assert.equal(api.defaultEnemySpawnDelay(1), 44);
assert.equal(api.scaleEnemySpawnDelayForPlayers(10, 2), 20);

state.game.enemySpawned = 1;
state.game.nextSpawn = 0;
state.game.enemies = [];
deps.isEnemySpawnPointOccupied = (point) => point.x === 0;
api.spawnEnemies();
assert.equal(state.game.enemySpawned, 2);
assert.equal(state.game.enemies.length, 1);
assert.equal(state.game.enemies[0].spawn.x, 16);

state.game.enemySpawned = 1;
state.game.nextSpawn = 0;
state.game.enemies = [];
deps.isEnemySpawnPointOccupied = () => true;
api.spawnEnemies();
assert.equal(state.game.enemySpawned, 1);
assert.equal(state.game.enemies.length, 0);
assert.equal(state.game.nextSpawn, 3);

state.game.nextSpawn = 2;
api.spawnEnemies();
assert.equal(state.game.nextSpawn, 1);
api.spawnEnemies();
assert.equal(state.game.nextSpawn, 0);

console.log("enemy-spawn-runtime unit test passed");
