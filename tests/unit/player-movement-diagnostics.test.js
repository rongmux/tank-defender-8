const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/player-movement-diagnostics");
const motionDiagnostics = require("../../src/runtime/player-movement-motion-diagnostics");

const PLAYER_MOVEMENT_DIAGNOSTIC_METHODS = [
  "debugPlayerMovementCadenceProbe",
  "debugTankTrackAnimationProbe",
  "debugFriendlyFireDurationProbe",
  "debugFriendlyFireRefreshProbe",
  "debugPlayerStunProbe",
  "debugWasdDirectionProbe",
  "debugPlayerTurnAlignmentProbe",
  "debugPlayerBrickRecoveryProbe",
  "debugIceMovementProbe",
  "debugIceCoverRenderProbe",
  "debugForestPowerUpLayerProbe"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createPlayerMovementDiagnostics(),
  /state must be an object/
);
assert.throws(
  () => diagnostics.createPlayerMovementDiagnostics({}, {}),
  /state\.game must be an object/
);
assert.throws(
  () => diagnostics.createPlayerMovementDiagnostics({ game: {} }, {}),
  /state\.fn must be an object/
);
assert.throws(
  () => diagnostics.createPlayerMovementDiagnostics({ game: {}, fn: {} }, {}),
  /state\.keys must be an object/
);
assert.throws(
  () => diagnostics.createPlayerMovementDiagnostics({ game: {}, fn: {}, keys: {} }, {}),
  /state\.audio must be an object/
);
assert.throws(
  () => diagnostics.createPlayerMovementDiagnostics({ game: {}, fn: {}, keys: {}, audio: {} }),
  /deps must be an object/
);
assert.throws(
  () => diagnostics.createPlayerMovementDiagnostics({ game: {}, fn: {}, keys: {}, audio: {} }, {}),
  /deps\.sharedState must be an object/
);

const deps = {
  label: "deps",
  sharedState: {},
  createPlayerMovementMotionDiagnostics:
    motionDiagnostics.createPlayerMovementMotionDiagnostics,
  gameSettings() {
    return { playerMovement: { speed: this.label === "state-fn" ? 7 : 11, frameCadence: [0, 1] } };
  },
  isPlayerMovementFrame(tick) {
    return this.label === "state-fn" ? tick % 2 === 0 : tick % 2 === 1;
  }
};
const state = {
  game: { tick: 9 },
  keys: new Set(),
  audio: {
    movementIce: { active: false, frame: 0 },
    playerShoot: { active: false, frame: 0 }
  },
  stageRuntime: {
    label: "stage-runtime",
    gameSettings: deps.gameSettings,
    isPlayerMovementFrame: deps.isPlayerMovementFrame
  },
  fn: {
    label: "state-fn",
    gameSettings: deps.gameSettings,
    isPlayerMovementFrame: deps.isPlayerMovementFrame
  }
};

const api = diagnostics.createPlayerMovementDiagnostics(state, deps);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), PLAYER_MOVEMENT_DIAGNOSTIC_METHODS);
const stateProbe = api.debugPlayerMovementCadenceProbe();
assert.equal(stateProbe.speed, 7);
assert.equal(stateProbe.activeFrames, 4);
assert.equal(state.game.tick, 9);

state.fn.gameSettings = undefined;
state.fn.isPlayerMovementFrame = undefined;
const stageApi = diagnostics.createPlayerMovementDiagnostics(state, deps);
const stageProbe = stageApi.debugPlayerMovementCadenceProbe();
assert.equal(stageProbe.speed, 11);
assert.equal(stageProbe.frames[0].active, false);
assert.equal(stageProbe.frames[1].active, true);

console.log("player-movement-diagnostics unit test passed");
