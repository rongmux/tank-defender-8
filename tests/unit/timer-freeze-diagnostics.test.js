const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/timer-freeze-diagnostics");

const TIMER_FREEZE_DIAGNOSTIC_METHODS = [
  "debugTimerFreezeBehaviorProbe",
  "debugTimerFinalFrameFreezeProbe",
  "debugTimerSpawnDuringFreezeProbe"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createTimerFreezeDiagnostics(),
  /scope must be an object/
);

const api = diagnostics.createTimerFreezeDiagnostics({});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), TIMER_FREEZE_DIAGNOSTIC_METHODS);

console.log("timer-freeze-diagnostics unit test passed");
