const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-stage-bonus-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioStageBonusDiagnostics(), /scope must be an object/);

const api = diagnostics.createAudioStageBonusDiagnostics({
  FREE_AUDIO_MANIFEST: {
    events: {
      stageBonus: {
        durationFrames: 28,
        voices: [{ duration: 28, wave: "square" }]
      }
    }
  },
  fixedFrameVoiceDuration(voice) {
    return voice.duration;
  },
  stageBonusAudioPresentation(frame) {
    return {
      voices: frame < 3
        ? [{ frequency: 988, gain: 0.3, wave: "square" }]
        : [null]
    };
  }
});

assert.equal(Object.isFrozen(api), true);
assert.deepEqual(api.debugStageBonusAudioProbe(), {
  durationFrames: 28,
  voiceDurations: [28],
  waves: ["square"],
  frames: [
    { frame: 0, voices: [{ frequency: 988, gain: 0.3, wave: "square" }] },
    { frame: 2, voices: [{ frequency: 988, gain: 0.3, wave: "square" }] },
    { frame: 3, voices: [null] },
    { frame: 5, voices: [null] },
    { frame: 6, voices: [null] },
    { frame: 8, voices: [null] },
    { frame: 9, voices: [null] },
    { frame: 11, voices: [null] },
    { frame: 12, voices: [null] },
    { frame: 14, voices: [null] },
    { frame: 15, voices: [null] },
    { frame: 17, voices: [null] },
    { frame: 18, voices: [null] },
    { frame: 27, voices: [null] },
    { frame: 28, voices: [null] }
  ]
});

console.log("audio-stage-bonus-diagnostics unit test passed");
