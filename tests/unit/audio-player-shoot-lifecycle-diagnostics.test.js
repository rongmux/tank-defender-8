"use strict";

const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-player-shoot-lifecycle-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioPlayerShootLifecycleDiagnostics(), /scope must be an object/);

const api = diagnostics.createAudioPlayerShootLifecycleDiagnostics({});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ["debugPlayerShootAudioLifecycleProbe"]);
assert.equal(typeof api.debugPlayerShootAudioLifecycleProbe, "function");

console.log("audio-player-shoot-lifecycle-diagnostics unit test passed");
