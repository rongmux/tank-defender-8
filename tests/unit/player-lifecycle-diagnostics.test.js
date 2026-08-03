const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/player-lifecycle-diagnostics");
const gameOverDiagnostics = require("../../src/runtime/player-lifecycle-game-over-diagnostics");

const PLAYER_LIFECYCLE_DIAGNOSTIC_METHODS = [
  "debugPlayerDeathRespawnProbe",
  "debugPlayerGameOverMessageProbe",
  "debugRenderPlayerGameOverMessage",
  "debugLifeAwardProbe"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createPlayerLifecycleDiagnostics(),
  /state must be an object/
);
assert.throws(
  () => diagnostics.createPlayerLifecycleDiagnostics({}, {}),
  /state\.game must be an object/
);
assert.throws(
  () => diagnostics.createPlayerLifecycleDiagnostics({ game: {} }, {}),
  /state\.fn must be an object/
);
assert.throws(
  () => diagnostics.createPlayerLifecycleDiagnostics({ game: {}, fn: {} }, {}),
  /state\.keys must be an object/
);
assert.throws(
  () => diagnostics.createPlayerLifecycleDiagnostics({ game: {}, fn: {}, keys: {} }, {}),
  /state\.audio must be an object/
);
assert.throws(
  () => diagnostics.createPlayerLifecycleDiagnostics({ game: {}, fn: {}, keys: {}, audio: {} }),
  /deps must be an object/
);
assert.throws(
  () => diagnostics.createPlayerLifecycleDiagnostics({ game: {}, fn: {}, keys: {}, audio: {} }, {}),
  /deps\.sharedState must be an object/
);

const game = {
  paused: true,
  demoMode: true,
  tick: 9,
  frameLow: 9,
  frameHigh: 0,
  playerGameOverMessage: null
};
const state = {
  game,
  keys: new Set(),
  audio: {
    bonusLife: { active: false, frame: 0 },
    playerDestroy: { active: false, frame: 0 },
    powerUpPickup: { active: false, frame: 0 }
  },
  fn: {
    label: "state-fn",
    updatePlayerGameOverMessage() {
      this.updateCalls = (this.updateCalls || 0) + 1;
    },
    playerGameOverMessagePresentation() {
      return { receiver: this.label };
    },
    renderPlayerGameOverMessage() {
      this.renderCalls = (this.renderCalls || 0) + 1;
    }
  }
};
const deps = {
  label: "deps",
  sharedState: {
    PLAYER_GAME_OVER_MESSAGE_TIMER: 8,
    PLAYER_GAME_OVER_MESSAGE_Y: 32
  },
  createPlayerLifecycleGameOverDiagnostics:
    gameOverDiagnostics.createPlayerLifecycleGameOverDiagnostics,
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
};

const api = diagnostics.createPlayerLifecycleDiagnostics(state, deps);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), PLAYER_LIFECYCLE_DIAGNOSTIC_METHODS);
assert.deepEqual(api.debugRenderPlayerGameOverMessage(2, 3), { receiver: "state-fn" });
assert.equal(state.fn.updateCalls, 4);
assert.equal(state.fn.renderCalls, 1);
assert.deepEqual(game, {
  paused: true,
  demoMode: true,
  tick: 9,
  frameLow: 9,
  frameHigh: 0,
  playerGameOverMessage: null
});

console.log("player-lifecycle-diagnostics unit test passed");
