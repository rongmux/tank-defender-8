const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-steel-hit-lifecycle-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioSteelHitLifecycleDiagnostics(), /scope must be an object/);

const api = diagnostics.createAudioSteelHitLifecycleDiagnostics({});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ["debugSteelHitAudioLifecycleProbe"]);
assert.equal(typeof api.debugSteelHitAudioLifecycleProbe, "function");

console.log("audio-steel-hit-lifecycle-diagnostics unit test passed");
