const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/effect-diagnostics");
const enemyDestructionDiagnostics = require("../../src/runtime/effect-enemy-destruction-diagnostics");
const explosionDiagnostics = require("../../src/runtime/effect-explosion-diagnostics");

const EFFECT_DIAGNOSTIC_METHODS = [
  "debugExplosionRuleProbe",
  "debugTankDestructionExplosionProbe",
  "debugEnemyDestructionLifecycleProbe",
  "debugRenderTankDestructionExplosionFrame",
  "debugBulletImpactExplosionProbe"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createEffectDiagnostics(),
  /state must be an object/
);
assert.throws(
  () => diagnostics.createEffectDiagnostics({}, {}),
  /state\.game must be an object/
);
assert.throws(
  () => diagnostics.createEffectDiagnostics({ game: {} }, {}),
  /state\.fn must be an object/
);
assert.throws(
  () => diagnostics.createEffectDiagnostics({ game: {}, fn: {} }),
  /deps must be an object/
);
assert.throws(
  () => diagnostics.createEffectDiagnostics({ game: {}, fn: {} }, {}),
  /deps\.sharedState must be an object/
);

const deps = {
  label: "deps",
  sharedState: {},
  createEffectEnemyDestructionDiagnostics:
    enemyDestructionDiagnostics.createEffectEnemyDestructionDiagnostics,
  createEffectExplosionDiagnostics: explosionDiagnostics.createEffectExplosionDiagnostics,
  createEffectImpactDiagnostics: explosionDiagnostics.createEffectImpactDiagnostics,
  explosionRule() {
    return { source: this.label };
  }
};
const state = {
  game: {},
  stageRuntime: {
    label: "stage-runtime",
    explosionRule() {
      return { source: this.label };
    }
  },
  fn: {
    label: "state-fn",
    explosionRule() {
      return { source: this.label };
    }
  }
};

const api = diagnostics.createEffectDiagnostics(state, deps);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), EFFECT_DIAGNOSTIC_METHODS);
assert.deepEqual(api.debugExplosionRuleProbe("brickHit"), {
  key: "brickHit",
  source: "state-fn"
});

state.fn.explosionRule = undefined;
const stageApi = diagnostics.createEffectDiagnostics(state, deps);
assert.deepEqual(stageApi.debugExplosionRuleProbe("steelHit"), {
  key: "steelHit",
  source: "stage-runtime"
});

console.log("effect-diagnostics unit test passed");
