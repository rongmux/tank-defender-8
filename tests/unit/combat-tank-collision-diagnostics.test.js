const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/combat-tank-collision-diagnostics");

const METHODS = [
  "debugHelmetProtectionProbe",
  "debugEnemyBulletPlayerCollisionProbe",
  "debugPlayerBulletEnemyCollisionProbe",
  "debugPlayerSpawnLockProbe"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createCombatTankCollisionDiagnostics(),
  /scope must be an object/
);

const api = diagnostics.createCombatTankCollisionDiagnostics({});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), METHODS);

console.log("combat-tank-collision-diagnostics unit test passed");
