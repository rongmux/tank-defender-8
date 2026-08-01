const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-enemy-hit-lifecycle-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioEnemyHitLifecycleDiagnostics(), /scope must be an object/);

const api = diagnostics.createAudioEnemyHitLifecycleDiagnostics({});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ["debugEnemyHitAudioLifecycleProbe"]);
assert.equal(typeof api.debugEnemyHitAudioLifecycleProbe, "function");

console.log("audio-enemy-hit-lifecycle-diagnostics unit test passed");
