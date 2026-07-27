const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/score-diagnostics");

const SCORE_DIAGNOSTIC_METHODS = [
  "debugGrenadeScoreProbe",
  "debugGrenadeSpawnProtectionProbe",
  "debugScorePopupProbe",
  "debugPausedScorePopupProbe"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createScoreDiagnostics(),
  /state must be an object/
);
assert.throws(
  () => diagnostics.createScoreDiagnostics({}, {}),
  /state\.game must be an object/
);
assert.throws(
  () => diagnostics.createScoreDiagnostics({ game: {} }, {}),
  /state\.fn must be an object/
);
assert.throws(
  () => diagnostics.createScoreDiagnostics({ game: {}, fn: {} }, {}),
  /state\.audio must be an object/
);
assert.throws(
  () => diagnostics.createScoreDiagnostics({ game: {}, fn: {}, audio: {} }),
  /deps must be an object/
);
assert.throws(
  () => diagnostics.createScoreDiagnostics({ game: {}, fn: {}, audio: {} }, {}),
  /deps\.sharedState must be an object/
);

const game = { tick: 9, scorePopups: [] };
const state = {
  game,
  audio: { enemyDestroy: { active: false, frame: 0 } },
  fn: {
    label: "state-fn",
    preparePausedDebugBattle(value) {
      this.prepareValue = value;
    },
    update() {
      this.updateCalls = (this.updateCalls || 0) + 1;
    }
  }
};
const deps = {
  label: "deps",
  sharedState: { ENEMY_DESTRUCTION_SCORE_TICKS: 6 }
};

const api = diagnostics.createScoreDiagnostics(state, deps);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), SCORE_DIAGNOSTIC_METHODS);
assert.deepEqual(api.debugPausedScorePopupProbe(), {
  afterOneFrame: { tick: 9, ttl: 2 },
  afterTwoFrames: { tick: 9, popupCount: 1 }
});
assert.equal(state.fn.prepareValue, 27);
assert.equal(state.fn.updateCalls, 2);
assert.deepEqual(game, { tick: 9, scorePopups: [] });

console.log("score-diagnostics unit test passed");
