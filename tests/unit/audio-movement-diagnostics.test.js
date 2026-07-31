const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-movement-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioMovementDiagnostics(), /scope must be an object/);

const api = diagnostics.createAudioMovementDiagnostics({
  FREE_AUDIO_MANIFEST: {
    events: {
      movementIce: {
        durationFrames: 4,
        voices: [{ duration: 4, wave: "square" }]
      }
    }
  },
  fixedFrameVoiceDuration(voice) {
    return voice.duration;
  },
  movementIceAudioPresentation(frame) {
    return {
      voices: frame < 4
        ? [{ frequency: 279 + frame * 70, gain: 0.3, wave: "square" }]
        : [null]
    };
  }
});

assert.equal(Object.isFrozen(api), true);
assert.deepEqual(api.debugMovementIceAudioProbe(), {
  durationFrames: 4,
  voiceDurations: [4],
  waves: ["square"],
  frames: [
    { voices: [{ frequency: 279, gain: 0.3, wave: "square" }] },
    { voices: [{ frequency: 349, gain: 0.3, wave: "square" }] },
    { voices: [{ frequency: 419, gain: 0.3, wave: "square" }] },
    { voices: [{ frequency: 489, gain: 0.3, wave: "square" }] },
    { voices: [null] }
  ]
});

console.log("audio-movement-diagnostics unit test passed");
