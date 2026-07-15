const assert = require("assert").strict;
const {
  DEFAULT_FRIENDLY_FIRE,
  DEFAULT_PROJECTILE_RULES,
  normalizeFriendlyFire,
  normalizeProjectileRules
} = require("../../src/config/combat-settings");

assert.deepEqual(DEFAULT_PROJECTILE_RULES, {
  bulletSize: 4,
  spawnOffset: 9,
  boundsPadding: 4
});
assert.deepEqual(DEFAULT_FRIENDLY_FIRE, {
  enabled: true,
  stunFrames: 200
});
assert(Object.isFrozen(DEFAULT_PROJECTILE_RULES));
assert(Object.isFrozen(DEFAULT_FRIENDLY_FIRE));

assert.deepEqual(normalizeProjectileRules(), DEFAULT_PROJECTILE_RULES);
assert.deepEqual(normalizeFriendlyFire(), DEFAULT_FRIENDLY_FIRE);
assert.deepEqual(normalizeProjectileRules({ bulletSize: "6", spawnOffset: "11.5", boundsPadding: "2.25" }), {
  bulletSize: 6,
  spawnOffset: 11.5,
  boundsPadding: 2.25
});
assert.deepEqual(normalizeFriendlyFire({ enabled: false, stunFrames: "12" }), {
  enabled: false,
  stunFrames: 12
});

assert.throws(() => normalizeProjectileRules(true), /projectileRules must be an object/);
assert.throws(() => normalizeFriendlyFire(true), /friendlyFire must be an object/);
for (const bulletSize of [0, 1.5, 17]) {
  assert.throws(() => normalizeProjectileRules({ bulletSize }), /projectileRules\.bulletSize/);
}
for (const key of ["spawnOffset", "boundsPadding"]) {
  for (const value of [-0.1, 32.1]) {
    assert.throws(() => normalizeProjectileRules({ [key]: value }), new RegExp(`projectileRules\\.${key}`));
  }
}
assert.throws(() => normalizeFriendlyFire({ enabled: "false" }), /friendlyFire\.enabled must be a boolean/);
for (const stunFrames of [-1, 1.5, 3601]) {
  assert.throws(() => normalizeFriendlyFire({ stunFrames }), /friendlyFire\.stunFrames/);
}

console.log("combat-settings unit test passed");
