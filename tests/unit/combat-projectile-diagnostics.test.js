const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/combat-projectile-diagnostics");

const METHODS = [
  "debugProjectileRuleProbe",
  "debugFieldBoundaryBulletProbe",
  "debugTerrainHitSoundProbe",
  "debugFriendlyFireProbe",
  "debugFriendlyFireProtectionProbe"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createCombatProjectileDiagnostics(), /scope must be an object/);

const api = diagnostics.createCombatProjectileDiagnostics({
  gameSettings() {
    return { friendlyFire: { enabled: true, stunFrames: 37 } };
  }
});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), METHODS);
assert.deepEqual(api.debugFriendlyFireProbe(), { enabled: true, stunFrames: 37 });

console.log("combat-projectile-diagnostics unit test passed");
