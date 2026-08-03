const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/combat-crossing-diagnostics");
assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createCombatCrossingDiagnostics(), /scope must be an object/);
const api = diagnostics.createCombatCrossingDiagnostics({});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ["debugCrossingBulletCancelProbe"]);
console.log("combat-crossing-diagnostics unit test passed");
