const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/effect-enemy-destruction-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createEffectEnemyDestructionDiagnostics(),
  /scope must be an object/
);

const api = diagnostics.createEffectEnemyDestructionDiagnostics({});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ["debugEnemyDestructionLifecycleProbe"]);

console.log("effect-enemy-destruction-diagnostics unit test passed");
