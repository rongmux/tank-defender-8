const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/power-up-presentation-diagnostics");

const POWER_UP_PRESENTATION_DIAGNOSTIC_METHODS = [
  "debugPowerUpTypePoolProbe",
  "debugBattleRandomProbe",
  "debugPowerUpFlashCadenceProbe",
  "debugPausedPowerUpVisualProbe",
  "debugWaterAnimationCadenceProbe"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createPowerUpPresentationDiagnostics(),
  /scope must be an object/
);

const scope = {
  isPowerUpVisible(tick) {
    return tick % 2 === 0;
  },
  waterFrameName(tick) {
    return tick < 32 ? "waterA" : "waterB";
  }
};
const api = diagnostics.createPowerUpPresentationDiagnostics(scope);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), POWER_UP_PRESENTATION_DIAGNOSTIC_METHODS);
assert.equal(api.debugPowerUpFlashCadenceProbe().length, 32);
assert.equal(api.debugPowerUpFlashCadenceProbe()[0].visible, true);
assert.deepEqual(
  api.debugWaterAnimationCadenceProbe().map((entry) => entry.frame),
  ["waterA", "waterA", "waterB", "waterB", "waterB", "waterB", "waterB"]
);

console.log("power-up-presentation-diagnostics unit test passed");
