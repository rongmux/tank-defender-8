const assert = require("assert").strict;
const powerUpSpawnRules = require("../../src/rules/power-up-spawn-rules");

const {
  ORIGINAL_POWER_UP_RANDOM_TABLE,
  dedupePowerUpSpots,
  powerUpSpawnKey,
  powerUpTypeForRandomByte,
  selectPowerUpSpawnSpot
} = powerUpSpawnRules;

assert.equal(Object.isFrozen(powerUpSpawnRules), true);
assert.equal(Object.isFrozen(ORIGINAL_POWER_UP_RANDOM_TABLE), true);
assert.deepEqual(ORIGINAL_POWER_UP_RANDOM_TABLE, [
  "helmet",
  "timer",
  "shovel",
  "star",
  "grenade",
  "tank",
  "grenade",
  "star"
]);
assert.deepEqual(Array.from({ length: 8 }, (_, byte) => powerUpTypeForRandomByte(byte)), ORIGINAL_POWER_UP_RANDOM_TABLE);
assert.equal(powerUpTypeForRandomByte(255), "star");

const first = { x: 18, y: 18, id: "first" };
const duplicate = { x: 18, y: 18, id: "duplicate" };
const second = { x: 34, y: 18, id: "second" };
const third = { x: 50, y: 18, id: "third" };
assert.equal(powerUpSpawnKey(first), "18,18");
assert.deepEqual(dedupePowerUpSpots([first, duplicate, second]), [first, second]);
assert.equal(selectPowerUpSpawnSpot([], 0, null), null);
assert.equal(selectPowerUpSpawnSpot([first, second, third], 0, null), first);
assert.equal(selectPowerUpSpawnSpot([first, second, third], 0xffff, null), third);
assert.equal(selectPowerUpSpawnSpot([first, second, third], 0, "18,18"), second);
assert.equal(selectPowerUpSpawnSpot([first, second, third], 0xffff, "50,18"), second);
assert.equal(selectPowerUpSpawnSpot([first, duplicate], 0, "18,18"), first);

console.log("power-up-spawn-rules unit test passed");
