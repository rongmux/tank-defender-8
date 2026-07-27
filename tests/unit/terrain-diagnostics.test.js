const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/terrain-diagnostics");

const TERRAIN_DIAGNOSTIC_METHODS = [
  "debugTerrainCollisionProbe",
  "debugBaseWallPriorityProbe",
  "debugBaseDestructionSequenceProbe",
  "debugRenderBaseDestructionFrame",
  "debugTankCollisionProbe",
  "debugEnemyOverlapRecoveryProbe"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createTerrainDiagnostics(),
  /state must be an object/
);
assert.throws(
  () => diagnostics.createTerrainDiagnostics({}, {}),
  /state\.game must be an object/
);
assert.throws(
  () => diagnostics.createTerrainDiagnostics({ game: {} }, {}),
  /state\.fn must be an object/
);
assert.throws(
  () => diagnostics.createTerrainDiagnostics({ game: {}, fn: {} }, {}),
  /state\.keys must be an object/
);
assert.throws(
  () => diagnostics.createTerrainDiagnostics({ game: {}, fn: {}, keys: {} }, {}),
  /state\.pendingFirePresses must be an object/
);
assert.throws(
  () => diagnostics.createTerrainDiagnostics({ game: {}, fn: {}, keys: {}, pendingFirePresses: {} }, {}),
  /state\.audio must be an object/
);
assert.throws(
  () => diagnostics.createTerrainDiagnostics({ game: {}, fn: {}, keys: {}, pendingFirePresses: {}, audio: {} }),
  /deps must be an object/
);
assert.throws(
  () => diagnostics.createTerrainDiagnostics({ game: {}, fn: {}, keys: {}, pendingFirePresses: {}, audio: {} }, {}),
  /deps\.sharedState must be an object/
);

const deps = {
  label: "deps",
  sharedState: { TILE: 16 },
  makeGrid() {
    return [];
  },
  canTankOccupy() {
    return this.label !== "state-fn";
  },
  moveTank() {
    return this.label === "state-fn";
  }
};
const state = {
  game: {},
  keys: new Set(),
  pendingFirePresses: new Set(),
  audio: {
    baseHit: { active: false, frame: 0 },
    brickHit: { active: false, frame: 0 },
    playerDestroy: { active: false, frame: 0 }
  },
  stageRuntime: {
    label: "stage-runtime",
    makeGrid: deps.makeGrid,
    canTankOccupy: deps.canTankOccupy,
    moveTank: deps.moveTank
  },
  fn: {
    label: "state-fn",
    makeGrid: deps.makeGrid,
    canTankOccupy: deps.canTankOccupy,
    moveTank: deps.moveTank
  }
};

const api = diagnostics.createTerrainDiagnostics(state, deps);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), TERRAIN_DIAGNOSTIC_METHODS);
assert.deepEqual(api.debugTankCollisionProbe(), {
  enemyBlocks: true,
  teammateBlocks: true,
  movingAwayFromEnemyAllowed: true,
  finalX: 32
});

state.fn.makeGrid = undefined;
state.fn.canTankOccupy = undefined;
state.fn.moveTank = undefined;
const stageApi = diagnostics.createTerrainDiagnostics(state, deps);
assert.deepEqual(stageApi.debugTankCollisionProbe(), {
  enemyBlocks: false,
  teammateBlocks: false,
  movingAwayFromEnemyAllowed: false,
  finalX: 32
});

console.log("terrain-diagnostics unit test passed");
