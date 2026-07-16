const assert = require("assert").strict;
const {
  POWER_UP_SIZE,
  advancePowerUpState,
  createPowerUpState
} = require("../../src/entities/power-up-state");

assert.equal(POWER_UP_SIZE, 12);

const position = { x: 34, y: 50 };
const powerUp = createPowerUpState({ type: "star", position, ttl: 600 });
assert.deepEqual(powerUp, {
  type: "star",
  x: 34,
  y: 50,
  w: 12,
  h: 12,
  ttl: 600
});
assert.deepEqual(position, { x: 34, y: 50 });

const persistent = createPowerUpState({ type: "helmet", position: { x: 2, y: 2 }, ttl: 0 });
assert.equal(persistent.ttl, 0);
assert.equal(persistent.w, 12);
assert.equal(persistent.h, 12);
assert.equal(advancePowerUpState(persistent), persistent);
assert.equal(persistent.ttl, 0);

const timed = createPowerUpState({ type: "timer", position: { x: 18, y: 18 }, ttl: 2 });
assert.equal(advancePowerUpState(timed), timed);
assert.equal(timed.ttl, 1);
assert.equal(advancePowerUpState(timed), null);
assert.equal(timed.ttl, 0);
assert.equal(advancePowerUpState(null), null);

const negativeTtl = createPowerUpState({ type: "tank", position: { x: 34, y: 34 }, ttl: -1 });
assert.equal(advancePowerUpState(negativeTtl), negativeTtl);
assert.equal(negativeTtl.ttl, -1);

console.log("power-up-state unit test passed");
