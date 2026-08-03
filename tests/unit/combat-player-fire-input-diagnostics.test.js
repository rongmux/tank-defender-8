const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/combat-player-fire-input-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createCombatPlayerFireInputDiagnostics(),
  /scope must be an object/
);

const api = diagnostics.createCombatPlayerFireInputDiagnostics({});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ["debugPlayerFireInputProbe"]);

console.log("combat-player-fire-input-diagnostics unit test passed");
