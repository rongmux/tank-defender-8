const assert = require("assert").strict;
const runtime = require("../../src/runtime/debug-battle-runtime");

assert.equal(Object.isFrozen(runtime), true);
assert.throws(
  () => runtime.setupDebugBattleRuntime(),
  /state must be an object/
);
assert.throws(
  () => runtime.setupDebugBattleRuntime({ game: {} }, null),
  /deps must be an object/
);
assert.throws(
  () => runtime.setupDebugBattleRuntime({ game: {} }, { sharedState: {} }),
  /deps\.sharedState\.TILE must be a number/
);

const state = {
  game: {
    screen: "title",
    demoMode: true,
    paused: false,
    pauseElapsed: 11,
    tick: 2,
    frameLow: 2,
    frameHigh: 0,
    base: null,
    players: [],
    enemies: [{ alive: true }],
    enemySpawned: 4,
    clearPendingTimer: 9,
    scorePopups: [{ value: 100 }]
  }
};
const api = runtime.setupDebugBattleRuntime(state, { sharedState: { TILE: 16 } });

assert.equal(Object.isFrozen(api), true);
api.preparePausedDebugBattle(129.9);
assert.deepEqual(state.game.base, { x: 96, y: 192, w: 16, h: 16, alive: true });
assert.equal(state.game.screen, "playing");
assert.equal(state.game.demoMode, false);
assert.equal(state.game.paused, true);
assert.equal(state.game.pauseElapsed, 0);
assert.equal(state.game.tick, 129);
assert.equal(state.game.frameLow, 129);
assert.equal(state.game.frameHigh, 2);
assert.deepEqual(state.game.players, [{ alive: true, lives: 1, respawn: 0 }]);
assert.deepEqual(state.game.enemies, []);
assert.equal(state.game.enemySpawned, 0);
assert.equal(state.game.clearPendingTimer, 0);
assert.deepEqual(state.game.scorePopups, []);

console.log("debug-battle-runtime unit test passed");
