const assert = require("assert").strict;
const runtime = require("../../src/runtime/enemy-update-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupEnemyUpdateRuntime({}, {}, {}),
  /state\.game must be an object/
);

const events = [];
const settings = { timerFreezesEnemyTime: true };
const state = {
  game: {
    enemyKilled: 0,
    enemies: [],
    frameLow: 0,
    freezeTimer: 2
  },
  fn: {}
};
const api = runtime.setupEnemyUpdateRuntime(state, {
  advanceEnemyDestructionState(enemy, movementFrame, defaultExplosionTicks) {
    events.push(["destruction", enemy.id, movementFrame, defaultExplosionTicks]);
    if (!enemy.release) return false;
    enemy.alive = false;
    enemy.destroying = false;
    return true;
  },
  isEnemyMovementFrame() {
    return true;
  }
}, {
  explosionRule(name) {
    assert.equal(name, "enemyDestroy");
    return { ttl: 18 };
  },
  gameSettings() {
    return settings;
  },
  shoot(enemy) {
    events.push(["shoot", enemy.id]);
  },
  shouldEnemyFire() {
    return true;
  },
  updateEnemyMovement(enemy) {
    events.push(["move", enemy.id]);
  }
});

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), ["updateEnemies", "isEnemyTimeFrozen", "updateEnemyDestruction"]);
assert.equal(state.fn.updateEnemies, api.updateEnemies);
assert.equal(state.fn.isEnemyTimeFrozen, api.isEnemyTimeFrozen);
assert.equal(state.fn.updateEnemyDestruction, api.updateEnemyDestruction);
assert.equal(api.isEnemyTimeFrozen(), true);

const active = { id: 1, alive: true, destroying: false, spawnFlash: 0, reload: 3 };
const spawning = { id: 2, alive: true, destroying: false, spawnFlash: 2, reload: 3 };
const destroying = { id: 3, alive: true, destroying: true, spawnFlash: 0, release: false };
state.game.enemies = [active, spawning, destroying];
api.updateEnemies();
assert.equal(active.reload, 3, "timer freeze must retain active enemy reload");
assert.equal(spawning.spawnFlash, 1, "timer freeze must still advance a spawned enemy animation");
assert.deepEqual(events, [["destruction", 3, true, 18]]);

events.length = 0;
state.game.freezeTimer = 0;
active.reload = 1;
destroying.release = true;
api.updateEnemies();
assert.equal(active.reload, 0);
assert.deepEqual(events, [["move", 1], ["shoot", 1], ["destruction", 3, true, 18]]);
assert.equal(state.game.enemyKilled, 1);
assert.equal(destroying.alive, false);

console.log("enemy-update-runtime unit test passed");
