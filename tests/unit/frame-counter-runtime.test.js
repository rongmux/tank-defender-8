const assert = require("assert").strict;
const runtime = require("../../src/runtime/frame-counter-runtime");
const { advanceFrameCounter, resetFrameCounter } = require("../../src/core/frame-counter");

assert.equal(Object.isFrozen(runtime), true);
assert.throws(
  () => runtime.setupFrameCounterRuntime({}, {}),
  /state\.game must be an object/
);

const state = {
  game: { frameLow: 0x3f, frameHigh: 2 },
  fn: {}
};
const api = runtime.setupFrameCounterRuntime(state, {
  advanceFrameCounter,
  resetFrameCounter
});

assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), [
  "advanceFrameCounters",
  "applyFrameCounter",
  "resetFrameCounterHigh",
  "resetFrameCounterLow",
  "resetFrameCounters"
]);
assert.equal(state.fn.advanceFrameCounters, api.advanceFrameCounters);
assert.equal(state.fn.resetFrameCounters, api.resetFrameCounters);

api.advanceFrameCounters();
assert.deepEqual(state.game, { frameLow: 0x40, frameHigh: 3 });

api.resetFrameCounterLow();
assert.deepEqual(state.game, { frameLow: 0, frameHigh: 3 });

api.resetFrameCounterHigh();
assert.deepEqual(state.game, { frameLow: 0, frameHigh: 0 });

state.game.frameLow = 0xab;
state.game.frameHigh = 5;
api.resetFrameCounters();
assert.deepEqual(state.game, { frameLow: 0, frameHigh: 0 });

api.applyFrameCounter({ frameLow: 7, frameHigh: 9 });
assert.deepEqual(state.game, { frameLow: 7, frameHigh: 9 });

console.log("frame-counter-runtime unit test passed");
