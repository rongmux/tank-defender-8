const assert = require("assert").strict;
const runtime = require("../../src/runtime/battle-outcome-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupBattleOutcomeRuntime({}, {}, {}),
  /state\.game must be an object/
);

const events = [];
let cleared = false;
let messageActive = false;
const state = {
  game: {
    enemies: [{ alive: true }, { alive: false }],
    players: [{ alive: true, respawn: 0, lives: 1 }],
    base: { alive: true },
    demoMode: false,
    baseDestroyTimer: 0,
    clearPendingTimer: 0,
    paused: true,
    pauseElapsed: 7,
    tick: 12,
    frameHigh: 0
  },
  fn: {}
};
const api = runtime.setupBattleOutcomeRuntime(state, {}, {
  endTitleDemo() {
    events.push("demoEnd");
  },
  enterGameOver() {
    events.push("gameOver");
  },
  enterStageClear() {
    events.push("stageClear");
  },
  extendedStageEndFrameHigh() {
    return 254;
  },
  gameSettings() {
    return { timings: { stageClearDelay: 3 } };
  },
  playerGameOverMessageActive() {
    return messageActive;
  },
  playerGameOverStageEndDelay() {
    return 256;
  },
  resetFrameCounters() {
    events.push("resetFrames");
    state.game.tick = 0;
    state.game.frameHigh = 0;
  },
  stageEnemiesCleared() {
    return cleared;
  }
});

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), ["checkEndState"]);
assert.equal(state.fn.checkEndState, api.checkEndState);

api.checkEndState();
assert.equal(state.game.enemies.length, 1);
assert.deepEqual(events, []);

state.game.base.alive = false;
state.game.baseDestroyTimer = 2;
api.checkEndState();
assert.deepEqual(events, []);
state.game.baseDestroyTimer = 0;
api.checkEndState();
assert.deepEqual(events, ["gameOver"]);

events.length = 0;
state.game.base.alive = true;
state.game.players[0].alive = false;
state.game.players[0].lives = 0;
api.checkEndState();
assert.deepEqual(events, ["gameOver"]);

events.length = 0;
state.game.demoMode = true;
state.game.players[0].alive = true;
state.game.players[0].lives = 1;
cleared = true;
api.checkEndState();
assert.deepEqual(events, ["demoEnd"]);

events.length = 0;
state.game.demoMode = false;
cleared = true;
state.game.clearPendingTimer = 0;
state.game.paused = true;
state.game.pauseElapsed = 9;
state.game.tick = 12;
messageActive = false;
api.checkEndState();
assert.equal(state.game.paused, false);
assert.equal(state.game.pauseElapsed, 0);
assert.equal(state.game.clearPendingTimer, 3);
assert.equal(state.game.tick, 0);
assert.deepEqual(events, ["resetFrames"]);
api.checkEndState();
api.checkEndState();
assert.equal(state.game.clearPendingTimer, 1);
assert.deepEqual(events, ["resetFrames"]);
api.checkEndState();
assert.equal(state.game.clearPendingTimer, 0);
assert.deepEqual(events, ["resetFrames", "stageClear"]);

events.length = 0;
state.game.clearPendingTimer = 0;
messageActive = true;
api.checkEndState();
assert.equal(state.game.clearPendingTimer, 256);
assert.equal(state.game.frameHigh, 254);
assert.deepEqual(events, ["resetFrames"]);

console.log("battle-outcome-runtime unit test passed");
