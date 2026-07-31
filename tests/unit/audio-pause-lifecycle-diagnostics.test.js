const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-pause-lifecycle-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioPauseLifecycleDiagnostics(), /scope must be an object/);

const api = diagnostics.createAudioPauseLifecycleDiagnostics({});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ["debugPauseAudioLifecycleProbe"]);
assert.equal(typeof api.debugPauseAudioLifecycleProbe, "function");

console.log("audio-pause-lifecycle-diagnostics unit test passed");
