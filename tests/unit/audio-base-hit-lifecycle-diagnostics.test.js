"use strict";

const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-base-hit-lifecycle-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioBaseHitLifecycleDiagnostics(), /scope must be an object/);

const api = diagnostics.createAudioBaseHitLifecycleDiagnostics({});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ["debugBaseHitAudioLifecycleProbe"]);
assert.equal(typeof api.debugBaseHitAudioLifecycleProbe, "function");

console.log("audio-base-hit-lifecycle-diagnostics unit test passed");
