const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-bonus-life-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioBonusLifeDiagnostics(), /scope must be an object/);

const api = diagnostics.createAudioBonusLifeDiagnostics({
  FREE_AUDIO_MANIFEST: {
    events: {
      bonusLife: {
        durationFrames: 60,
        voices: [
          { duration: 60, wave: "square" },
          { duration: 54, wave: "square" }
        ]
      }
    }
  },
  fixedFrameVoiceDuration(voice) {
    return voice.duration;
  },
  bonusLifeAudioPresentation(frame) {
    return {
      frame,
      voices: frame < 54
        ? [
            { frequency: 784, gain: 0.3, wave: "square" },
            { frequency: 523, gain: 0.25, wave: "square" }
          ]
        : frame < 60
          ? [{ frequency: 784, gain: 0.3, wave: "square" }, null]
          : [null, null]
    };
  }
});

assert.equal(Object.isFrozen(api), true);
const sampledFrames = [0, 1, 2, 5, 6, 41, 42, 53, 54, 59, 60];
assert.deepEqual(api.debugBonusLifeAudioProbe(), {
  durationFrames: 60,
  voiceDurations: [60, 54],
  waves: ["square", "square"],
  frames: sampledFrames.map((frame) => ({
    frame,
    voices: frame < 54
      ? [
          { frequency: 784, gain: 0.3, wave: "square" },
          { frequency: 523, gain: 0.25, wave: "square" }
        ]
      : frame < 60
        ? [{ frequency: 784, gain: 0.3, wave: "square" }, null]
        : [null, null]
  }))
});

console.log("audio-bonus-life-diagnostics unit test passed");
