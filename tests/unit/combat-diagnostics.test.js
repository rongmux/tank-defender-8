const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/combat-diagnostics");
const projectileDiagnostics = require("../../src/runtime/combat-projectile-diagnostics");

const COMBAT_DIAGNOSTIC_METHODS = [
  "debugHelmetProtectionProbe",
  "debugEnemyBulletPlayerCollisionProbe",
  "debugPlayerBulletEnemyCollisionProbe",
  "debugPlayerSpawnLockProbe",
  "debugActiveBulletLimitProbe",
  "debugPlayerFireInputProbe",
  "debugCrossingBulletCancelProbe",
  "debugProjectileRuleProbe",
  "debugFieldBoundaryBulletProbe",
  "debugTerrainHitSoundProbe",
  "debugFriendlyFireProbe",
  "debugFriendlyFireProtectionProbe"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createCombatDiagnostics(),
  /state must be an object/
);
assert.throws(
  () => diagnostics.createCombatDiagnostics({}, {}),
  /state\.game must be an object/
);
assert.throws(
  () => diagnostics.createCombatDiagnostics({ game: {} }, {}),
  /state\.fn must be an object/
);
assert.throws(
  () => diagnostics.createCombatDiagnostics({ game: {}, fn: {} }, {}),
  /state\.keys must be an object/
);
assert.throws(
  () => diagnostics.createCombatDiagnostics({ game: {}, fn: {}, keys: {} }, {}),
  /state\.pendingFirePresses must be an object/
);
assert.throws(
  () => diagnostics.createCombatDiagnostics({ game: {}, fn: {}, keys: {}, pendingFirePresses: {} }, {}),
  /state\.audio must be an object/
);
assert.throws(
  () => diagnostics.createCombatDiagnostics({ game: {}, fn: {}, keys: {}, pendingFirePresses: {}, audio: {} }),
  /deps must be an object/
);
assert.throws(
  () => diagnostics.createCombatDiagnostics({ game: {}, fn: {}, keys: {}, pendingFirePresses: {}, audio: {} }, {}),
  /deps\.sharedState must be an object/
);

const deps = {
  label: "deps",
  sharedState: {},
  createCombatProjectileDiagnostics: projectileDiagnostics.createCombatProjectileDiagnostics,
  gameSettings() {
    return {
      friendlyFire: {
        enabled: this.label === "state-fn",
        stunFrames: this.label === "state-fn" ? 37 : 11
      }
    };
  }
};
const state = {
  game: {},
  keys: new Set(),
  pendingFirePresses: new Set(),
  audio: {
    enemyDestroy: { active: false, frame: 0 },
    enemyHit: { active: false, frame: 0 },
    playerDestroy: { active: false, frame: 0 },
    playerShoot: { active: false, frame: 0 },
    steelHit: { active: false, frame: 0 }
  },
  stageRuntime: {
    label: "stage-runtime",
    gameSettings: deps.gameSettings
  },
  fn: {
    label: "state-fn",
    gameSettings: deps.gameSettings
  }
};

const api = diagnostics.createCombatDiagnostics(state, deps);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), COMBAT_DIAGNOSTIC_METHODS);
assert.deepEqual(api.debugFriendlyFireProbe(), { enabled: true, stunFrames: 37 });

state.fn.gameSettings = undefined;
const stageApi = diagnostics.createCombatDiagnostics(state, deps);
assert.deepEqual(stageApi.debugFriendlyFireProbe(), { enabled: false, stunFrames: 0 });

console.log("combat-diagnostics unit test passed");
