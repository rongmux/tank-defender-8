const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-bonus-life-lifecycle-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioBonusLifeLifecycleDiagnostics(), /scope must be an object/);

const api = diagnostics.createAudioBonusLifeLifecycleDiagnostics({});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ["debugBonusLifeAudioLifecycleProbe"]);
assert.equal(typeof api.debugBonusLifeAudioLifecycleProbe, "function");

console.log("audio-bonus-life-lifecycle-diagnostics unit test passed");
