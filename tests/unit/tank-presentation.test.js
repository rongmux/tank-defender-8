const assert = require("assert").strict;
const { DOWN, LEFT, RIGHT, UP } = require("../../src/core/directions");
const tankPresentation = require("../../src/presentation/tank-presentation");

const {
  CARRIER_FLASH_COLOR,
  CARRIER_FLASH_PHASE_FRAMES,
  PLAYER_UPGRADE_OVERLAY_COLORS,
  SPAWN_ANIMATION_CYCLE,
  SPAWN_PHASE_SIZES,
  directionName,
  enemyColor,
  isPlayerShieldVisible,
  isPlayerTankVisible,
  playerUpgradeOverlayParts,
  shieldColorForTick,
  spawnAnimationPresentation,
  tankPrimaryColor,
  tankTrackFrameName
} = tankPresentation;

assert.equal(Object.isFrozen(tankPresentation), true);
assert.equal(Object.isFrozen(PLAYER_UPGRADE_OVERLAY_COLORS), true);
assert.equal(Object.isFrozen(SPAWN_PHASE_SIZES), true);
assert.equal(CARRIER_FLASH_COLOR, "#dd3d33");
assert.equal(CARRIER_FLASH_PHASE_FRAMES, 8);
assert.equal(SPAWN_ANIMATION_CYCLE, 14);
assert.deepEqual(Array.from(SPAWN_PHASE_SIZES), [6, 8, 11, 14]);

assert.deepEqual([UP, RIGHT, DOWN, LEFT].map(directionName), ["up", "right", "down", "left"]);
assert.equal(directionName(99), "left");
assert.deepEqual([
  tankTrackFrameName({ dir: UP, trackPhase: 0 }),
  tankTrackFrameName({ dir: DOWN, trackPhase: 1 }),
  tankTrackFrameName({ dir: LEFT, trackPhase: 2 }),
  tankTrackFrameName({ dir: RIGHT, trackPhase: 3 })
], ["verticalA", "verticalB", "horizontalA", "horizontalB"]);

assert.deepEqual(playerUpgradeOverlayParts(0, UP), []);
assert.deepEqual(playerUpgradeOverlayParts(1, UP), [
  { role: "level1", rect: [6, 0, 2, 3] },
  { role: "level1", rect: [5, 2, 4, 1] }
]);
assert.deepEqual(playerUpgradeOverlayParts(1, DOWN), [
  { role: "level1", rect: [6, 11, 2, 3] },
  { role: "level1", rect: [5, 11, 4, 1] }
]);
assert.deepEqual(playerUpgradeOverlayParts(1, LEFT), [
  { role: "level1", rect: [0, 6, 3, 2] },
  { role: "level1", rect: [2, 5, 1, 4] }
]);
assert.deepEqual(playerUpgradeOverlayParts(1, RIGHT), [
  { role: "level1", rect: [11, 6, 3, 2] },
  { role: "level1", rect: [11, 5, 1, 4] }
]);
assert.equal(playerUpgradeOverlayParts(2, UP).length, 6);
const maximumUpgrade = playerUpgradeOverlayParts(3, UP);
assert.equal(maximumUpgrade.length, 8);
assert.deepEqual(maximumUpgrade.slice(-2), [
  { role: "level3", rect: [5, 0, 4, 1] },
  { role: "level3", rect: [6, 1, 2, 2] }
]);

const carrier = { carrier: true };
assert.equal(tankPrimaryColor({ carrier: false }, "#123456", 0), "#123456");
assert.equal(tankPrimaryColor(carrier, "#123456", 0), CARRIER_FLASH_COLOR);
assert.equal(tankPrimaryColor(carrier, "#123456", 7), CARRIER_FLASH_COLOR);
assert.equal(tankPrimaryColor(carrier, "#123456", 8), "#123456");
assert.equal(tankPrimaryColor(carrier, "#123456", 16), CARRIER_FLASH_COLOR);
assert.deepEqual([0, 7, 8, 15, 16].map((tick) => isPlayerTankVisible({ stun: 1 }, tick)), [
  true,
  true,
  false,
  false,
  true
]);
assert.equal(isPlayerTankVisible({ stun: 0 }, 8), true);

const armored = {
  hp: 2,
  color: "#base",
  hitColors: ["#low", "#high"]
};
assert.equal(enemyColor({ ...armored, hp: 1 }), "#low");
assert.equal(enemyColor(armored), "#high");
assert.equal(enemyColor({ ...armored, hp: 3 }), "#high");
assert.equal(enemyColor({ ...armored, hitColors: null }), "#base");

assert.equal(isPlayerShieldVisible({ invuln: 1 }, false), true);
assert.equal(isPlayerShieldVisible({ invuln: 1 }, true), false);
assert.equal(isPlayerShieldVisible({ invuln: 0 }, false), false);
assert.deepEqual(Array.from({ length: 8 }, (_, tick) => shieldColorForTick(tick)), [
  "#78d9ff",
  "#78d9ff",
  "#ffffff",
  "#ffffff",
  "#78d9ff",
  "#78d9ff",
  "#ffffff",
  "#ffffff"
]);

const spawnFrames = Array.from({ length: 28 }, (_, elapsed) =>
  spawnAnimationPresentation(28 - elapsed, 28)
);
assert.deepEqual(spawnFrames.map((frame) => frame.low), [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13
]);
assert.deepEqual(spawnFrames.map((frame) => frame.phase), [
  3, 3, 2, 2, 1, 1, 0, 0, 0, 1, 1, 2, 2, 3,
  3, 3, 2, 2, 1, 1, 0, 0, 0, 1, 1, 2, 2, 3
]);
assert.deepEqual(spawnFrames.map((frame) => frame.size), [
  14, 14, 11, 11, 8, 8, 6, 6, 6, 8, 8, 11, 11, 14,
  14, 14, 11, 11, 8, 8, 6, 6, 6, 8, 8, 11, 11, 14
]);

console.log("tank-presentation unit test passed");
