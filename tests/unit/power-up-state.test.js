const assert = require("assert").strict;
const {
  POWER_UP_SIZE,
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

console.log("power-up-state unit test passed");
