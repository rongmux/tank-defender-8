const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/player-lifecycle-game-over-diagnostics");

const PLAYER_LIFECYCLE_GAME_OVER_DIAGNOSTIC_METHODS = [
  "debugPlayerGameOverMessageProbe",
  "debugRenderPlayerGameOverMessage"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createPlayerLifecycleGameOverDiagnostics(),
  /scope must be an object/
);

const game = {
  paused: true,
  demoMode: true,
  tick: 9,
  frameLow: 9,
  frameHigh: 0,
  playerGameOverMessage: null
};
let updateCalls = 0;
let renderCalls = 0;
const scope = {
  game,
  PLAYER_GAME_OVER_MESSAGE_TIMER: 8,
  PLAYER_GAME_OVER_MESSAGE_Y: 32,
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  },
  updatePlayerGameOverMessage() {
    updateCalls += 1;
  },
  playerGameOverMessagePresentation() {
    return { receiver: "scope" };
  },
  renderPlayerGameOverMessage() {
    renderCalls += 1;
  }
};
const api = diagnostics.createPlayerLifecycleGameOverDiagnostics(scope);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), PLAYER_LIFECYCLE_GAME_OVER_DIAGNOSTIC_METHODS);
assert.deepEqual(api.debugRenderPlayerGameOverMessage(2, 3), { receiver: "scope" });
assert.equal(updateCalls, 4);
assert.equal(renderCalls, 1);
assert.deepEqual(game, {
  paused: true,
  demoMode: true,
  tick: 9,
  frameLow: 9,
  frameHigh: 0,
  playerGameOverMessage: null
});

console.log("player-lifecycle-game-over-diagnostics unit test passed");
