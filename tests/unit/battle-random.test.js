const assert = require("assert").strict;
const { advanceBattleRandom } = require("../../src/core/battle-random");

const syntheticBytes = [0x11, 0x80, 0x7f];
const states = [];
let state = { value: 0x5a, index: 0xfe };
for (const zeroPageByte of syntheticBytes) {
  state = advanceBattleRandom(state.value, state.index, 0x22, zeroPageByte);
  states.push(state);
}

assert.deepEqual(states.map((entry) => entry.value), [0xa9, 0x41, 0x68]);
assert.deepEqual(states.map((entry) => entry.index), [0xff, 0x00, 0x01]);
assert.deepEqual(
  advanceBattleRandom(0xfa, 0x20, 0x64, 0),
  { value: 0x3b, index: 0x21 },
  "the carry from the frame-high addition must feed the zero-page addition"
);
assert.deepEqual(
  advanceBattleRandom(0x100, 0x1ff, 0x100, 0x100),
  { value: 0, index: 0 },
  "all state inputs must retain eight-bit wrapping"
);

console.log("battle-random unit test passed");
