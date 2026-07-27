const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/enemy-diagnostics");

const ENEMY_DIAGNOSTIC_METHODS = [
  "debugCarrierReleaseProbe",
  "debugCarrierFlashProbe",
  "debugPausedTankVisualProbe",
  "debugEnemyColorProbe",
  "debugEnemyTargetEligibilityProbe",
  "debugEnemyAiPhaseProbe",
  "debugEnemyTargetingProbe",
  "debugEnemyMovementCadenceProbe",
  "debugEnemyBlockedStateProbe",
  "debugEnemySpawnTimelineProbe",
  "debugSpawnAnimationCadenceProbe"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createEnemyDiagnostics(),
  /state must be an object/
);
assert.throws(
  () => diagnostics.createEnemyDiagnostics({}, {}),
  /state\.game must be an object/
);
assert.throws(
  () => diagnostics.createEnemyDiagnostics({ game: {} }, {}),
  /state\.fn must be an object/
);
assert.throws(
  () => diagnostics.createEnemyDiagnostics({ game: {}, fn: {} }),
  /deps must be an object/
);
assert.throws(
  () => diagnostics.createEnemyDiagnostics({ game: {}, fn: {} }, {}),
  /deps\.sharedState must be an object/
);

const deps = {
  label: "deps",
  sharedState: {},
  gameSettings() {
    return {
      powerUpRules: {
        carrierRelease: "destroyed",
        clearUncollectedOnCarrierSpawn: false,
        pickupScore: 100
      }
    };
  },
  shouldReleaseCarrierPowerUp() {
    return this.label;
  }
};
const state = {
  game: {},
  stageRuntime: {
    label: "stage-runtime",
    shouldReleaseCarrierPowerUp() {
      return this.label;
    }
  },
  fn: {
    label: "state-fn",
    pickupScore: 500,
    gameSettings() {
      return {
        powerUpRules: {
          carrierRelease: "firstHit",
          clearUncollectedOnCarrierSpawn: true,
          pickupScore: this.pickupScore
        }
      };
    }
  }
};

const api = diagnostics.createEnemyDiagnostics(state, deps);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ENEMY_DIAGNOSTIC_METHODS);
const spawnOverlapApi = diagnostics.createEnemySpawnOverlapDiagnostics(state, deps);
assert.equal(Object.isFrozen(spawnOverlapApi), true);
assert.deepEqual(Object.keys(spawnOverlapApi), ["debugEnemySpawnOverlapProbe"]);
assert.deepEqual(api.debugCarrierReleaseProbe(4), {
  rule: "firstHit",
  clearUncollectedOnCarrierSpawn: true,
  pickupScore: 500,
  releaseOnThisHit: "stage-runtime"
});

console.log("enemy-diagnostics unit test passed");
