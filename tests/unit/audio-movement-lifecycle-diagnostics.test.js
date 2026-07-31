const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-movement-lifecycle-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioMovementLifecycleDiagnostics(), /scope must be an object/);

const api = diagnostics.createAudioMovementLifecycleDiagnostics({});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ["debugMovementIceAudioLifecycleProbe"]);
assert.equal(typeof api.debugMovementIceAudioLifecycleProbe, "function");

console.log("audio-movement-lifecycle-diagnostics unit test passed");
