const assert = require("assert").strict;
const {
  advanceFrameCounter,
  frameCounterState,
  resetFrameCounter
} = require("../../src/core/frame-counter");

function advance(source, frames) {
  let state = frameCounterState(source);
  for (let frame = 0; frame < frames; frame += 1) state = advanceFrameCounter(state);
  return state;
}

assert.deepEqual(advance({}, 63), { frameLow: 0x3f, frameHigh: 0 });
assert.deepEqual(advance({}, 64), { frameLow: 0x40, frameHigh: 1 });
assert.deepEqual(advance({}, 256), { frameLow: 0, frameHigh: 4 });
assert.deepEqual(advance({ frameLow: 0xff, frameHigh: 0xff }, 1), { frameLow: 0, frameHigh: 0 });
assert.deepEqual(
  resetFrameCounter({ frameLow: 0xab, frameHigh: 5 }, false, true),
  { frameLow: 0xab, frameHigh: 0 }
);
assert.deepEqual(
  resetFrameCounter({ frameLow: 0xab, frameHigh: 5 }, true, false),
  { frameLow: 0, frameHigh: 5 }
);
assert.deepEqual(resetFrameCounter({ frameLow: 0xab, frameHigh: 5 }), { frameLow: 0, frameHigh: 0 });

console.log("frame-counter unit test passed");
