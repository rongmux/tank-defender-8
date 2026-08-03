const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/effect-explosion-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createEffectExplosionDiagnostics(),
  /scope must be an object/
);
assert.throws(
  () => diagnostics.createEffectImpactDiagnostics(),
  /scope must be an object/
);

const scope = {
  explosionRule(name) {
    return { source: "scope", name };
  }
};
const explosionApi = diagnostics.createEffectExplosionDiagnostics(scope);
const impactApi = diagnostics.createEffectImpactDiagnostics(scope);

assert.equal(Object.isFrozen(explosionApi), true);
assert.equal(Object.isFrozen(impactApi), true);
assert.deepEqual(Object.keys(explosionApi), [
  "debugExplosionRuleProbe",
  "debugTankDestructionExplosionProbe"
]);
assert.deepEqual(Object.keys(impactApi), [
  "debugRenderTankDestructionExplosionFrame",
  "debugBulletImpactExplosionProbe"
]);
assert.deepEqual(explosionApi.debugExplosionRuleProbe("brickHit"), {
  key: "brickHit",
  source: "scope",
  name: "brickHit"
});

console.log("effect-explosion-diagnostics unit test passed");
