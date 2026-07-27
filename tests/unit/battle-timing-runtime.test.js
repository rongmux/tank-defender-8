const assert = require("assert").strict;
const runtime = require("../../src/runtime/battle-timing-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupBattleTimingRuntime({}, {}, {}),
  /state\.game must be an object/
);

const wallBuilds = [];
const state = {
  game: {
    baseDestroyTimer: 2,
    enemies: [],
    enemySpawned: 3,
    frameLow: 0,
    freezeTimer: 2,
    grid: [],
    players: [{ id: 1, invuln: 2 }],
    shovelTimer: 0
  },
  fn: {}
};
const settings = {
  powerUpDurations: { shovelFlash: 10 }
};
const api = runtime.setupBattleTimingRuntime(state, {
  BRICK: 1,
  buildBaseWall(grid, type) {
    wallBuilds.push({ grid, type });
  },
  shovelWallTypeForTimer(timer, frame, flash) {
    assert.equal(flash, 10);
    return timer === 5 && frame === 16 ? "steel-flash" : "brick-flash";
  }
}, {
  enemyTotal() {
    return 3;
  },
  gameSettings() {
    return settings;
  }
});

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), [
  "isGlobalTimerTick",
  "updateFreezeTimer",
  "updateShovelTimer",
  "updatePlayerInvulnerabilityTimers",
  "updateBaseDestructionTimer",
  "stageEnemiesCleared"
]);
assert.equal(state.fn.updateFreezeTimer, api.updateFreezeTimer);
assert.equal(api.isGlobalTimerTick(0), true);
assert.equal(api.isGlobalTimerTick(1), false);
assert.equal(api.isGlobalTimerTick(64), true);

api.updateFreezeTimer();
assert.equal(state.game.freezeTimer, 1);
api.updatePlayerInvulnerabilityTimers();
assert.equal(state.game.players[0].invuln, 1);
api.updateBaseDestructionTimer();
assert.equal(state.game.baseDestroyTimer, 1);

state.game.frameLow = 1;
api.updateFreezeTimer();
api.updatePlayerInvulnerabilityTimers();
assert.equal(state.game.freezeTimer, 1);
assert.equal(state.game.players[0].invuln, 1);

state.game.frameLow = 0;
state.game.shovelTimer = 1;
api.updateShovelTimer();
assert.equal(state.game.shovelTimer, 0);
assert.deepEqual(wallBuilds[0], { grid: state.game.grid, type: 1 });

state.game.frameLow = 16;
state.game.shovelTimer = 5;
api.updateShovelTimer();
assert.equal(state.game.shovelTimer, 5);
assert.deepEqual(wallBuilds[1], { grid: state.game.grid, type: "steel-flash" });

assert.equal(api.stageEnemiesCleared(), true);
state.game.enemies.push({ id: 9 });
assert.equal(api.stageEnemiesCleared(), false);
state.game.enemySpawned = 2;
state.game.enemies.length = 0;
assert.equal(api.stageEnemiesCleared(), false);

console.log("battle-timing-runtime unit test passed");
