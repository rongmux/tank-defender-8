const assert = require("assert").strict;
const fixedFrameAudioState = require("../../src/audio/fixed-frame-audio-state");

const {
  FIXED_FRAME_AUDIO_UPDATE_MODE,
  advanceFixedFrameAudioState,
  beginFixedFrameAudioState,
  createFixedFrameAudioState,
  fixedFrameAudioUpdateMode,
  resetFixedFrameAudioState
} = fixedFrameAudioState;

assert.equal(Object.isFrozen(fixedFrameAudioState), true);
assert.equal(Object.isFrozen(FIXED_FRAME_AUDIO_UPDATE_MODE), true);
assert.deepEqual(FIXED_FRAME_AUDIO_UPDATE_MODE, {
  INACTIVE: "inactive",
  HELD: "held",
  ADVANCE: "advance"
});

const first = createFixedFrameAudioState();
const second = createFixedFrameAudioState();
assert.deepEqual(first, { active: false, frame: 0, nodes: [] });
assert.deepEqual(second, { active: false, frame: 0, nodes: [] });
assert.notEqual(first, second);
assert.notEqual(first.nodes, second.nodes);

const retainedNode = { source: "runtime-owned" };
first.nodes.push(retainedNode);
assert.equal(beginFixedFrameAudioState(first), first);
assert.equal(first.active, true);
assert.equal(first.frame, 0);
assert.deepEqual(first.nodes, [retainedNode]);

assert.equal(
  fixedFrameAudioUpdateMode(null, false, false),
  FIXED_FRAME_AUDIO_UPDATE_MODE.INACTIVE
);
assert.equal(
  fixedFrameAudioUpdateMode(second, false, false),
  FIXED_FRAME_AUDIO_UPDATE_MODE.INACTIVE
);
assert.equal(
  fixedFrameAudioUpdateMode(first, true, false),
  FIXED_FRAME_AUDIO_UPDATE_MODE.HELD
);
assert.equal(
  fixedFrameAudioUpdateMode(first, true, true),
  FIXED_FRAME_AUDIO_UPDATE_MODE.ADVANCE
);
assert.equal(
  fixedFrameAudioUpdateMode(first, false, false),
  FIXED_FRAME_AUDIO_UPDATE_MODE.ADVANCE
);

assert.equal(advanceFixedFrameAudioState(first, 3), false);
assert.deepEqual({ active: first.active, frame: first.frame }, { active: true, frame: 1 });
assert.equal(advanceFixedFrameAudioState(first, 3), false);
assert.deepEqual({ active: first.active, frame: first.frame }, { active: true, frame: 2 });
assert.equal(advanceFixedFrameAudioState(first, 3), true);
assert.deepEqual({ active: first.active, frame: first.frame }, { active: false, frame: 3 });
assert.deepEqual(first.nodes, [retainedNode]);

assert.equal(resetFixedFrameAudioState(first), first);
assert.deepEqual({ active: first.active, frame: first.frame }, { active: false, frame: 0 });
assert.deepEqual(first.nodes, [retainedNode]);

beginFixedFrameAudioState(first);
assert.equal(advanceFixedFrameAudioState(first, "invalid"), true);
assert.deepEqual({ active: first.active, frame: first.frame }, { active: false, frame: 1 });

console.log("fixed-frame-audio-state unit test passed");
