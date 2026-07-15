const assert = require("assert").strict;
const {
  DEFAULT_TIMINGS,
  SPAWN_ANIMATION_FRAMES,
  normalizeTimings
} = require("../../src/config/timing-settings");

assert.equal(SPAWN_ANIMATION_FRAMES, 28);
assert.deepEqual(DEFAULT_TIMINGS, {
  stageIntro: 95,
  stageClearDelay: 128,
  stageClear: 0,
  gameOverSlide: 127,
  gameOverHold: 129,
  playerRespawn: 24,
  playerSpawnFlash: 28,
  playerInvulnerability: 3,
  enemySpawnFlash: 28,
  enemyInitialReload: 0,
  enemySpawnRetry: 25,
  powerUpTtl: 0
});
assert(Object.isFrozen(DEFAULT_TIMINGS));
assert.equal(DEFAULT_TIMINGS.playerSpawnFlash, SPAWN_ANIMATION_FRAMES);
assert.equal(DEFAULT_TIMINGS.enemySpawnFlash, SPAWN_ANIMATION_FRAMES);

const defaults = normalizeTimings();
assert.deepEqual(defaults, DEFAULT_TIMINGS);
assert.notEqual(defaults, DEFAULT_TIMINGS);

const custom = Object.fromEntries(Object.keys(DEFAULT_TIMINGS).map((key, index) => [key, String(index)]));
assert.deepEqual(normalizeTimings(custom), Object.fromEntries(Object.keys(DEFAULT_TIMINGS).map((key, index) => [key, index])));
for (const key of Object.keys(DEFAULT_TIMINGS)) {
  for (const value of [-1, 1.5, 3601]) {
    assert.throws(() => normalizeTimings({ [key]: value }), new RegExp(`timings\\.${key}`));
  }
}
assert.throws(() => normalizeTimings(true), /timings must be an object/);

console.log("timing-settings unit test passed");
