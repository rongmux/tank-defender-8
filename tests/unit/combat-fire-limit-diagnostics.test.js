const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/combat-fire-limit-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createCombatFireLimitDiagnostics(), /scope must be an object/);

const api = diagnostics.createCombatFireLimitDiagnostics({});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ["debugActiveBulletLimitProbe"]);

console.log("combat-fire-limit-diagnostics unit test passed");
