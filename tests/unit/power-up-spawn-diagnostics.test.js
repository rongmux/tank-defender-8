const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/power-up-spawn-diagnostics");

const POWER_UP_SPAWN_DIAGNOSTIC_METHODS = [
  "debugPowerUpTerrainMutationProbe",
  "debugPowerUpSpawnTerrainProbe",
  "debugPowerUpSpawnRandomProbe",
  "debugPowerUpSpawnRotationProbe",
  "debugCarrierSpawnClearsPowerUpProbe"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createPowerUpSpawnDiagnostics(),
  /scope must be an object/
);

const api = diagnostics.createPowerUpSpawnDiagnostics({});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), POWER_UP_SPAWN_DIAGNOSTIC_METHODS);

console.log("power-up-spawn-diagnostics unit test passed");
