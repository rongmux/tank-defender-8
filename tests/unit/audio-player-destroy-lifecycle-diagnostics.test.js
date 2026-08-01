"use strict";

const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-player-destroy-lifecycle-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioPlayerDestroyLifecycleDiagnostics(), /scope must be an object/);

const api = diagnostics.createAudioPlayerDestroyLifecycleDiagnostics({});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ["debugPlayerDestroyAudioLifecycleProbe"]);
assert.equal(typeof api.debugPlayerDestroyAudioLifecycleProbe, "function");

console.log("audio-player-destroy-lifecycle-diagnostics unit test passed");
