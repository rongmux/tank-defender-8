const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/upgrade-diagnostics");

const UPGRADE_DIAGNOSTIC_METHODS = [
  "debugStarUpgradeProbe",
  "debugPlayerUpgradeVisualProbe",
  "debugStarSurvivabilityProbe"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createUpgradeDiagnostics(),
  /state must be an object/
);
assert.throws(
  () => diagnostics.createUpgradeDiagnostics({}, {}),
  /state\.game must be an object/
);
assert.throws(
  () => diagnostics.createUpgradeDiagnostics({ game: {} }, {}),
  /state\.fn must be an object/
);
assert.throws(
  () => diagnostics.createUpgradeDiagnostics({ game: {}, fn: {} }, {}),
  /state\.audio must be an object/
);
assert.throws(
  () => diagnostics.createUpgradeDiagnostics({ game: {}, fn: {}, audio: {} }),
  /deps must be an object/
);
assert.throws(
  () => diagnostics.createUpgradeDiagnostics({ game: {}, fn: {}, audio: {} }, {}),
  /deps\.sharedState must be an object/
);

const deps = {
  label: "deps",
  sharedState: {
    UP: 0,
    PLAYER_UPGRADE_OVERLAY_COLORS: { level3: "#max" }
  },
  clamp(value) {
    return Math.max(0, Math.min(3, value));
  },
  drawTank() {},
  playerUpgradeOverlayParts() {
    return [{ role: this.label, rect: [0, 0, 1, 1] }];
  }
};
const state = {
  game: {},
  audio: {
    playerDestroy: { active: false, frame: 0 }
  },
  stageRuntime: {
    label: "stage-runtime",
    clamp(value) {
      return Math.max(0, Math.min(3, value));
    },
    drawTank() {},
    playerUpgradeOverlayParts() {
      return [{ role: this.label, rect: [0, 0, 1, 1] }];
    }
  },
  fn: {
    label: "state-fn",
    clamp(value) {
      return Math.max(0, Math.min(3, value));
    },
    drawTank() {},
    playerUpgradeOverlayParts() {
      return [{ role: this.label, rect: [0, 0, 1, 1] }];
    }
  }
};

const api = diagnostics.createUpgradeDiagnostics(state, deps);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), UPGRADE_DIAGNOSTIC_METHODS);
assert.equal(api.debugPlayerUpgradeVisualProbe(1).overlaySignature, "state-fn:0,0,1,1");

state.fn.clamp = undefined;
state.fn.drawTank = undefined;
state.fn.playerUpgradeOverlayParts = undefined;
const stageApi = diagnostics.createUpgradeDiagnostics(state, deps);
assert.equal(
  stageApi.debugPlayerUpgradeVisualProbe(1).overlaySignature,
  "stage-runtime:0,0,1,1"
);

console.log("upgrade-diagnostics unit test passed");
