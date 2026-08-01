const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-brick-hit-lifecycle-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioBrickHitLifecycleDiagnostics(), /scope must be an object/);

const api = diagnostics.createAudioBrickHitLifecycleDiagnostics({});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ["debugBrickHitAudioLifecycleProbe"]);
assert.equal(typeof api.debugBrickHitAudioLifecycleProbe, "function");

console.log("audio-brick-hit-lifecycle-diagnostics unit test passed");
