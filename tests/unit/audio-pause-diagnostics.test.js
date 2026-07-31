const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-pause-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioPauseDiagnostics(), /scope must be an object/);

const api = diagnostics.createAudioPauseDiagnostics({
  FREE_AUDIO_MANIFEST: {
    events: {
      pause: {
        durationFrames: 36,
        voices: [{ duration: 36, wave: "square" }]
      }
    }
  },
  fixedFrameVoiceDuration(voice) {
    return voice.duration;
  },
  pauseAudioPresentation(frame) {
    return {
      frame,
      voices: frame < 36
        ? [{ frequency: 659 + frame, gain: 0.3, wave: "square" }]
        : [null]
    };
  }
});

assert.equal(Object.isFrozen(api), true);
const sampledFrames = [0, 3, 4, 7, 8, 23, 24, 35, 36];
assert.deepEqual(api.debugPauseAudioProbe(), {
  durationFrames: 36,
  voiceDurations: [36],
  waves: ["square"],
  frames: sampledFrames.map((frame) => ({
    frame,
    voices: frame < 36
      ? [{ frequency: 659 + frame, gain: 0.3, wave: "square" }]
      : [null]
  }))
});

console.log("audio-pause-diagnostics unit test passed");
