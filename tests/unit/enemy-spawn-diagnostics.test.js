const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/enemy-spawn-diagnostics");

const ENEMY_SPAWN_DIAGNOSTIC_METHODS = [
  "debugEnemySpawnTimelineProbe",
  "debugSpawnAnimationCadenceProbe"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createEnemySpawnDiagnostics(),
  /scope must be an object/
);
assert.throws(
  () => diagnostics.createEnemySpawnOverlapDiagnostics(),
  /scope must be an object/
);

const api = diagnostics.createEnemySpawnDiagnostics({});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ENEMY_SPAWN_DIAGNOSTIC_METHODS);

const overlapApi = diagnostics.createEnemySpawnOverlapDiagnostics({});
assert.equal(Object.isFrozen(overlapApi), true);
assert.deepEqual(Object.keys(overlapApi), ["debugEnemySpawnOverlapProbe"]);

console.log("enemy-spawn-diagnostics unit test passed");
