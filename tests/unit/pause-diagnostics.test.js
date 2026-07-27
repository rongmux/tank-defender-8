const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/pause-diagnostics");

const PAUSE_DIAGNOSTIC_METHODS = [
  "debugPauseBehaviorProbe",
  "debugPausedStageEndProbe",
  "debugRenderPauseFrame"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createPauseDiagnostics(),
  /state must be an object/
);
assert.throws(
  () => diagnostics.createPauseDiagnostics({}, {}),
  /state\.game must be an object/
);
assert.throws(
  () => diagnostics.createPauseDiagnostics({ game: {} }, {}),
  /state\.fn must be an object/
);
assert.throws(
  () => diagnostics.createPauseDiagnostics({ game: {}, fn: {} }, {}),
  /state\.pendingFirePresses must be an object/
);
assert.throws(
  () => diagnostics.createPauseDiagnostics({ game: {}, fn: {}, pendingFirePresses: new Set() }, {}),
  /state\.audio must be an object/
);
assert.throws(
  () => diagnostics.createPauseDiagnostics({ game: {}, fn: {}, pendingFirePresses: new Set(), audio: {} }),
  /deps must be an object/
);
assert.throws(
  () => diagnostics.createPauseDiagnostics(
    { game: {}, fn: {}, pendingFirePresses: new Set(), audio: {} },
    {}
  ),
  /deps\.sharedState must be an object/
);

const game = {
  paused: false,
  pauseElapsed: 4,
  tick: 4,
  frameLow: 4,
  frameHigh: 0
};
const state = {
  game,
  pendingFirePresses: new Set(),
  audio: { pause: { active: false, frame: 0 } },
  fn: {
    label: "state-fn",
    renderPause() {
      this.renderCalls = (this.renderCalls || 0) + 1;
    },
    pausePresentation(frame) {
      return { receiver: this.label, frame };
    }
  }
};
const deps = {
  label: "deps",
  sharedState: { TILE: 16 }
};

const api = diagnostics.createPauseDiagnostics(state, deps);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), PAUSE_DIAGNOSTIC_METHODS);
assert.deepEqual(api.debugRenderPauseFrame(31), { receiver: "state-fn", frame: 31 });
assert.equal(state.fn.renderCalls, 1);
assert.deepEqual(game, {
  paused: false,
  pauseElapsed: 4,
  tick: 4,
  frameLow: 4,
  frameHigh: 0
});

console.log("pause-diagnostics unit test passed");
