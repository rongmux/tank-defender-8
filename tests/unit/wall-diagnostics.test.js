const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/wall-diagnostics");

const WALL_DIAGNOSTIC_METHODS = [
  "debugSteelRuleProbe",
  "debugBrickWallPowerProbe",
  "debugBrickFragmentRenderProbe",
  "debugShovelWallProbe",
  "debugShovelDestroyedBaseProbe"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createWallDiagnostics(),
  /state must be an object/
);
assert.throws(
  () => diagnostics.createWallDiagnostics({}, {}),
  /state\.game must be an object/
);
assert.throws(
  () => diagnostics.createWallDiagnostics({ game: {} }, {}),
  /state\.fn must be an object/
);
assert.throws(
  () => diagnostics.createWallDiagnostics({ game: {}, fn: {} }, {}),
  /state\.audio must be an object/
);
assert.throws(
  () => diagnostics.createWallDiagnostics({ game: {}, fn: {}, audio: {} }),
  /deps must be an object/
);
assert.throws(
  () => diagnostics.createWallDiagnostics({ game: {}, fn: {}, audio: {} }, {}),
  /deps\.sharedState must be an object/
);

const deps = {
  label: "deps",
  sharedState: {
    STEEL: 2,
    UP: 0
  },
  makeCell(type, mask) {
    return { type, mask, steelHits: [] };
  },
  damageWall() {
    return this.label;
  }
};
const state = {
  game: {},
  audio: {
    brickHit: { active: false, frame: 0 }
  },
  stageRuntime: {
    label: "stage-runtime",
    damageWall() {
      return this.label;
    }
  },
  fn: {
    label: "state-fn",
    damageWall() {
      return this.label;
    }
  }
};

const api = diagnostics.createWallDiagnostics(state, deps);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), WALL_DIAGNOSTIC_METHODS);
assert.deepEqual(api.debugSteelRuleProbe(), {
  blocked: "state-fn",
  blockedMask: 15,
  first: "state-fn",
  afterFirst: { type: 2, mask: 15, steelHits: [] },
  second: "state-fn",
  afterSecond: { type: 2, mask: 15, steelHits: [] }
});

state.fn.damageWall = undefined;
const stageApi = diagnostics.createWallDiagnostics(state, deps);
assert.equal(stageApi.debugSteelRuleProbe().blocked, "stage-runtime");

console.log("wall-diagnostics unit test passed");
