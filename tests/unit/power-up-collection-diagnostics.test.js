const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/power-up-collection-diagnostics");

const POWER_UP_COLLECTION_DIAGNOSTIC_METHODS = [
  "debugPowerUpTtlProbe",
  "debugPowerUpPickupBoundaryProbe",
  "debugPowerUpPickupPriorityProbe",
  "debugPowerUpPickupRenderProbe",
  "debugPowerUpFootprintClearProbe"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createPowerUpCollectionDiagnostics(),
  /scope must be an object/
);

const api = diagnostics.createPowerUpCollectionDiagnostics({});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), POWER_UP_COLLECTION_DIAGNOSTIC_METHODS);

console.log("power-up-collection-diagnostics unit test passed");
