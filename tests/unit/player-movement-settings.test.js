const assert = require("assert").strict;
const {
  DEFAULT_PLAYER_FRAME_CADENCE,
  DEFAULT_PLAYER_MOVEMENT,
  clonePlayerMovementSettings,
  normalizePlayerFrameCadence,
  normalizePlayerMovement
} = require("../../src/config/player-movement-settings");

assert.deepEqual(DEFAULT_PLAYER_MOVEMENT, {
  speed: 1,
  frameCadence: [true, true, false, true],
  iceSlideFrames: 28,
  iceSlideSpeed: 1
});
assert(Object.isFrozen(DEFAULT_PLAYER_MOVEMENT));
assert(Object.isFrozen(DEFAULT_PLAYER_FRAME_CADENCE));

const firstClone = clonePlayerMovementSettings();
const secondClone = clonePlayerMovementSettings();
assert.deepEqual(firstClone, DEFAULT_PLAYER_MOVEMENT);
assert.notEqual(firstClone, DEFAULT_PLAYER_MOVEMENT);
assert.notEqual(firstClone.frameCadence, DEFAULT_PLAYER_FRAME_CADENCE);
firstClone.frameCadence[0] = false;
assert.equal(secondClone.frameCadence[0], true);

assert.deepEqual(normalizePlayerMovement(), clonePlayerMovementSettings());
assert.deepEqual(normalizePlayerMovement({ speed: "1.5", iceSlideFrames: "3", iceSlideSpeed: "0.4" }), {
  speed: 1.5,
  frameCadence: [true],
  iceSlideFrames: 3,
  iceSlideSpeed: 0.4
});
assert.deepEqual(normalizePlayerMovement({ frameCadence: [true, false, true] }).frameCadence, [true, false, true]);
assert.deepEqual(normalizePlayerFrameCadence(undefined, [false, true]), [false, true]);

assert.throws(() => normalizePlayerMovement(true), /playerMovement must be an object/);
for (const speed of [0, 6.1]) assert.throws(() => normalizePlayerMovement({ speed }), /playerMovement\.speed/);
for (const iceSlideFrames of [-1, 1.5, 3601]) {
  assert.throws(() => normalizePlayerMovement({ iceSlideFrames }), /playerMovement\.iceSlideFrames/);
}
for (const iceSlideSpeed of [-0.1, 6.1]) {
  assert.throws(() => normalizePlayerMovement({ iceSlideSpeed }), /playerMovement\.iceSlideSpeed/);
}
for (const frameCadence of [[], Array(17).fill(true), [false, false], [true, 1]]) {
  assert.throws(() => normalizePlayerMovement({ frameCadence }), /playerMovement\.frameCadence/);
}

console.log("player-movement-settings unit test passed");
