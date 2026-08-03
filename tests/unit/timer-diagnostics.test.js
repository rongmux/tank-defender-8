const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/timer-diagnostics");
const timerFreezeDiagnostics = require("../../src/runtime/timer-freeze-diagnostics");

const TIMER_DIAGNOSTIC_METHODS = [
  "debugTimerRuleProbe",
  "debugGlobalTimerCadenceProbe",
  "debugShieldCadenceProbe",
  "debugPausedShieldProbe",
  "debugTimerFreezeBehaviorProbe",
  "debugTimerFinalFrameFreezeProbe",
  "debugTimerSpawnDuringFreezeProbe"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createTimerDiagnostics(),
  /state must be an object/
);
assert.throws(
  () => diagnostics.createTimerDiagnostics({}, {}),
  /state\.game must be an object/
);
assert.throws(
  () => diagnostics.createTimerDiagnostics({ game: {} }, {}),
  /state\.fn must be an object/
);
assert.throws(
  () => diagnostics.createTimerDiagnostics({ game: {}, fn: {} }),
  /deps must be an object/
);
assert.throws(
  () => diagnostics.createTimerDiagnostics({ game: {}, fn: {} }, {}),
  /deps\.sharedState must be an object/
);

const deps = {
  label: "deps",
  sharedState: {},
  createTimerFreezeDiagnostics: timerFreezeDiagnostics.createTimerFreezeDiagnostics,
  isEnemyTimeFrozen() {
    return this.label;
  },
  shouldSpawnEnemies() {
    return this.label;
  }
};
const state = {
  game: { freezeTimer: 9 },
  stageRuntime: {
    label: "stage-runtime",
    isEnemyTimeFrozen() {
      return this.label;
    },
    shouldSpawnEnemies() {
      return this.label;
    }
  },
  fn: {
    label: "state-fn",
    isEnemyTimeFrozen() {
      return this.label;
    },
    shouldSpawnEnemies() {
      return this.label;
    }
  }
};

const api = diagnostics.createTimerDiagnostics(state, deps);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), TIMER_DIAGNOSTIC_METHODS);
assert.deepEqual(api.debugTimerRuleProbe(), {
  frozen: "state-fn",
  canSpawn: "state-fn"
});
assert.equal(state.game.freezeTimer, 9);

state.fn.isEnemyTimeFrozen = undefined;
state.fn.shouldSpawnEnemies = undefined;
const stageApi = diagnostics.createTimerDiagnostics(state, deps);
assert.deepEqual(stageApi.debugTimerRuleProbe(), {
  frozen: "stage-runtime",
  canSpawn: "stage-runtime"
});
assert.equal(state.game.freezeTimer, 9);

console.log("timer-diagnostics unit test passed");
