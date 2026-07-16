const assert = require("assert").strict;
const {
  DEFAULT_POWERUP_DURATIONS,
  DEFAULT_POWERUP_RULES,
  normalizePowerUpDurations,
  normalizePowerUpRules,
  shouldClearPowerUpForCarrierSpawn,
  shouldReleaseCarrierPowerUp
} = require("../../src/config/power-up-settings");

assert.deepEqual(DEFAULT_POWERUP_DURATIONS, {
  helmet: 10,
  shovel: 20,
  shovelFlash: 4,
  timer: 10
});
assert.deepEqual(DEFAULT_POWERUP_RULES, {
  carrierRelease: "hit",
  clearUncollectedOnCarrierSpawn: true,
  pickupScore: 500
});
assert(Object.isFrozen(DEFAULT_POWERUP_DURATIONS));
assert(Object.isFrozen(DEFAULT_POWERUP_RULES));

const defaultDurations = normalizePowerUpDurations();
const defaultRules = normalizePowerUpRules();
assert.deepEqual(defaultDurations, DEFAULT_POWERUP_DURATIONS);
assert.deepEqual(defaultRules, DEFAULT_POWERUP_RULES);
assert.notEqual(defaultDurations, DEFAULT_POWERUP_DURATIONS);
assert.notEqual(defaultRules, DEFAULT_POWERUP_RULES);

assert.deepEqual(normalizePowerUpDurations({
  helmet: "30",
  shovel: 40,
  shovelFlash: 16,
  timer: 50
}), {
  helmet: 30,
  shovel: 40,
  shovelFlash: 16,
  timer: 50
});
assert.deepEqual(normalizePowerUpRules({
  carrierRelease: "destroyed",
  clearUncollectedOnCarrierSpawn: false,
  pickupScore: "750"
}), {
  carrierRelease: "destroyed",
  clearUncollectedOnCarrierSpawn: false,
  pickupScore: 750
});

for (const key of Object.keys(DEFAULT_POWERUP_DURATIONS)) {
  for (const value of [0, 1.5, 3601]) {
    assert.throws(() => normalizePowerUpDurations({ [key]: value }), new RegExp(`powerUpDurations\\.${key}`));
  }
}
assert.throws(() => normalizePowerUpDurations(true), /powerUpDurations must be an object/);
assert.throws(() => normalizePowerUpRules(true), /powerUpRules must be an object/);
assert.throws(() => normalizePowerUpRules({ carrierRelease: "first" }), /carrierRelease must be destroyed or hit/);
assert.throws(() => normalizePowerUpRules({ clearUncollectedOnCarrierSpawn: "false" }), /clearUncollectedOnCarrierSpawn must be a boolean/);
for (const pickupScore of [-1, 1.5, 1000000]) {
  assert.throws(() => normalizePowerUpRules({ pickupScore }), /pickupScore must be an integer from 0 to 999999/);
}

assert.equal(shouldReleaseCarrierPowerUp(false, false, "hit"), false);
assert.equal(shouldReleaseCarrierPowerUp(false, true, "destroyed"), false);
assert.equal(shouldReleaseCarrierPowerUp(true, false, "hit"), true);
assert.equal(shouldReleaseCarrierPowerUp(true, true, "hit"), true);
assert.equal(shouldReleaseCarrierPowerUp(true, false, "destroyed"), false);
assert.equal(shouldReleaseCarrierPowerUp(true, true, "destroyed"), true);
assert.equal(shouldReleaseCarrierPowerUp(true, true, "unknown"), false);
assert.equal(shouldClearPowerUpForCarrierSpawn(false, true), false);
assert.equal(shouldClearPowerUpForCarrierSpawn(true, false), false);
assert.equal(shouldClearPowerUpForCarrierSpawn(true, true), true);

console.log("power-up-settings unit test passed");
