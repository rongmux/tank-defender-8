const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-power-up-pickup-lifecycle-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioPowerUpPickupLifecycleDiagnostics(), /scope must be an object/);

const api = diagnostics.createAudioPowerUpPickupLifecycleDiagnostics({});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ["debugPowerUpPickupAudioLifecycleProbe"]);
assert.equal(typeof api.debugPowerUpPickupAudioLifecycleProbe, "function");

console.log("audio-power-up-pickup-lifecycle-diagnostics unit test passed");
