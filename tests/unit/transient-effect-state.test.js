const assert = require("assert").strict;
const {
  advanceTimedStates,
  createExplosionState,
  createScorePopupState
} = require("../../src/entities/transient-effect-state");

assert.deepEqual(createExplosionState({
  x: 12,
  y: 34,
  ttl: 9,
  color: "#123456",
  coreColor: "#abcdef",
  defaultCoreColor: "#ffffff",
  style: "bulletImpact"
}), {
  x: 12,
  y: 34,
  ttl: 9,
  max: 9,
  color: "#123456",
  coreColor: "#abcdef",
  style: "bulletImpact"
});

assert.deepEqual(createExplosionState({
  x: 2,
  y: 4,
  ttl: 18,
  color: "#654321",
  defaultCoreColor: "#fedcba"
}), {
  x: 2,
  y: 4,
  ttl: 18,
  max: 18,
  color: "#654321",
  coreColor: "#fedcba",
  style: "default"
});

assert.deepEqual(createScorePopupState(500.9, 24, 48, {
  ttl: 49,
  style: "powerUp"
}), {
  value: 500,
  x: 24,
  y: 48,
  ttl: 49,
  max: 49,
  style: "powerUp"
});

assert.deepEqual(createScorePopupState(100, "invalid", NaN, {
  defaultX: 104,
  defaultY: 104,
  ttl: 0
}), {
  value: 100,
  x: 104,
  y: 104,
  ttl: 54,
  max: 54,
  style: "float"
});

assert.equal(createScorePopupState(0, 1, 2), null);
assert.equal(createScorePopupState(-100, 1, 2), null);
assert.equal(createScorePopupState("invalid", 1, 2), null);

const expired = { ttl: 1 };
const survivor = { ttl: 3 };
const advanced = advanceTimedStates([expired, survivor]);
assert.deepEqual(advanced, [survivor]);
assert.equal(advanced[0], survivor);
assert.equal(expired.ttl, 0);
assert.equal(survivor.ttl, 2);

console.log("transient-effect-state unit test passed");
