"use strict";

const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-enemy-destroy-lifecycle-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioEnemyDestroyLifecycleDiagnostics(), /scope must be an object/);

const api = diagnostics.createAudioEnemyDestroyLifecycleDiagnostics({});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ["debugEnemyDestroyAudioLifecycleProbe"]);
assert.equal(typeof api.debugEnemyDestroyAudioLifecycleProbe, "function");

console.log("audio-enemy-destroy-lifecycle-diagnostics unit test passed");
