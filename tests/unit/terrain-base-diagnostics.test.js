const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/terrain-base-diagnostics");

const TERRAIN_BASE_DIAGNOSTIC_METHODS = [
  "debugBaseWallPriorityProbe",
  "debugBaseDestructionSequenceProbe",
  "debugRenderBaseDestructionFrame"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createTerrainBaseDiagnostics(),
  /scope must be an object/
);

const api = diagnostics.createTerrainBaseDiagnostics({});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), TERRAIN_BASE_DIAGNOSTIC_METHODS);

console.log("terrain-base-diagnostics unit test passed");
