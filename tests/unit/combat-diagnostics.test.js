const assert = require("assert").strict;
const { createDiagnosticScope } = require("../../src/runtime/diagnostic-scope");
const diagnostics = require("../../src/runtime/combat-diagnostics");
const tankCollisionDiagnostics = require("../../src/runtime/combat-tank-collision-diagnostics");
const crossingDiagnostics = require("../../src/runtime/combat-crossing-diagnostics");
const fireLimitDiagnostics = require("../../src/runtime/combat-fire-limit-diagnostics");
const playerFireInputDiagnostics = require("../../src/runtime/combat-player-fire-input-diagnostics");
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
  createDiagnosticScope,
  label: "deps",
  sharedState: {},
  createCombatTankCollisionDiagnostics: tankCollisionDiagnostics.createCombatTankCollisionDiagnostics,
  createCombatCrossingDiagnostics: crossingDiagnostics.createCombatCrossingDiagnostics,
  createCombatFireLimitDiagnostics: fireLimitDiagnostics.createCombatFireLimitDiagnostics,
  createCombatPlayerFireInputDiagnostics: playerFireInputDiagnostics.createCombatPlayerFireInputDiagnostics,
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

const childFactories = [
  ["createCombatTankCollisionDiagnostics", COMBAT_DIAGNOSTIC_METHODS.slice(0, 4)],
  ["createCombatFireLimitDiagnostics", COMBAT_DIAGNOSTIC_METHODS.slice(4, 5)],
  ["createCombatPlayerFireInputDiagnostics", COMBAT_DIAGNOSTIC_METHODS.slice(5, 6)],
  ["createCombatCrossingDiagnostics", COMBAT_DIAGNOSTIC_METHODS.slice(6, 7)],
  ["createCombatProjectileDiagnostics", COMBAT_DIAGNOSTIC_METHODS.slice(7)]
];
const factoryCalls = [];
const childApis = new Map();
const compositionDeps = { ...deps };
for (const [factoryName, methodNames] of childFactories) {
  const childApi = Object.freeze(Object.fromEntries(methodNames.map((name) => [name, () => name])));
  childApis.set(factoryName, childApi);
  compositionDeps[factoryName] = function (scope) {
    factoryCalls.push({ factoryName, scope, receiver: this });
    return childApi;
  };
}

const composedApi = diagnostics.createCombatDiagnostics(state, compositionDeps);
assert.equal(Object.isFrozen(composedApi), true);
assert.deepEqual(Object.keys(composedApi), COMBAT_DIAGNOSTIC_METHODS);
assert.deepEqual(factoryCalls.map((call) => call.factoryName), childFactories.map(([name]) => name));
const sharedScope = factoryCalls[0].scope;
for (const call of factoryCalls) {
  assert.equal(call.scope, sharedScope, "all combat children must receive the same scope");
  assert.equal(call.receiver, compositionDeps, "child factories must retain their receiver");
  for (const [name, probe] of Object.entries(childApis.get(call.factoryName))) {
    assert.equal(composedApi[name], probe, `${name} must be delegated directly to its child`);
  }
}
for (const name of ["game", "keys", "pendingFirePresses"]) {
  assert.equal(sharedScope[name], state[name], `${name} must remain a live reference`);
}
for (const name of ["enemyDestroy", "enemyHit", "playerDestroy", "playerShoot", "steelHit"]) {
  assert.equal(sharedScope[`${name}Audio`], state.audio[name], `${name} audio must remain live`);
}

console.log("combat-diagnostics unit test passed");
