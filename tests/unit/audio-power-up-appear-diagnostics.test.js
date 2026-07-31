const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-power-up-appear-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioPowerUpAppearDiagnostics(), /scope must be an object/);

const api = diagnostics.createAudioPowerUpAppearDiagnostics({
  FREE_AUDIO_MANIFEST: {
    events: {
      powerUpAppear: {
        durationFrames: 32,
        voices: [{ duration: 32, wave: "square" }]
      }
    }
  },
  fixedFrameVoiceDuration(voice) {
    return voice.duration;
  },
  powerUpAppearAudioPresentation(frame) {
    return {
      frame,
      voices: frame < 32
        ? [{ frequency: 392 + frame, gain: 0.3, wave: "square" }]
        : [null]
    };
  }
});

assert.equal(Object.isFrozen(api), true);
const sampledFrames = [0, 3, 4, 7, 8, 27, 28, 31, 32];
assert.deepEqual(api.debugPowerUpAppearAudioProbe(), {
  durationFrames: 32,
  voiceDurations: [32],
  waves: ["square"],
  frames: sampledFrames.map((frame) => ({
    frame,
    voices: frame < 32
      ? [{ frequency: 392 + frame, gain: 0.3, wave: "square" }]
      : [null]
  }))
});

console.log("audio-power-up-appear-diagnostics unit test passed");
