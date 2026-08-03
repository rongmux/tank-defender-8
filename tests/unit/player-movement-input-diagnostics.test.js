const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/player-movement-input-diagnostics");

const PLAYER_MOVEMENT_INPUT_DIAGNOSTIC_METHODS = [
  "debugWasdDirectionProbe",
  "debugPlayerTurnAlignmentProbe",
  "debugPlayerBrickRecoveryProbe"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createPlayerMovementInputDiagnostics(),
  /scope must be an object/
);

const api = diagnostics.createPlayerMovementInputDiagnostics({});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), PLAYER_MOVEMENT_INPUT_DIAGNOSTIC_METHODS);

console.log("player-movement-input-diagnostics unit test passed");
