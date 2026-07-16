const assert = require("assert").strict;
const audioPresentation = require("../../src/audio/audio-presentation");

const {
  fixedFrameAudioPresentation,
  fixedFrameVoiceDuration,
  fixedFrameVoiceIsAudible,
  fixedFrameVoicePresentation,
  movementAudioPresentation
} = audioPresentation;

assert.equal(Object.isFrozen(audioPresentation), true);
assert.equal(fixedFrameVoiceDuration(), 0);
assert.equal(fixedFrameVoiceDuration({ segments: "invalid" }), 0);

const voice = {
  gain: 0.02,
  wave: "triangle",
  segments: [
    { frequencies: [100, 200], noteFrames: 2, repeat: 2 },
    { frequencies: [300], noteFrames: 3, repeat: 1, gain: 0.03, wave: "square" }
  ]
};
assert.equal(fixedFrameVoiceDuration(voice), 11);
assert.deepEqual(fixedFrameVoicePresentation(voice, -1), {
  frequency: 100,
  gain: 0.02,
  wave: "triangle",
  segmentIndex: 0,
  repeatIndex: 0,
  noteIndex: 0,
  frameInNote: 0
});
assert.deepEqual(fixedFrameVoicePresentation(voice, 3), {
  frequency: 200,
  gain: 0.02,
  wave: "triangle",
  segmentIndex: 0,
  repeatIndex: 0,
  noteIndex: 1,
  frameInNote: 1
});
assert.deepEqual(fixedFrameVoicePresentation(voice, 4), {
  frequency: 100,
  gain: 0.02,
  wave: "triangle",
  segmentIndex: 0,
  repeatIndex: 1,
  noteIndex: 0,
  frameInNote: 0
});
assert.deepEqual(fixedFrameVoicePresentation(voice, 8), {
  frequency: 300,
  gain: 0.03,
  wave: "square",
  segmentIndex: 1,
  repeatIndex: 0,
  noteIndex: 0,
  frameInNote: 0
});
assert.equal(fixedFrameVoicePresentation(voice, 11), null);
assert.equal(fixedFrameVoicePresentation({ segments: [{ frequencies: [0], noteFrames: 1 }] }, 0), null);
assert.equal(fixedFrameVoicePresentation({ gain: 0, segments: [{ frequencies: [100] }] }, 0), null);
assert.equal(
  fixedFrameVoicePresentation({ segments: [{ frequencies: [100], gain: "invalid" }] }, 0).gain,
  0.01
);

const computedEvent = { voices: [voice, { segments: [{ frequencies: [500], noteFrames: 12 }] }] };
assert.equal(fixedFrameAudioPresentation(computedEvent, 0).durationFrames, 12);
assert.equal(fixedFrameAudioPresentation({ ...computedEvent, durationFrames: 20 }, 0).durationFrames, 20);
assert.deepEqual(fixedFrameAudioPresentation(null, -5), {
  frame: 0,
  durationFrames: 1,
  voices: []
});

assert.equal(fixedFrameVoiceIsAudible(true, 0), true);
assert.equal(fixedFrameVoiceIsAudible(false, 0), false);
assert.equal(fixedFrameVoiceIsAudible([true, false], 0), true);
assert.equal(fixedFrameVoiceIsAudible([true, false], 1), false);
assert.equal(fixedFrameVoiceIsAudible([false], 1), true);

const movementEvents = {
  movementEnemy: { frequencies: [72, 64], stepFrames: 4, gain: 0.01, wave: "square" },
  movementPlayer: { frequencies: [112, 96], stepFrames: 16, gain: 0.012, wave: "triangle" }
};
assert.deepEqual(movementAudioPresentation("enemy", 4, movementEvents), {
  mode: "enemy",
  eventName: "movementEnemy",
  phase: 1,
  frequency: 64,
  stepFrames: 4,
  gain: 0.01,
  wave: "square"
});
assert.deepEqual(movementAudioPresentation("player", 32, movementEvents), {
  mode: "player",
  eventName: "movementPlayer",
  phase: 0,
  frequency: 112,
  stepFrames: 16,
  gain: 0.012,
  wave: "triangle"
});
assert.equal(movementAudioPresentation("enemy", 0, {}), null);

console.log("audio-presentation unit test passed");
