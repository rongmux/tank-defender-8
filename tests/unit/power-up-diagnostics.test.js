const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/power-up-diagnostics");
const presentationDiagnostics = require("../../src/runtime/power-up-presentation-diagnostics");
const spawnDiagnostics = require("../../src/runtime/power-up-spawn-diagnostics");

const POWER_UP_DIAGNOSTIC_METHODS = [
  "debugPowerUpTypePoolProbe",
  "debugBattleRandomProbe",
  "debugPowerUpFlashCadenceProbe",
  "debugPausedPowerUpVisualProbe",
  "debugWaterAnimationCadenceProbe",
  "debugPowerUpTtlProbe",
  "debugPowerUpPickupBoundaryProbe",
  "debugPowerUpPickupPriorityProbe",
  "debugPowerUpPickupRenderProbe",
  "debugPowerUpFootprintClearProbe",
  "debugPowerUpTerrainMutationProbe",
  "debugPowerUpSpawnTerrainProbe",
  "debugPowerUpSpawnRandomProbe",
  "debugPowerUpSpawnRotationProbe",
  "debugCarrierSpawnClearsPowerUpProbe"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createPowerUpDiagnostics(),
  /state must be an object/
);
assert.throws(
  () => diagnostics.createPowerUpDiagnostics({}, {}),
  /state\.game must be an object/
);
assert.throws(
  () => diagnostics.createPowerUpDiagnostics({ game: {} }, {}),
  /state\.fn must be an object/
);
assert.throws(
  () => diagnostics.createPowerUpDiagnostics({ game: {}, fn: {} }, {}),
  /state\.audio must be an object/
);
assert.throws(
  () => diagnostics.createPowerUpDiagnostics({ game: {}, fn: {}, audio: {} }),
  /deps must be an object/
);
assert.throws(
  () => diagnostics.createPowerUpDiagnostics(
    { game: {}, fn: {}, audio: {} },
    {}
  ),
  /deps\.sharedState must be an object/
);

const deps = {
  label: "deps",
  sharedState: {},
  createPowerUpPresentationDiagnostics:
    presentationDiagnostics.createPowerUpPresentationDiagnostics,
  createPowerUpSpawnDiagnostics: spawnDiagnostics.createPowerUpSpawnDiagnostics,
  isPowerUpVisible() {
    return this.label;
  }
};
const state = {
  game: {},
  audio: {
    powerUpPickup: { active: false, frame: 0 }
  },
  stageRuntime: {
    label: "stage-runtime",
    isPowerUpVisible() {
      return this.label;
    }
  },
  fn: {
    label: "state-fn",
    isPowerUpVisible() {
      return this.label;
    }
  }
};

const api = diagnostics.createPowerUpDiagnostics(state, deps);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), POWER_UP_DIAGNOSTIC_METHODS);
assert.equal(api.debugPowerUpFlashCadenceProbe().length, 32);
assert(
  api.debugPowerUpFlashCadenceProbe().every((frame) => frame.visible === "state-fn")
);

state.fn.isPowerUpVisible = undefined;
const stageApi = diagnostics.createPowerUpDiagnostics(state, deps);
assert(
  stageApi.debugPowerUpFlashCadenceProbe()
    .every((frame) => frame.visible === "stage-runtime")
);

console.log("power-up-diagnostics unit test passed");
