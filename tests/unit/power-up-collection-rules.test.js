const assert = require("assert").strict;
const powerUpCollectionRules = require("../../src/rules/power-up-collection-rules");

const {
  POWER_UP_COLLECTION_DISTANCE,
  canPlayerCollectPowerUp,
  findPowerUpCollector
} = powerUpCollectionRules;

const power = { type: "star", x: 64, y: 64, w: 12, h: 12 };
const playerAtOffset = (id, centerDx, centerDy, overrides) => ({
  id,
  alive: true,
  respawn: 0,
  spawnFlash: 0,
  stun: 0,
  invuln: 0,
  x: power.x + power.w / 2 - 7 + centerDx,
  y: power.y + power.h / 2 - 7 + centerDy,
  w: 14,
  h: 14,
  ...(overrides || {})
});

assert.equal(Object.isFrozen(powerUpCollectionRules), true);
assert.equal(POWER_UP_COLLECTION_DISTANCE, 12);
assert.equal(canPlayerCollectPowerUp(playerAtOffset(1, 0, 0), power), true);
assert.equal(canPlayerCollectPowerUp(playerAtOffset(1, 11, -11), power), true);
assert.equal(canPlayerCollectPowerUp(playerAtOffset(1, 12, 0), power), false);
assert.equal(canPlayerCollectPowerUp(playerAtOffset(1, -12, 0), power), false);
assert.equal(canPlayerCollectPowerUp(playerAtOffset(1, 0, 12), power), false);
assert.equal(canPlayerCollectPowerUp(playerAtOffset(1, 0, -12), power), false);
assert.equal(canPlayerCollectPowerUp(playerAtOffset(1, 0, 0, { alive: false }), power), false);
assert.equal(canPlayerCollectPowerUp(playerAtOffset(1, 0, 0, { respawn: 1 }), power), false);
assert.equal(canPlayerCollectPowerUp(playerAtOffset(1, 0, 0, { spawnFlash: 1 }), power), false);
assert.equal(canPlayerCollectPowerUp(playerAtOffset(1, 0, 0, { stun: 1 }), power), true);
assert.equal(canPlayerCollectPowerUp(playerAtOffset(1, 0, 0, { invuln: 1 }), power), true);

const player1 = playerAtOffset(1, 0, 0);
const player2 = playerAtOffset(2, 0, 0);
assert.equal(findPowerUpCollector([player1, player2], power), player2);
player2.spawnFlash = 1;
assert.equal(findPowerUpCollector([player1, player2], power), player1);
player1.alive = false;
assert.equal(findPowerUpCollector([player1, player2], power), null);
assert.equal(findPowerUpCollector([], power), null);

console.log("power-up-collection-rules unit test passed");
