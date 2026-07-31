const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-power-up-appear-lifecycle-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioPowerUpAppearLifecycleDiagnostics(), /scope must be an object/);

const api = diagnostics.createAudioPowerUpAppearLifecycleDiagnostics({});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ["debugPowerUpAppearAudioLifecycleProbe"]);
assert.equal(typeof api.debugPowerUpAppearAudioLifecycleProbe, "function");

console.log("audio-power-up-appear-lifecycle-diagnostics unit test passed");
